import { chromium, type FullConfig } from '@playwright/test'

// Dev-сервер Vite оптимизирует зависимости при первом заходе на страницу и перезагружает её.
// Прогреваем все маршруты до тестов, чтобы параллельные прогоны не ловили эту перезагрузку.
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL!
  const browser = await chromium.launch()
  const page = await browser.newPage()
  for (const path of ['/', '/solve/fe_chunk', '/theory', '/cases', '/quiz', '/mock']) {
    await page.goto(baseURL + path, { waitUntil: 'networkidle' }).catch(() => {})
    await page.waitForTimeout(500)
  }
  await browser.close()
}
