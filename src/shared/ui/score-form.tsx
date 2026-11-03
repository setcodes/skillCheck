import { Send } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ToolButton } from './tool-button'

interface Props {
  /** префикс id полей — на странице может быть несколько форм */
  idPrefix: string
  score?: number
  comment?: string
  commentLabel?: string
  onScore: (score: number) => void
  onComment: (comment: string) => void
  onSend: () => void
  disabled?: boolean
}

const SCORES = [0, 1, 2, 3, 4, 5]

/** Оценка 0–5 (поле и быстрые кнопки), комментарий и отправка в отчёт интервью. */
export function ScoreForm({ idPrefix, score, comment, commentLabel = 'Комментарий:', onScore, onComment, onSend, disabled }: Props) {
  return (
    <div className="space-y-3 font-mono text-[0.8rem]">
      <div className="flex items-center gap-2">
        <label htmlFor={`${idPrefix}-score`} className="text-muted-foreground">Оценка (0–5):</label>
        <input
          id={`${idPrefix}-score`}
          type="number"
          min={0}
          max={5}
          step={0.5}
          value={score ?? ''}
          disabled={disabled}
          onChange={(e) => onScore(Math.min(5, Math.max(0, Number(e.target.value))))}
          className="h-7 w-16 rounded-sm border px-2 text-right tabular-nums outline-none focus:border-primary"
        />
      </div>
      <div className="flex gap-1" aria-hidden>
        {SCORES.map((n) => (
          <button
            key={n}
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => onScore(n)}
            className={cn(
              'grid h-7 w-7 place-items-center rounded-sm border text-xs tabular-nums transition-colors',
              score === n ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground hover:border-primary hover:text-foreground'
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor={`${idPrefix}-comment`} className="mb-1 block text-muted-foreground">{commentLabel}</label>
        <textarea
          id={`${idPrefix}-comment`}
          placeholder="что получилось, что нет…"
          value={comment ?? ''}
          disabled={disabled}
          onChange={(e) => onComment(e.target.value)}
          className="min-h-[80px] w-full resize-y rounded-sm border p-2 leading-relaxed outline-none focus:border-primary"
        />
      </div>
      <ToolButton variant="primary" onClick={onSend} disabled={disabled}>
        <Send aria-hidden />
        Отправить оценку
      </ToolButton>
    </div>
  )
}
