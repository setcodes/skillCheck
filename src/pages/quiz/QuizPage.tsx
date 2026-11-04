import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, FileCode2, PanelLeft, RotateCcw } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/app/providers/AppProvider'
import { useQuiz } from '@/shared/bank'
import { cn } from '@/shared/lib/utils'
import { KEYS, readJSON, writeJSON } from '@/shared/storage/storage'
import { CodeView } from '@/shared/ui/code-view'
import { Explorer, type ExplorerGroup } from '@/shared/ui/explorer'
import { InspectorSection } from '@/shared/ui/inspector-section'
import { InspectorSplit } from '@/shared/ui/inspector-split'
import { MiniMarkdown } from '@/shared/ui/mini-markdown'
import { ToolButton } from '@/shared/ui/tool-button'
import { FRONTEND_TOPICS, LEVELS, topicLabel } from '@/entities/question/model/topics'

type Progress = Record<string, { chosen: number; correct: boolean }>

/** Вывод варианта в одну строку: каждая строка stdout — отдельный компактный токен. */
function OutputLines({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
      {lines.map((line, i) => (
        <span key={i} className="contents">
          {i > 0 && ' '}
          <span className="whitespace-pre rounded-[3px] bg-muted px-1.5 py-0.5 text-foreground">
            {line === '' ? '""' : line}
          </span>
        </span>
      ))}
    </span>
  )
}

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

export default function QuizPage() {
  const { prof, role } = useApp()
  const items = useQuiz(prof)
  const navigate = useNavigate()
  const { quizId } = useParams()
  const [progress, setProgress] = useState<Progress>(() =>
    readJSON<Progress>(KEYS.quizProgress, {})
  )
  const [revealed, setRevealed] = useState(false)
  const [query, setQuery] = useState('')
  const [explorerOpen, setExplorerOpen] = useState(false)
  const optionsRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLElement>(null)

  useEffect(() => {
    writeJSON(KEYS.quizProgress, progress)
  }, [progress])

  const current = items.find((q) => q.id === quizId)
  useEffect(() => setRevealed(false), [quizId])

  const groups: ExplorerGroup[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    const topics = [...new Set(items.map((x) => x.topic))].sort(
      (a, b) =>
        FRONTEND_TOPICS.findIndex((t) => t.id === a) - FRONTEND_TOPICS.findIndex((t) => t.id === b)
    )
    return topics
      .map((topic) => ({
        id: topic,
        name: topic,
        hint: topicLabel(topic),
        items: items
          .filter(
            (x) =>
              x.topic === topic &&
              (!q || x.title.toLowerCase().includes(q) || x.code.toLowerCase().includes(q))
          )
          .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level))
          .map((x) => {
            const a = progress[x.id]
            return {
              id: x.id,
              title: x.title,
              mark: a
                ? a.correct
                  ? { text: '✓', tone: 'text-ok', label: 'решено верно' }
                  : { text: '✗', tone: 'text-ansi-red', label: 'решено неверно' }
                : undefined,
            }
          }),
      }))
      .filter((g) => g.items.length > 0)
  }, [items, progress, query])

  const flat = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.id)), [groups])
  const open = (id: string) => {
    navigate(`/quiz/${id}`)
    setExplorerOpen(false)
  }
  const index = current ? flat.indexOf(current.id) : -1
  const step = (dir: 1 | -1) =>
    flat.length && open(index === -1 ? flat[0] : flat[(index + dir + flat.length) % flat.length])

  // [ и ] — предыдущий и следующий фрагмент
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isEditable(e.target)) return
      if (e.key === '[') step(-1)
      if (e.key === ']') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (items.length === 0)
    return (
      <p className="py-12 text-center font-mono text-sm text-muted-foreground">
        Для этой профессии пока нет задач на предсказание
      </p>
    )
  if (!current) return <Navigate to={`/quiz/${items[0].id}`} replace />

  const answer = progress[current.id]
  const showAnswer = !!answer || revealed
  const solved = items.filter((q) => progress[q.id]?.correct).length
  const wrong = items.filter((q) => progress[q.id] && !progress[q.id].correct).length

  const choose = (i: number) => {
    if (answer) return
    setProgress((p) => ({ ...p, [current.id]: { chosen: i, correct: i === current.correct } }))
    // показать вывод и разбор, которые появились ниже вариантов
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' })
    )
  }
  const retry = () =>
    setProgress((p) => {
      const rest = { ...p }
      delete rest[current.id]
      return rest
    })

  // ↑/↓ по вариантам, как в CLI-меню
  const onOptionKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const buttons = optionsRef.current?.querySelectorAll('button')
    const n = current.options.length
    buttons?.[(i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n]?.focus()
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      {explorerOpen && (
        <button
          type="button"
          aria-label="Закрыть список фрагментов"
          onClick={() => setExplorerOpen(false)}
          className="fixed inset-0 z-20 bg-background/60 backdrop-blur-[2px] xl:hidden"
        />
      )}
      <Explorer
        title="что выведет код?"
        label="Список фрагментов"
        counter={
          <span className="tabular-nums" title="Решено верно">
            {solved}/{items.length}
          </span>
        }
        groups={groups}
        currentId={current.id}
        onSelect={open}
        query={query}
        onQuery={setQuery}
        className={
          explorerOpen ? 'fixed bottom-7 left-14 top-10 z-30 flex shadow-2xl' : 'hidden xl:flex'
        }
        onClose={explorerOpen ? () => setExplorerOpen(false) : undefined}
      />

      <InspectorSplit
        id="quiz"
        defaultSize={24}
        main={
          <div className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
            <div className="flex h-9 shrink-0 items-stretch justify-between gap-2 border-b bg-card font-mono">
              <div className="flex min-w-0 items-stretch">
                <button
                  type="button"
                  onClick={() => setExplorerOpen((o) => !o)}
                  aria-label="Список фрагментов"
                  className="flex items-center border-r px-2.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring xl:hidden"
                >
                  <PanelLeft className="h-4 w-4" aria-hidden />
                </button>
                <span className="flex min-w-0 items-center gap-2 border-r bg-background px-3 text-xs text-foreground shadow-[inset_0_2px_0_hsl(var(--primary))]">
                  <FileCode2 className="h-3.5 w-3.5 shrink-0 text-ansi-yellow" aria-hidden />
                  <span className="truncate">{current.id}.js</span>
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1 pr-2">
                <span className="px-1 text-xs tabular-nums text-muted-foreground">
                  {index === -1 ? '—' : index + 1}/{flat.length}
                </span>
                <ToolButton
                  variant="ghost"
                  onClick={() => step(-1)}
                  aria-label="Предыдущий фрагмент"
                  aria-keyshortcuts="["
                  title="Предыдущий ([)"
                >
                  <ChevronLeft aria-hidden />
                </ToolButton>
                <ToolButton
                  variant="ghost"
                  onClick={() => step(1)}
                  aria-label="Следующий фрагмент"
                  aria-keyshortcuts="]"
                  title="Следующий (])"
                >
                  <ChevronRight aria-hidden />
                </ToolButton>
              </div>
            </div>

            <div className="flex-1 bg-background lg:min-h-0 lg:overflow-y-auto">
              <article className="mx-auto max-w-3xl space-y-6 px-5 py-8 font-mono sm:px-8">
                <header className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-ansi-blue">{current.topic}</span> · {current.level}
                    {current.reviewedAt == null && (
                      <span className="text-ansi-yellow"> · ещё не вычитана</span>
                    )}
                  </p>
                  <h1 className="text-balance font-display text-2xl font-bold leading-snug tracking-[-0.02em] text-foreground">
                    {current.title}
                  </h1>
                </header>

                <CodeView code={current.code} label={`${current.id}.js`} />

                <fieldset className="space-y-2">
                  <legend className="mb-2 flex gap-2 text-sm font-bold text-foreground">
                    <span className="text-primary-text" aria-hidden>
                      ?
                    </span>
                    {current.prompt}
                  </legend>
                  <div ref={optionsRef} className="grid gap-1.5 sm:grid-cols-2">
                    {current.options.map((opt, i) => {
                      const isCorrect = i === current.correct
                      const chosen = answer?.chosen === i
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!!answer}
                          onClick={() => choose(i)}
                          onKeyDown={(e) => onOptionKey(e, i)}
                          className={cn(
                            'group flex w-full items-center gap-3 rounded-sm border px-3 py-2 text-left text-[0.85rem] transition-colors disabled:cursor-default',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            !answer &&
                              'hover:border-primary hover:bg-primary/10 focus-visible:bg-primary/10',
                            answer && isCorrect && 'border-ok bg-ok/15',
                            answer && chosen && !isCorrect && 'border-ansi-red bg-ansi-red/10',
                            answer && !isCorrect && !chosen && 'opacity-60'
                          )}
                        >
                          <span
                            className={cn(
                              'w-3 shrink-0 text-primary-text',
                              !answer &&
                                'invisible group-hover:visible group-focus-visible:visible',
                              answer && !chosen && 'invisible'
                            )}
                            aria-hidden
                          >
                            ❯
                          </span>
                          <OutputLines text={opt} />
                          {answer && isCorrect && (
                            <span className="shrink-0 text-xs font-bold text-ok">Верно</span>
                          )}
                          {answer && chosen && !isCorrect && (
                            <span className="shrink-0 text-xs font-bold text-ansi-red">
                              Ваш ответ
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                <div className="flex flex-wrap gap-2">
                  {!answer && role === 'interviewer' && !revealed && (
                    <ToolButton onClick={() => setRevealed(true)}>Показать ответ</ToolButton>
                  )}
                  {answer && (
                    <ToolButton onClick={retry}>
                      <RotateCcw aria-hidden />
                      Пройти заново
                    </ToolButton>
                  )}
                  <ToolButton variant="primary" onClick={() => step(1)}>
                    Следующая
                    <ChevronRight aria-hidden />
                  </ToolButton>
                </div>

                {showAnswer && (
                  <section ref={resultRef} className="scroll-mt-6 space-y-5" aria-live="polite">
                    <div className="rounded-sm border bg-card">
                      <p className="border-b px-4 py-2 text-xs text-muted-foreground">
                        <span className="text-primary-text" aria-hidden>
                          ${' '}
                        </span>
                        node {current.id}.js
                      </p>
                      <div className="flex px-4 py-3 text-[0.85rem]">
                        <OutputLines text={current.output.join('\n')} />
                      </div>
                      {answer && (
                        <p
                          className={cn(
                            'border-t px-4 py-2 text-sm font-bold',
                            answer.correct ? 'text-ok' : 'text-ansi-red'
                          )}
                        >
                          {answer.correct ? 'Верно' : 'Неверно'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xs font-bold text-foreground">Разбор</h2>
                      <MiniMarkdown
                        text={current.explanation}
                        className="space-y-3 font-sans text-[0.95rem] leading-relaxed text-foreground"
                      />
                    </div>
                    {current.pitfalls.length > 0 && (
                      <div className="space-y-2">
                        <h2 className="text-xs font-bold text-foreground">Что проверяют</h2>
                        <ul className="space-y-1">
                          {current.pitfalls.map((p, i) => (
                            <li key={i} className="flex gap-2 text-[0.85rem] leading-relaxed">
                              <span className="text-ansi-yellow" aria-hidden>
                                !
                              </span>
                              <span className="text-foreground">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}
              </article>
            </div>
          </div>
        }
        inspector={
          <>
            <InspectorSection
              label="Прогресс"
              title="Прогресс"
              meta={`${Object.keys(progress).filter((id) => items.some((q) => q.id === id)).length}/${items.length}`}
            >
              <dl className="grid grid-cols-[1fr_auto] gap-y-1.5">
                <dt className="text-muted-foreground">верно</dt>
                <dd className="tabular-nums text-ok">{solved}</dd>
                <dt className="text-muted-foreground">неверно</dt>
                <dd className="tabular-nums text-ansi-red">{wrong}</dd>
                <dt className="text-muted-foreground">осталось</dt>
                <dd className="tabular-nums text-foreground">{items.length - solved - wrong}</dd>
              </dl>
              <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                <span className="bg-ok" style={{ width: `${(solved / items.length) * 100}%` }} />
                <span
                  className="bg-ansi-red"
                  style={{ width: `${(wrong / items.length) * 100}%` }}
                />
              </div>
            </InspectorSection>
            <InspectorSection label="Клавиши" title="Клавиши">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-muted-foreground">
                {[
                  ['↑ ↓', 'по вариантам, enter — выбрать'],
                  ['[ ]', 'предыдущий / следующий'],
                  ['/', 'поиск по фрагментам'],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt>
                      <kbd className="rounded-sm bg-foreground px-1.5 py-0.5 font-bold text-background">
                        {k}
                      </kbd>
                    </dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </InspectorSection>
          </>
        }
      />
    </div>
  )
}
