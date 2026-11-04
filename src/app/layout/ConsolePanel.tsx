import { useEffect, useRef } from 'react'
import { Timer, X } from 'lucide-react'
import { ConsoleView, type ConsoleViewHandle } from '@/features/command-console'
import { cn } from '@/shared/lib/utils'
import { useApp } from '../providers/AppProvider'
import { useConsole } from '../providers/ConsoleProvider'
import { useInterviewTimer } from '../providers/InterviewTimerProvider'
import { useLocation } from 'react-router-dom'

const SUGGESTIONS = ['ls', 'cd задачи', 'cd теория', 'timer start', 'help']

/** Выезжающая снизу консоль, доступная на любой странице по ⌘K / Ctrl+K или `. */
export function ConsolePanel() {
  const { entries, history, submit, complete, panelOpen, close } = useConsole()
  const { role } = useApp()
  const timer = useInterviewTimer()
  const { pathname } = useLocation()
  const viewRef = useRef<ConsoleViewHandle>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen, close])

  useEffect(() => {
    if (!panelOpen) return
    returnFocus.current = document.activeElement as HTMLElement | null
    viewRef.current?.focus()
    return () => returnFocus.current?.focus?.()
  }, [panelOpen])

  if (!panelOpen) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:pb-6 print:hidden">
      <section
        role="dialog"
        aria-modal="false"
        aria-label="Консоль"
        className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-lg border bg-card shadow-[0_30px_80px_-20px_rgb(0_0_0/0.55),0_0_0_1px_hsl(var(--border))] motion-safe:animate-slide-up"
      >
        <div className="flex h-9 items-center justify-between gap-3 border-b bg-surface px-3 font-mono text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
            <span className="font-medium text-foreground">skillcheck</span>
            <span className="truncate">{pathname}</span>
          </span>
          <span className="flex items-center gap-3">
            <span className={cn('flex items-center gap-1 tabular-nums', timer.running && 'text-primary-text')}>
              <Timer className="h-3.5 w-3.5" aria-hidden />
              {timer.display}
              <span className="sr-only">{timer.running ? ', идёт' : ', на паузе'}</span>
            </span>
            <span className="hidden sm:inline">{role === 'interviewer' ? 'интервьюер' : 'кандидат'}</span>
            <kbd className="hidden rounded-sm bg-muted px-1 sm:inline" aria-hidden>esc</kbd>
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть консоль"
              className="grid h-6 w-6 place-items-center rounded-sm hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </span>
        </div>
        <ConsoleView
          ref={viewRef}
          inputId="console-panel-input"
          entries={entries}
          history={history}
          onSubmit={submit}
          complete={complete}
          suggestions={SUGGESTIONS}
          logClassName="max-h-[40vh] min-h-[7rem]"
          className="px-4 pb-4 pt-3"
        />
      </section>
    </div>
  )
}
