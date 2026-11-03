import { Fragment, type ReactNode } from 'react'

// Минимальный рендер для ответов: **жирный**, `код`, нумерованные списки и абзацы.
// Намеренно без dangerouslySetInnerHTML и внешних библиотек.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{part.slice(1, -1)}</code>
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

export function MiniMarkdown({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/)
  const rendered: ReactNode[] = []
  for (let i = 0; i < blocks.length; i++) {
    const lines = blocks[i].split('\n')
    if (lines.every((l) => /^\d+\.\s/.test(l))) {
      rendered.push(
        <ol key={i} className="list-decimal pl-5 space-y-0.5">
          {lines.map((l, j) => (
            <li key={j}>{inline(l.replace(/^\d+\.\s/, ''))}</li>
          ))}
        </ol>
      )
    } else {
      rendered.push(<p key={i}>{inline(lines.join(' '))}</p>)
    }
  }
  return <div className={className ?? 'space-y-2'}>{rendered}</div>
}
