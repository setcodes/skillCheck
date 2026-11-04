import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Explorer, type ExplorerMark } from '@/shared/ui/explorer'
import { ToolButton } from '@/shared/ui/tool-button'
import type { UITask } from '@/entities/task/model/types'
import type { Solution } from '../model/useSolutions'

interface Props {
  tasks: UITask[]
  solutions: Record<string, Solution>
  currentId: string
  onSelect: (id: string) => void
  onResetEvaluations: () => void
  className?: string
  onClose?: () => void
}

const LEVELS: UITask['level'][] = ['junior', 'middle', 'senior']

function markOf(task: UITask, s?: Solution): ExplorerMark | undefined {
  const results = s?.lastResult
  if (results && results.length > 0) {
    return results.every((r) => r.ok)
      ? { text: '✓', tone: 'text-ok', label: 'все проверки пройдены' }
      : { text: '✗', tone: 'text-ansi-red', label: 'есть проваленные проверки' }
  }
  if (s?.code !== undefined && s.code !== task.starter) return { text: '●', tone: 'text-ansi-yellow', label: 'код изменён, не запускался' }
  return undefined
}

/** Проводник задач: папки по уровням и статус решения. */
export function TaskExplorer({ tasks, solutions, currentId, onSelect, onResetEvaluations, className, onClose }: Props) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return LEVELS.map((level) => ({
      id: level,
      name: level,
      hint: `Уровень ${level}`,
      items: tasks
        .filter((t) => t.level === level && (!q || t.title.toLowerCase().includes(q) || t.exportName.toLowerCase().includes(q)))
        .map((t) => ({ id: t.id, title: t.title, mark: markOf(t, solutions[t.id]) })),
    })).filter((g) => g.items.length > 0)
  }, [tasks, solutions, query])

  const passed = tasks.filter((t) => markOf(t, solutions[t.id])?.text === '✓').length

  return (
    <Explorer
      title="задачи"
      label="Список задач"
      counter={
        <span title="Решено полностью" className="tabular-nums">
          {passed}/{tasks.length}
        </span>
      }
      groups={groups}
      currentId={currentId}
      onSelect={onSelect}
      query={query}
      onQuery={setQuery}
      className={className}
      onClose={onClose}
      footer={
        <ToolButton variant="ghost" onClick={onResetEvaluations} className="w-full justify-start">
          <Trash2 aria-hidden />
          Сброс оценок
        </ToolButton>
      }
    />
  )
}
