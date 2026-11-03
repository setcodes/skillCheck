import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/app/providers/AppProvider'
import { useQuiz } from '@/shared/bank'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { MiniMarkdown } from '@/shared/ui/mini-markdown'
import { cn } from '@/shared/lib/utils'
import { levelLabel, topicLabel } from '@/entities/question/model/topics'
import { KEYS, readJSON, writeJSON } from '@/shared/storage/storage'

type Progress = Record<string, { chosen: number; correct: boolean }>

export default function QuizPage() {
  const { prof, role } = useApp()
  const items = useQuiz(prof)
  const navigate = useNavigate()
  const { quizId } = useParams()
  const [progress, setProgress] = useState<Progress>(() => readJSON<Progress>(KEYS.quizProgress, {}))
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    writeJSON(KEYS.quizProgress, progress)
  }, [progress])

  const current = items.find((q) => q.id === quizId)
  useEffect(() => setRevealed(false), [quizId])

  const solved = useMemo(() => items.filter((q) => progress[q.id]?.correct).length, [items, progress])

  if (items.length === 0) return <p className="text-muted-foreground text-center py-12">Для этой профессии пока нет задач на предсказание</p>
  if (!current) return <Navigate to={`/quiz/${items[0].id}`} replace />

  const answer = progress[current.id]
  const showAnswer = !!answer || revealed
  const index = items.indexOf(current)
  const next = items[(index + 1) % items.length]

  const choose = (i: number) => {
    if (answer) return
    setProgress((p) => ({ ...p, [current.id]: { chosen: i, correct: i === current.correct } }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
      <div className="lg:col-span-1 h-full min-h-0">
        <div className="bg-card border rounded-lg p-6 h-full flex flex-col min-h-0">
          <h2 className="text-xl font-semibold">Что выведет код?</h2>
          <p className="text-sm text-muted-foreground mb-4">Решено верно: {solved} из {items.length}</p>
          <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
            {items.map((q) => {
              const a = progress[q.id]
              return (
                <Button
                  key={q.id}
                  variant={q.id === current.id ? 'secondary' : 'ghost'}
                  aria-current={q.id === current.id ? 'true' : undefined}
                  className="w-full justify-between text-left h-auto p-3"
                  onClick={() => navigate(`/quiz/${q.id}`)}
                >
                  <span className="flex flex-col items-start gap-1">
                    <span className="font-medium whitespace-normal">{q.title}</span>
                    <span className="text-xs text-muted-foreground">{levelLabel(q.level)}</span>
                  </span>
                  {a && (a.correct ? <CheckCircle className="h-4 w-4 text-green-600" aria-label="решено верно" /> : <XCircle className="h-4 w-4 text-red-600" aria-label="решено неверно" />)}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 h-full min-h-0">
        <div className="bg-card border rounded-lg h-full overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline">{topicLabel(current.topic)}</Badge>
            <Badge variant="secondary">{levelLabel(current.level)}</Badge>
            {current.reviewedAt == null && <span className="text-xs text-muted-foreground">Задача ещё не вычитана</span>}
          </div>
          <h3 className="text-lg font-semibold mb-3">{current.title}</h3>
          <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto mb-4"><code>{current.code}</code></pre>

          <fieldset>
            <legend className="text-sm font-medium mb-2">{current.prompt}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {current.options.map((opt, i) => {
                const isCorrect = i === current.correct
                const chosen = answer?.chosen === i
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!!answer}
                    onClick={() => choose(i)}
                    className={cn(
                      'text-left rounded-lg border p-3 transition-colors disabled:cursor-default',
                      !answer && 'hover:border-primary/60',
                      answer && isCorrect && 'border-green-600 bg-green-50 dark:bg-green-950/30',
                      answer && chosen && !isCorrect && 'border-red-600 bg-red-50 dark:bg-red-950/30'
                    )}
                  >
                    <pre className="text-xs whitespace-pre-wrap">{opt}</pre>
                    {answer && isCorrect && <span className="text-xs font-medium text-green-700 dark:text-green-400">Верно</span>}
                    {answer && chosen && !isCorrect && <span className="text-xs font-medium text-red-700 dark:text-red-400">Ваш ответ</span>}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-2 mt-4">
            {!answer && role === 'interviewer' && (
              <Button variant="outline" size="sm" onClick={() => setRevealed(true)}>Показать ответ</Button>
            )}
            {answer && (
              <Button variant="outline" size="sm" onClick={() => setProgress((p) => { const { [current.id]: _drop, ...rest } = p; return rest })}>
                Пройти заново
              </Button>
            )}
            <Button size="sm" onClick={() => navigate(`/quiz/${next.id}`)}>Следующая</Button>
          </div>

          {showAnswer && (
            <section className="mt-6 text-sm" aria-live="polite">
              {answer && (
                <p className={cn('font-medium mb-2', answer.correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400')}>
                  {answer.correct ? 'Верно' : 'Неверно'}
                </p>
              )}
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Разбор</h4>
              <MiniMarkdown text={current.explanation} />
              {current.pitfalls.length > 0 && (
                <>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-4 mb-1">Что проверяют</h4>
                  <ul className="list-disc pl-5 space-y-0.5">{current.pitfalls.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
