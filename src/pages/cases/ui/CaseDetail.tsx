import { useEffect, useState } from 'react'
import { FileCode2, Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { CodeView } from '@/shared/ui/code-view'
import type { Case, CaseFile } from '@/entities/case/model/types'
import type { UserRole } from '@/entities/user/model/types'

function Bullets({ title, items, mark, tone }: { title: string; items: string[]; mark: string; tone: string }) {
  if (items.length === 0) return null
  return (
    <section className="space-y-1.5">
      <h2 className="text-xs font-bold text-foreground">{title}</h2>
      <ul className="space-y-1">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2 leading-relaxed">
            <span className={cn('w-3 shrink-0', tone)} aria-hidden>{mark}</span>
            <span className="font-sans text-[0.9rem] text-foreground">{x}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

type Tab = { key: string; file: CaseFile; reference: boolean }

/** Условие кейса и его файлы во вкладках; эталон (live) — отдельные вкладки только для интервьюера. */
export function CaseDetail({ item, role }: { item: Case; role: UserRole }) {
  const interviewer = role === 'interviewer'
  const tabs: Tab[] = [
    ...item.files.map((file) => ({ key: `f:${file.name}`, file, reference: false })),
    ...(interviewer ? item.solution.map((file) => ({ key: `s:${file.name}`, file, reference: true })) : []),
  ]
  const [active, setActive] = useState(tabs[0]?.key)
  useEffect(() => setActive(tabs[0]?.key), [item.id, role]) // eslint-disable-line react-hooks/exhaustive-deps
  const tab = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <article className="mx-auto max-w-4xl space-y-8 px-5 py-8 font-mono text-[0.85rem] sm:px-8">
      <header className="space-y-3">
        <p className="text-xs text-muted-foreground">
          <span className={item.kind === 'review' ? 'text-ansi-magenta' : 'text-ansi-yellow'}>{item.kind === 'review' ? 'ревью кода' : 'live coding'}</span>
          {' · '}
          {item.level} · {item.topic}
          {item.reviewedAt == null && <span className="text-ansi-yellow"> · ещё не вычитан</span>}
        </p>
        <h1 className="text-balance font-display text-2xl font-bold leading-snug tracking-[-0.02em] text-foreground">{item.title}</h1>
        <blockquote className="flex gap-3 rounded-sm border bg-card px-4 py-3">
          <span className="text-primary-text" aria-hidden>❯</span>
          <p className="font-sans text-base leading-relaxed text-foreground">{item.brief}</p>
        </blockquote>
      </header>

      {(item.context.length > 0 || item.requirements.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          <Bullets title="Контекст от интервьюера" items={item.context} mark="›" tone="text-ansi-cyan" />
          <Bullets title="Что должно получиться" items={item.requirements} mark="□" tone="text-ok" />
        </div>
      )}

      {tabs.length > 0 && tab && (
        <section aria-label={item.kind === 'review' ? 'Код для ревью' : 'Стартовый шаблон'} className="overflow-hidden rounded-sm border">
          <div role="tablist" aria-label="Файлы" className="flex items-stretch overflow-x-auto border-b bg-card">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={t.key === tab.key}
                onClick={() => setActive(t.key)}
                className={cn(
                  'flex shrink-0 items-center gap-2 whitespace-nowrap border-r px-3 py-2 text-xs transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  t.key === tab.key ? 'bg-background text-foreground shadow-[inset_0_2px_0_hsl(var(--primary))]' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.reference ? (
                  <Star className="h-3.5 w-3.5 text-ansi-yellow" fill="currentColor" stroke="none" aria-hidden />
                ) : (
                  <FileCode2 className="h-3.5 w-3.5 text-ansi-blue" aria-hidden />
                )}
                {t.reference && <span className="text-muted-foreground">эталон/</span>}
                {t.file.name}
              </button>
            ))}
          </div>
          <div role="tabpanel" aria-label={tab.file.name}>
            <CodeView code={tab.file.code} className="rounded-none border-0" />
          </div>
        </section>
      )}
    </article>
  )
}
