import { cn } from '@/shared/lib/utils'
import { InspectorSection } from '@/shared/ui/inspector-section'
import type { Case, IssueRisk } from '@/entities/case/model/types'
import type { UserRole } from '@/entities/user/model/types'

const RISK: Record<IssueRisk, { label: string; tone: string; order: number }> = {
  critical: { label: 'критично', tone: 'border-ansi-red text-ansi-red', order: 0 },
  important: { label: 'важно', tone: 'border-ansi-yellow text-ansi-yellow', order: 1 },
  quality: { label: 'качество', tone: 'border-ansi-cyan text-ansi-cyan', order: 2 },
  cosmetic: { label: 'косметика', tone: 'text-muted-foreground', order: 3 },
}

function List({ items, mark, tone }: { items: string[]; mark: string; tone: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2 leading-relaxed">
          <span className={cn('w-3 shrink-0', tone)} aria-hidden>{mark}</span>
          <span className="text-foreground">{x}</span>
        </li>
      ))}
    </ul>
  )
}

/** Материалы интервьюера: находки по риску, критерии, вопросы после; кандидату — как проходить кейс. */
export function CaseInspector({ item, role }: { item: Case; role: UserRole }) {
  if (role !== 'interviewer') {
    return (
      <InspectorSection label="Как проходить" title="Как проходить">
        <p className="leading-relaxed text-muted-foreground">
          {item.kind === 'review'
            ? 'Называйте проблемы от критичных к косметике: что не так, чем это грозит пользователю и как исправить.'
            : 'Уточните требования, проговорите план, затем пишите код. В конце назовите, какие проверки и тесты нужны.'}
        </p>
      </InspectorSection>
    )
  }

  const issues = [...item.issues].sort((a, b) => RISK[a.risk].order - RISK[b.risk].order)
  return (
    <>
      {issues.length > 0 && (
        <InspectorSection label="Что нужно найти" title={`Что нужно найти (${issues.length})`}>
          <ol className="space-y-4">
            {issues.map((issue, i) => (
              <li key={i} className="space-y-1">
                <p className="flex items-start gap-2">
                  <span className={cn('shrink-0 rounded-sm border px-1 text-[0.7rem] leading-5', RISK[issue.risk].tone)}>{RISK[issue.risk].label}</span>
                  <span className="font-bold leading-5 text-foreground">{issue.title}</span>
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  <span className="text-foreground">Чем грозит: </span>
                  {issue.consequence}
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  <span className="text-foreground">Исправление: </span>
                  {issue.fix}
                </p>
              </li>
            ))}
          </ol>
        </InspectorSection>
      )}
      {item.grading.length > 0 && (
        <InspectorSection label="Что оценивается" title="Что оценивается">
          <List items={item.grading} mark="+" tone="text-ok" />
        </InspectorSection>
      )}
      {item.followUps.length > 0 && (
        <InspectorSection label="Что спросить после" title="Что спросить после">
          <List items={item.followUps} mark="?" tone="text-ansi-cyan" />
        </InspectorSection>
      )}
      {item.testsToMention.length > 0 && (
        <InspectorSection label="Проверки и тесты" title="Какие проверки и тесты стоит назвать">
          <List items={item.testsToMention} mark="✓" tone="text-ok" />
        </InspectorSection>
      )}
    </>
  )
}
