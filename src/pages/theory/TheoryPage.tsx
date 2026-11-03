import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, EyeOff, FileText, PanelLeft, Trash2 } from 'lucide-react'
import { useApp } from '@/app/providers/AppProvider'
import { useQuestions } from '@/shared/bank'
import { useToast } from '@/shared/hooks/use-sonner'
import { cn } from '@/shared/lib/utils'
import { KEYS, clearAllEvaluations, readJSON, writeJSON } from '@/shared/storage/storage'
import { Explorer, type ExplorerGroup } from '@/shared/ui/explorer'
import { InspectorSection } from '@/shared/ui/inspector-section'
import { ScoreForm } from '@/shared/ui/score-form'
import { ToolButton } from '@/shared/ui/tool-button'
import { ENABLED_PROFESSIONS } from '@/entities/profession/model/constants'
import { FRONTEND_TOPICS, LEVELS, levelNumber, topicLabel } from '@/entities/question/model/topics'
import type { Level, Question } from '@/entities/question/model/types'
import { AnswerView } from './ui/AnswerView'

type Draft = { score?: number; comment?: string }
type LevelFilter = Level | 'all'

const KIND_LABEL: Record<Question['kind'], string> = {
  screening: 'скрининг',
  deep: 'глубокий',
  practical: 'практика',
  architecture: 'архитектура',
}

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

const byLevelThenTitle = (a: Question, b: Question) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.title.localeCompare(b.title)

export default function TheoryPage() {
  const { prof, role } = useApp()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { questionId } = useParams()
  const all = useQuestions(prof)
  const interviewer = role === 'interviewer'

  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<LevelFilter>('all')
  const [explorerOpen, setExplorerOpen] = useState(false)

  const cur = useMemo(() => all.find((q) => q.id === questionId || q.aliases?.includes(questionId ?? '')) ?? all[0], [all, questionId])
  // старые ссылки по прежним id ведут на актуальный адрес
  useEffect(() => {
    if (cur && questionId && questionId !== cur.id) navigate(`/theory/${encodeURIComponent(cur.id)}`, { replace: true })
  }, [cur, questionId, navigate])
  const open = (id: string) => {
    navigate(`/theory/${encodeURIComponent(id)}`)
    setExplorerOpen(false)
  }

  // Черновики оценок по вопросам (локально, до отправки в отчёт)
  const draftsKey = KEYS.theoryDrafts(prof)
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => readJSON(draftsKey, {}))
  useEffect(() => {
    writeJSON(draftsKey, drafts)
  }, [drafts, draftsKey])
  const patchDraft = (p: Draft) => cur && setDrafts((d) => ({ ...d, [cur.id]: { ...d[cur.id], ...p } }))

  // Темы — папки в порядке справочника, внутри — по уровню и названию
  const groups: ExplorerGroup[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = (x: Question) =>
      (level === 'all' || x.level === level) && (!q || x.title.toLowerCase().includes(q) || x.prompt.toLowerCase().includes(q))
    const topicIds = [...FRONTEND_TOPICS.map((t) => t.id), ...new Set(all.map((x) => x.topic).filter((t) => !FRONTEND_TOPICS.some((f) => f.id === t)))]
    return topicIds
      .map((topic) => ({
        id: topic,
        name: topic,
        hint: topicLabel(topic),
        items: all
          .filter((x) => x.topic === topic && match(x))
          .sort(byLevelThenTitle)
          .map((x) => {
            const score = drafts[x.id]?.score
            return {
              id: x.id,
              title: x.title,
              mark: interviewer && score !== undefined ? { text: String(score), tone: 'text-primary-text', label: `оценка ${score}` } : undefined,
            }
          }),
      }))
      .filter((g) => g.items.length > 0)
  }, [all, query, level, drafts, interviewer])

  const flat = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.id)), [groups])
  const index = cur ? flat.indexOf(cur.id) : -1
  const step = (dir: 1 | -1) => {
    if (flat.length === 0) return
    const next = index === -1 ? flat[0] : flat[(index + dir + flat.length) % flat.length]
    open(next)
  }

  // [ и ] — предыдущий и следующий вопрос
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isEditable(e.target)) return
      if (e.key === '[') step(-1)
      if (e.key === ']') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const send = () => {
    if (!cur) return
    const bridge = readJSON<Record<string, unknown>>(KEYS.theoryScoresBridge, {})
    bridge[`${prof}:${cur.id}`] = {
      prof,
      questionId: cur.id,
      title: cur.title,
      category: topicLabel(cur.topic),
      difficulty: levelNumber(cur.level),
      score: drafts[cur.id]?.score ?? 0,
      comment: drafts[cur.id]?.comment ?? '',
    }
    writeJSON(KEYS.theoryScoresBridge, bridge)
    toast.success('Оценка сохранена', 'Оценка по теории добавлена в отчёт.')
  }

  const resetEvaluations = () => {
    if (!window.confirm('Сбросить все оценки, комментарии и решения?')) return
    clearAllEvaluations(ENABLED_PROFESSIONS)
    setDrafts({})
    toast.success('Все оценки сброшены', 'Очищены оценки задач, теории и решения')
  }

  if (!cur) return <p className="py-12 text-center font-mono text-sm text-muted-foreground">Для этой профессии пока нет вопросов</p>

  const scored = Object.values(drafts).filter((d) => d.score !== undefined).length
  const showPrompt = cur.prompt.replace(/\?$/, '') !== cur.title.replace(/\?$/, '')

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      {explorerOpen && (
        <button
          type="button"
          aria-label="Закрыть список вопросов"
          onClick={() => setExplorerOpen(false)}
          className="fixed inset-0 z-20 bg-background/60 backdrop-blur-[2px] xl:hidden"
        />
      )}
      <Explorer
        title="теория"
        label="Список вопросов"
        counter={
          <span className="tabular-nums" title={interviewer ? 'Оценено / всего' : 'Всего вопросов'}>
            {interviewer ? `${scored}/${all.length}` : all.length}
          </span>
        }
        groups={groups}
        currentId={cur.id}
        onSelect={open}
        query={query}
        onQuery={setQuery}
        className={explorerOpen ? 'fixed bottom-7 left-14 top-10 z-30 flex shadow-2xl' : 'hidden xl:flex'}
        onClose={explorerOpen ? () => setExplorerOpen(false) : undefined}
        filters={
          <div className="flex flex-wrap gap-1 text-[0.7rem]" role="group" aria-label="Уровень">
            {(['all', ...LEVELS] as LevelFilter[]).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={level === l}
                onClick={() => setLevel(l)}
                className={cn(
                  'rounded-sm border px-1.5 py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  level === l ? 'border-primary bg-primary/15 text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                --{l}
              </button>
            ))}
          </div>
        }
        footer={
          <ToolButton variant="ghost" onClick={resetEvaluations} className="w-full justify-start">
            <Trash2 aria-hidden />
            Сброс оценок
          </ToolButton>
        }
      />

      <div className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
        <div className="flex h-9 shrink-0 items-stretch justify-between gap-2 border-b bg-card font-mono">
          <div className="flex min-w-0 items-stretch">
            <button
              type="button"
              onClick={() => setExplorerOpen((o) => !o)}
              aria-label="Список вопросов"
              className="flex items-center border-r px-2.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring xl:hidden"
            >
              <PanelLeft className="h-4 w-4" aria-hidden />
            </button>
            <span className="flex min-w-0 items-center gap-2 border-r bg-background px-3 text-xs text-foreground shadow-[inset_0_2px_0_hsl(var(--primary))]">
              <FileText className="h-3.5 w-3.5 shrink-0 text-ansi-blue" aria-hidden />
              <span className="truncate">{cur.id}.md</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 pr-2">
            <span className="px-1 text-xs tabular-nums text-muted-foreground">
              {index === -1 ? '—' : index + 1}/{flat.length}
            </span>
            <ToolButton variant="ghost" onClick={() => step(-1)} aria-label="Предыдущий вопрос" aria-keyshortcuts="[" title="Предыдущий ([)">
              <ChevronLeft aria-hidden />
            </ToolButton>
            <ToolButton variant="ghost" onClick={() => step(1)} aria-label="Следующий вопрос" aria-keyshortcuts="]" title="Следующий (])">
              <ChevronRight aria-hidden />
            </ToolButton>
          </div>
        </div>

        <div className="flex-1 bg-background lg:min-h-0 lg:overflow-y-auto">
          <article className="mx-auto max-w-3xl space-y-8 px-5 py-8 sm:px-8">
            <header className="space-y-3 font-mono">
              <p className="text-xs text-muted-foreground">
                <span className="text-ansi-blue">{cur.topic}</span> · {cur.level} · {KIND_LABEL[cur.kind]}
              </p>
              <h1 className="text-balance font-display text-2xl font-bold leading-snug tracking-[-0.02em] text-foreground">{cur.title}</h1>
              {showPrompt && <p className="max-w-[65ch] font-sans text-base leading-relaxed text-foreground">{cur.prompt}</p>}
              {cur.tags.length > 0 && (
                <p className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  {cur.tags.map((t) => (
                    <span key={t} className="rounded-sm border px-1.5 py-0.5">#{t}</span>
                  ))}
                </p>
              )}
            </header>

            {interviewer ? (
              <AnswerView q={cur} />
            ) : (
              <section className="flex gap-3 rounded-sm border bg-card px-4 py-4 font-mono text-[0.85rem]">
                <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="space-y-1">
                  <p className="text-foreground">В режиме «Кандидат» ответы скрыты.</p>
                  <p className="text-muted-foreground">Ответьте вслух или набросайте тезисы — эталон и чек-лист видит интервьюер.</p>
                </div>
              </section>
            )}
          </article>
        </div>
      </div>

      <aside aria-label="Инспектор" className="shrink-0 border-t bg-card lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0 2xl:w-96">
        <InspectorSection label="Оценка" title="Оценка" meta={interviewer ? `${scored} оценено` : undefined}>
          {interviewer ? (
            <ScoreForm
              idPrefix="theory"
              score={drafts[cur.id]?.score}
              comment={drafts[cur.id]?.comment}
              onScore={(score) => patchDraft({ score })}
              onComment={(comment) => patchDraft({ comment })}
              onSend={send}
            />
          ) : (
            <p className="text-muted-foreground">Оценка доступна только интервьюеру.</p>
          )}
        </InspectorSection>
        <InspectorSection label="Клавиши" title="Клавиши">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-muted-foreground">
            {[
              ['[ ]', 'предыдущий / следующий'],
              ['/', 'поиск по вопросам'],
              ['↑ ↓', 'по списку, enter — открыть'],
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt>
                  <kbd className="rounded-sm bg-foreground px-1.5 py-0.5 font-bold text-background">{k}</kbd>
                </dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </InspectorSection>
      </aside>
    </div>
  )
}
