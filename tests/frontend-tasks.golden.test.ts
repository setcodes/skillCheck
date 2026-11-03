import { describe, it, expect } from 'vitest'
import { FE } from '@/shared/api/tasks/frontend'
import { runModule } from '@/shared/api/runner'

// Задачи, у которых эталонное решение не проходит собственные тесты в текущем раннере
// (regex-вырезание TS-типов ломается на стрелочных типах, классы не находятся, и т.п.).
// Список должен только сокращаться: Фаза 2 (Worker-раннер + транспиляция TS) обнуляет его.
// Если задача из списка начала проходить — тест упадёт и попросит убрать её отсюда.
const KNOWN_BROKEN = new Set([
  'fe_uniqueBy', 'fe_sumBy', 'fe_throttle', 'fe_safeGet', 'fe_promiseAllSettled',
  'fe_debounce', 'fe_useState', 'fe_useEffect', 'fe_useMemo', 'fe_deepClone',
  'fe_curry', 'fe_eventDelegate', 'fe_fetchJSON', 'fe_LRU', 'fe_memoize',
  'fe_flatten', 'fe_compose', 'fe_virtualScroll',
])

// Для каждой задачи Frontend: эталонное решение проходит свои тесты,
// стартовый шаблон — нет (иначе задача «решена» без усилий).
describe.each(FE.map((t) => [t.id, t] as const))('task %s', (_id, task) => {
  const solutionTest = KNOWN_BROKEN.has(task.id) ? it.fails : it
  solutionTest('solution проходит все тесты', async () => {
    const res = await runModule(task.solution ?? '', task.tests)
    const failed = res.filter((r) => !r.ok).map((r) => r.message)
    expect(res.length).toBeGreaterThan(0)
    expect(failed).toEqual([])
  })

  it('starter не проходит тесты', async () => {
    const res = await runModule(task.starter, task.tests)
    expect(res.some((r) => !r.ok)).toBe(true)
  })
})
