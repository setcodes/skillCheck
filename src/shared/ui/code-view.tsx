import { Fragment, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

const KEYWORDS = new Set(
  'const let var function return if else for while do break continue new class extends super this typeof instanceof in of try catch finally throw async await yield import export default from switch case null undefined true false void delete static get set'.split(
    ' '
  )
)

// Лёгкая подсветка JS/TS для коротких фрагментов: строки, комментарии, числа и ключевые слова.
const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g

function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN)) {
    const [text, comment, str, num, word] = m
    const i = m.index ?? 0
    if (i > last) out.push(line.slice(last, i))
    const tone = comment
      ? 'text-muted-foreground italic'
      : str
        ? 'text-ansi-yellow'
        : num
          ? 'text-ansi-magenta'
          : word && KEYWORDS.has(word)
            ? 'text-ansi-blue'
            : undefined
    out.push(tone ? <span key={i} className={tone}>{text}</span> : <Fragment key={i}>{text}</Fragment>)
    last = i + text.length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

/** Фрагмент кода с номерами строк — как в редакторе, только для чтения. */
export function CodeView({ code, className, label }: { code: string; className?: string; label?: string }) {
  const lines = code.replace(/\n$/, '').split('\n')
  return (
    <figure className={cn('overflow-hidden rounded-sm border bg-background font-mono text-[0.85rem]', className)}>
      {label && <figcaption className="border-b bg-card px-4 py-1.5 text-xs text-muted-foreground">{label}</figcaption>}
      <pre className="overflow-x-auto py-3 leading-[1.7]">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="flex">
              <span className="w-10 shrink-0 select-none pr-4 text-right tabular-nums text-muted-foreground/60" aria-hidden>
                {i + 1}
              </span>
              <span className="whitespace-pre pr-4 text-foreground">{highlight(line)}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}
