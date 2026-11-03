import { z } from 'zod'
import type { TheoryQuestion } from '@/entities/question/model/types'
import type { UITask } from '@/entities/task/model/types'

const nonEmpty = z.string().trim().min(1)

export const QuestionSchema = z.object({
  id: nonEmpty,
  title: nonEmpty,
  category: nonEmpty,
  difficulty: z.number().int().min(1).max(5),
  bucket: z.enum(['screening', 'deep', 'architecture']),
  prompt: nonEmpty,
  answer: nonEmpty,
}) satisfies z.ZodType<TheoryQuestion>

export const TaskSchema = z.object({
  id: nonEmpty,
  level: z.enum(['junior', 'middle', 'senior']),
  title: nonEmpty,
  exportName: nonEmpty,
  description: nonEmpty,
  starter: z.string(),
  tests: nonEmpty,
  language: z.enum(['javascript', 'typescript']).optional(),
  solution: z.string().optional(),
}) satisfies z.ZodType<UITask>

// Принимаем и «простой» формат: { id, level, category, question, answer }
const LEVEL_TO_DIFFICULTY: Record<string, number> = { junior: 1, middle: 2, mid: 2, senior: 3 }

export function coerceQuestion(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const r = raw as Record<string, unknown>
  const text = String(r.question ?? r.prompt ?? r.title ?? '')
  return {
    id: r.id ?? undefined,
    title: r.title ?? text,
    category: r.category ?? 'General',
    difficulty:
      typeof r.difficulty === 'number'
        ? r.difficulty
        : (LEVEL_TO_DIFFICULTY[String(r.level ?? '').toLowerCase()] ?? 2),
    bucket: r.bucket ?? 'screening',
    prompt: r.prompt ?? text,
    answer: r.answer ?? '',
  }
}
