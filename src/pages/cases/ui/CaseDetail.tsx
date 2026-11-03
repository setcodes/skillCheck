import { ChevronDown } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { cn } from '@/shared/lib/utils'
import type { Case, CaseFile, IssueRisk } from '@/entities/case/model/types'
import type { UserRole } from '@/entities/user/model/types'

const RISK: Record<IssueRisk, { label: string; className: string; order: number }> = {
  critical: { label: 'Критично', className: 'bg-red-100 text-red-800 border-red-200', order: 0 },
  important: { label: 'Важно', className: 'bg-orange-100 text-orange-800 border-orange-200', order: 1 },
  quality: { label: 'Качество', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', order: 2 },
  cosmetic: { label: 'Косметика', className: 'bg-slate-100 text-slate-800 border-slate-200', order: 3 },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</h3>
      {children}
    </section>
  )
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <ul className="list-disc pl-5 space-y-1 text-sm">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  )
}

function Code({ file }: { file: CaseFile }) {
  return (
    <figure className="mb-3">
      <figcaption className="text-xs font-mono text-muted-foreground mb-1">{file.name}</figcaption>
      <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
        <code>{file.code}</code>
      </pre>
    </figure>
  )
}

export function CaseDetail({ item, role }: { item: Case; role: UserRole }) {
  const interviewer = role === 'interviewer'
  const issues = [...item.issues].sort((a, b) => RISK[a.risk].order - RISK[b.risk].order)

  return (
    <article>
      <header className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant="outline">{item.kind === 'review' ? 'Ревью кода' : 'Live coding'}</Badge>
        <Badge variant="secondary" className="capitalize">{item.level}</Badge>
        {item.reviewedAt == null && <span className="text-xs text-muted-foreground">Кейс ещё не вычитан</span>}
      </header>
      <h2 className="text-xl font-semibold">{item.title}</h2>

      <Section title="Задание">
        <blockquote className="border-l-4 pl-4 text-sm italic">{item.brief}</blockquote>
      </Section>

      {item.context.length > 0 && (
        <Section title="Контекст от интервьюера">
          <Bullets items={item.context} />
        </Section>
      )}
      {item.requirements.length > 0 && (
        <Section title="Что должно получиться">
          <Bullets items={item.requirements} />
        </Section>
      )}
      {item.files.length > 0 && (
        <Section title={item.kind === 'review' ? 'Код для ревью' : 'Стартовый шаблон'}>
          {item.files.map((f) => (
            <Code key={f.name} file={f} />
          ))}
        </Section>
      )}

      {interviewer && (
        <div className="mt-8 border-t pt-2">
          <p className="text-xs text-muted-foreground mt-2">Материалы интервьюера</p>

          {issues.length > 0 && (
            <Section title={`Что нужно найти (${issues.length})`}>
              <ol className="space-y-3">
                {issues.map((issue, i) => (
                  <li key={i} className="text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn(RISK[issue.risk].className)}>
                        {RISK[issue.risk].label}
                      </Badge>
                      <span className="font-medium">{issue.title}</span>
                    </div>
                    <p className="mt-1"><span className="text-muted-foreground">Чем грозит: </span>{issue.consequence}</p>
                    <p><span className="text-muted-foreground">Исправление: </span>{issue.fix}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {item.grading.length > 0 && (
            <Section title="Что оценивается">
              <Bullets items={item.grading} />
            </Section>
          )}
          {item.followUps.length > 0 && (
            <Section title="Что спросить после">
              <Bullets items={item.followUps} />
            </Section>
          )}
          {item.testsToMention.length > 0 && (
            <Section title="Какие проверки и тесты стоит назвать">
              <Bullets items={item.testsToMention} />
            </Section>
          )}
          {item.solution.length > 0 && (
            <Section title="Эталонное решение">
              <Collapsible>
                <CollapsibleTrigger className="group flex items-center gap-2 text-sm hover:bg-muted/70 rounded px-2 py-1">
                  Показать решение
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  {item.solution.map((f) => (
                    <Code key={f.name} file={f} />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </Section>
          )}
        </div>
      )}
    </article>
  )
}
