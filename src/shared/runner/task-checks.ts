import type { UITask } from '@/entities/task/model/types'
import { runChecksWithLogs } from './index'
import type { SandboxOutput } from './types'

/**
 * Запускает все проверки задачи одним запуском песочницы.
 * Результаты скрытых проверок помечены hidden: true — интерфейс решает, что показывать кандидату.
 */
export function runTaskChecks(task: Pick<UITask, 'checks' | 'exportName'>, code: string): Promise<SandboxOutput> {
  return runChecksWithLogs(code, task.checks, task.exportName)
}
