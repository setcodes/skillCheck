import { Lightbulb } from 'lucide-react'
import { ToolButton } from '@/shared/ui/tool-button'
import type { UserRole } from '@/entities/user/model/types'
import { InspectorSection } from '@/shared/ui/inspector-section'

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
    <InspectorSection
      label="Подсказки"
      title={
        <>
          <Lightbulb className="h-3.5 w-3.5 text-ansi-yellow" aria-hidden />
          Подсказки
        </>
      }
      meta={interviewer ? `кандидат открыл ${used}/${hints.length}` : `${used}/${hints.length}`}
    >
      {visible === 0 ? (
        <p className="text-muted-foreground">
          Открываются по одной: от общего направления к почти готовой идее. Использованные подсказки видит интервьюер.
        </p>
      ) : (
        <ol className="space-y-3">
          {hints.slice(0, visible).map((h, i) => (
            <li key={i} className="leading-relaxed">
              <span className="text-ansi-yellow">{i + 1}. {TITLES[i] ?? 'Подсказка'}. </span>
              <span className="text-foreground">{h}</span>
            </li>
          ))}
        </ol>
      )}
      {!interviewer && used < hints.length && (
        <ToolButton onClick={onReveal} className="mt-3">
          {used === 0 ? 'Показать подсказку' : 'Следующая подсказка'}
        </ToolButton>
      )}
    </InspectorSection>
  )
}
