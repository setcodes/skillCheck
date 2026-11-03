import { describe, it, expect, vi } from 'vitest'

vi.mock('@/shared/runner/index', () => ({
  runModuleWithLogs: vi.fn(async (_code: string, tests: string) => ({
    results: [{ ok: tests === 'ok', message: tests }],
    logs: [`log:${tests}`],
  })),
}))

import { runTaskChecks } from '@/shared/runner/task-checks'
import { suggestScore } from '@/pages/solve/ui/ScorePanel'

describe('runTaskChecks', () => {
  it('без скрытых проверок возвращает только видимые', async () => {
    const out = await runTaskChecks({ tests: 'ok' }, 'code')
    expect(out.results).toEqual([{ ok: true, message: 'ok' }])
  })

  it('результаты скрытых проверок помечаются hidden, логи — только видимого запуска', async () => {
    const out = await runTaskChecks({ tests: 'ok', hiddenTests: 'bad' }, 'code')
    expect(out.results).toEqual([
      { ok: true, message: 'ok' },
      { ok: false, message: 'bad', hidden: true },
    ])
    expect(out.logs).toEqual(['log:ok'])
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
