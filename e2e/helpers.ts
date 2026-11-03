import type { Page } from '@playwright/test'

type Role = 'interviewer' | 'candidate'

/** Заранее кладёт данные в localStorage до загрузки приложения. */
export async function seedStorage(page: Page, data: Record<string, unknown>) {
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
  }, data)
}

export const asRole = (page: Page, role: Role) => seedStorage(page, { role })

/** Ошибки консоли и необработанные исключения страницы — тест падает, если они были. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|fonts\.g|cdn\.jsdelivr|net::ERR/.test(m.text())) errors.push(`console: ${m.text()}`)
  })
  return errors
}
