import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Printer, Trash2, X } from 'lucide-react'
import { useApp } from '@/app/providers/AppProvider'
import { useToast } from '@/shared/hooks/use-sonner'
import { cn } from '@/shared/lib/utils'
import { clearAllEvaluations, KEYS, readJSON } from '@/shared/storage/storage'
import { InspectorSection } from '@/shared/ui/inspector-section'
import { ToolButton } from '@/shared/ui/tool-button'
import { ENABLED_PROFESSIONS, PROFESSIONS } from '@/entities/profession/model/constants'

type TaskRow = { prof: string; level: string; taskId: string; title: string; score: number; comment: string }
type TheoryRow = { prof: string; questionId: string; title: string; category: string; difficulty: number; score: number; comment: string }

// Данные отчёта сохраняются в браузере по мере ввода (те же ключи, что и раньше)
const CAND = {
  name: 'cand.name',
  pos: 'cand.pos',
  note: 'cand.note',
  date: 'cand.date',
  timeSpent: 'cand.timeSpent',
  interviewers: 'cand.interviewers',
} as const

function read(key: string, fallback = ''): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // приватный режим — отчёт живёт до перезагрузки
  }
}

function readInterviewers(): string[] {
  try {
    const parsed = JSON.parse(read(CAND.interviewers, '[]'))
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

const todayIso = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

const field = 'h-8 w-full rounded-sm border bg-background px-2 text-foreground outline-none focus:border-primary print:border-0 print:px-0'

function ScoreCell({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn('w-6 text-right tabular-nums font-bold', score >= 4 ? 'text-ok' : score >= 3 ? 'text-ansi-yellow' : 'text-ansi-red')}>{score}</span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted print:hidden" aria-hidden>
        <span className={cn('block h-full', score >= 4 ? 'bg-ok' : score >= 3 ? 'bg-ansi-yellow' : 'bg-ansi-red')} style={{ width: `${(score / 5) * 100}%` }} />
      </span>
    </span>
  )
}

function ScoreTable({ title, head, rows, empty }: { title: string; head: string; rows: { key: string; tag: string; title: string; score: number; comment: string }[]; empty: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-bold text-foreground">
        {title} <span className="font-normal text-muted-foreground">· {rows.length}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="rounded-sm border border-dashed px-4 py-3 text-muted-foreground">{empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border">
          <table className="w-full border-collapse text-left">
            <thead className="bg-card text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="px-3 py-2 font-normal">{head}</th>
                <th className="px-3 py-2 font-normal">Название</th>
                <th className="px-3 py-2 font-normal">Оценка</th>
                <th className="px-3 py-2 font-normal">Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b last:border-b-0 hover:bg-accent/50">
                  <td className="whitespace-nowrap px-3 py-2 text-ansi-blue">{r.tag}</td>
                  <td className="px-3 py-2 text-foreground">{r.title}</td>
                  <td className="px-3 py-2">
                    <ScoreCell score={r.score} />
                  </td>
                  <td className="px-3 py-2 font-sans text-[0.85rem] text-muted-foreground">{r.comment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function InterviewPage() {
  const { prof } = useApp()
  const { toast } = useToast()
  const [name, setName] = useState(() => read(CAND.name))
  const [pos, setPos] = useState(() => read(CAND.pos))
  const [note, setNote] = useState(() => read(CAND.note))
  const [date, setDate] = useState(() => read(CAND.date) || todayIso())
  const [timeSpent, setTimeSpent] = useState(() => read(CAND.timeSpent))
  const [interviewers, setInterviewers] = useState<string[]>(readInterviewers)
  const [newInterviewer, setNewInterviewer] = useState('')

  useEffect(() => {
    write(CAND.name, name)
    write(CAND.pos, pos)
    write(CAND.note, note)
    write(CAND.date, date)
    write(CAND.timeSpent, timeSpent)
    write(CAND.interviewers, JSON.stringify(interviewers))
  }, [name, pos, note, date, timeSpent, interviewers])

  const [bridge, setBridge] = useState<Record<string, TaskRow>>(() => readJSON(KEYS.taskScoresBridge, {}))
  const [tBridge, setTBridge] = useState<Record<string, TheoryRow>>(() => readJSON(KEYS.theoryScoresBridge, {}))
  const rows = useMemo(() => Object.values(bridge).filter((r) => r.prof === prof), [prof, bridge])
  const tRows = useMemo(() => Object.values(tBridge).filter((r) => r.prof === prof), [prof, tBridge])

  // итог считается по задачам, как и раньше; теория — справочно
  const final = rows.length ? (rows.reduce((s, r) => s + (r.score || 0), 0) / (rows.length * 5)) * 100 : 0
  const level = final >= 85 ? 'Senior' : final >= 65 ? 'Middle' : 'Junior-'
  const theoryAvg = tRows.length ? tRows.reduce((s, r) => s + (r.score || 0), 0) / tRows.length : null

  const addInterviewer = () => {
    const v = newInterviewer.trim()
    if (!v) return
    setInterviewers((a) => Array.from(new Set([...a, v])))
    setNewInterviewer('')
  }

  const resetAll = () => {
    if (!window.confirm('Сбросить все оценки, комментарии и решения?')) return
    clearAllEvaluations(ENABLED_PROFESSIONS)
    setBridge({})
    setTBridge({})
    toast.success('Все оценки сброшены', 'Очищены оценки задач, теории и решения')
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden print:block print:overflow-visible">
      <div className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
        <div className="flex h-9 shrink-0 items-stretch justify-between border-b bg-card font-mono print:hidden">
          <span className="flex items-center border-r bg-background px-3 text-xs text-foreground shadow-[inset_0_2px_0_hsl(var(--primary))]">interview-report.md</span>
          <div className="flex items-center gap-1.5 pr-2">
            <ToolButton onClick={() => window.print()}>
              <Printer aria-hidden />
              Печать
            </ToolButton>
          </div>
        </div>

        <div className="flex-1 bg-background lg:min-h-0 lg:overflow-y-auto print:overflow-visible">
          <article className="mx-auto max-w-4xl space-y-8 px-5 py-8 font-mono text-[0.85rem] sm:px-8">
            <header className="space-y-1">
              <p className="text-xs text-muted-foreground">Режим интервью — {prof} · сохраняется автоматически</p>
              <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">Отчет по результатам собеседования</h1>
            </header>

            <section aria-label="Данные интервью" className="grid gap-4 rounded-sm border bg-card p-4 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="iv-name" className="text-xs text-muted-foreground">Кандидат:</label>
                <input id="iv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя кандидата" className={field} />
              </div>
              <div className="space-y-1">
                <label htmlFor="iv-pos" className="text-xs text-muted-foreground">Позиция:</label>
                <select id="iv-pos" value={pos} onChange={(e) => setPos(e.target.value)} className={field}>
                  <option value="">не выбрана</option>
                  {PROFESSIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} · {p.subtitle}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="iv-date" className="text-xs text-muted-foreground">Дата интервью:</label>
                  <input id="iv-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="iv-time" className="text-xs text-muted-foreground">Время (чч:мм)</label>
                  <input id="iv-time" type="time" step={1} value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} className={field} />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="iv-new" className="text-xs text-muted-foreground">Интервьюеры:</label>
                <div className="flex gap-2 print:hidden">
                  <input
                    id="iv-new"
                    value={newInterviewer}
                    onChange={(e) => setNewInterviewer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addInterviewer()
                      }
                    }}
                    placeholder="Имя интервьюера"
                    className={field}
                  />
                  <ToolButton onClick={addInterviewer} className="h-8">
                    Добавить
                  </ToolButton>
                </div>
                {interviewers.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5 pt-1" aria-label="Интервьюеры">
                    {interviewers.map((p, i) => (
                      <li key={p} className="inline-flex items-center gap-1 rounded-sm border bg-background px-2 py-0.5 text-foreground">
                        {p}
                        <button
                          type="button"
                          onClick={() => setInterviewers((arr) => arr.filter((_, idx) => idx !== i))}
                          aria-label={`Убрать интервьюера ${p}`}
                          className="text-muted-foreground hover:text-foreground print:hidden"
                        >
                          <X className="h-3 w-3" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section aria-label="Итог" className="grid gap-4 rounded-sm border bg-card p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
              <div>
                <p className="text-xs text-muted-foreground">Финальный процент:</p>
                <p className="font-display text-5xl font-bold tabular-nums tracking-[-0.03em] text-foreground">{final.toFixed(0)}%</p>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <dt className="text-muted-foreground">Уровень:</dt>
                <dd className={cn('font-bold', level === 'Senior' ? 'text-ok' : level === 'Middle' ? 'text-ansi-yellow' : 'text-ansi-red')}>{level}</dd>
                <dt className="text-muted-foreground">задач оценено</dt>
                <dd className="tabular-nums text-foreground">{rows.length}</dd>
                <dt className="text-muted-foreground">теория, среднее</dt>
                <dd className="tabular-nums text-foreground">{theoryAvg === null ? '—' : `${theoryAvg.toFixed(1)} из 5 · ${tRows.length}`}</dd>
              </dl>
            </section>

            <ScoreTable
              title="Оценки по задачам"
              head="Уровень"
              rows={rows.map((r) => ({ key: `${r.level}:${r.taskId}`, tag: r.level, title: r.title, score: r.score, comment: r.comment }))}
              empty={
                <>
                  Пока пусто. Оцените решение в разделе <Link to="/solve" className="text-primary-text underline underline-offset-4">задачи</Link> и нажмите «Отправить оценку».
                </>
              }
            />
            <ScoreTable
              title="Оценки по теории"
              head="Категория"
              rows={tRows.map((r) => ({ key: r.questionId, tag: r.category, title: r.title, score: r.score, comment: r.comment }))}
              empty={
                <>
                  Пока пусто. Оцените ответ в разделе <Link to="/theory" className="text-primary-text underline underline-offset-4">теория</Link> и нажмите «Отправить оценку».
                </>
              }
            />

            <section className="space-y-1">
              <label htmlFor="iv-note" className="text-xs font-bold text-foreground">Общая обратная связь:</label>
              <textarea
                id="iv-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Общие комментарии по кандидату..."
                className="min-h-[120px] w-full resize-y rounded-sm border bg-card p-3 font-sans text-[0.95rem] leading-relaxed outline-none focus:border-primary print:border print:bg-transparent"
              />
            </section>
          </article>
        </div>
      </div>

      <aside aria-label="Инспектор" className="shrink-0 border-t bg-card font-mono lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0 2xl:w-96 print:hidden">
        <InspectorSection label="Как собирается отчёт" title="Как собирается отчёт">
          <ol className="space-y-2 leading-relaxed text-muted-foreground">
            <li>
              <span className="text-primary-text">1.</span> В <Link to="/solve" className="text-foreground underline underline-offset-4">задачах</Link> и{' '}
              <Link to="/theory" className="text-foreground underline underline-offset-4">теории</Link> ставьте оценку и жмите «Отправить оценку».
            </li>
            <li>
              <span className="text-primary-text">2.</span> Оценки появляются здесь, итог считается по задачам.
            </li>
            <li>
              <span className="text-primary-text">3.</span> Заполните данные и обратную связь — всё сохраняется само. Отчёт можно распечатать.
            </li>
          </ol>
        </InspectorSection>
        <InspectorSection label="Опасная зона" title="Опасная зона">
          <ToolButton onClick={resetAll} className="border-ansi-red text-ansi-red hover:border-ansi-red hover:bg-ansi-red/10 hover:text-ansi-red">
            <Trash2 aria-hidden />
            Сброс всех оценок
          </ToolButton>
        </InspectorSection>
      </aside>
    </div>
  )
}
