import { describe, it, expect } from 'vitest'
import { FRONTEND_TASKS as FE } from '@/shared/api/tasks'
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
  it('всего задач не меньше 38', () => {
    expect(FE.length).toBeGreaterThanOrEqual(38)
  })
  it('в каждом уровне не меньше 8 задач', () => {
    for (const l of ['junior', 'middle', 'senior']) {
      expect(FE.filter((t) => t.level === l).length, l).toBeGreaterThanOrEqual(8)
    }
  })
})

describe('Frontend: развёрнутые ответы', () => {
  const parsed = (questions as unknown[]).map((q) => QuestionSchema.parse(q))
  const withFull = parsed.filter((q) => q.answer.full)

  it('у вопросов с полным ответом есть чек-лист «должно прозвучать»', () => {
    expect(withFull.length).toBeGreaterThanOrEqual(95)
    expect(withFull.filter((q) => q.answer.mustMention.length === 0).map((q) => q.id)).toEqual([])
  })
  it('полный ответ длиннее краткого', () => {
    for (const q of withFull) expect(q.answer.full!.length, q.id).toBeGreaterThanOrEqual(q.answer.short.length)
  })
  it('покрыты ключевые темы: сеть, безопасность, производительность, асинхронность, состояние', () => {
    const count = (t: string) => parsed.filter((q) => q.topic === t).length
    for (const t of ['browser-network', 'security', 'performance', 'async', 'state']) expect(count(t), t).toBeGreaterThanOrEqual(5)
  })
})
