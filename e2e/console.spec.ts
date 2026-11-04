import { test, expect } from '@playwright/test'
import { asRole, collectErrors } from './helpers'

test.describe('консоль', () => {
  test('ls, дополнение по Tab и переход в раздел', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/')
    await page.keyboard.press('Control+k')
    const input = page.getByRole('dialog', { name: 'Консоль' }).getByRole('textbox', { name: 'Команда' })
    await input.fill('ls')
    await input.press('Enter')
    await expect(page.getByRole('log', { name: 'Вывод консоли' })).toContainText('теория/')
    await input.fill('cd те')
    await input.press('Tab')
    await expect(input).toHaveValue('cd теория ')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/theory/)
    expect(errors).toEqual([])
  })

  test('панель по Ctrl+K на любой странице: таймер и закрытие по Esc', async ({ page }) => {
    await page.goto('/solve')
    await page.keyboard.press('Control+k')
    const panel = page.getByRole('dialog', { name: 'Консоль' })
    await expect(panel).toBeVisible()
    const input = panel.getByRole('textbox', { name: 'Команда' })
    await expect(input).toBeFocused()
    await input.fill('timer 30')
    await input.press('Enter')
    await expect(panel).toContainText('обратный отсчёт 30 мин запущен')
    await input.press('Escape')
    await expect(panel).toBeHidden()
    await page.getByRole('button', { name: 'Открыть консоль' }).click()
    await expect(panel).toBeVisible()
  })

  test('кандидату закрыты разделы интервьюера', async ({ page }) => {
    await asRole(page, 'candidate')
    await page.goto('/')
    await page.keyboard.press('Control+k')
    const input = page.getByRole('dialog', { name: 'Консоль' }).getByRole('textbox', { name: 'Команда' })
    await input.fill('cd интервью')
    await input.press('Enter')
    await expect(page.getByRole('log', { name: 'Вывод консоли' })).toContainText('доступен только интервьюеру')
    await expect(page).toHaveURL('/')
  })
})
