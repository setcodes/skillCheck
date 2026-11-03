import { describe, it, expect } from 'vitest'
import { FE } from '@/shared/api/tasks/frontend'
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
    const { results: res } = await runInSandbox({ code: task.solution ?? '', tests: task.tests })
    const failed = res.filter((r) => !r.ok).map((r) => r.message)
    expect(res.length).toBeGreaterThan(0)
    expect(failed).toEqual([])
  })

  it('starter не проходит тесты', async () => {
    const { results: res } = await runInSandbox({ code: task.starter, tests: task.tests })
    expect(res.some((r) => !r.ok)).toBe(true)
  })
})
