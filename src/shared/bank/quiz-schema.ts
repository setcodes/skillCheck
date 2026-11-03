import { z } from 'zod'
import type { QuizItem } from '@/entities/quiz/model/types'
import { TOPIC_IDS } from '@/entities/question/model/topics'

const nonEmpty = z.string().trim().min(1)

export const QuizSchema = z
  .object({
    id: z.string().regex(/^quiz-[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id: quiz-<slug>'),
    version: z.number().int().min(1).default(1),
    title: nonEmpty.max(100),
    level: z.enum(['junior', 'middle', 'senior']),
    topic: z.enum(TOPIC_IDS),
    tags: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).default([]),
    prompt: nonEmpty,
    code: nonEmpty,
    options: z.array(nonEmpty).min(2).max(6),
    correct: z.number().int().min(0),
    output: z.array(z.string()).min(1),
    explanation: nonEmpty,
    pitfalls: z.array(nonEmpty).default([]),
    reviewedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .default(null),
  })
  .superRefine((q, ctx) => {
    if (q.correct >= q.options.length) ctx.addIssue({ code: 'custom', message: 'correct вне диапазона options' })
    else if (q.options[q.correct] !== q.output.join('\n')) {
      ctx.addIssue({ code: 'custom', message: 'правильный вариант должен совпадать с output' })
    }
    if (new Set(q.options).size !== q.options.length) ctx.addIssue({ code: 'custom', message: 'варианты ответа повторяются' })
  }) satisfies z.ZodType<QuizItem, unknown>
