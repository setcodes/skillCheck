import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface ExplorerMark {
  text: string
  tone: string
  label: string
}

export interface ExplorerItem {
  id: string
  title: string
  mark?: ExplorerMark
}

export interface ExplorerGroup {
  id: string
  /** имя папки, например «junior» → «junior/» */
  name: string
  hint?: string
  items: ExplorerItem[]
}

interface Props {
  /** заголовок панели и доступное имя, например «задачи» */
  title: string
  label: string
  counter?: ReactNode
  groups: ExplorerGroup[]
  currentId?: string
  onSelect: (id: string) => void
  query: string
  onQuery: (q: string) => void
  /** строка фильтров под поиском */
  filters?: ReactNode
  footer?: ReactNode
  className?: string
  onClose?: () => void
}

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

/** Проводник в духе IDE: папки со счётчиками, поиск по «/», ↑/↓ по элементам. */
export function Explorer({ title, label, counter, groups, currentId, onSelect, query, onQuery, filters, footer, className, onClose }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || isEditable(e.target)) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // текущий элемент — в зоне видимости (после перехода по [ ] или ссылке)
  useEffect(() => {
    listRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [currentId])

  const moveFocus = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('[data-explorer-item]') ?? [])]
    const i = items.indexOf(e.currentTarget)
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  const searching = query.trim() !== ''

  return (
    <aside aria-label={label} className={cn('flex min-h-0 w-72 shrink-0 flex-col border-r bg-card font-mono text-sm', className)}>
      <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b px-3 text-xs">
        <h2 className="font-bold text-foreground">{title}</h2>
        <span className="flex items-center gap-2 text-muted-foreground">
          {counter}
          {onClose && (
            <button type="button" onClick={onClose} aria-label={`Скрыть: ${label.toLowerCase()}`} className="rounded-sm p-0.5 hover:bg-accent hover:text-foreground">
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </span>
      </div>

      <div className="shrink-0 space-y-2 border-b p-2">
        <label className="flex h-8 items-center gap-2 rounded-sm border bg-background px-2 text-xs focus-within:border-primary">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="sr-only">Поиск</span>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onQuery('')
                e.currentTarget.blur()
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                listRef.current?.querySelector<HTMLButtonElement>('[data-explorer-item]')?.focus()
              }
            }}
            placeholder="поиск"
            className="min-w-0 flex-1 !bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded-sm bg-muted px-1 text-muted-foreground" aria-hidden>/</kbd>
        </label>
        {filters}
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {groups.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">ничего не найдено</p>}
        {groups.map((g) => {
          const open = !collapsed[g.id] || searching
          return (
            <section key={g.id} aria-label={g.hint ?? g.name}>
              <button
                type="button"
                aria-expanded={open}
                title={g.hint}
                onClick={() => setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))}
                className="flex w-full items-center gap-1 rounded-sm px-1.5 py-1 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {open ? <ChevronDown className="h-3.5 w-3.5" aria-hidden /> : <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
                <span className="truncate font-bold text-ansi-blue">{g.name}/</span>
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">{g.items.length}</span>
              </button>
              {open && (
                <ul>
                  {g.items.map((it) => {
                    const active = it.id === currentId
                    return (
                      <li key={it.id}>
                        <button
                          type="button"
                          data-explorer-item
                          aria-current={active ? 'true' : undefined}
                          onClick={() => onSelect(it.id)}
                          onKeyDown={moveFocus}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-sm py-1 pl-6 pr-2 text-left transition-colors duration-100',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            active ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          )}
                        >
                          <span className={cn('w-2 shrink-0', active ? 'text-primary-text' : 'invisible')} aria-hidden>❯</span>
                          <span className="min-w-0 flex-1 truncate">{it.title}</span>
                          {it.mark && (
                            <span className={cn('shrink-0 text-xs tabular-nums', it.mark.tone)} title={it.mark.label}>
                              <span aria-hidden>{it.mark.text}</span>
                              <span className="sr-only">{it.mark.label}</span>
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      {footer && <div className="shrink-0 border-t p-2">{footer}</div>}
    </aside>
  )
}
