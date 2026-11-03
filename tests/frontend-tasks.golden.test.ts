import { describe, it, expect } from 'vitest'
import { FE } from '@/shared/api/tasks/frontend'
import { runInSandbox } from '@/shared/runner/core'

// Задачи, у которых эталонное решение не проходит собственные тесты. Теперь причина в самих
// задачах (контент), а не в раннере: тест useState проверяет невозможное (снимок
// деструктурированного значения), тест useMemo расходится с эталоном, eventDelegate требует DOM (в воркере его нет), у flatten
// тест ожидает неверный результат. Чинятся в Фазе 3/4 при миграции на формат задач.
// Если задача из списка начала проходить — тест упадёт и попросит убрать её отсюда.
const KNOWN_BROKEN = new Set(['fe_useState', 'fe_useMemo', 'fe_eventDelegate', 'fe_flatten'])

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
