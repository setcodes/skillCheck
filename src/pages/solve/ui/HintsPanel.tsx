import { Lightbulb } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { UserRole } from '@/entities/user/model/types'

interface Props {
  hints: string[]
  used: number
  role: UserRole
  onReveal: () => void
}

const TITLES = ['Направление', 'Ключевая идея', 'Почти решение']

export function HintsPanel({ hints, used, role, onReveal }: Props) {
  if (hints.length === 0) return null
  const interviewer = role === 'interviewer'
  const visible = interviewer ? hints.length : used

  return (
    <section className="mb-6 border rounded-lg p-4" aria-label="Подсказки">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Lightbulb className="h-4 w-4 text-yellow-500" aria-hidden />
          Подсказки {interviewer ? `(кандидат открыл: ${used} из ${hints.length})` : `(${used} из ${hints.length})`}
        </h3>
        {!interviewer && used < hints.length && (
          <Button size="sm" variant="outline" onClick={onReveal}>
            {used === 0 ? 'Показать подсказку' : 'Следующая подсказка'}
          </Button>
        )}
      </div>
      {visible === 0 ? (
        <p className="text-sm text-muted-foreground">Подсказки открываются по одной: от общего направления к почти готовой идее. Использованные подсказки видит интервьюер.</p>
      ) : (
        <ol className="space-y-2 text-sm">
          {hints.slice(0, visible).map((h, i) => (
            <li key={i}>
              <span className="font-medium">{i + 1}. {TITLES[i] ?? 'Подсказка'}. </span>
              {h}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
