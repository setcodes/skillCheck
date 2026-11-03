// Единый слой данных банка вопросов и задач.
//
// Встроенный банк (builtin) — источник истины и обновляется вместе с приложением.
// Пользовательские изменения (импорт) хранятся как overlay по id и накладываются сверху,
// поэтому новые вопросы/исправления в релизе доходят до всех, а локальные правки не теряются.

import type { Profession } from '@/entities/profession/model/types'
import type { Question } from '@/entities/question/model/types'
import { levelNumber } from '@/entities/question/model/topics'
import type { UITask } from '@/entities/task/model/types'
import { FE } from '@/shared/api/tasks/frontend'
import FRONTEND_QA from '@/shared/questions/frontend.json'
import { KEYS, readJSON, removeKey, writeJSON } from '@/shared/storage/storage'
import { QuestionSchema, TaskSchema, coerceQuestion, describeIssue } from './schema'

export interface Bank {
  questions: Question[]
  tasks: UITask[]
}

export interface Overrides {
  v: 1
  questions: Record<string, Question>
  tasks: Record<string, UITask>
}

export interface ImportReport {
  questions: { added: number; updated: number; rejected: number }
  tasks: { added: number; updated: number; rejected: number }
  errors: string[]
}

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024

// Замороженные профессии (backend-java, analyst, devops) лежат в /frozen и в сборку не входят
const BUILTIN: Partial<Record<Profession, Bank>> = {
  frontend: { questions: FRONTEND_QA as Question[], tasks: FE },
}

const emptyOverrides = (): Overrides => ({ v: 1, questions: {}, tasks: {} })

const sortQuestions = (a: Question, b: Question) =>
  levelNumber(a.level) - levelNumber(b.level) || a.topic.localeCompare(b.topic) || a.id.localeCompare(b.id)

export function mergeById<T extends { id: string }>(
  builtin: T[],
  overrides: Record<string, T>
): T[] {
  const map = new Map(builtin.map((x) => [x.id, x]))
  for (const [id, item] of Object.entries(overrides)) map.set(id, item)
  return [...map.values()]
}

export function mergeBank(builtin: Bank, o: Overrides): Bank {
  return {
    questions: mergeById(builtin.questions, o.questions).sort(sortQuestions),
    tasks: mergeById(builtin.tasks, o.tasks),
  }
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Карта «прежний id → актуальный id» по полю aliases встроенных вопросов. */
export function aliasMap(questions: Question[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const q of questions) for (const a of q.aliases ?? []) m.set(a, q.id)
  return m
}

function resolveAlias(questions: Question[], id: string): string {
  return aliasMap(questions).get(id) ?? id
}

// Старый формат хранил полную копию банка: если ответ совпадает с короткой формулировкой
// встроенного вопроса, пользователь его не менял.
function isUntouchedLegacyCopy(builtin: Question, raw: unknown): boolean {
  const r = raw as { answer?: unknown; prompt?: unknown }
  return typeof r?.answer === 'string' && r.answer === builtin.answer.short && r.prompt === builtin.prompt
}

// Старый формат: полный банк целиком в `bank:<prof>:questions|tasks`.
// Превращаем в overlay: сохраняем только то, что отличается от встроенного.
export function migrateLegacy(
  builtin: Bank,
  legacyQuestions: unknown,
  legacyTasks: unknown
): Overrides {
  const o = emptyOverrides()
  const builtinQ = new Map(builtin.questions.map((q) => [q.id, q]))
  const builtinT = new Map(builtin.tasks.map((t) => [t.id, t]))
  if (Array.isArray(legacyQuestions)) {
    for (const raw of legacyQuestions) {
      const parsed = QuestionSchema.safeParse(coerceQuestion(raw))
      if (!parsed.success) continue
      const id = resolveAlias(builtin.questions, parsed.data.id)
      const candidate = { ...parsed.data, id }
      // старая копия встроенного вопроса (до миграции схемы) — не правка пользователя
      if (builtinQ.has(id) && (id !== parsed.data.id || !same(candidate, builtinQ.get(id)))) {
        if (isUntouchedLegacyCopy(builtinQ.get(id)!, raw)) continue
      }
      if (!same(candidate, builtinQ.get(id))) o.questions[id] = candidate
    }
  }
  if (Array.isArray(legacyTasks)) {
    for (const raw of legacyTasks) {
      const parsed = TaskSchema.safeParse(raw)
      if (parsed.success && !same(parsed.data, builtinT.get(parsed.data.id))) {
        o.tasks[parsed.data.id] = parsed.data
      }
    }
  }
  return o
}

// Overlay мог быть записан до смены схемы вопроса: приводим к текущей и переносим на актуальные id.
function normalizeStored(builtin: Bank | undefined, stored: Overrides): Overrides {
  const aliases = aliasMap(builtin?.questions ?? [])
  const questions: Record<string, Question> = {}
  for (const [key, raw] of Object.entries(stored.questions ?? {})) {
    const parsed = QuestionSchema.safeParse(coerceQuestion(raw))
    if (!parsed.success) continue
    const id = aliases.get(key) ?? aliases.get(parsed.data.id) ?? parsed.data.id
    questions[id] = { ...parsed.data, id }
  }
  return { v: 1, questions, tasks: stored.tasks ?? {} }
}

function loadOverrides(prof: Profession): Overrides {
  const stored = readJSON<Overrides | null>(KEYS.bankOverrides(prof), null)
  if (stored && stored.v === 1) return normalizeStored(BUILTIN[prof], stored)
  const builtin = BUILTIN[prof]
  const legacyQ = readJSON<unknown>(KEYS.legacyBankQuestions(prof), null)
  const legacyT = readJSON<unknown>(KEYS.legacyBankTasks(prof), null)
  if (!builtin || (legacyQ == null && legacyT == null)) return emptyOverrides()
  const migrated = migrateLegacy(builtin, legacyQ, legacyT)
  if (writeJSON(KEYS.bankOverrides(prof), migrated)) {
    removeKey(KEYS.legacyBankQuestions(prof))
    removeKey(KEYS.legacyBankTasks(prof))
  }
  return migrated
}

// --- кэш с устойчивыми ссылками (важно для зависимостей useEffect/useMemo) ---
const cache = new Map<Profession, Bank>()
const listeners = new Set<() => void>()

function notify() {
  cache.clear()
  listeners.forEach((l) => l())
}

export function subscribeBank(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

if (typeof window !== 'undefined') {
  // правки из другой вкладки
  window.addEventListener('storage', (e) => {
    if (e.key?.startsWith('bank:')) notify()
  })
}

export function getBank(prof: Profession): Bank {
  const hit = cache.get(prof)
  if (hit) return hit
  const builtin = BUILTIN[prof] ?? { questions: [], tasks: [] }
  const bank = mergeBank(builtin, loadOverrides(prof))
  cache.set(prof, bank)
  return bank
}

export const getQuestions = (prof: Profession) => getBank(prof).questions
export const getTasks = (prof: Profession) => getBank(prof).tasks

/** Актуальный id вопроса по прежнему (для старых ссылок и сохранённых данных). */
export function canonicalQuestionId(prof: Profession, id: string): string {
  return aliasMap(BUILTIN[prof]?.questions ?? []).get(id) ?? id
}

export function resetBank(prof: Profession): void {
  removeKey(KEYS.bankOverrides(prof))
  removeKey(KEYS.legacyBankQuestions(prof))
  removeKey(KEYS.legacyBankTasks(prof))
  notify()
}

export function exportBank(prof: Profession): Bank {
  return getBank(prof)
}

// Импорт: { questions?, tasks? } или просто массив вопросов. Невалидные элементы отбрасываются
// с понятным сообщением, валидные накладываются поверх встроенного банка.
export function importBank(prof: Profession, raw: unknown): ImportReport {
  const report: ImportReport = {
    questions: { added: 0, updated: 0, rejected: 0 },
    tasks: { added: 0, updated: 0, rejected: 0 },
    errors: [],
  }
  const rawQuestions = Array.isArray(raw) ? raw : (raw as { questions?: unknown })?.questions
  const rawTasks = Array.isArray(raw) ? undefined : (raw as { tasks?: unknown })?.tasks
  if (!Array.isArray(rawQuestions) && !Array.isArray(rawTasks)) {
    report.errors.push('Ожидается массив вопросов или объект { questions, tasks }')
    return report
  }

  const current = getBank(prof)
  const knownQ = new Set(current.questions.map((q) => q.id))
  const knownT = new Set(current.tasks.map((t) => t.id))
  const overrides = loadOverrides(prof)

  const take = <T extends { id: string }>(
    list: unknown,
    parse: (x: unknown) => { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } },
    known: Set<string>,
    into: Record<string, T>,
    stat: ImportReport['questions'],
    label: string
  ) => {
    if (!Array.isArray(list)) return
    list.forEach((item, i) => {
      const parsed = parse(item)
      if (!parsed.success) {
        stat.rejected++
        if (report.errors.length < 10) report.errors.push(`${label} #${i + 1}: ${describeIssue(parsed.error)}`)
        return
      }
      if (known.has(parsed.data.id)) stat.updated++
      else stat.added++
      into[parsed.data.id] = parsed.data
    })
  }

  take(rawQuestions, (x) => QuestionSchema.safeParse(coerceQuestion(x)), knownQ, overrides.questions, report.questions, 'Вопрос')
  take(rawTasks, (x) => TaskSchema.safeParse(x), knownT, overrides.tasks, report.tasks, 'Задача')

  const imported = report.questions.added + report.questions.updated + report.tasks.added + report.tasks.updated
  if (imported > 0) {
    writeJSON(KEYS.bankOverrides(prof), overrides)
    notify()
  }
  return report
}
