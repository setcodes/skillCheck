import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { applyCompletion, type Tone } from '../model/commands'

export interface ConsoleEntry {
  id: number
  kind: 'input' | 'output'
  text: string
  tone?: Tone
}

interface Props {
  entries: ConsoleEntry[]
  history: string[]
  onSubmit: (text: string) => void
  complete: (text: string) => string[]
  suggestions?: string[]
  footer?: ReactNode
  /** высота области вывода */
  logClassName?: string
  className?: string
  inputId: string
}

export interface ConsoleViewHandle {
  focus: () => void
}

const TONES: Record<Tone, string> = {
  out: 'text-foreground',
  muted: 'text-muted-foreground',
  ok: 'text-primary-text',
  error: 'text-ansi-red',
  accent: 'text-ansi-yellow',
}

export const ConsoleView = forwardRef<ConsoleViewHandle, Props>(function ConsoleView(
  { entries, history, onSubmit, complete, suggestions = [], footer, logClassName, className, inputId },
  ref
) {
  const [value, setValue] = useState('')
  const [cursor, setCursor] = useState<number | null>(null)
  const [hint, setHint] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), [])

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [entries])

  const options = value.trim() ? complete(value) : []
  // «призрачное» продолжение: единственный вариант для последнего слова
  const last = value.match(/\S*$/)?.[0] ?? ''
  const ghost = options.length === 1 && options[0].startsWith(last.toLowerCase()) ? options[0].slice(last.length) : ''

  const submit = (text: string) => {
    onSubmit(text)
    setValue('')
    setCursor(null)
    setHint([])
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && value.trim()) {
      e.preventDefault()
      const next = applyCompletion(value, options)
      setHint(next === value && options.length > 1 ? options : [])
      setValue(next)
      return
    }
    if (e.key === 'ArrowRight' && ghost && inputRef.current?.selectionStart === value.length) {
      e.preventDefault()
      setValue(applyCompletion(value, options))
      return
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (history.length === 0) return
      e.preventDefault()
      const up = e.key === 'ArrowUp'
      const base = cursor ?? history.length
      const next = Math.min(history.length, Math.max(0, base + (up ? -1 : 1)))
      setCursor(next === history.length ? null : next)
      setValue(next === history.length ? '' : history[next])
      return
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      submit('clear')
    }
  }

  return (
    <div className={cn('font-mono text-sm', className)}>
      <div ref={logRef} role="log" aria-live="polite" aria-label="Вывод консоли" className={cn('space-y-0.5 overflow-y-auto', logClassName)}>
        {entries.map((e) =>
          e.kind === 'input' ? (
            <p key={e.id} className="flex gap-2 pt-1.5 text-foreground">
              <span className="text-primary-text" aria-hidden>$</span>
              <span className="break-all">{e.text}</span>
            </p>
          ) : (
            <p key={e.id} className={cn('whitespace-pre-wrap break-words pl-4', TONES[e.tone ?? 'out'])}>
              {e.text}
            </p>
          )
        )}
      </div>

      <form
        className="mt-2 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          submit(value)
        }}
      >
        <label htmlFor={inputId} className="text-primary-text">
          <span aria-hidden>$</span>
          <span className="sr-only">Команда</span>
        </label>
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute inset-0 whitespace-pre text-muted-foreground/60" aria-hidden>
            <span className="invisible">{value}</span>
            {ghost}
          </span>
          <input
            ref={inputRef}
            id={inputId}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setCursor(null)
              setHint([])
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={value ? '' : 'help'}
            aria-describedby={`${inputId}-hint`}
            className="relative w-full !bg-transparent p-0 !text-foreground caret-primary outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </form>

      {hint.length > 0 && <p className="mt-1 pl-4 text-muted-foreground">{hint.join('   ')}</p>}

      <div id={`${inputId}-hint`} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {suggestions.length > 0 && (
          <span className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  submit(s)
                  inputRef.current?.focus()
                }}
                className="rounded-sm border px-1.5 py-0.5 transition-colors hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {s}
              </button>
            ))}
          </span>
        )}
        {footer}
      </div>
    </div>
  )
})
