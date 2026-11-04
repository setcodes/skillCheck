import { useState } from 'react'
import { ChevronLeft, ChevronRight, FileCode2, FileText, Flag, Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ToolButton } from '@/shared/ui/tool-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { ThemedEditor } from '@/features/code-editor/ui'
import { formatSeconds } from '@/shared/lib/timer'
import type { MockSessionState, MockTaskItem, MockTheoryItem } from '@/entities/mock/model/types'

interface Props {
  s: MockSessionState
  language: string
  logs: string[]
  running: boolean
  onIndex: (i: number) => void
  onAnswer: (id: string, text: string) => void
  onCode: (id: string, code: string) => void
  onRun: () => void
  onToggleTimer: () => void
  onResetTimer: () => void
  onFinish: () => void
}

/** Текущий пункт сессии: вкладка, таймер, завершение, ответ или редактор задачи. */
export function MockSession({ s, language, logs, running, onIndex, onAnswer, onCode, onRun, onToggleTimer, onResetTimer, onFinish }: Props) {
  const [finishOpen, setFinishOpen] = useState(false)
  const cur = s.items[s.currentIndex]
  const n = s.items.length
  const num = String(s.currentIndex + 1).padStart(2, '0')
  const isTask = cur.type === 'task'
  const task = cur as MockTaskItem
  const theory = cur as MockTheoryItem
  const low = s.remainingSec <= s.config.durationSec * 0.1

  return (
    <div className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
      <div className="flex h-9 shrink-0 items-stretch justify-between gap-2 border-b bg-card font-mono">
        <span className="flex min-w-0 items-center gap-2 border-r bg-background px-3 text-xs text-foreground shadow-[inset_0_2px_0_hsl(var(--primary))]">
          {isTask ? <FileCode2 className="h-3.5 w-3.5 shrink-0 text-ansi-yellow" aria-hidden /> : <FileText className="h-3.5 w-3.5 shrink-0 text-ansi-blue" aria-hidden />}
          <span className="truncate">
            {num}-{isTask ? 'task.js' : 'theory.md'}
          </span>
        </span>
        <div className="flex shrink-0 items-center gap-1.5 pr-2">
          <ToolButton variant="ghost" onClick={() => onIndex(Math.max(0, s.currentIndex - 1))} disabled={s.currentIndex === 0} aria-label="Предыдущий пункт">
            <ChevronLeft aria-hidden />
          </ToolButton>
          <ToolButton variant="ghost" onClick={() => onIndex(Math.min(n - 1, s.currentIndex + 1))} disabled={s.currentIndex === n - 1} aria-label="Следующий пункт">
            <ChevronRight aria-hidden />
          </ToolButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-sm border px-2 font-mono text-xs tabular-nums transition-colors hover:border-primary',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  low ? 'border-ansi-red text-ansi-red' : s.running ? 'text-primary-text' : 'text-muted-foreground'
                )}
              >
                <Timer className="h-3.5 w-3.5" aria-hidden />
                {formatSeconds(s.remainingSec)}
                <span className={cn('h-1.5 w-1.5 rounded-full', s.running ? 'bg-primary motion-safe:animate-pulse' : 'bg-muted-foreground/50')} aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 font-mono">
              <div className="px-2 py-1.5 text-xs text-muted-foreground">Таймер сессии · {s.running ? 'идёт' : 'на паузе'}</div>
              <DropdownMenuSeparator />
              <div className="flex items-center gap-2 px-2 py-2">
                <ToolButton onClick={onToggleTimer} disabled={!s.config.allowPause} title={s.config.allowPause ? '' : 'Пауза отключена'}>
                  {s.running ? <Pause aria-hidden /> : <Play aria-hidden />}
                  {s.running ? 'Пауза' : 'Старт'}
                </ToolButton>
                <ToolButton onClick={onResetTimer}>
                  <RotateCcw aria-hidden />
                  Сброс
                </ToolButton>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover open={finishOpen} onOpenChange={setFinishOpen}>
            <PopoverTrigger asChild>
              <ToolButton>
                <Flag aria-hidden />
                Завершить
              </ToolButton>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 font-mono text-xs">
              <div className="space-y-2">
                <p className="text-sm font-bold text-foreground">Завершить сессию?</p>
                <p className="text-muted-foreground">
                  Оставшееся время: <span className="tabular-nums text-foreground">{formatSeconds(s.remainingSec)}</span>
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <ToolButton onClick={() => setFinishOpen(false)}>Отмена</ToolButton>
                  <ToolButton
                    variant="primary"
                    onClick={() => {
                      setFinishOpen(false)
                      onFinish()
                    }}
                  >
                    Завершить
                  </ToolButton>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <header className="shrink-0 border-b bg-background px-5 py-3 font-mono">
        <p className="text-xs text-muted-foreground">
          {num}/{String(n).padStart(2, '0')} · <span className={isTask ? 'text-ansi-yellow' : 'text-ansi-blue'}>{isTask ? 'практика' : 'теория'}</span>
          {!isTask && <> · {theory.category}</>}
          {isTask && <> · {task.level}</>}
        </p>
        <h1 className="mt-1 text-base font-bold text-foreground">{cur.title}</h1>
        <p className="mt-1 max-w-[80ch] text-[0.85rem] leading-relaxed text-muted-foreground">{isTask ? task.description : theory.prompt}</p>
      </header>

      {isTask ? (
        <>
          <div className="h-[50vh] min-h-[14rem] lg:h-auto lg:min-h-0 lg:flex-[3]">
            <ThemedEditor
              key={cur.id}
              value={task.code ?? task.starter}
              language={language}
              onChange={(code) => onCode(cur.id, code)}
              onRun={onRun}
              label={`Редактор задачи ${cur.title}`}
            />
          </div>
          <section aria-label="Результаты" className="shrink-0 border-t bg-card font-mono text-[0.8rem] lg:max-h-[40%] lg:overflow-y-auto">
            <div className="flex h-9 items-center justify-between gap-2 border-b px-4 text-xs">
              <span className="text-muted-foreground">
                <span className="text-primary-text" aria-hidden>$ </span>skillcheck test
              </span>
              <ToolButton variant="primary" onClick={onRun} disabled={running} aria-keyshortcuts="Control+Enter Meta+Enter">
                <Play aria-hidden />
                Запустить
              </ToolButton>
            </div>
            <div className="space-y-1 px-4 py-3" aria-live="polite">
              {running ? (
                <p className="text-muted-foreground">выполняю в песочнице…</p>
              ) : typeof task.passedCount === 'number' ? (
                <p>
                  <span className={task.passedCount === task.totalCount ? 'text-ok' : 'text-ansi-red'}>
                    {task.passedCount}/{task.totalCount} проверок пройдено
                  </span>
                  <span className="text-muted-foreground"> · автооценка {task.autoScore} из 5</span>
                </p>
              ) : (
                <p className="text-muted-foreground">Проверки ещё не запускались — «Запустить» или ⌘/Ctrl+Enter в редакторе.</p>
              )}
              {logs.length > 0 && (
                <div className="mt-2 space-y-0.5 border-t pt-2">
                  {logs.map((l, i) => (
                    <p key={i} className="whitespace-pre-wrap break-words text-muted-foreground">{l}</p>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <div className="flex-1 bg-background lg:min-h-0 lg:overflow-y-auto">
          <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
            <label htmlFor="mock-answer" className="mb-2 block font-mono text-xs text-muted-foreground">
              <span className="text-primary-text" aria-hidden>❯ </span>ваш ответ — сохраняется автоматически
            </label>
            <textarea
              id="mock-answer"
              placeholder="Ваш ответ..."
              value={theory.answerDraft ?? ''}
              onChange={(e) => onAnswer(cur.id, e.target.value)}
              className="min-h-[16rem] w-full resize-y rounded-sm border bg-card p-4 text-[0.95rem] leading-relaxed outline-none focus:border-primary"
            />
            <div className="mt-3 flex justify-end">
              <ToolButton variant="primary" onClick={() => onIndex(Math.min(n - 1, s.currentIndex + 1))} disabled={s.currentIndex === n - 1}>
                Следующий пункт
                <ChevronRight aria-hidden />
              </ToolButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
