import type { Question } from '@/entities/question/model/types'
import { MiniMarkdown } from '@/shared/ui/mini-markdown'

function List({ title, items, mark, tone }: { title: string; items: string[]; mark: string; tone: string }) {
  if (items.length === 0) return null
  return (
    <section className="space-y-1.5">
      <h3 className="text-xs font-bold text-foreground">{title}</h3>
      <ul className="space-y-1">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2 leading-relaxed">
            <span className={`w-3 shrink-0 ${tone}`} aria-hidden>{mark}</span>
            <span className="text-foreground">{x}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Эталон для интервьюера: суть, развёрнутый ответ и чек-листы оценки.
export function AnswerView({ q }: { q: Question }) {
  const { answer } = q
  const hasFull = !!answer.full && answer.full !== answer.short
  return (
    <div className="space-y-6 font-mono text-[0.85rem]">
      <section className="rounded-sm border bg-card">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
          <span>
            <span className="text-primary-text" aria-hidden>▸ </span>эталонный ответ
          </span>
          {q.reviewedAt == null ? <span className="text-ansi-yellow">ещё не вычитан</span> : <span>обновлён {q.reviewedAt}</span>}
        </div>
        <div className="px-4 py-3 font-sans text-[0.95rem] leading-relaxed text-foreground">
          {hasFull ? <MiniMarkdown text={answer.full!} className="space-y-3" /> : <p className="whitespace-pre-wrap">{answer.short}</p>}
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <List title="Должно прозвучать" items={answer.mustMention} mark="+" tone="text-ok" />
        <List title="Типичные ошибки" items={answer.commonMistakes} mark="!" tone="text-ansi-yellow" />
        <List title="Красные флаги" items={answer.redFlags} mark="✗" tone="text-ansi-red" />
        <List title="Уточняющие вопросы" items={q.followUps} mark="?" tone="text-ansi-cyan" />
      </div>
      <List title="Источники" items={q.sources} mark="→" tone="text-muted-foreground" />
    </div>
  )
}
