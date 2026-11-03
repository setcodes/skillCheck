import { describe, it, expect } from 'vitest'
import { FRONTEND_TASKS as FE } from '@/shared/api/tasks'
import { runInSandbox } from '@/shared/runner/core'

// Задачи, у которых эталонное решение не проходит собственные тесты. Сейчас таких нет:
// список должен оставаться пустым, новые сломанные задачи ловит `check`.
const KNOWN_BROKEN = new Set<string>()

// Стартовый шаблон бросает исключение, а тест успел создать Promise.reject(...) —
// в воркере это безвредный unhandledrejection, в Node он валит прогон.
process.on('unhandledRejection', () => {})

// Для каждой задачи Frontend: эталонное решение проходит свои тесты,
// стартовый шаблон — нет (иначе задача «решена» без усилий).
describe.each(FE.map((t) => [t.id, t] as const))('task %s', (_id, task) => {
  const solutionTest = KNOWN_BROKEN.has(task.id) ? it.fails : it
  solutionTest('solution проходит все тесты', async () => {
    const { results: res } = await runInSandbox({ code: task.solution ?? '', checks: task.checks.filter((c) => !c.hidden), exportName: task.exportName })
    const failed = res.filter((r) => !r.ok).map((r) => r.message)
    expect(res.length).toBeGreaterThan(0)
    expect(failed).toEqual([])
  })

  it('solution проходит скрытые проверки', async () => {
    const hidden = task.checks.filter((c) => c.hidden)
    expect(hidden.length, 'у задачи должны быть скрытые проверки').toBeGreaterThan(0)
    const { results } = await runInSandbox({ code: task.solution ?? '', checks: hidden, exportName: task.exportName })
    expect(results.length).toBeGreaterThanOrEqual(2)
    expect(results.filter((r) => !r.ok).map((r) => r.message)).toEqual([])
  })

  it('solution проходит все проверки одним запуском (как в приложении)', async () => {
    const { results } = await runInSandbox({ code: task.solution ?? '', checks: task.checks, exportName: task.exportName })
    expect(results.filter((r) => !r.ok).map((r) => r.message)).toEqual([])
    expect(results.some((r) => r.hidden)).toBe(true)
  })

  it('starter не проходит тесты', async () => {
    const { results: res } = await runInSandbox({ code: task.starter, checks: task.checks.filter((c) => !c.hidden), exportName: task.exportName })
    expect(res.some((r) => !r.ok)).toBe(true)
  })
})
