import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/** Базовый вид поля: моноширинный, тонкая рамка, акцент на фокусе. */
export const fieldClass =
  'h-8 w-full rounded-sm border bg-background px-2 font-mono text-[0.8rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-muted-foreground/50 focus:border-primary focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-ansi-red'

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(fieldClass, className)} {...props} />
})

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { className, ...props },
  ref
) {
  return <textarea ref={ref} className={cn(fieldClass, 'h-auto min-h-[80px] resize-y py-2 leading-relaxed', className)} {...props} />
})

interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | undefined
  onValue: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const clamp = (v: number, min?: number, max?: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v))
// шаг 0.1 / 0.5 без хвостов плавающей точки
const round = (v: number, step: number) => Number((Math.round(v / step) * step).toFixed(4))

/** Число со своими кнопками −/+ вместо браузерных стрелок; стрелки ↑/↓ клавиатуры тоже работают. */
export function NumberField({ value, onValue, min, max, step = 1, className, disabled, onBlur, ...props }: NumberFieldProps) {
  const bump = (dir: 1 | -1) => onValue(clamp(round((value ?? min ?? 0) + dir * step, step), min, max))
  const btn =
    'grid w-6 shrink-0 place-items-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
  return (
    <span
      className={cn(
        'inline-flex h-8 items-stretch overflow-hidden rounded-sm border bg-background font-mono text-[0.8rem] transition-colors focus-within:border-primary hover:border-muted-foreground/50',
        disabled && 'opacity-50',
        className
      )}
    >
      <button type="button" tabIndex={-1} aria-hidden onClick={() => bump(-1)} disabled={disabled || (min !== undefined && (value ?? min) <= min)} className={cn(btn, 'border-r')}>
        <Minus className="h-3 w-3" />
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={value ?? ''}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        // пустое или недописанное («0.») не трогаем; минимум применяем на blur, чтобы можно было набрать «120» при min=10
        onChange={(e) => e.target.value !== '' && onValue(Math.min(max ?? Infinity, Number(e.target.value)))}
        onBlur={(e) => {
          const n = e.target.value === '' ? (min ?? 0) : Number(e.target.value)
          if (n !== value || n !== clamp(n, min, max)) onValue(clamp(n, min, max))
          onBlur?.(e)
        }}
        className="w-12 min-w-0 flex-1 !bg-transparent px-1 text-center tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        {...props}
      />
      <button type="button" tabIndex={-1} aria-hidden onClick={() => bump(1)} disabled={disabled || (max !== undefined && (value ?? 0) >= max)} className={cn(btn, 'border-l')}>
        <Plus className="h-3 w-3" />
      </button>
    </span>
  )
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean
  onChecked: (checked: boolean) => void
}

/** Чекбокс в духе TUI: `[✓]` / `[ ]`. Под рисунком — настоящий input: клавиатура и скринридер как у нативного. */
export function Checkbox({ checked, onChecked, className, ...props }: CheckboxProps) {
  return (
    <span className={cn('relative inline-grid h-4 w-4 shrink-0 place-items-center', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChecked(e.target.checked)}
        className="peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-[3px] border border-muted-foreground/70 !bg-background outline-none transition-colors checked:border-primary checked:!bg-primary hover:border-primary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      <svg viewBox="0 0 16 16" aria-hidden className="pointer-events-none relative h-3 w-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100">
        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
