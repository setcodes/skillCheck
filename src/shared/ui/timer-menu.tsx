import type { ReactNode } from 'react'
import { Clock, Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
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
          <Button variant="outline" className="inline-flex items-center gap-2" aria-label={`${title}: ${timer.display}`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono" aria-live="off">{timer.display}</span>
            <span
              className={cn('h-2 w-2 rounded-full', timer.running ? 'bg-green-500' : 'bg-muted-foreground/50')}
              aria-hidden
            />
            <span className="sr-only">{timer.running ? 'идёт' : 'на паузе'}</span>
          </Button>
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
            <input
              id="timer-limit"
              className="w-full px-2 py-1 rounded border bg-card text-right font-mono"
              type="number"
              min={1}
              step={1}
              value={Math.floor(timer.limitSec / 60)}
              onChange={(e) => timer.setLimitSec(Math.max(1, Number(e.target.value) || 0) * 60)}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESETS_MIN.map((min) => (
                <Button key={min} variant="outline" size="sm" onClick={() => timer.setLimitSec(min * 60)}>
                  {min} мин
                </Button>
              ))}
            </div>
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="px-2 py-2 flex items-center gap-2">
          <Button variant="outline" size="sm" className="inline-flex items-center gap-1" onClick={timer.toggle}>
            {timer.running ? (<><Pause className="h-3 w-3" /> Пауза</>) : (<><Play className="h-3 w-3" /> Старт</>)}
          </Button>
          <Button variant="outline" size="sm" className="inline-flex items-center gap-1" onClick={timer.reset}>
            <RotateCcw className="h-3 w-3" /> Сброс
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
