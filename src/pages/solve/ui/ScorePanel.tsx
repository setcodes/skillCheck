import { Send, Star } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

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
        <fieldset className="mt-6 border rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Рубрика оценки</legend>
          <ul className="space-y-2">
            {rubric.map((r, i) => (
              <li key={i}>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="mt-1" checked={rubricDone.includes(i)} onChange={() => toggle(i)} />
                  <span className="flex-1">{r.criterion}</span>
                  <span className="text-xs text-muted-foreground">{r.weight}%</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
            <span>Предложенная оценка: <strong>{suggested}</strong> из 5</span>
            <Button size="sm" variant="outline" onClick={() => onScore(suggested ?? 0)}>Применить</Button>
            <span className="text-muted-foreground">Подсказок использовано: {hintsUsed}</span>
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap gap-3 mt-6">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4" aria-hidden />
          <label htmlFor="task-score" className="text-sm">Оценка (0–5):</label>
          <Input
            id="task-score"
            type="number"
            min={0}
            max={5}
            step={0.5}
            value={score ?? ''}
            onChange={(e) => onScore(Math.min(5, Math.max(0, Number(e.target.value))))}
            className="w-20"
          />
        </div>
        <Button variant="outline" onClick={onSend} className="flex items-center gap-2">
          <Send className="h-4 w-4" aria-hidden />
          Отправить оценку
        </Button>
      </div>
      <div className="mb-6 mt-4">
        <label htmlFor="task-comment" className="block text-sm font-medium mb-2">Комментарий по решению:</label>
        <Textarea
          id="task-comment"
          placeholder="Введите комментарий..."
          value={comment ?? ''}
          onChange={(e) => onComment(e.target.value)}
          className="w-full min-h-[80px]"
        />
      </div>
    </>
  )
}
