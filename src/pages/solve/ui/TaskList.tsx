import { Trash2 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import type { UITask } from '@/entities/task/model/types'
import { languageLabel } from '../lib/language'

interface Props {
  prof: string
  levels: UITask['level'][]
  level: UITask['level']
  tasks: UITask[]
  currentId?: string
  onLevel: (level: UITask['level']) => void
  onSelect: (id: string) => void
  onResetEvaluations: () => void
}

export function TaskList({ prof, levels, level, tasks, currentId, onLevel, onSelect, onResetEvaluations }: Props) {
  return (
    <div className="bg-card border rounded-lg p-6 h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Задачи — {prof}</h2>
        <Button variant="outline" size="sm" onClick={onResetEvaluations} className="inline-flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Сброс оценок
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Уровень сложности">
        {levels.map((l) => (
          <Button
            key={l}
            variant={level === l ? 'default' : 'outline'}
            size="sm"
            aria-pressed={level === l}
            onClick={() => onLevel(l)}
            className="capitalize"
          >
            {l}
          </Button>
        ))}
      </div>

      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
        {tasks.map((x) => (
          <Button
            key={x.id}
            variant={currentId === x.id ? 'secondary' : 'ghost'}
            aria-current={currentId === x.id ? 'true' : undefined}
            className="w-full justify-start text-left h-auto p-3"
            onClick={() => onSelect(x.id)}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{x.title}</span>
                <Badge variant="outline" className="text-[10px] tracking-wide">
                  {languageLabel(x.language)}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{x.level}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
