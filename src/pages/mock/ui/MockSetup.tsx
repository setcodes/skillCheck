import { useState, type ReactNode } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ToolButton } from '@/shared/ui/tool-button'
import { InspectorSection } from '@/shared/ui/inspector-section'

export type MockLevel = 'junior' | 'middle' | 'senior'

export interface MockSetupValues {
  theoryCount: number
  taskCount: number
  durationMin: number
  allowPause: boolean
  level: MockLevel
  weightTasks: number
  candName: string
  candDept: string
  candPos: string
  showExtra: boolean
}

interface Props {
  values: MockSetupValues
  onChange: (patch: Partial<MockSetupValues>) => void
  onStart: () => void
}

const LEVELS: MockLevel[] = ['junior', 'middle', 'senior']

const field = 'h-7 rounded-sm border bg-background px-2 text-foreground outline-none focus:border-primary'

/** Строка-флаг команды: `--name значение` и пояснение справа. */
function Flag({ name, htmlFor, hint, children }: { name: string; htmlFor?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid items-center gap-x-4 gap-y-1 py-1.5 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <label htmlFor={htmlFor} className="text-ansi-cyan">
        --{name}
        {hint && <span className="sr-only"> — {hint}</span>}
      </label>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {children}
        {hint && <span className="text-xs text-muted-foreground" aria-hidden>{hint}</span>}
      </div>
    </div>
  )
}

/** Настройка сессии в виде команды с флагами — команда собирается вживую. */
export function MockSetup({ values: v, onChange, onStart }: Props) {
  const [touched, setTouched] = useState(false)
  const nameMissing = !v.candName.trim()
  const command = [
    'skillcheck mock',
    `--candidate "${v.candName.trim() || '…'}"`,
    `--questions ${v.theoryCount}`,
    `--tasks ${v.taskCount}`,
    `--level ${v.level}`,
    `--time ${v.durationMin}`,
    `--weight-tasks ${v.weightTasks}`,
    v.allowPause ? '--allow-pause' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <div className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
        <div className="flex h-9 shrink-0 items-stretch border-b bg-card font-mono">
          <span className="flex items-center gap-2 border-r bg-background px-3 text-xs text-foreground shadow-[inset_0_2px_0_hsl(var(--primary))]">
            mock.config
          </span>
        </div>
        <div className="flex-1 bg-background lg:min-h-0 lg:overflow-y-auto">
          <form
            className="mx-auto max-w-3xl space-y-8 px-5 py-8 font-mono text-[0.85rem] sm:px-8"
            onSubmit={(e) => {
              e.preventDefault()
              setTouched(true)
              if (!nameMissing) onStart()
            }}
          >
            <header className="space-y-2">
              <h1 className="font-display text-2xl font-bold leading-snug tracking-[-0.02em] text-foreground">Мок‑интервью</h1>
              <p className="max-w-[65ch] font-sans text-base leading-relaxed text-muted-foreground">
                Сконфигурируйте сессию и начните тренировку: случайные вопросы и задачи, общий таймер и отчёт по темам в конце.
              </p>
            </header>

            <section className="rounded-sm border bg-card">
              <p className="border-b px-4 py-2 text-xs text-muted-foreground">
                <span className="text-primary-text" aria-hidden>$ </span>skillcheck mock \
              </p>
              <div className="divide-y divide-border/60 px-4 py-2">
                <Flag name="questions" htmlFor="mock-questions" hint="вопросов по теории">
                  <input id="mock-questions" type="number" min={1} max={30} value={v.theoryCount} onChange={(e) => onChange({ theoryCount: Number(e.target.value) || 0 })} className={cn(field, 'w-20 text-right tabular-nums')} />
                </Flag>
                <Flag name="tasks" htmlFor="mock-tasks" hint="задач на практику">
                  <input id="mock-tasks" type="number" min={1} max={30} value={v.taskCount} onChange={(e) => onChange({ taskCount: Number(e.target.value) || 0 })} className={cn(field, 'w-20 text-right tabular-nums')} />
                </Flag>
                <Flag name="candidate" htmlFor="mock-name">
                  <input
                    id="mock-name"
                    required
                    value={v.candName}
                    onChange={(e) => onChange({ candName: e.target.value })}
                    onBlur={() => setTouched(true)}
                    placeholder="Иванов Иван Иванович"
                    aria-invalid={touched && nameMissing}
                    aria-describedby="mock-name-hint"
                    className={cn(field, 'w-full max-w-sm', touched && nameMissing && 'border-ansi-red')}
                  />
                  <span id="mock-name-hint" className={cn('text-xs', touched && nameMissing ? 'text-ansi-red' : 'text-muted-foreground')}>
                    ФИО {touched && nameMissing ? '— обязательно' : 'для отчёта'}
                  </span>
                </Flag>
                <Flag name="level" hint="уровень задач">
                  <div className="flex gap-1" role="group" aria-label="Уровень задач">
                    {LEVELS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        aria-pressed={v.level === l}
                        onClick={() => onChange({ level: l })}
                        className={cn(
                          'h-7 rounded-sm border px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          v.level === l ? 'border-primary bg-primary/15 text-foreground' : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </Flag>
                <Flag name="time" htmlFor="mock-time" hint="минут">
                  <input id="mock-time" type="number" min={10} max={240} value={v.durationMin} onChange={(e) => onChange({ durationMin: Number(e.target.value) || 0 })} className={cn(field, 'w-20 text-right tabular-nums')} />
                </Flag>
                <Flag name="weight-tasks" htmlFor="mock-weight" hint="вес практики в итоге, 0.0–1.0">
                  <input id="mock-weight" type="number" step={0.1} min={0} max={1} value={v.weightTasks} onChange={(e) => onChange({ weightTasks: Number(e.target.value) })} className={cn(field, 'w-20 text-right tabular-nums')} />
                </Flag>
                <Flag name="allow-pause" htmlFor="mock-pause" hint="таймер можно ставить на паузу">
                  <input id="mock-pause" type="checkbox" checked={v.allowPause} onChange={(e) => onChange({ allowPause: e.target.checked })} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                </Flag>
                <Flag name="extra" htmlFor="mock-extra" hint="указать отдел и должность">
                  <input id="mock-extra" type="checkbox" checked={v.showExtra} onChange={(e) => onChange({ showExtra: e.target.checked })} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                </Flag>
                {v.showExtra && (
                  <>
                    <Flag name="dept" htmlFor="mock-dept" hint="опционально">
                      <input id="mock-dept" value={v.candDept} onChange={(e) => onChange({ candDept: e.target.value })} placeholder="Например, Аналитика" className={cn(field, 'w-full max-w-sm')} />
                    </Flag>
                    <Flag name="position" htmlFor="mock-pos" hint="опционально">
                      <input id="mock-pos" value={v.candPos} onChange={(e) => onChange({ candPos: e.target.value })} placeholder="Например, Middle BA" className={cn(field, 'w-full max-w-sm')} />
                    </Flag>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
                <code className="min-w-0 flex-1 break-all text-xs text-muted-foreground">{command}</code>
                <ToolButton type="submit" variant="primary" disabled={nameMissing} className="h-8 px-3">
                  <Play aria-hidden />
                  Начать
                </ToolButton>
              </div>
            </section>
          </form>
        </div>
      </div>

      <aside aria-label="Инспектор" className="shrink-0 border-t bg-card lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0 2xl:w-96">
        <InspectorSection label="Как это работает" title="Как это работает">
          <div className="space-y-2 leading-relaxed text-muted-foreground">
            <p>В случайном порядке будет выбрано N теоретических вопросов и M задач — вопросы из разных тем. У вас будет ограниченное время, по истечении которого сессия завершится автоматически.</p>
            <p>По завершении вы увидите эталонные ответы, выставите самооценку по теории и получите итоговую рекомендацию по уровню.</p>
          </div>
        </InspectorSection>
      </aside>
    </div>
  )
}
