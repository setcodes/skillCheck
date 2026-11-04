import { useState, type ReactNode } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ToolButton } from '@/shared/ui/tool-button'
import { InspectorSection } from '@/shared/ui/inspector-section'
import { InspectorSplit } from '@/shared/ui/inspector-split'
import { Checkbox, NumberField, TextField } from '@/shared/ui/field'

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

/** Строка-флаг команды: `--name значение` и пояснение справа. */
function Flag({
  name,
  htmlFor,
  hint,
  children,
}: {
  name: string
  htmlFor?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="grid items-center gap-x-4 gap-y-1 py-1.5 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <label htmlFor={htmlFor} className="text-ansi-cyan">
        --{name}
        {hint && <span className="sr-only"> — {hint}</span>}
      </label>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {children}
        {hint && (
          <span className="text-xs text-muted-foreground" aria-hidden>
            {hint}
          </span>
        )}
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
      <InspectorSplit
        id="mock-setup"
        defaultSize={26}
        main={
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
                  <h1 className="font-display text-2xl font-bold leading-snug tracking-[-0.02em] text-foreground">
                    Мок‑интервью
                  </h1>
                  <p className="max-w-[65ch] font-sans text-base leading-relaxed text-muted-foreground">
                    Сконфигурируйте сессию и начните тренировку: случайные вопросы и задачи, общий
                    таймер и отчёт по темам в конце.
                  </p>
                </header>

                <section className="rounded-sm border bg-card">
                  <p className="border-b px-4 py-2 text-xs text-muted-foreground">
                    <span className="text-primary-text" aria-hidden>
                      ${' '}
                    </span>
                    skillcheck mock \
                  </p>
                  <div className="divide-y divide-border/60 px-4 py-2">
                    <Flag name="questions" htmlFor="mock-questions" hint="вопросов по теории">
                      <NumberField id="mock-questions" min={1} max={30} value={v.theoryCount} onValue={(n) => onChange({ theoryCount: n })} className="w-28" />
                    </Flag>
                    <Flag name="tasks" htmlFor="mock-tasks" hint="задач на практику">
                      <NumberField id="mock-tasks" min={1} max={30} value={v.taskCount} onValue={(n) => onChange({ taskCount: n })} className="w-28" />
                    </Flag>
                    <Flag name="candidate" htmlFor="mock-name">
                      <TextField
                        id="mock-name"
                        required
                        value={v.candName}
                        onChange={(e) => onChange({ candName: e.target.value })}
                        onBlur={() => setTouched(true)}
                        placeholder="Иванов Иван Иванович"
                        aria-invalid={touched && nameMissing}
                        aria-describedby="mock-name-hint"
                        className="max-w-sm"
                      />
                      <span
                        id="mock-name-hint"
                        className={cn(
                          'text-xs',
                          touched && nameMissing ? 'text-ansi-red' : 'text-muted-foreground'
                        )}
                      >
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
                              v.level === l
                                ? 'border-primary bg-primary/15 text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </Flag>
                    <Flag name="time" htmlFor="mock-time" hint="минут">
                      <NumberField id="mock-time" min={10} max={240} step={5} value={v.durationMin} onValue={(n) => onChange({ durationMin: n })} className="w-28" />
                    </Flag>
                    <Flag
                      name="weight-tasks"
                      htmlFor="mock-weight"
                      hint="вес практики в итоге, 0.0–1.0"
                    >
                      <NumberField id="mock-weight" min={0} max={1} step={0.1} value={v.weightTasks} onValue={(n) => onChange({ weightTasks: n })} className="w-28" />
                    </Flag>
                    <Flag
                      name="allow-pause"
                      htmlFor="mock-pause"
                      hint="таймер можно ставить на паузу"
                    >
                      <Checkbox id="mock-pause" checked={v.allowPause} onChecked={(c) => onChange({ allowPause: c })} />
                    </Flag>
                    <Flag name="extra" htmlFor="mock-extra" hint="указать отдел и должность">
                      <Checkbox id="mock-extra" checked={v.showExtra} onChecked={(c) => onChange({ showExtra: c })} />
                    </Flag>
                    {v.showExtra && (
                      <>
                        <Flag name="dept" htmlFor="mock-dept" hint="опционально">
                          <TextField
                            id="mock-dept"
                            value={v.candDept}
                            onChange={(e) => onChange({ candDept: e.target.value })}
                            placeholder="Например, Аналитика"
                            className="max-w-sm"
                          />
                        </Flag>
                        <Flag name="position" htmlFor="mock-pos" hint="опционально">
                          <TextField
                            id="mock-pos"
                            value={v.candPos}
                            onChange={(e) => onChange({ candPos: e.target.value })}
                            placeholder="Например, Middle BA"
                            className="max-w-sm"
                          />
                        </Flag>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
                    <code className="min-w-0 flex-1 break-all text-xs text-muted-foreground">
                      {command}
                    </code>
                    <ToolButton
                      type="submit"
                      variant="primary"
                      disabled={nameMissing}
                      className="h-8 px-3"
                    >
                      <Play aria-hidden />
                      Начать
                    </ToolButton>
                  </div>
                </section>
              </form>
            </div>
          </div>
        }
        inspector={
          <>
            <InspectorSection label="Как это работает" title="Как это работает">
              <div className="space-y-2 leading-relaxed text-muted-foreground">
                <p>
                  В случайном порядке будет выбрано N теоретических вопросов и M задач — вопросы из
                  разных тем. У вас будет ограниченное время, по истечении которого сессия
                  завершится автоматически.
                </p>
                <p>
                  По завершении вы увидите эталонные ответы, выставите самооценку по теории и
                  получите итоговую рекомендацию по уровню.
                </p>
              </div>
            </InspectorSection>
          </>
        }
      />
    </div>
  )
}
