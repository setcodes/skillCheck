import { Palette, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { THEMES, nextTheme, useTheme } from '@/shared/hooks/use-theme'
import { cn } from '@/shared/lib/utils'
import { useApp } from '../providers/AppProvider'
import { useConsole } from '../providers/ConsoleProvider'
import type { UserRole } from '@/entities/user/model/types'

const ROLES: { id: UserRole; label: string }[] = [
  { id: 'interviewer', label: 'Интервьюер' },
  { id: 'candidate', label: 'Кандидат' },
]

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background'

export function Header() {
  const { role, setRole } = useApp()
  const { theme, toggle } = useTheme()
  const terminal = useConsole()
  const themeName = (id: string) => THEMES.find((t) => t.id === id)?.label ?? id
  const label = `Тема: ${themeName(theme)}. Переключить на ${themeName(nextTheme(theme))}`

  return (
    <header className="relative z-10 border-b bg-card font-mono text-sm print:hidden">
      <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-4">
        <Link to="/" className={cn('flex items-baseline gap-1.5 rounded-sm', focusRing)} aria-label="SkillCheck — на главную">
          <span className="hidden text-primary-text sm:inline" aria-hidden>~/</span>
          <span className="font-brand text-lg uppercase sm:text-xl tracking-wide text-foreground">SkillCheck</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-4">
          <button
            type="button"
            onClick={terminal.open}
            aria-label="Открыть консоль"
            aria-keyshortcuts="Control+K Meta+K"
            title="Консоль — ⌘K / Ctrl+K"
            className={cn(
              'flex h-8 items-center gap-2 rounded-sm border px-1.5 text-muted-foreground transition-colors sm:px-2 hover:border-primary hover:text-foreground',
              focusRing
            )}
          >
            <Terminal className="h-4 w-4" aria-hidden />
            <span className="hidden md:inline" aria-hidden>консоль</span>
            <kbd className="hidden rounded-sm bg-muted px-1 text-[0.7rem] lg:inline" aria-hidden>⌘K</kbd>
          </button>
          <div className="flex items-center gap-1" role="group" aria-label="Роль">
            <span className="hidden text-muted-foreground md:inline" aria-hidden>role:</span>
            {ROLES.map(({ id, label: text }) => {
              const active = role === id
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRole(id)}
                  className={cn(
                    'h-8 rounded-sm px-1.5 text-xs lowercase transition-colors duration-150 sm:px-2 sm:text-sm',
                    focusRing,
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {text}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={toggle}
            title={label}
            aria-label={label}
            className={cn(
              'flex h-8 items-center gap-2 rounded-sm border px-1.5 text-muted-foreground transition-colors sm:px-2 hover:text-foreground',
              focusRing
            )}
          >
            <Palette className="h-4 w-4 sm:hidden" aria-hidden />
            <span className="hidden h-2.5 w-2.5 rounded-[2px] bg-primary sm:inline-block" aria-hidden />
            <span className="hidden sm:inline" aria-hidden>:{themeName(theme)}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
