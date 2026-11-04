import { describe, it, expect, vi } from 'vitest'
import { createSession, advanceSession, toggleRunning, resetClock, buildReport, pickBalanced, poolByLevel, randomSeed } from '@/shared/api/mock'
import type { MockSessionState, MockTaskItem, MockTheoryItem } from '@/entities/mock/model/types'

const make = (seed: number, cfg = {}) => createSession('frontend', { theoryCount: 12, taskCount: 6, level: 'middle', ...cfg }, { seed, now: 1_000_000, persist: false })

describe('мок-интервью: состав сессии', () => {
  it('одинаковый seed даёт одинаковую сессию, разный — другую', () => {
    const a = make(42)
    const b = make(42)
    const c = make(43)
    expect(a.items.map((i) => i.id + (i as any).questionId + (i as any).taskId)).toEqual(
      b.items.map((i) => i.id + (i as any).questionId + (i as any).taskId)
    )
    expect(JSON.stringify(a.items)).not.toBe(JSON.stringify(c.items))
    expect(a.seed).toBe(42)
  })

  it('seed берётся из crypto, а не из Math.random', () => {
    const spy = vi.spyOn(Math, 'random')
    const seeds = new Set(Array.from({ length: 5 }, () => randomSeed()))
    expect(spy).not.toHaveBeenCalled()
    expect(seeds.size).toBeGreaterThan(1)
    spy.mockRestore()
  })

  it('вопросы покрывают разные темы, без повторов, нужного уровня', () => {
    const s = make(7)
    const theory = s.items.filter((i): i is MockTheoryItem => i.type === 'theory')
    expect(theory).toHaveLength(12)
    expect(new Set(theory.map((t) => t.questionId)).size).toBe(12)
    expect(new Set(theory.map((t) => t.category)).size).toBeGreaterThanOrEqual(6)
    expect(theory.every((t) => t.difficulty === 2)).toBe(true)
  })

  it('задачи: нужный уровень, без повторов; при нехватке добираются ближайшие уровни', () => {
    const s = make(7, { taskCount: 6 })
    const tasks = s.items.filter((i): i is MockTaskItem => i.type === 'task')
    expect(tasks).toHaveLength(6)
    expect(tasks.every((t) => t.level === 'middle')).toBe(true)
    const many = make(7, { level: 'senior', taskCount: 12 }).items.filter((i): i is MockTaskItem => i.type === 'task')
    expect(many).toHaveLength(12)
    expect(new Set(many.map((t) => t.taskId)).size).toBe(12)
    expect(many.some((t) => t.level === 'middle')).toBe(true) // senior-задач меньше 12
  })

  it('pickBalanced берёт по кругу из разных тем', () => {
    const items = [...'aaaaaa'].map((_, i) => ({ t: 'A', i })).concat([...'bb'].map((_, i) => ({ t: 'B', i })), [{ t: 'C', i: 0 }])
    const picked = pickBalanced(items, 3, (x) => x.t, () => 0.5)
    expect(new Set(picked.map((x) => x.t)).size).toBe(3)
    expect(pickBalanced(items, 100, (x) => x.t, () => 0.5)).toHaveLength(items.length)
  })

  it('poolByLevel: приоритет точного уровня, затем ближайшие', () => {
    const items = [{ level: 'senior' }, { level: 'junior' }, { level: 'middle' }, { level: 'junior' }]
    expect(poolByLevel(items, 'junior', 2).every((x) => x.level === 'junior')).toBe(true)
    const wide = poolByLevel(items, 'junior', 3)
    expect(wide).toHaveLength(3)
    expect(wide.map((x) => x.level)).toEqual(['junior', 'junior', 'middle'])
  })
})

describe('мок-интервью: часы по меткам времени', () => {
  const base = () => make(1, { durationSec: 600 })

  it('учитывает реально прошедшее время, а не число тиков', () => {
    const s = base()
    // «фоновая вкладка»: следующий тик пришёл через 90 секунд
    const later = advanceSession(s, 1_000_000 + 90_000)
    expect(later.remainingSec).toBe(510)
    expect(later.tickedAt).toBe(1_090_000)
  })

  it('дробные доли секунды не теряются', () => {
    let s = base()
    s = advanceSession(s, 1_000_000 + 1_700) // 1 полная секунда
    expect(s.remainingSec).toBe(599)
    s = advanceSession(s, 1_000_000 + 2_100) // с учётом остатка — две секунды
    expect(s.remainingSec).toBe(598)
  })

  it('по истечении времени сессия завершается, оставшееся не уходит в минус', () => {
    const done = advanceSession(base(), 1_000_000 + 10_000_000)
    expect(done).toMatchObject({ remainingSec: 0, running: false, finished: true })
  })

  it('пауза замораживает время, продолжение идёт с текущего момента', () => {
    let s = base()
    s = toggleRunning(s, 1_000_000 + 10_000) // пауза через 10 с
    expect(s).toMatchObject({ running: false, remainingSec: 590 })
    expect(advanceSession(s, 1_000_000 + 500_000).remainingSec).toBe(590) // на паузе не идёт
    s = toggleRunning(s, 1_000_000 + 500_000) // продолжили
    expect(advanceSession(s, 1_000_000 + 505_000).remainingSec).toBe(585)
  })

  it('сброс таймера возвращает полное время на паузе', () => {
    const s = resetClock(advanceSession(base(), 1_000_000 + 30_000), 1_050_000)
    expect(s).toMatchObject({ remainingSec: 600, running: false })
  })

  it('сессия без tickedAt (старый формат) не ломается', () => {
    const old: MockSessionState = { ...base(), tickedAt: undefined }
    expect(advanceSession(old, 5_000_000).remainingSec).toBe(600)
  })
})

describe('мок-интервью: отчёт', () => {
  it('итог, уровень и разбивка теории по темам (слабые темы первыми)', () => {
    const s = make(3, { theoryCount: 4, taskCount: 2, weightTasks: 0.5 })
    let n = 0
    s.items = s.items.map((it) => {
      if (it.type === 'task') return { ...it, autoScore: 5 }
      n++
      return { ...it, category: n <= 2 ? 'Тема А' : 'Тема Б', selfScore: n <= 2 ? 1 : 5 }
    })
    const r = buildReport(s)
    expect(r.tasksAvg).toBe(5)
    expect(r.theoryAvg).toBe(3)
    expect(r.final).toBe(4)
    expect(r.finalPct).toBe(80)
    expect(r.level).toBe('Middle')
    expect(r.topics).toEqual([
      { topic: 'Тема А', count: 2, avg: 1 },
      { topic: 'Тема Б', count: 2, avg: 5 },
    ])
  })

  it('пустая сессия не даёт NaN', () => {
    const s = make(3, { theoryCount: 0, taskCount: 0 })
    const r = buildReport(s)
    expect(r.finalPct).toBe(0)
    expect(r.topics).toEqual([])
  })
})
