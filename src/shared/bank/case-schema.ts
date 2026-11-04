import { z } from 'zod'
import type { Case } from '@/entities/case/model/types'
import { TOPIC_IDS } from '@/entities/question/model/topics'

const nonEmpty = z.string().trim().min(1)
const list = z.array(nonEmpty).default([])
const file = z.object({
  name: nonEmpty,
  language: z.enum(['tsx', 'ts', 'js']),
  code: z.string(),
})

export const CaseSchema = z
  .object({
    id: z.string().regex(/^case-[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id: case-<slug>'),
    version: z.number().int().min(1).default(1),
    title: nonEmpty.max(100),
    kind: z.enum(['review', 'live']),
    level: z.enum(['junior', 'middle', 'senior']),
    topic: z.enum(TOPIC_IDS),
    tags: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).default([]),
    brief: nonEmpty,
    context: list,
    requirements: list,
    files: z.array(file).default([]),
    solution: z.array(file).default([]),
    issues: z
      .array(
        z.object({
          title: nonEmpty,
          risk: z.enum(['critical', 'important', 'quality', 'cosmetic']),
          consequence: nonEmpty,
          fix: nonEmpty,
        })
      )
      .default([]),
    grading: list,
    followUps: list,
    testsToMention: list,
    reviewedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .default(null),
  })
  .superRefine((c, ctx) => {
    if (c.kind === 'review' && (c.files.length === 0 || c.issues.length === 0)) {
      ctx.addIssue({ code: 'custom', message: 'review-кейс требует files и issues' })
    }
    if (c.kind === 'live' && c.requirements.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'live-кейс требует requirements' })
    }
  }) satisfies z.ZodType<Case, unknown>
