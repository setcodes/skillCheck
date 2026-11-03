import { test, expect } from '@playwright/test'
import { asRole, collectErrors } from './helpers'

test.describe('кейсы', () => {
  test('интервьюер видит находки по риску, кандидат — нет', async ({ page }) => {
    const errors = collectErrors(page)
    await asRole(page, 'interviewer')
    await page.goto('/cases')
    await expect(page).toHaveURL(/\/cases\/case-/)
    await page.getByRole('button', { name: /Ревью: поиск пользователей/ }).click()
    await expect(page.getByRole('heading', { name: 'Ревью: поиск пользователей с подсказками' })).toBeVisible()
    await expect(page.getByText(/Что нужно найти \(11\)/i)).toBeVisible()
    await expect(page.getByText('Гонка запросов: старый ответ перезаписывает новый')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('кандидат видит задание и код, но не находки и не эталон', async ({ page }) => {
    await asRole(page, 'candidate')
    await page.goto('/cases/case-review-user-search')
    await expect(page.getByText('Проведите ревью этого компонента')).toBeVisible()
    await expect(page.getByText('UserSearch.tsx')).toBeVisible()
    await expect(page.getByText(/Что нужно найти/i)).toHaveCount(0)
    await page.goto('/cases/case-live-autocomplete')
    await expect(page.getByText(/Эталонное решение/i)).toHaveCount(0)
  })
})

test.describe('quiz «Что выведет код?»', () => {
  test('выбор ответа показывает вердикт и разбор, прогресс переживает перезагрузку', async ({ page }) => {
    await page.goto('/quiz/quiz-finally-return')
    await expect(page.getByRole('heading', { name: 'return и finally' })).toBeVisible()
    await page.getByRole('button', { name: 'try', exact: true }).click() // неверный вариант
    await expect(page.getByText('Неверно', { exact: true })).toBeVisible()
    await expect(page.getByText('Разбор', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByText('Неверно', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Пройти заново' }).click()
    await expect(page.getByText('Неверно', { exact: true })).toHaveCount(0)
    await page.getByRole('button', { name: 'finally try' }).click()
    await expect(page.getByText('Верно', { exact: true }).first()).toBeVisible()
  })
})

test.describe('теория', () => {
  test('интервьюер видит эталон и чек-лист, кандидат — «ответы скрыты»', async ({ page }) => {
    await asRole(page, 'interviewer')
    await page.goto('/theory/fe-browser-network-002')
    await expect(page.getByText('Должно прозвучать')).toBeVisible()
    await page.getByRole('button', { name: 'Кандидат' }).click()
    await expect(page.getByText('В режиме «Кандидат» ответы скрыты.')).toBeVisible()
  })
})
