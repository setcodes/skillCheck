import { test, expect } from '@playwright/test'
import { asRole, collectErrors } from './helpers'

test.describe('главная и навигация', () => {
  test('активен только Frontend, остальные профессии — «Скоро»', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Выберите профессию' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Frontend/ })).toBeEnabled()
    for (const name of ['Backend', 'Аналитик', 'DevOps']) {
      await expect(page.getByRole('button', { name: new RegExp(name) })).toBeDisabled()
    }
    await expect(page.getByText('Скоро')).toHaveCount(3)
    expect(errors).toEqual([])
  })

  test('вход во Frontend ведёт на первую задачу, «назад» работает', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Frontend/ }).click()
    await expect(page).toHaveURL(/\/solve\/fe_/)
    await page.getByRole('navigation', { name: 'Разделы' }).getByRole('link', { name: 'Теория' }).click()
    await expect(page).toHaveURL(/\/theory/)
    await page.goBack()
    await expect(page).toHaveURL(/\/solve\//)
  })

  test('неизвестный адрес ведёт на главную', async ({ page }) => {
    await page.goto('/no/such/page')
    await expect(page).toHaveURL('/')
  })

  test('кандидат не попадает в разделы интервьюера', async ({ page }) => {
    await asRole(page, 'candidate')
    await page.goto('/data')
    await expect(page).toHaveURL(/\/solve\//)
    await page.goto('/interview')
    await expect(page).toHaveURL(/\/solve\//)
    await expect(page.getByRole('link', { name: 'Импорт / Экспорт' })).toHaveCount(0)
  })

  test('старая ссылка на вопрос ведёт на новый адрес', async ({ page }) => {
    await page.goto('/theory/html_06')
    await expect(page).toHaveURL(/\/theory\/fe-html-006/)
  })
})

test.describe('главная: клавиатура', () => {
  test('↑/↓ по профессиям, → в разделы, Enter открывает раздел', async ({ page }) => {
    await page.goto('/')
    const frontend = page.getByRole('button', { name: /Frontend/ })
    await expect(frontend).toBeFocused() // фокус приходит после анимации загрузки
    await page.keyboard.press('ArrowDown')
    await expect(page.getByText('банк в разработке')).toBeVisible()
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/theory/)
  })
})
