import { cn } from '@/shared/lib/utils'
import { ToolButton } from '@/shared/ui/tool-button'
import { ScoreForm } from '@/shared/ui/score-form'
import { InspectorSection } from '@/shared/ui/inspector-section'

interface Props {
  score?: number
  comment?: string
  rubric?: { criterion: string; weight: number }[]
  rubricDone: number[]
  hintsUsed: number
  onRubric: (done: number[]) => void
  onScore: (score: number) => void
  onComment: (comment: string) => void
  onSend: () => void
}

/** Предложенная оценка 0–5 по выполненным критериям (шаг 0.5). */
export function suggestScore(rubric: { weight: number }[], done: number[]): number {
  const total = rubric.reduce((s, r) => s + r.weight, 0)
  if (total === 0) return 0
  const got = done.reduce((s, i) => s + (rubric[i]?.weight ?? 0), 0)
  return Math.round(((got / total) * 5) * 2) / 2
}

export function ScorePanel({ score, comment, rubric, rubricDone, hintsUsed, onRubric, onScore, onComment, onSend }: Props) {
  const suggested = rubric ? suggestScore(rubric, rubricDone) : null
  const toggle = (i: number) => onRubric(rubricDone.includes(i) ? rubricDone.filter((x) => x !== i) : [...rubricDone, i])

  return (
    <>
      {rubric && rubric.length > 0 && (
        <InspectorSection label="Рубрика" title="Рубрика" meta={`подсказок: ${hintsUsed}`}>
          <fieldset>
            <legend className="sr-only">Рубрика оценки</legend>
            <ul className="space-y-2">
              {rubric.map((r, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-2 leading-relaxed">
                    <input
                      type="checkbox"
                      className="mt-1 h-3.5 w-3.5 shrink-0 accent-[hsl(var(--primary))]"
                      checked={rubricDone.includes(i)}
                      onChange={() => toggle(i)}
                    />
                    <span className={cn('flex-1', rubricDone.includes(i) ? 'text-foreground' : 'text-muted-foreground')}>{r.criterion}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">{r.weight}%</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
              <span>
                Предложенная оценка: <strong className="text-primary-text">{suggested}</strong> из 5
              </span>
              <ToolButton onClick={() => onScore(suggested ?? 0)}>Применить</ToolButton>
            </div>
          </fieldset>
        </InspectorSection>
      )}

      <InspectorSection label="Оценка" title="Оценка">
        <ScoreForm
          idPrefix="task"
          score={score}
          comment={comment}
          commentLabel="Комментарий по решению:"
          onScore={onScore}
          onComment={onComment}
          onSend={onSend}
        />
      </InspectorSection>
    </>
  )
}
