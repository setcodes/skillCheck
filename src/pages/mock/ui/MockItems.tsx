import { cn } from '@/shared/lib/utils'
import type { MockItem, MockTaskItem, MockTheoryItem } from '@/entities/mock/model/types'

export const isDone = (it: MockItem) => (it.type === 'task' ? (it as MockTaskItem).autoScore != null : (it as MockTheoryItem).answerDraft != null)

/** В отчёте: задача — все проверки пройдены, теория — самооценка от 3. */
function reviewMark(it: MockItem): { text: string; tone: string; label: string } | null {
  if (it.type === 'task') {
    const t = it as MockTaskItem
    if (t.autoScore == null) return null
    return t.testPassedRatio === 1 ? { text: '✓', tone: 'text-ok', label: 'все проверки пройдены' } : { text: '✗', tone: 'text-ansi-red', label: 'проверки не пройдены' }
  }
  const th = it as MockTheoryItem
  if (th.selfScore == null) return null
  return th.selfScore >= 3 ? { text: '✓', tone: 'text-ok', label: 'самооценка от 3' } : { text: '✗', tone: 'text-ansi-red', label: 'самооценка ниже 3' }
}

interface Props {
  items: MockItem[]
  currentIndex: number
  review: boolean
  onSelect: (index: number) => void
  className?: string
}

/** Пункты сессии по порядку: номер, тип, название и статус. */
export function MockItems({ items, currentIndex, review, onSelect, className }: Props) {
  const done = items.filter(isDone).length
  const percent = Math.round((done / items.length) * 100)
  return (
    <aside aria-label="Пункты сессии" className={cn('flex min-h-0 w-72 shrink-0 flex-col border-r bg-card font-mono text-sm', className)}>
      <div className="shrink-0 space-y-2 border-b px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <h2 className="font-bold text-foreground">Мок‑интервью — прогресс</h2>
          <span className="tabular-nums text-muted-foreground">{review ? 'отчёт' : `${currentIndex + 1}/${items.length}`}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
          <span className="tabular-nums">{percent}% завершено</span>
        </div>
      </div>
      <ol className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {items.map((it, i) => {
          const active = !review && i === currentIndex
          const mark = review ? reviewMark(it) : isDone(it) ? { text: '●', tone: 'text-ok', label: 'есть ответ' } : null
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left transition-colors duration-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                <span className={cn('w-12 shrink-0 text-xs', it.type === 'task' ? 'text-ansi-yellow' : 'text-ansi-blue')}>
                  {it.type === 'task' ? 'задача' : 'теория'}
                </span>
                <span className="min-w-0 flex-1 truncate">{it.title}</span>
                {mark && (
                  <span className={cn('shrink-0 text-xs', mark.tone)} title={mark.label}>
                    <span aria-hidden>{mark.text}</span>
                    <span className="sr-only">{mark.label}</span>
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
