// Проверка банков вопросов. Ошибки (exit 1) — нарушение схемы, дубликаты id/alias.
// Предупреждения — контентный долг: короткие ответы, нет чек-листов, не вычитано, перекос по темам.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { QuestionSchema, describeIssue } from '../src/shared/bank/schema'
import { FRONTEND_TOPICS, LEVELS } from '../src/entities/question/model/topics'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const c = { r: '\x1b[31m', g: '\x1b[32m', y: '\x1b[33m', b: '\x1b[34m', x: '\x1b[0m' }
const errors: string[] = []
const warnings: string[] = []
const err = (m: string) => errors.push(m)
const warn = (m: string) => warnings.push(m)

const list = (dir: string) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f)) : []

function readArray(file: string): unknown[] | null {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    const arr = Array.isArray(data) ? data : data?.questions
    if (Array.isArray(arr)) return arr
    err(`${path.relative(root, file)}: ожидается массив вопросов`)
  } catch (e) {
    err(`${path.relative(root, file)}: невалидный JSON (${(e as Error).message})`)
  }
  return null
}

// --- активный банк: полная схема ---
let total = 0
const matrix: Record<string, Record<string, number>> = {}
for (const file of list(path.join(root, 'src/shared/questions'))) {
  const rel = path.relative(root, file)
  const arr = readArray(file)
  if (!arr) continue
  const ids = new Set<string>()
  const aliases = new Map<string, string>()
  const stats = { titleEqPrompt: 0, short: 0, noFull: 0, noMust: 0, unreviewed: 0 }

  arr.forEach((raw, i) => {
    const parsed = QuestionSchema.safeParse(raw)
    const label = `${rel} #${i + 1}${(raw as { id?: string })?.id ? ` (${(raw as { id: string }).id})` : ''}`
    if (!parsed.success) return err(`${label}: ${describeIssue(parsed.error)}`)
    const q = parsed.data
    total++
    if (ids.has(q.id)) err(`${label}: дубликат id`)
    ids.add(q.id)
    if (!q.id.startsWith(`fe-${q.topic}-`)) err(`${label}: id должен начинаться с fe-${q.topic}-`)
    for (const a of q.aliases ?? []) {
      if (aliases.has(a)) err(`${label}: alias "${a}" уже у ${aliases.get(a)}`)
      aliases.set(a, q.id)
    }
    matrix[q.topic] ??= {}
    matrix[q.topic][q.level] = (matrix[q.topic][q.level] ?? 0) + 1
    if (q.title.trim() === q.prompt.trim()) stats.titleEqPrompt++
    if (q.answer.short.length < 30) stats.short++
    if (!q.answer.full) stats.noFull++
    if (q.answer.mustMention.length === 0) stats.noMust++
    if (q.reviewedAt == null) stats.unreviewed++
  })
  for (const a of aliases.keys()) if (ids.has(a)) err(`${rel}: alias "${a}" совпадает с чьим-то id`)

  warn(`${rel}: ${arr.length} вопросов; title = prompt: ${stats.titleEqPrompt}; ответ < 30 симв.: ${stats.short}; без full: ${stats.noFull}; без mustMention: ${stats.noMust}; не вычитано: ${stats.unreviewed}`)
}

// --- замороженные профессии: только базовая проверка старого формата ---
let frozen = 0
for (const file of list(path.join(root, 'frozen/questions'))) {
  const arr = readArray(file)
  if (!arr) continue
  const ids = new Set<string>()
  arr.forEach((raw, i) => {
    const q = raw as Record<string, unknown>
    for (const f of ['id', 'title', 'category', 'prompt', 'answer']) {
      if (!q?.[f]) err(`${path.relative(root, file)} #${i + 1}: нет поля ${f}`)
    }
    if (ids.has(String(q?.id))) err(`${path.relative(root, file)} #${i + 1}: дубликат id ${q?.id}`)
    ids.add(String(q?.id))
    frozen++
  })
}

// --- отчёт ---
console.log(`${c.b}Покрытие банка Frontend (тема × уровень)${c.x}`)
console.log('тема'.padEnd(34) + LEVELS.map((l) => l.padStart(8)).join('') + '  всего')
for (const t of FRONTEND_TOPICS) {
  const row = matrix[t.id] ?? {}
  const sum = LEVELS.reduce((s, l) => s + (row[l] ?? 0), 0)
  if (sum === 0) continue
  console.log(t.label.padEnd(34) + LEVELS.map((l) => String(row[l] ?? 0).padStart(8)).join('') + String(sum).padStart(8))
  if (sum < 5 && t.id !== 'general') warn(`тема «${t.label}»: вопросов ${sum} (< 5)`)
}
console.log(`\nАктивных вопросов: ${total}, замороженных: ${frozen}`)
for (const w of warnings) console.log(`${c.y}⚠ ${w}${c.x}`)
for (const e of errors) console.log(`${c.r}✗ ${e}${c.x}`)
if (errors.length) {
  console.log(`${c.r}\nОшибок: ${errors.length}${c.x}`)
  process.exit(1)
}
console.log(`${c.g}\n✓ Валидация пройдена${c.x}`)
