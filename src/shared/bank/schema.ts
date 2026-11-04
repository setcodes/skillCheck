import { z } from 'zod'
import type { Check } from '@/entities/task/model/checks'
import type { Question } from '@/entities/question/model/types'
import { TOPIC_IDS } from '@/entities/question/model/topics'
import type { UITask } from '@/entities/task/model/types'

const nonEmpty = z.string().trim().min(1)
const kebab = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'только a-z, 0-9 и дефис')
const stringList = z.array(nonEmpty).default([])

export const QUESTION_ID_RE = /^[a-z0-9][a-z0-9_-]*$/

export const QuestionSchema = z.object({
  id: z.string().regex(QUESTION_ID_RE, 'id: только a-z, 0-9, "-" и "_"'),
  aliases: z.array(z.string()).optional(),
  version: z.number().int().min(1).default(1),
  title: nonEmpty.max(140),
  prompt: nonEmpty,
  level: z.enum(['junior', 'middle', 'senior']),
  kind: z.enum(['screening', 'deep', 'practical', 'architecture']),
  topic: z.enum(TOPIC_IDS),
  tags: z.array(kebab).default([]),
  answer: z.object({
    short: nonEmpty,
    full: nonEmpty.optional(),
    mustMention: stringList,
    commonMistakes: stringList,
    redFlags: stringList,
  }),
  followUps: stringList,
  sources: stringList,
  reviewedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'формат YYYY-MM-DD')
    .nullable()
    .default(null),
  author: z.string().optional(),
}) satisfies z.ZodType<Question, unknown>

const expectation = z.union([
  z.object({ equals: z.unknown() }).strict(),
  z.object({ resolves: z.unknown() }).strict(),
  z.object({ throws: z.union([z.string(), z.literal(true)]) }).strict(),
  z.object({ rejects: z.union([z.string(), z.literal(true)]) }).strict(),
  z.object({ satisfies: nonEmpty }).strict(),
])
const jsExpr = z.object({ $js: nonEmpty }).strict()
const argList = z.union([z.array(z.unknown()), jsExpr])

export const CheckSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('call'),
    title: nonEmpty,
    fn: nonEmpty.optional(),
    args: argList,
    then: argList.optional(),
    expect: expectation,
    unchanged: z.boolean().optional(),
    maxMs: z.number().positive().optional(),
    hidden: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('script'),
    title: z.string().optional(),
    code: nonEmpty,
    hidden: z.boolean().optional(),
  }),
]) satisfies z.ZodType<Check, unknown>

export const TaskSchema = z.object({
  id: nonEmpty,
  level: z.enum(['junior', 'middle', 'senior']),
  title: nonEmpty,
  exportName: nonEmpty,
  description: nonEmpty,
  starter: z.string(),
  checks: z.array(CheckSchema).min(1),
  language: z.enum(['javascript', 'typescript']).optional(),
  solution: z.string().optional(),
  hints: z.array(nonEmpty).optional(),
  rubric: z.array(z.object({ criterion: nonEmpty, weight: z.number().min(0).max(100) })).optional(),
  commonMistakes: z.array(nonEmpty).optional(),
}) satisfies z.ZodType<UITask>

/**
 * Приводит задачу из любого формата к текущему: в прежнем формате проверки — строки `tests` и `hiddenTests`
 * с кодом assert, они становятся сценарными проверками.
 */
export function coerceTask(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.checks)) return raw
  const { tests, hiddenTests, ...rest } = r
  const checks: unknown[] = []
  if (typeof tests === 'string' && tests.trim()) checks.push({ type: 'script', code: tests })
  if (typeof hiddenTests === 'string' && hiddenTests.trim()) checks.push({ type: 'script', hidden: true, code: hiddenTests })
  return { ...rest, checks }
}

const LEGACY_LEVEL: Record<string, string> = { junior: 'junior', middle: 'middle', mid: 'middle', senior: 'senior' }
const NUM_TO_LEVEL = ['junior', 'middle', 'senior']
const LEGACY_KINDS = ['screening', 'deep', 'architecture', 'practical']
const LEGACY_CATEGORY_TO_TOPIC: Record<string, string> = {
  javascript: 'js-core',
  typescript: 'typescript',
  html: 'html',
  css: 'css',
  react: 'react',
  'state management': 'state',
  architecture: 'architecture',
  algorithms: 'algorithms',
}

// Любые входные форматы приводим к виду, который понимает QuestionSchema:
//  1) уже новый формат (answer — объект) — не трогаем
//  2) прежний банк: { difficulty, bucket, category, answer: string }
//  3) простой: { id, level, category, question, answer }
export function coerceQuestion(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const r = raw as Record<string, unknown>
  if (r.answer && typeof r.answer === 'object') return raw

  const text = String(r.question ?? r.prompt ?? r.title ?? '')
  const level =
    typeof r.difficulty === 'number'
      ? NUM_TO_LEVEL[Math.min(Math.max(r.difficulty, 1), 3) - 1]
      : (LEGACY_LEVEL[String(r.level ?? '').toLowerCase()] ?? 'middle')
  const bucket = String(r.bucket ?? '').toLowerCase()
  const category = String(r.category ?? '').toLowerCase()
  return {
    id: r.id ?? undefined,
    title: r.title ?? text,
    prompt: r.prompt ?? text,
    level,
    kind: LEGACY_KINDS.includes(bucket) ? bucket : 'screening',
    topic: typeof r.topic === 'string' ? r.topic : (LEGACY_CATEGORY_TO_TOPIC[category] ?? 'general'),
    answer: { short: String(r.answer ?? '') },
  }
}

/** Короткое человекочитаемое описание первой ошибки валидации. */
export function describeIssue(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  const i = error.issues[0]
  if (!i) return 'неверный формат'
  const path = i.path.map(String).join('.')
  return path ? `${path}: ${i.message}` : i.message
}
