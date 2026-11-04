import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ru } from 'react-day-picker/locale'
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { fieldClass } from './field'

const toIso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const fromIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : undefined
}
const human = (d: Date) => d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })

interface DateFieldProps {
  id?: string
  /** YYYY-MM-DD */
  value: string
  onChange: (iso: string) => void
  placeholder?: string
  className?: string
}

/** Поле даты с календарём во всплывающем окне — вместо браузерного date-пикера. */
export function DateField({ id, value, onChange, placeholder = 'выберите дату', className }: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const date = value ? fromIso(value) : undefined
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button id={id} type="button" className={cn(fieldClass, 'flex items-center justify-between gap-2 text-left', !date && 'text-muted-foreground', className)}>
          <span className="tabular-nums">{date ? human(date) : placeholder}</span>
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-sm p-3 font-mono shadow-[0_20px_50px_-20px_rgb(0_0_0/0.55)]">
        <DayPicker
          mode="single"
          locale={ru}
          weekStartsOn={1}
          selected={date}
          defaultMonth={date}
          onSelect={(d) => {
            if (d) onChange(toIso(d))
            setOpen(false)
          }}
          showOutsideDays
          components={{
            Chevron: ({ orientation }) =>
              orientation === 'left' ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />,
          }}
          classNames={{
            root: 'text-[0.8rem]',
            months: 'relative',
            month_caption: 'flex h-7 items-center px-1 font-bold capitalize text-foreground',
            nav: 'absolute right-0 top-0 flex gap-1',
            button_previous: 'grid h-7 w-7 place-items-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground',
            button_next: 'grid h-7 w-7 place-items-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground',
            month_grid: 'mt-2 border-collapse',
            weekdays: 'flex',
            weekday: 'w-8 pb-1 text-center text-[0.7rem] font-normal lowercase text-muted-foreground',
            week: 'flex',
            day: 'h-8 w-8 p-0 text-center',
            day_button:
              'h-8 w-8 rounded-sm tabular-nums text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            today: '[&>button]:text-primary-text [&>button]:font-bold',
            selected: '[&>button]:bg-primary [&>button]:!text-primary-foreground [&>button]:hover:bg-primary',
            outside: '[&>button]:text-muted-foreground/40',
            disabled: 'opacity-40',
          }}
        />
        <div className="mt-2 flex justify-between border-t pt-2 text-xs">
          <button type="button" className="rounded-sm px-1.5 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => { onChange(toIso(new Date())); setOpen(false) }}>
            сегодня
          </button>
          {value && (
            <button type="button" className="rounded-sm px-1.5 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => { onChange(''); setOpen(false) }}>
              очистить
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface TimeFieldProps {
  id?: string
  /** ЧЧ:ММ */
  value: string
  onChange: (value: string) => void
  className?: string
}

/** Длительность ЧЧ:ММ: цифры раскладываются по маске сами, ↑/↓ меняют минуты на 5. */
export function TimeField({ id, value, onChange, className }: TimeFieldProps) {
  const format = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4)
    return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits
  }
  const step = (dir: 1 | -1) => {
    const [h = 0, m = 0] = value.split(':').map(Number)
    const total = Math.max(0, Math.min(99 * 60 + 59, h * 60 + m + dir * 5))
    onChange(`${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`)
  }
  return (
    <span className={cn('relative block', className)}>
      <input
        id={id}
        inputMode="numeric"
        placeholder="00:00"
        value={value.slice(0, 5)}
        onChange={(e) => onChange(format(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            step(e.key === 'ArrowUp' ? 1 : -1)
          }
        }}
        className={cn(fieldClass, 'pr-8 tabular-nums')}
      />
      <Clock className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </span>
  )
}
