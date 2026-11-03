import { useCallback, useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/app/providers/AppProvider'
import { useTasks } from '@/shared/bank'
import { useToast } from '@/shared/hooks/use-sonner'
import { useTimer } from '@/shared/hooks/use-timer'
import { formatSeconds } from '@/shared/lib/timer'
import { KEYS, clearAllEvaluations, readJSON, writeJSON } from '@/shared/storage/storage'
import { ENABLED_PROFESSIONS } from '@/entities/profession/model/constants'
import type { UITask } from '@/entities/task/model/types'
import type { TestResult } from '@/shared/api/runner'
import { useSolutions } from './model/useSolutions'
import { useTaskRunner } from './model/useTaskRunner'
import { TaskList } from './ui/TaskList'
import { TaskWorkspace } from './ui/TaskWorkspace'

export default function SolvePage() {
  const { role, prof } = useApp()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { taskId } = useParams()
  const tasks = useTasks(prof)
  const { solutions, patch, clearAll } = useSolutions()

  const task = tasks.find((t) => t.id === taskId)
  const levels = useMemo(() => [...new Set(tasks.map((t) => t.level))] as UITask['level'][], [tasks])
  const list = useMemo(() => tasks.filter((t) => t.level === task?.level), [tasks, task?.level])

  const onResult = useCallback(
    (id: string, code: string, lastResult: TestResult[]) => patch(id, { code, lastResult }),
    [patch]
  )
  const runner = useTaskRunner(onResult)

  const timer = useTimer({
    storageKey: KEYS.taskTimer(prof, task?.id ?? 'none'),
    pauseOnLeave: true,
    onEvent: (event, remaining) => {
      const name = task ? `Задача: ${task.title}` : undefined
      if (event === 'half') toast.info('Половина времени по задаче', `Осталось ~ ${formatSeconds(remaining)}`)
      if (event === 'tenPercent') toast.warning('Меньше 10% времени по задаче', `Осталось ~ ${formatSeconds(remaining)}`)
      if (event === 'expired') toast.error('Время по задаче истекло', name)
    },
  })

  if (tasks.length === 0) {
    return <p className="text-muted-foreground text-center py-12">Для этой профессии пока нет задач</p>
  }
  if (!task) return <Navigate to={`/solve/${tasks[0].id}`} replace />

  const solution = solutions[task.id] ?? {}

  const sendScore = () => {
    const bridge = readJSON<Record<string, unknown>>(KEYS.taskScoresBridge, {})
    bridge[`${prof}:${task.level}:${task.id}`] = {
      prof,
      level: task.level,
      taskId: task.id,
      title: task.title,
      score: solution.score ?? 0,
      comment: solution.comment ?? '',
    }
    writeJSON(KEYS.taskScoresBridge, bridge)
    toast.success('Оценка отправлена!', 'Оценка сохранена и доступна в режиме интервью')
  }

  const resetEvaluations = () => {
    if (!window.confirm('Сбросить все оценки, комментарии и решения?')) return
    clearAllEvaluations(ENABLED_PROFESSIONS)
    clearAll()
    toast.success('Все оценки сброшены', 'Очищены оценки задач, теории и решения')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
      <div className="lg:col-span-1 h-full min-h-0">
        <TaskList
          prof={prof}
          levels={levels}
          level={task.level}
          tasks={list}
          currentId={task.id}
          onLevel={(l) => {
            const first = tasks.find((t) => t.level === l)
            if (first) navigate(`/solve/${first.id}`)
          }}
          onSelect={(id) => navigate(`/solve/${id}`)}
          onResetEvaluations={resetEvaluations}
        />
      </div>
      <div className="lg:col-span-2 h-full min-h-0">
        <div className="bg-card border rounded-lg h-full flex flex-col">
          <TaskWorkspace
            task={task}
            role={role}
            solution={solution}
            timer={timer}
            logs={runner.logs}
            onCode={(code) => patch(task.id, { code })}
            onRun={(code) => runner.run(task, code)}
            onResetTask={() => {
              patch(task.id, { code: task.starter, lastResult: undefined })
              runner.clearLogs()
              toast.info('Задача сброшена', 'Код возвращен к исходному состоянию')
            }}
            onResetTests={() => {
              patch(task.id, { lastResult: undefined })
              runner.clearLogs()
              toast.info('Результаты очищены', 'Очищены результаты тестов и консоль')
            }}
            onClearLogs={runner.clearLogs}
            onScore={(score) => patch(task.id, { score })}
            onComment={(comment) => patch(task.id, { comment })}
            onSendScore={sendScore}
          />
        </div>
      </div>
    </div>
  )
}
