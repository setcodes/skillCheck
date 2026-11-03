import type { Check } from '@/entities/task/model/checks'
import { format } from './checks'

const isJs = (v: unknown): v is { $js: string } => !!v && typeof v === 'object' && '$js' in (v as object)
const show = (v: unknown): string => (isJs(v) ? v.$js : Array.isArray(v) ? `[${v.map(show).join(', ')}]` : v && typeof v === 'object' ? format(v, 120) : format(v, 120))

const expectation = (e: Record<string, unknown>): string => {
  if ('equals' in e) return `→ ${show(e.equals)}`
  if ('resolves' in e) return `→ промис с ${show(e.resolves)}`
  if ('throws' in e) return e.throws === true ? '→ бросает ошибку' : `→ бросает «${e.throws}»`
  if ('rejects' in e) return e.rejects === true ? '→ отклоняет промис' : `→ отклоняет промис с «${e.rejects}»`
  return `→ условие ${e.satisfies}`
}

/** Читаемое описание видимых проверок — для блока «Показать тесты». */
export function describeChecks(checks: Check[], exportName: string): string {
  return checks
    .filter((c) => !c.hidden)
    .map((c) => {
      if (c.type === 'script') return c.code.trim()
      const args = Array.isArray(c.args) ? c.args.map(show).join(', ') : c.args.$js
      const call = `${c.fn ?? exportName}(${args})${c.then ? `(${Array.isArray(c.then) ? c.then.map(show).join(', ') : c.then.$js})` : ''}`
      const extras = [c.unchanged ? 'вход не меняется' : '', c.maxMs ? `≤ ${c.maxMs} мс` : ''].filter(Boolean).join(', ')
      return `// ${c.title}${extras ? ` (${extras})` : ''}\n${call} ${expectation(c.expect as Record<string, unknown>)}`
    })
    .join('\n\n')
}
