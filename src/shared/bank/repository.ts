// Единый слой данных банка вопросов и задач.
//
// Встроенный банк (builtin) — источник истины и обновляется вместе с приложением.
// Пользовательские изменения (импорт) хранятся как overlay по id и накладываются сверху,
// поэтому новые вопросы/исправления в релизе доходят до всех, а локальные правки не теряются.

import type { Profession } from '@/entities/profession/model/types'
import type { Question } from '@/entities/question/model/types'
import { levelNumber } from '@/entities/question/model/topics'
import type { UITask } from '@/entities/task/model/types'
import { FRONTEND_TASKS } from '@/shared/api/tasks'
import FRONTEND_QA from '@/shared/questions/frontend.json'
import { KEYS, readJSON, removeKey, writeJSON } from '@/shared/storage/storage'
import { QuestionSchema, TaskSchema, coerceQuestion, coerceTask, describeIssue } from './schema'

export interface Bank {
  questions: Question[]
  tasks: UITask[]
}

export interface Overrides {
  v: 1
  questions: Record<string, Question>
  tasks: Record<string, UITask>
}

export interface ImportStat {
  added: number
  updated: number
  /** совпали со встроенным банком — не сохраняются, чтобы не заслонять будущие исправления */
  unchanged: number
  rejected: number
}

export interface ImportReport {
  questions: ImportStat
  tasks: ImportStat
  errors: string[]
}

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024

// Замороженные профессии (backend-java, analyst, devops) лежат в /frozen и в сборку не входят
const BUILTIN: Partial<Record<Profession, Bank>> = {
  frontend: { questions: FRONTEND_QA as Question[], tasks: FRONTEND_TASKS },
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

// Сравнение без учёта порядка ключей: файл банка и результат схемы перечисляют поля по-разному.
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((k) => (value as Record<string, unknown>)[k] !== undefined)
        .map((k) => [k, stable((value as Record<string, unknown>)[k])])
    )
  }
  return value
}
const sameContent = (a: unknown, b: unknown) => same(stable(a), stable(b))

// Встроенный банк, приведённый схемой, — чтобы сравнивать импорт с ним по содержимому.
const normalizedBuiltin = new Map<Profession, { questions: Map<string, Question>; tasks: Map<string, UITask> }>()
function builtinIndex(prof: Profession) {
  const hit = normalizedBuiltin.get(prof)
  if (hit) return hit
  const b = BUILTIN[prof] ?? { questions: [], tasks: [] }
  const index = {
    questions: new Map(b.questions.map((q) => [q.id, QuestionSchema.safeParse(q).data ?? q])),
    tasks: new Map(b.tasks.map((t) => [t.id, TaskSchema.safeParse(t).data ?? t])),
  }
  normalizedBuiltin.set(prof, index)
  return index
}

/** Карта «прежний id → актуальный id» по полю aliases встроенных вопросов. */
export function aliasMap(questions: Question[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const q of questions) for (const a of q.aliases ?? []) m.set(a, q.id)
  return m
}

function resolveAlias(questions: Question[], id: string): string {
  return aliasMap(questions).get(id) ?? id
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
      // Старый формат целиком копировал встроенный банк, отличить правку от копии нельзя —
      // вопросы со встроенными id не переносим (исходный файл сохраняется в резервной копии).
      if (builtinQ.has(parsed.data.id) || builtinQ.has(resolveAlias(builtin.questions, parsed.data.id))) continue
      o.questions[parsed.data.id] = parsed.data
    }
  }
  if (Array.isArray(legacyTasks)) {
    for (const raw of legacyTasks) {
      const parsed = TaskSchema.safeParse(coerceTask(raw))
      if (parsed.success && !same(parsed.data, builtinT.get(parsed.data.id))) {
        o.tasks[parsed.data.id] = parsed.data
      }
    }
  }
  return o
}

// Overlay мог быть записан до смены схемы вопроса: приводим к текущей и переносим на актуальные id.
function normalizeStored(prof: Profession, stored: Overrides): Overrides {
  const aliases = aliasMap(BUILTIN[prof]?.questions ?? [])
  const index = builtinIndex(prof)
  const questions: Record<string, Question> = {}
  for (const [key, raw] of Object.entries(stored.questions ?? {})) {
    const parsed = QuestionSchema.safeParse(coerceQuestion(raw))
    if (!parsed.success) continue
    const id = aliases.get(key) ?? aliases.get(parsed.data.id) ?? parsed.data.id
    const q = { ...parsed.data, id }
    // копия встроенного вопроса (например, после импорта полной выгрузки) — не правка
    if (!sameContent(q, index.questions.get(id))) questions[id] = q
  }
  const tasks: Record<string, UITask> = {}
  for (const [key, raw] of Object.entries(stored.tasks ?? {})) {
    const parsed = TaskSchema.safeParse(coerceTask(raw))
    if (parsed.success && !sameContent(parsed.data, index.tasks.get(key))) tasks[key] = parsed.data
  }
  return { v: 1, questions, tasks }
}

function loadOverrides(prof: Profession): Overrides {
  const stored = readJSON<Overrides | null>(KEYS.bankOverrides(prof), null)
  if (stored && stored.v === 1) return normalizeStored(prof, stored)
  const builtin = BUILTIN[prof]
  const legacyQ = readJSON<unknown>(KEYS.legacyBankQuestions(prof), null)
  const legacyT = readJSON<unknown>(KEYS.legacyBankTasks(prof), null)
  if (!builtin || (legacyQ == null && legacyT == null)) return emptyOverrides()
  const migrated = migrateLegacy(builtin, legacyQ, legacyT)
  if (writeJSON(KEYS.bankOverrides(prof), migrated)) {
    writeJSON(KEYS.legacyBackup(prof), { questions: legacyQ, tasks: legacyT })
    removeKey(KEYS.legacyBankQuestions(prof))
    removeKey(KEYS.legacyBankTasks(prof))
  }
  return migrated
}

// --- кэш с устойчивыми ссылками (важно для зависимостей useEffect/useMemo) ---
const cache = new Map<Profession, Bank>()
const ownCache = new Map<Profession, Bank>()
const listeners = new Set<() => void>()

function notify() {
  cache.clear()
  ownCache.clear()
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

/**
 * Выгрузка только своих правок: добавленное и изменённое импортом.
 * Встроенный банк приходит с приложением и в файл не попадает — так файл годится и для переноса
 * в другой браузер, и для предложения вопросов в репозиторий, а его повторный импорт не заслоняет
 * будущие исправления встроенного банка.
 */
export function exportBank(prof: Profession): Bank {
  const hit = ownCache.get(prof)
  if (hit) return hit
  const o = loadOverrides(prof)
  const own = {
    questions: Object.values(o.questions).sort(sortQuestions),
    tasks: Object.values(o.tasks),
  }
  ownCache.set(prof, own)
  return own
}

// Импорт: { questions?, tasks? } или просто массив вопросов. Невалидные элементы отбрасываются
// с понятным сообщением, валидные накладываются поверх встроенного банка.
export function importBank(prof: Profession, raw: unknown): ImportReport {
  const report: ImportReport = {
    questions: { added: 0, updated: 0, unchanged: 0, rejected: 0 },
    tasks: { added: 0, updated: 0, unchanged: 0, rejected: 0 },
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
  const index = builtinIndex(prof)
  const aliases = aliasMap(BUILTIN[prof]?.questions ?? [])
  let changed = false

  const take = <T extends { id: string }>(
    list: unknown,
    parse: (x: unknown) => { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } },
    known: Set<string>,
    builtin: Map<string, T>,
    into: Record<string, T>,
    stat: ImportStat,
    label: string,
    canonical: (id: string) => string = (id) => id
  ) => {
    if (!Array.isArray(list)) return
    list.forEach((raw, i) => {
      const parsed = parse(raw)
      if (!parsed.success) {
        stat.rejected++
        if (report.errors.length < 10) report.errors.push(`${label} #${i + 1}: ${describeIssue(parsed.error)}`)
        return
      }
      const id = canonical(parsed.data.id)
      const item = { ...parsed.data, id }
      if (sameContent(item, builtin.get(id))) {
        // совпадает со встроенным: прежнюю правку (если была) снимаем, копию не храним
        stat.unchanged++
        if (id in into) {
          delete into[id]
          changed = true
        }
        return
      }
      if (known.has(id)) stat.updated++
      else stat.added++
      into[id] = item
      changed = true
    })
  }

  take(
    rawQuestions,
    (x) => QuestionSchema.safeParse(coerceQuestion(x)),
    knownQ,
    index.questions,
    overrides.questions,
    report.questions,
    'Вопрос',
    (id) => aliases.get(id) ?? id
  )
  take(rawTasks, (x) => TaskSchema.safeParse(coerceTask(x)), knownT, index.tasks, overrides.tasks, report.tasks, 'Задача')

  if (changed) {
    writeJSON(KEYS.bankOverrides(prof), overrides)
    notify()
  }
  return report
}
