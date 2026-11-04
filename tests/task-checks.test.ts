import { describe, it, expect, vi } from 'vitest'

vi.mock('@/shared/runner/index', () => ({
  runChecksWithLogs: vi.fn(async (code: string, checks: unknown[], exportName: string) => ({
    results: [{ ok: true, message: `${exportName}:${checks.length}:${code}` }],
    logs: [],
  })),
}))

import { runTaskChecks } from '@/shared/runner/task-checks'
import { suggestScore } from '@/pages/solve/ui/ScorePanel'

describe('runTaskChecks', () => {
  it('передаёт в песочницу код, все проверки и имя экспорта одним запуском', async () => {
    const out = await runTaskChecks({ checks: [{ type: 'script', code: 'a' }, { type: 'script', code: 'b', hidden: true }], exportName: 'fn' }, 'CODE')
    expect(out.results).toEqual([{ ok: true, message: 'fn:2:CODE' }])
  })
})

describe('suggestScore', () => {
  const rubric = [{ weight: 40 }, { weight: 30 }, { weight: 20 }, { weight: 10 }]
  it('шкала 0–5 с шагом 0.5 по весам выполненных критериев', () => {
    expect(suggestScore(rubric, [])).toBe(0)
    expect(suggestScore(rubric, [0, 1, 2, 3])).toBe(5)
    expect(suggestScore(rubric, [0])).toBe(2)
    expect(suggestScore(rubric, [0, 2])).toBe(3)
    expect(suggestScore(rubric, [1, 3])).toBe(2)
  })
  it('пустая рубрика и неверные индексы не ломают расчёт', () => {
    expect(suggestScore([], [0])).toBe(0)
    expect(suggestScore(rubric, [99])).toBe(0)
  })
})
