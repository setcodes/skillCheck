import { describe, it, expect } from 'vitest'
import { FE } from '@/shared/api/tasks/frontend'
import questions from '@/shared/questions/frontend-qa-100.json'

type Q = { id: string; title: string; category: string; difficulty: number; bucket: string; prompt: string; answer: string }
const QS = questions as Q[]

describe('Frontend: вопросы', () => {
  it('id уникальны', () => {
    expect(new Set(QS.map((q) => q.id)).size).toBe(QS.length)
  })
  it('обязательные поля заполнены', () => {
    for (const q of QS) {
      for (const k of ['id', 'title', 'category', 'prompt', 'answer'] as const) {
        expect(typeof q[k] === 'string' && q[k].trim().length > 0, `${q.id}.${k}`).toBe(true)
      }
    }
  })
  it('difficulty 1–3, bucket из списка', () => {
    for (const q of QS) {
      expect([1, 2, 3], q.id).toContain(q.difficulty)
      expect(['screening', 'deep', 'architecture'], q.id).toContain(q.bucket)
    }
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
