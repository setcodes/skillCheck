import { useState } from 'react'
import { Copy, Eye, Printer, Settings2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ToolButton } from '@/shared/ui/tool-button'
import { CodeView } from '@/shared/ui/code-view'
import { buildReport } from '@/shared/api/mock'
import type { MockSessionState, MockTaskItem, MockTheoryItem } from '@/entities/mock/model/types'

interface Props {
  s: MockSessionState
  /** эталонный ответ по id вопроса */
  answerOf: (questionId: string) => string | undefined
  /** эталонное решение по id задачи */
  solutionOf: (taskId: string) => string | undefined
  onSelfScore: (id: string, score: number) => void
  onCopy: (text: string) => void
  onReset: () => void
}

const LEVEL_TONE = { Senior: 'text-ok', Middle: 'text-ansi-yellow', 'Junior-': 'text-ansi-red' } as const

/** Итоговый отчёт сессии в виде report.md: сводка, темы и разбор каждого пункта. */
export function MockReport({ s, answerOf, solutionOf, onSelfScore, onCopy, onReset }: Props) {
  const [reveal, setReveal] = useState<Record<string, boolean>>({})
  const { tasksAvg, theoryAvg, finalPct, level, topics } = buildReport(s)
  const c = s.config
  const show = (id: string) => setReveal((r) => ({ ...r, [id]: true }))

  return (
    <div className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
      <div className="flex h-9 shrink-0 items-stretch justify-between gap-2 border-b bg-card font-mono print:hidden">
        <span className="flex items-center border-r bg-background px-3 text-xs text-foreground shadow-[inset_0_2px_0_hsl(var(--primary))]">report.md</span>
        <div className="flex items-center gap-1.5 pr-2">
          <ToolButton onClick={onReset}>
            <Settings2 aria-hidden />
            К конфигурации
          </ToolButton>
          <ToolButton onClick={() => window.print()}>
            <Printer aria-hidden />
            Печать / PDF
          </ToolButton>
        </div>
      </div>

      <div className="flex-1 bg-background lg:min-h-0 lg:overflow-y-auto print:overflow-visible">
        <article className="mx-auto max-w-3xl space-y-10 px-5 py-8 font-mono text-[0.85rem] sm:px-8">
          <header className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">отчёт мок-интервью · {new Date(s.createdAt).toLocaleDateString('ru-RU')}</p>
              {c.candidateName && <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">{c.candidateName}</h1>}
              {(c.candidateDept || c.candidatePosition) && (
                <p className="text-muted-foreground">{[c.candidateDept, c.candidatePosition].filter(Boolean).join(', ')}</p>
              )}
            </div>

            <div className="grid gap-4 rounded-sm border bg-card p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
              <div>
                <p className="text-xs text-muted-foreground">Итоговый процент</p>
                <p className="font-display text-5xl font-bold tabular-nums tracking-[-0.03em] text-foreground">{finalPct}%</p>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <dt className="text-muted-foreground">Уровень:</dt>
                <dd className={cn('font-bold', LEVEL_TONE[level])}>{level}</dd>
                <dt className="text-muted-foreground">практика</dt>
                <dd className="tabular-nums text-foreground">{tasksAvg.toFixed(1)} из 5</dd>
                <dt className="text-muted-foreground">теория</dt>
                <dd className="tabular-nums text-foreground">{theoryAvg.toFixed(1)} из 5</dd>
                <dt className="text-muted-foreground">вес практики</dt>
                <dd className="tabular-nums text-foreground">{(c.weightTasks * 100).toFixed(0)}%</dd>
              </dl>
            </div>

            {topics.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-bold text-foreground">Теория по темам (от слабых к сильным)</h2>
                <ul className="space-y-1.5" aria-label="Результаты по темам">
                  {topics.map((t) => (
                    <li key={t.topic} className="grid grid-cols-[minmax(0,14rem)_1fr_auto] items-center gap-3">
                      <span className="truncate text-foreground">{t.topic}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                        <span className={cn('block h-full', t.avg >= 3 ? 'bg-ok' : 'bg-ansi-red')} style={{ width: `${(t.avg / 5) * 100}%` }} />
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {t.avg.toFixed(1)} из 5 · {t.count}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground print:hidden">Темы считаются по самооценке теории — выставьте её ниже по каждому вопросу.</p>
              </section>
            )}
          </header>

          <section className="space-y-4">
            <h2 className="text-xs font-bold text-foreground">Разбор</h2>
            {s.items.map((it, i) => {
              const num = String(i + 1).padStart(2, '0')
              if (it.type === 'theory') {
                const th = it as MockTheoryItem
                const ref = answerOf(th.questionId)
                return (
                  <article key={it.id} id={`mock-item-${i}`} className="scroll-mt-6 rounded-sm border bg-card">
                    <header className="flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-2.5">
                      <h3 className="font-bold text-foreground">
                        <span className="text-muted-foreground">{num} </span>
                        <span className="text-ansi-blue">теория</span> · {it.title}
                      </h3>
                      <span className="text-xs text-muted-foreground">{th.category}</span>
                    </header>
                    <div className="space-y-3 px-4 py-3">
                      <p className="font-sans text-[0.9rem] leading-relaxed text-muted-foreground">{th.prompt}</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">Ваш ответ</p>
                          <pre className="min-h-[3rem] whitespace-pre-wrap rounded-sm bg-background p-2 font-sans text-[0.85rem] text-foreground">{th.answerDraft || '—'}</pre>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">Эталонный ответ</p>
                          <pre className={cn('whitespace-pre-wrap rounded-sm bg-background p-2 font-sans text-[0.85rem] text-foreground', !reveal[it.id] && 'hidden print:block')}>{ref ?? '—'}</pre>
                          {!reveal[it.id] && (
                            <ToolButton className="print:hidden" onClick={() => show(it.id)}>
                              <Eye aria-hidden />
                              Показать ответ
                            </ToolButton>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor={`self-${it.id}`} className="text-muted-foreground">Самооценка (0–5):</label>
                        <input
                          id={`self-${it.id}`}
                          type="number"
                          min={0}
                          max={5}
                          step={0.5}
                          value={th.selfScore ?? ''}
                          onChange={(e) => onSelfScore(it.id, Number(e.target.value) || 0)}
                          className="h-7 w-16 rounded-sm border bg-background px-2 text-right tabular-nums outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </article>
                )
              }
              const t = it as MockTaskItem
              const solution = solutionOf(t.taskId)
              return (
                <article key={it.id} id={`mock-item-${i}`} className="scroll-mt-6 rounded-sm border bg-card">
                  <header className="flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-2.5">
                    <h3 className="font-bold text-foreground">
                      <span className="text-muted-foreground">{num} </span>
                      <span className="text-ansi-yellow">задача</span> · {it.title}
                    </h3>
                    <span className={cn('text-xs tabular-nums', typeof t.passedCount === 'number' && t.passedCount === t.totalCount ? 'text-ok' : 'text-muted-foreground')}>
                      Результаты тестов: {typeof t.passedCount === 'number' ? `${t.passedCount}/${t.totalCount}` : '—'}
                    </span>
                  </header>
                  <div className="space-y-3 px-4 py-3">
                    <p className="font-sans text-[0.9rem] leading-relaxed text-muted-foreground">{t.description}</p>
                    <CodeView code={t.code || t.starter} label="Ваше решение" />
                    {solution && solution !== '-' && (
                      <div>
                        {reveal[it.id] ? (
                          <CodeView code={solution} label="Эталонное решение" />
                        ) : (
                          <div className="hidden print:block">
                            <CodeView code={solution} label="Эталонное решение" />
                          </div>
                        )}
                        <div className="mt-2 flex gap-2 print:hidden">
                          {!reveal[it.id] && (
                            <ToolButton onClick={() => show(it.id)}>
                              <Eye aria-hidden />
                              Показать ответ
                            </ToolButton>
                          )}
                          <ToolButton variant="ghost" onClick={() => onCopy(solution)}>
                            <Copy aria-hidden />
                            Копировать
                          </ToolButton>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </section>
        </article>
      </div>
    </div>
  )
}
