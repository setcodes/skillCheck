import { Send, Star } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

interface Props {
  score?: number
  comment?: string
  onScore: (score: number) => void
  onComment: (comment: string) => void
  onSend: () => void
}

export function ScorePanel({ score, comment, onScore, onComment, onSend }: Props) {
  return (
    <>
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
