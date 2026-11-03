import { test, expect } from '@playwright/test'
import { FRONTEND_TASKS } from '../src/shared/api/tasks'
import { asRole, collectErrors, seedStorage } from './helpers'

const task = (id: string) => FRONTEND_TASKS.find((t) => t.id === id)!

async function runInEditor(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Запустить' }).click()
}

test.describe('решение задач', () => {
  test('эталонное решение проходит видимые и скрытые проверки', async ({ page }) => {
    const errors = collectErrors(page)
    const chunk = task('fe_chunk')
    await seedStorage(page, { 'solutions.v4': { fe_chunk: { code: chunk.solution } } })
    await page.goto('/solve/fe_chunk')
    await runInEditor(page)
    await expect(page.getByText('Все тесты пройдены!')).toBeVisible()
    const total = chunk.checks.filter((c) => c.hidden).length
    await expect(page.getByText(`Скрытые проверки: ${total} из ${total}`)).toBeVisible()
    expect(errors).toEqual([])
  })

  test('«Как проверяется» описывает проверки читаемо, скрытые не раскрываются', async ({ page }) => {
    await page.goto('/solve/fe_chunk')
    await page.getByRole('tab', { name: 'Как проверяется' }).click()
    const spec = page.getByRole('tabpanel').locator('pre')
    await expect(spec).toContainText('chunk([1, 2, 3, 4, 5], 2) → [[1, 2], [3, 4], [5]]')
    await expect(spec).not.toContainText('нулевой размер')
  })

  test('стартовый шаблон не проходит тесты', async ({ page }) => {
    await page.goto('/solve/fe_chunk')
    await runInEditor(page)
    await expect(page.getByText('Тесты не пройдены')).toBeVisible()
  })

  test('наивное решение проходит видимые тесты, но проваливает скрытые', async ({ page }) => {
    const naive = `export function debounce(fn, delay = 200) {
  let id;
  const f = (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), delay); };
  f.cancel = () => clearTimeout(id);
  return f;
}`
    await seedStorage(page, { role: 'candidate', 'solutions.v4': { fe_debounce: { code: naive } } })
    await page.goto('/solve/fe_debounce')
    await runInEditor(page)
    await expect(page.getByText('Тесты не пройдены')).toBeVisible()
    const summary = await page.getByText(/Скрытые проверки: \d+ из \d+/).textContent()
    const [, passed, total] = summary!.match(/(\d+) из (\d+)/)!.map(Number)
    expect(passed).toBeLessThan(total) // скрытая проверка про this провалена
    await expect(page.getByText(/^Скрытая проверка \d+$/).first()).toBeVisible() // кандидат не видит описаний
  })

  test('бесконечный цикл не вешает страницу', async ({ page }) => {
    await seedStorage(page, { 'solutions.v4': { fe_chunk: { code: 'export function chunk() { while (true) {} }' } } })
    await page.goto('/solve/fe_chunk')
    await runInEditor(page)
    await expect(page.getByText(/Превышено время выполнения/).first()).toBeVisible({ timeout: 20_000 })
    // страница отзывчива: можно переключить вкладку вывода
    await page.getByRole('tab', { name: 'Консоль' }).click()
    await expect(page.getByRole('tab', { name: 'Консоль' })).toHaveAttribute('aria-selected', 'true')
  })

  test('кандидат: подсказки открываются по одной, рубрика и эталон скрыты', async ({ page }) => {
    await asRole(page, 'candidate')
    await page.goto('/solve/fe_debounce')
    const hints = page.getByRole('region', { name: 'Подсказки' })
    await expect(hints.getByRole('listitem')).toHaveCount(0)
    await hints.getByRole('button', { name: 'Показать подсказку' }).click()
    await expect(hints.getByRole('listitem')).toHaveCount(1)
    await hints.getByRole('button', { name: 'Следующая подсказка' }).click()
    await expect(hints.getByRole('listitem')).toHaveCount(2)
    await expect(page.getByText('Рубрика оценки')).toHaveCount(0)
    await expect(page.getByText('Эталонное решение')).toHaveCount(0)
    await page.reload()
    await expect(hints.getByRole('listitem')).toHaveCount(2) // сохранилось
  })

  test('интервьюер: рубрика даёт предложенную оценку и применяет её', async ({ page }) => {
    await asRole(page, 'interviewer')
    await page.goto('/solve/fe_chunk')
    const rubric = page.getByRole('group', { name: 'Рубрика оценки' })
    await expect(rubric).toBeVisible()
    await expect(rubric.getByText('Предложенная оценка: 0 из 5')).toBeVisible()
    for (const box of await rubric.getByRole('checkbox').all()) await box.check()
    await expect(rubric.getByText('Предложенная оценка: 5 из 5')).toBeVisible()
    await rubric.getByRole('button', { name: 'Применить' }).click()
    await expect(page.getByLabel('Оценка (0–5):')).toHaveValue('5')
  })
})
