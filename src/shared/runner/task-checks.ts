import type { UITask } from '@/entities/task/model/types'
import { runModuleWithLogs } from './index'
import type { SandboxOutput } from './types'

/**
 * Запускает видимые тесты задачи и, если они есть, скрытые проверки.
 * Результаты скрытых помечаются hidden: true — интерфейс решает, что показывать кандидату.
 */
export async function runTaskChecks(
  task: Pick<UITask, 'tests' | 'hiddenTests'>,
  code: string
): Promise<SandboxOutput> {
  const visible = await runModuleWithLogs(code, task.tests)
  if (!task.hiddenTests) return visible
  const hidden = await runModuleWithLogs(code, task.hiddenTests)
  return {
    results: [...visible.results, ...hidden.results.map((r) => ({ ...r, hidden: true }))],
    logs: visible.logs,
  }
}
