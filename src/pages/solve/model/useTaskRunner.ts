import { useCallback, useState } from 'react'
import { runTaskChecks, type TestResult } from '@/shared/api/runner'
import { useToast } from '@/shared/hooks/use-sonner'
import type { UITask } from '@/entities/task/model/types'

const FRIENDLY: [needle: string, prefix: string][] = [
  ['Превышено время выполнения', '⏱️ '],
  ['Test execution error', '💥 '],
]

function firstFailure(results: TestResult[]): string {
  const msg = results.find((r) => !r.ok)?.message ?? 'Неизвестная ошибка'
  if (msg.includes('No functions found')) return '🔍 Не найдены функции для выполнения'
  const hit = FRIENDLY.find(([needle]) => msg.includes(needle))
  return hit ? hit[1] + msg : msg
}

export function useTaskRunner(onResult: (taskId: string, code: string, results: TestResult[]) => void) {
  const { toast } = useToast()
  const [logs, setLogs] = useState<string[]>([])
  const [running, setRunning] = useState(false)

  const run = useCallback(
    async (task: UITask, code: string) => {
      if (running) return
      if (!code.trim()) {
        toast.warning('Нет кода для тестирования', 'Введите код решения перед запуском тестов')
        return
      }
      setRunning(true)
      toast.info('Запуск тестов...', 'Выполняются тесты для задачи')
      try {
        const { results, logs } = await runTaskChecks(task, code)
        setLogs(logs)
        onResult(task.id, code, results)
        const passed = results.filter((r) => r.ok).length
        if (results.length > 0 && passed === results.length) {
          toast.success('Все тесты пройдены!', `Успешно выполнено ${passed} из ${results.length} тестов`)
        } else {
          toast.error('Тесты не пройдены', `Пройдено ${passed} из ${results.length} тестов. ${firstFailure(results)}`)
        }
      } catch (e) {
        toast.error('Ошибка выполнения', `Не удалось запустить тесты: ${e instanceof Error ? e.message : 'неизвестная ошибка'}`)
      } finally {
        setRunning(false)
      }
    },
    [running, onResult, toast]
  )

  return { run, running, logs, clearLogs: () => setLogs([]) }
}
