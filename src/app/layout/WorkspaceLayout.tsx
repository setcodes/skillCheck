import { Suspense, useEffect, type ReactNode } from 'react'
import {
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Code as CodeIcon,
  FileSearch,
  HelpCircle,
  Import as ImportIcon,
  Terminal,
  Timer,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TimerMenu } from '@/shared/ui/timer-menu'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { THEMES, nextTheme, useTheme } from '@/shared/hooks/use-theme'
import { PROFESSIONS, isProfessionEnabled } from '@/entities/profession/model/constants'
import type { UserRole } from '@/entities/user/model/types'
import { useApp } from '../providers/AppProvider'
import { useConsole } from '../providers/ConsoleProvider'
import { useInterviewTimer } from '../providers/InterviewTimerProvider'

const INTERVIEWER_ONLY = ['/interview', '/data']

interface Section {
  to: string
  /** имя в пути и строке состояния */
  name: string
  /** полное название — подсказка и доступное имя ссылки */
  label: string
  icon: LucideIcon
  interviewerOnly?: boolean
}

const SECTIONS: Section[] = [
  { to: '/solve', name: 'задачи', label: 'Решение задач', icon: CodeIcon },
  { to: '/theory', name: 'теория', label: 'Теория', icon: BookOpen },
  { to: '/quiz', name: 'квиз', label: 'Что выведет код?', icon: HelpCircle },
  { to: '/cases', name: 'кейсы', label: 'Кейсы', icon: FileSearch },
  { to: '/mock', name: 'мок', label: 'Мок‑интервью', icon: Clock },
  { to: '/interview', name: 'интервью', label: 'Режим интервью', icon: Users, interviewerOnly: true },
  { to: '/data', name: 'данные', label: 'Импорт / Экспорт', icon: ImportIcon, interviewerOnly: true },
]

const ROLES: { id: UserRole; label: string }[] = [
  { id: 'interviewer', label: 'Интервьюер' },
  { id: 'candidate', label: 'Кандидат' },
]

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

/** Цифры 1–7 переключают раздел, если фокус не в поле ввода и не открыто меню. */
function useSectionHotkeys(sections: Section[]) {
  const navigate = useNavigate()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isEditable(e.target)) return
      if (document.querySelector('[role="menu"], [role="dialog"][aria-modal="true"]')) return
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1 || n > sections.length) return
      e.preventDefault()
      navigate(sections[n - 1].to)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sections, navigate])
}

function Rail({ sections, onHome }: { sections: Section[]; onHome: () => void }) {
  return (
    <nav aria-label="Разделы" className="flex w-14 shrink-0 flex-col items-center gap-1 border-r bg-card py-2 print:hidden">
      <Link
        to="/"
        onClick={onHome}
        aria-label="SkillCheck — к профессиям"
        className={cn('group relative mb-2 grid h-10 w-10 place-items-center rounded-sm font-bold text-primary-text', focusRing)}
      >
        ~/
        <RailTip>К профессиям</RailTip>
      </Link>
      {sections.map(({ to, label, icon: Icon }, i) => (
        <NavLink key={to} to={to} className={cn('group relative rounded-sm', focusRing)}>
          {({ isActive }) => (
            <span
              className={cn(
                'grid h-10 w-10 place-items-center rounded-sm transition-colors duration-150',
                isActive ? 'bg-primary/15 text-primary-text' : 'text-muted-foreground group-hover:bg-accent group-hover:text-foreground'
              )}
            >
              <span className={cn('absolute -left-2 bottom-2 top-2 w-0.5 rounded-full bg-primary', !isActive && 'hidden')} aria-hidden />
              <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} aria-hidden />
              <span className="sr-only">{label}</span>
              <span className="absolute bottom-0.5 right-1 font-mono text-[0.55rem] text-muted-foreground/70" aria-hidden>
                {i + 1}
              </span>
              <RailTip>
                {label} <kbd className="ml-2 rounded-sm bg-muted px-1 text-muted-foreground">{i + 1}</kbd>
              </RailTip>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

/** Подсказка справа от иконки рейла — по наведению и фокусу с клавиатуры. */
function RailTip({ children }: { children: ReactNode }) {
  return (
    <span
      className="pointer-events-none invisible absolute left-full top-1/2 z-30 ml-3 -translate-y-1/2 whitespace-nowrap rounded-sm border bg-popover px-2 py-1 font-mono text-xs font-normal text-popover-foreground opacity-0 shadow-lg transition-opacity duration-100 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100"
      aria-hidden
    >
      {children}
    </span>
  )
}

function PathBar({ section, item }: { section?: Section; item?: string }) {
  const { role, setRole, prof, setProf } = useApp()
  const navigate = useNavigate()
  const current = PROFESSIONS.find((p) => p.id === prof)
  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 font-mono text-xs print:hidden">
      <nav aria-label="Путь" className="flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap text-muted-foreground">
        <Link to="/" className={cn('rounded-sm px-1 text-primary-text hover:underline', focusRing)} aria-label="На главную">
          ~
        </Link>
        <span aria-hidden>/</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn('flex items-center gap-0.5 rounded-sm px-1 hover:bg-accent hover:text-foreground', focusRing)}
            aria-label={`Профессия: ${current?.title ?? prof}. Сменить`}
          >
            {prof}
            <ChevronDown className="h-3 w-3" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 font-mono">
            {PROFESSIONS.map((p) => {
              const enabled = isProfessionEnabled(p.id)
              return (
                <DropdownMenuItem
                  key={p.id}
                  disabled={!enabled}
                  onSelect={() => {
                    setProf(p.id)
                    navigate('/solve')
                  }}
                  className="flex items-center gap-2 text-xs"
                >
                  <Check className={cn('h-3.5 w-3.5', p.id !== prof && 'invisible')} aria-hidden />
                  <span className="font-bold">{p.title}</span>
                  <span className="ml-auto text-muted-foreground">{enabled ? p.subtitle : 'скоро'}</span>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        {section && (
          <>
            <span aria-hidden>/</span>
            {item ? (
              <Link to={section.to} className={cn('rounded-sm px-1 hover:text-foreground hover:underline', focusRing)}>
                {section.name}
              </Link>
            ) : (
              <span className="px-1 text-foreground" aria-current="page">{section.name}</span>
            )}
          </>
        )}
        {item && (
          <>
            <span aria-hidden>/</span>
            <span className="truncate px-1 text-foreground" aria-current="page">{item}</span>
          </>
        )}
      </nav>

      <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Роль">
        <span className="hidden text-muted-foreground sm:inline" aria-hidden>role:</span>
        {ROLES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={role === id}
            onClick={() => setRole(id)}
            className={cn(
              'h-6 rounded-sm px-1.5 lowercase transition-colors duration-150',
              focusRing,
              role === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StatusBar({ section, count }: { section?: Section; count: number }) {
  const { role } = useApp()
  const { theme, toggle } = useTheme()
  const { open } = useConsole()
  const timer = useInterviewTimer()
  const themeLabel = THEMES.find((t) => t.id === theme)?.label ?? theme
  const cell = cn('flex items-center gap-1.5 border-l px-3 transition-colors hover:bg-accent hover:text-foreground', focusRing)
  return (
    <footer className="flex h-7 shrink-0 items-stretch justify-between border-t bg-card font-mono text-xs text-muted-foreground print:hidden">
      <div className="flex min-w-0 items-stretch">
        <span className="flex shrink-0 items-center bg-primary px-3 font-bold uppercase text-primary-foreground">{section?.name ?? 'skillcheck'}</span>
        <span className="hidden items-center px-3 sm:flex">{role === 'interviewer' ? 'интервьюер' : 'кандидат'}</span>
        <TimerMenu timer={timer} title="Глобальный таймер интервью" align="start" side="top">
          <button type="button" aria-label={`Глобальный таймер интервью: ${timer.display}`} className={cn(cell, timer.running && 'text-primary-text')}>
            <Timer className="h-3.5 w-3.5" aria-hidden />
            <span className="tabular-nums">{timer.display}</span>
            <span
              className={cn('h-1.5 w-1.5 rounded-full', timer.running ? 'bg-primary motion-safe:animate-pulse' : 'bg-muted-foreground/50')}
              aria-hidden
            />
            <span className="sr-only">{timer.running ? 'идёт' : 'на паузе'}</span>
          </button>
        </TimerMenu>
        <span className="hidden items-center border-l px-3 lg:flex" aria-hidden>
          1–{count} разделы · ⌘K консоль
        </span>
      </div>
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={toggle}
          aria-label={`Тема: ${themeLabel}. Переключить на ${THEMES.find((t) => t.id === nextTheme(theme))?.label}`}
          className={cell}
        >
          <span className="h-2 w-2 rounded-[2px] bg-primary" aria-hidden />
          <span className="hidden sm:inline">{themeLabel}</span>
        </button>
        <button type="button" onClick={open} aria-label="Открыть консоль" aria-keyshortcuts="Control+K Meta+K" className={cell}>
          <Terminal className="h-3.5 w-3.5" aria-hidden />
          <span aria-hidden>⌘K</span>
        </button>
      </div>
    </footer>
  )
}

export function WorkspaceLayout() {
  const { role, prof } = useApp()
  const { pathname } = useLocation()
  const timer = useInterviewTimer()

  const sections = SECTIONS.filter((s) => !s.interviewerOnly || role === 'interviewer')
  useSectionHotkeys(sections)

  if (!isProfessionEnabled(prof)) return <Navigate to="/" replace />
  if (role === 'candidate' && INTERVIEWER_ONLY.some((p) => pathname.startsWith(p))) {
    return <Navigate to="/solve" replace />
  }

  const section = sections.find((s) => pathname.startsWith(s.to))
  const item = section ? decodeURIComponent(pathname.slice(section.to.length + 1)) || undefined : undefined

  return (
    <div className="flex min-h-0 flex-1 print:block">
      {/* выход к профессиям сбрасывает глобальный таймер — как раньше кнопка «К профессиям» */}
      <Rail sections={sections} onHome={timer.reset} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PathBar section={section} item={item} />
        <main className="min-h-0 flex-1 overflow-hidden print:overflow-visible">
          <div className="h-full min-h-0">
            <Suspense fallback={<p className="py-12 text-center font-mono text-sm text-muted-foreground">загрузка…</p>}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        <StatusBar section={section} count={sections.length} />
      </div>
    </div>
  )
}
