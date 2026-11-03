import { describe, it, expect } from 'vitest'
import { FE } from '@/shared/api/tasks/frontend'
import questions from '@/shared/questions/frontend.json'
import { QuestionSchema, describeIssue } from '@/shared/bank/schema'

const QS = questions as unknown[]

describe('Frontend: вопросы', () => {
  it('все вопросы проходят схему', () => {
    for (const raw of QS) {
      const r = QuestionSchema.safeParse(raw)
      expect(r.success, `${(raw as { id: string }).id}: ${r.success ? '' : describeIssue(r.error)}`).toBe(true)
    }
  })
  it('id и alias уникальны и не пересекаются', () => {
    const parsed = QS.map((q) => QuestionSchema.parse(q))
    const ids = parsed.map((q) => q.id)
    const aliases = parsed.flatMap((q) => q.aliases ?? [])
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(aliases).size).toBe(aliases.length)
    expect(aliases.filter((a) => ids.includes(a))).toEqual([])
  })
  it('id начинается с fe-<тема>-', () => {
    for (const q of QS.map((x) => QuestionSchema.parse(x))) expect(q.id.startsWith(`fe-${q.topic}-`), q.id).toBe(true)
  })
})

describe('Frontend: задачи', () => {
  it('id уникальны', () => {
    expect(new Set(FE.map((t) => t.id)).size).toBe(FE.length)
  })
  it('у каждой задачи есть starter, tests, solution, exportName', () => {
    for (const t of FE) {
      for (const k of ['starter', 'tests', 'solution', 'exportName', 'description'] as const) {
        expect((t[k] ?? '').trim().length > 0, `${t.id}.${k}`).toBe(true)
      }
    }
  })
  it('в каждом уровне есть задачи', () => {
    for (const l of ['junior', 'middle', 'senior']) {
      expect(FE.filter((t) => t.level === l).length, l).toBeGreaterThan(0)
    }
  })
})
