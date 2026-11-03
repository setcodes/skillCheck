import type { Question } from '@/entities/question/model/types'
import { MiniMarkdown } from '@/shared/ui/mini-markdown'

function List({ title, items, tone }: { title: string; items: string[]; tone?: 'warn' }) {
  if (items.length === 0) return null
  return (
    <section className="mt-3">
      <h4 className={`text-xs font-semibold uppercase tracking-wide ${tone === 'warn' ? 'text-destructive' : 'text-muted-foreground'}`}>
        {title}
      </h4>
      <ul className="mt-1 list-disc pl-5 text-sm space-y-0.5">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
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
    <div className="space-y-2">
      {q.reviewedAt == null && (
        <p className="text-xs text-muted-foreground">Ответ ещё не вычитан</p>
      )}
      <div className="p-3 bg-muted rounded-lg text-sm">
        {hasFull ? (
          <MiniMarkdown text={answer.full!} />
        ) : (
          <p className="font-medium whitespace-pre-wrap">{answer.short}</p>
        )}
      </div>
      <List title="Должно прозвучать" items={answer.mustMention} />
      <List title="Типичные ошибки" items={answer.commonMistakes} />
      <List title="Красные флаги" items={answer.redFlags} tone="warn" />
      <List title="Уточняющие вопросы" items={q.followUps} />
      <List title="Источники" items={q.sources} />
    </div>
  )
}
