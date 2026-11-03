import { test, expect, type Page } from '@playwright/test'
import { collectErrors } from './helpers'

async function startSession(page: Page) {
  await page.getByPlaceholder('Иванов Иван Иванович').fill('Тестов Тест Тестович')
  await page.getByRole('spinbutton').nth(0).fill('4') // вопросы
  await page.getByRole('spinbutton').nth(1).fill('2') // задачи
  await page.getByRole('button', { name: 'Начать' }).click()
  await expect(page.getByText('Мок‑интервью — прогресс')).toBeVisible()
}

test.describe('мок-интервью', () => {
  test('сессия: состав, таймер по времени, пауза, перезагрузка, завершение и отчёт', async ({ page }) => {
    const errors = collectErrors(page)
    await page.clock.install()
    await page.goto('/mock')
    await startSession(page)

    // состав сессии: 4 вопроса + 2 задачи
    await expect(page.getByText('01:30:00').first()).toBeVisible()

    // время идёт по часам, а не по числу тиков
    await page.clock.runFor(65_000)
    await expect(page.getByText('01:28:55').first()).toBeVisible()

    // пауза замораживает время (кнопки — в меню таймера)
    const timerMenu = () => page.getByRole('button', { name: /^\d\d:\d\d:\d\d$/ }).first()
    await timerMenu().click()
    await page.getByRole('button', { name: 'Пауза' }).click()
    await page.keyboard.press('Escape')
    await page.clock.runFor(30_000)
    await expect(page.getByText('01:28:55').first()).toBeVisible()
    await timerMenu().click()
    await page.getByRole('button', { name: 'Старт' }).click()
    await page.keyboard.press('Escape')
    await page.clock.runFor(5_000)
    await expect(page.getByText('01:28:50').first()).toBeVisible()

    // ответ на теоретический вопрос сохраняется и переживает перезагрузку
    const answer = page.getByPlaceholder('Ваш ответ...')
    if (await answer.count()) {
      await answer.fill('Мой ответ')
      await page.reload()
      await expect(page.getByPlaceholder('Ваш ответ...')).toHaveValue('Мой ответ')
    }
    await expect(page.getByText('Мок‑интервью — прогресс')).toBeVisible()

    // завершение и отчёт с разбивкой по темам
    await page.getByRole('button', { name: 'Завершить' }).first().click()
    await page.getByRole('button', { name: 'Завершить' }).last().click()
    await expect(page.getByText('Итоговый процент')).toBeVisible()
    await expect(page.getByText('Теория по темам')).toBeVisible()
    await expect(page.getByRole('list', { name: 'Результаты по темам' }).getByRole('listitem').first()).toContainText('из 5')
    expect(errors).toEqual([])
  })

  test('сессии с разными seed отличаются, набор вопросов — разнообразный', async ({ page }) => {
    await page.goto('/mock')
    const read = async () => {
      await startSession(page)
      const raw = await page.evaluate(() => localStorage.getItem('mock.session.v1'))
      const session = JSON.parse(raw!)
      await page.getByRole('button', { name: 'Завершить' }).first().click()
      await page.getByRole('button', { name: 'Завершить' }).last().click()
      await page.getByRole('button', { name: 'К конфигурации' }).click()
      return session
    }
    const a = await read()
    const b = await read()
    expect(a.seed).not.toBe(b.seed)
    expect(a.seed).toBeGreaterThan(0)
    const topics = new Set(a.items.filter((i: any) => i.type === 'theory').map((i: any) => i.category))
    expect(topics.size).toBeGreaterThanOrEqual(3) // 4 вопроса — из разных тем
    expect(JSON.stringify(a.items)).not.toBe(JSON.stringify(b.items))
  })

  test('время идёт, пока страница была закрыта (сессия хранит метку тика)', async ({ page }) => {
    await page.goto('/mock')
    await startSession(page)
    // «перематываем» сохранённую сессию на 10 минут назад, как будто вкладка была закрыта
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('mock.session.v1')!)
      s.tickedAt -= 10 * 60 * 1000
      localStorage.setItem('mock.session.v1', JSON.stringify(s))
    })
    await page.reload()
    // 90:00 - 10:00 = 80:00 (допускаем несколько секунд на загрузку)
    await expect(page.getByText(/01:19:[45]\d/).first()).toBeVisible()
  })
})
