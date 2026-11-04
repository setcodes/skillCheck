import type { ReactNode } from 'react'
import { Clock, Pause, Play, RotateCcw } from 'lucide-react'
import { ToolButton } from './tool-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { NumberField } from './field'
import type { useTimer } from '@/shared/hooks/use-timer'

interface Props {
  timer: ReturnType<typeof useTimer>
  title: string
  align?: 'start' | 'end'
  side?: 'top' | 'bottom'
  /** свой триггер вместо кнопки по умолчанию (например, в строке состояния) */
  children?: ReactNode
}

const PRESETS_MIN = [5, 15, 30, 60]

export function TimerMenu({ timer, title, align = 'end', side = 'bottom', children }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ?? (
          <ToolButton aria-label={`${title}: ${timer.display}`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono" aria-live="off">{timer.display}</span>
            <span
              className={cn('h-2 w-2 rounded-full', timer.running ? 'bg-primary' : 'bg-muted-foreground/50')}
              aria-hidden
            />
            <span className="sr-only">{timer.running ? 'идёт' : 'на паузе'}</span>
          </ToolButton>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-64">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">{title}</div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <div className="text-xs mb-1">Режим</div>
          <Select value={timer.mode} onValueChange={(m: 'up' | 'down') => timer.setMode(m)}>
            <SelectTrigger>
              <SelectValue placeholder="Режим" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="up">Прямой</SelectItem>
              <SelectItem value="down">Обратный</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {timer.mode === 'down' && (
          <div className="px-2 py-1.5">
            <label className="text-xs mb-1 block" htmlFor="timer-limit">Лимит (мин)</label>
            <NumberField id="timer-limit" min={1} max={600} value={Math.floor(timer.limitSec / 60)} onValue={(n) => timer.setLimitSec(Math.max(1, n) * 60)} className="w-full" />
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESETS_MIN.map((min) => (
                <ToolButton key={min} onClick={() => timer.setLimitSec(min * 60)}>
                  {min} мин
                </ToolButton>
              ))}
            </div>
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="px-2 py-2 flex items-center gap-2">
          <ToolButton onClick={timer.toggle}>
            {timer.running ? (<><Pause className="h-3 w-3" /> Пауза</>) : (<><Play className="h-3 w-3" /> Старт</>)}
          </ToolButton>
          <ToolButton onClick={timer.reset}>
            <RotateCcw className="h-3 w-3" /> Сброс
          </ToolButton>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
