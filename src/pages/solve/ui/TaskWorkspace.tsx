import { useEffect, useState } from 'react'
import { Clock, FileCode2, Maximize2, Minimize2, PanelLeft, Play, RotateCcw, Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ToolButton } from '@/shared/ui/tool-button'
import { TimerMenu } from '@/shared/ui/timer-menu'
import type { useTimer } from '@/shared/hooks/use-timer'
import type { UITask } from '@/entities/task/model/types'
import type { UserRole } from '@/entities/user/model/types'
import { describeChecks } from '@/shared/runner/describe-checks'
import type { Solution } from '../model/useSolutions'
import { detectLanguage } from '../lib/language'
import { HintsPanel } from './HintsPanel'
import { InspectorSection } from '@/shared/ui/inspector-section'
import { OutputPanel } from './OutputPanel'
import { ReferenceSolution } from './ReferenceSolution'
import { ScorePanel } from './ScorePanel'
import { ThemedEditor } from '@/features/code-editor/ui'

interface Props {
  task: UITask
  role: UserRole
  solution: Solution
  timer: ReturnType<typeof useTimer>
  logs: string[]
  running: boolean
  onCode: (code: string) => void
  onRun: (code: string) => void
  onResetTask: () => void
  onResetTests: () => void
  onClearLogs: () => void
  onScore: (score: number) => void
  onComment: (comment: string) => void
  onSendScore: () => void
  onRevealHint: () => void
  onRubric: (done: number[]) => void
  onToggleExplorer: () => void
}

type EditorTab = 'mine' | 'reference'

const tabClass = (active: boolean) =>
  cn(
    'flex items-center gap-2 border-r px-3 text-xs transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    active ? 'bg-background text-foreground shadow-[inset_0_2px_0_hsl(var(--primary))]' : 'text-muted-foreground hover:text-foreground'
  )

/** Окно задачи: вкладки файлов, условие, редактор, вывод проверок и инспектор справа. */
export function TaskWorkspace(p: Props) {
  const { task, role, solution } = p
  const interviewer = role === 'interviewer'
  const language = detectLanguage(task)
  const ext = language === 'typescript' ? 'ts' : 'js'
  const code = solution.code ?? task.starter
  const [tab, setTab] = useState<EditorTab>('mine')
  const [maximized, setMaximized] = useState(false)

  // другая задача или роль — снова своё решение
  useEffect(() => setTab('mine'), [task.id, role])

  useEffect(() => {
    if (!maximized) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMaximized(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [maximized])

  const run = () => p.onRun(code)
  const showReference = interviewer && !!task.solution && tab === 'reference'

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div
        className={cn(
          'flex min-w-0 flex-col lg:min-h-0 lg:flex-1',
          maximized && 'fixed inset-0 z-40 bg-background'
        )}
      >
        {/* строка вкладок и действий */}
        <div className="flex h-9 shrink-0 items-stretch justify-between gap-2 border-b bg-card font-mono">
          <div className="flex min-w-0 items-stretch overflow-x-auto">
            <button
              type="button"
              onClick={p.onToggleExplorer}
              aria-label="Список задач"
              className="flex items-center border-r px-2.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring xl:hidden"
            >
              <PanelLeft className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" onClick={() => setTab('mine')} className={tabClass(tab === 'mine')} aria-pressed={tab === 'mine'}>
              <FileCode2 className="h-3.5 w-3.5 text-ansi-yellow" aria-hidden />
              {task.exportName}.{ext}
              {solution.code !== undefined && solution.code !== task.starter && (
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" title="изменено" aria-hidden />
              )}
            </button>
            {interviewer && task.solution && (
              <button type="button" onClick={() => setTab('reference')} className={tabClass(tab === 'reference')} aria-pressed={tab === 'reference'}>
                <Star className="h-3.5 w-3.5 text-ansi-yellow" fill="currentColor" stroke="none" aria-hidden />
                эталон.{ext}
                <span className="text-muted-foreground">только чтение</span>
              </button>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pr-2">
            <TimerMenu timer={p.timer} title="Таймер задачи">
              <ToolButton variant="ghost" aria-label={`Таймер задачи: ${p.timer.display}`} className={cn(p.timer.running && 'text-primary-text')}>
                <Clock aria-hidden />
                <span className="tabular-nums">{p.timer.display}</span>
              </ToolButton>
            </TimerMenu>
            <ToolButton variant="ghost" onClick={p.onResetTask} title="Вернуть стартовый код" className="max-md:hidden">
              <RotateCcw aria-hidden />
              сбросить
            </ToolButton>
            <ToolButton
              variant="ghost"
              onClick={() => setMaximized((m) => !m)}
              aria-label={maximized ? 'Свернуть редактор' : 'Развернуть редактор'}
              title={maximized ? 'Свернуть (Esc)' : 'Развернуть'}
            >
              {maximized ? <Minimize2 aria-hidden /> : <Maximize2 aria-hidden />}
            </ToolButton>
            <ToolButton variant="primary" onClick={run} disabled={p.running} aria-keyshortcuts="Control+Enter Meta+Enter">
              <Play aria-hidden />
              Запустить
              <kbd className="rounded-sm bg-primary-foreground/15 px-1 text-[0.65rem] max-sm:hidden" aria-hidden>⌘↵</kbd>
            </ToolButton>
          </div>
        </div>

        {/* условие */}
        <header className="shrink-0 border-b bg-background px-5 py-3 font-mono">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h1 className="text-base font-bold text-foreground">{task.title}</h1>
            <span className="text-xs text-muted-foreground">
              <span className="text-ansi-blue">{task.level}</span> · {language}
            </span>
          </div>
          <p className="mt-1 max-w-[80ch] text-[0.8rem] leading-relaxed text-muted-foreground">{task.description}</p>
        </header>

        <div className="h-[55vh] min-h-[16rem] lg:h-auto lg:min-h-0 lg:flex-[3]">
          {showReference ? (
            <ThemedEditor key="reference" value={task.solution ?? ''} language={language} onChange={() => {}} onRun={run} label="Эталонное решение, только чтение" readOnly />
          ) : (
            <ThemedEditor key={task.id} value={code} language={language} onChange={p.onCode} onRun={run} label={`Редактор: ${task.exportName}.${ext}`} />
          )}
        </div>

        <div className="flex h-72 min-h-0 flex-col lg:h-auto lg:flex-[2]">
          <OutputPanel
            results={solution.lastResult ?? []}
            logs={p.logs}
            spec={describeChecks(task.checks, task.exportName)}
            role={role}
            running={p.running}
            command={`skillcheck test ${task.exportName}`}
            onClearResults={p.onResetTests}
            onClearLogs={p.onClearLogs}
          />
        </div>
      </div>

      {/* инспектор */}
      <aside aria-label="Инспектор" className="shrink-0 border-t bg-card lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0 2xl:w-96">
        {task.hints && <HintsPanel hints={task.hints} used={solution.hintsUsed ?? 0} role={role} onReveal={p.onRevealHint} />}
        {interviewer && task.commonMistakes && task.commonMistakes.length > 0 && (
          <InspectorSection label="Типичные ошибки" title="Типичные ошибки">
            <ul className="space-y-1.5">
              {task.commonMistakes.map((m, i) => (
                <li key={i} className="flex gap-2 leading-relaxed">
                  <span className="text-ansi-red" aria-hidden>!</span>
                  <span className="text-foreground">{m}</span>
                </li>
              ))}
            </ul>
          </InspectorSection>
        )}
        {interviewer && task.solution && <ReferenceSolution solution={task.solution} onOpenInEditor={() => setTab('reference')} />}
        {interviewer && (
          <ScorePanel
            score={solution.score}
            comment={solution.comment}
            rubric={task.rubric}
            rubricDone={solution.rubricDone ?? []}
            hintsUsed={solution.hintsUsed ?? 0}
            onRubric={p.onRubric}
            onScore={p.onScore}
            onComment={p.onComment}
            onSend={p.onSendScore}
          />
        )}
        {!interviewer && (
          <InspectorSection label="Как это работает" title="Как это работает">
            <p className="leading-relaxed text-muted-foreground">
              Видимые проверки описаны во вкладке «Как проверяется». Скрытые ловят граничные случаи — их описания видит только интервьюер.
            </p>
          </InspectorSection>
        )}
      </aside>
    </div>
  )
}
