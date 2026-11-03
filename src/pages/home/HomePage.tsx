import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import { DEFAULT_PROFESSION, PROFESSIONS, isProfessionEnabled } from '@/entities/profession/model/constants'
import type { Profession } from '@/entities/profession/model/types'
import { useApp } from '@/app/providers/AppProvider'
import { useConsole } from '@/app/providers/ConsoleProvider'
import { useBoot } from './model/useBoot'

type BankModule = typeof import('@/shared/bank')
type CountKey = 'tasks' | 'questions' | 'quiz' | 'cases'

const SECTIONS: { to: string; name: string; count: CountKey | null; tone: string; note: string; interviewerOnly?: boolean }[] = [
  { to: '/solve', name: 'задачи', count: 'tasks', tone: 'text-ansi-yellow', note: 'песочница, видимые и скрытые проверки' },
  { to: '/theory', name: 'теория', count: 'questions', tone: 'text-ansi-blue', note: 'вопросы с эталонными ответами' },
  { to: '/quiz', name: 'что-выведет-код', count: 'quiz', tone: 'text-ansi-cyan', note: 'предскажите вывод фрагмента' },
  { to: '/cases', name: 'кейсы', count: 'cases', tone: 'text-ansi-magenta', note: 'ревью чужого кода и live coding' },
  { to: '/mock', name: 'мок-интервью', count: null, tone: 'text-primary-text', note: 'таймер, баланс тем, отчёт' },
  { to: '/interview', name: 'режим-интервью', count: null, tone: 'text-ansi-red', note: 'оценки, рубрики, отчёт', interviewerOnly: true },
]

const ROLE_NOTE = {
  interviewer: 'эталоны, чек-листы и рубрики видны, можно ставить оценки',
  candidate: 'эталонные ответы скрыты, подсказки открываются по одной',
} as const

const CMD_HELP = 'skillcheck --help'
const CMD_START = 'skillcheck start'
const CMD_WHOAMI = 'whoami'

// скорость «набора» команды
const CHAR_MS = 22
const typeMs = (text: string) => text.length * CHAR_MS + 160
const PRINT_MS = 55

/** Банк грузится отдельным чанком, чтобы не утяжелять первый экран. */
function useBank(): BankModule | null {
  const [bank, setBank] = useState<BankModule | null>(null)
  useEffect(() => {
    let alive = true
    import('@/shared/bank').then((m) => alive && setBank(m))
    return () => {
      alive = false
    }
  }, [])
  return bank
}

function countsFor(bank: BankModule, prof: Profession): Record<CountKey, number> {
  return {
    tasks: bank.getTasks(prof).length,
    questions: bank.getQuestions(prof).length,
    quiz: bank.getQuiz(prof).length,
    cases: bank.getCases(prof).length,
  }
}

interface CommandProps {
  text: string
  shown: boolean
  /** команда сейчас набирается — анимация и курсор */
  typing: boolean
  animate: boolean
}

function Command({ text, shown, typing, animate }: CommandProps) {
  return (
    <p className={cn('flex items-center gap-2 text-sm text-muted-foreground', !shown && 'invisible')}>
      <span className="text-primary-text" aria-hidden>$</span>
      <span
        className={cn('whitespace-nowrap', animate && shown && 'inline-block overflow-hidden align-bottom motion-safe:animate-typing')}
        style={{ '--chars': text.length, '--type-ms': `${text.length * CHAR_MS}ms` } as CSSProperties}
      >
        {text}
      </span>
      {typing && <span className="h-[1.1em] w-[0.6em] bg-primary" aria-hidden />}
    </p>
  )
}

type Zone = 'professions' | 'sections'

/** Полоса подсказок в духе nano: клавиша-«инверсия» и действие; неактуальные для текущей колонки приглушены. */
function KeyBar({ zone, canEnter, className }: { zone: Zone; canEnter: boolean; className?: string }) {
  const keys: { key: string; label: string; on: boolean }[] = [
    { key: '↑↓', label: 'выбор', on: true },
    { key: '→', label: 'разделы', on: zone === 'professions' && canEnter },
    { key: '←', label: 'профессии', on: zone === 'sections' },
    { key: '⏎', label: zone === 'sections' ? 'открыть' : 'начать', on: canEnter || zone === 'sections' },
    { key: '⌘K', label: 'консоль', on: true },
  ]
  return (
    <div
      className={cn('hidden shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-t bg-surface px-5 py-2.5 text-xs sm:flex sm:px-8', className)}
      aria-hidden
    >
      {keys.map(({ key, label, on }) => (
        <span key={key} className={cn('flex items-center gap-2 transition-opacity duration-150', !on && 'opacity-35')}>
          <kbd className="min-w-[1.75rem] rounded-[3px] bg-foreground px-1.5 py-0.5 text-center font-mono font-bold leading-none text-background">
            {key}
          </kbd>
          <span className="text-muted-foreground">{label}</span>
        </span>
      ))}
    </div>
  )
}

/** Перемещение фокуса стрелками внутри списка: возвращает индекс следующего элемента. */
function step(current: number, length: number, key: string): number | null {
  if (key === 'ArrowDown') return (current + 1) % length
  if (key === 'ArrowUp') return (current - 1 + length) % length
  return null
}

export default function HomePage() {
  const { role, prof, setProf } = useApp()
  const { open: openConsole } = useConsole()
  const navigate = useNavigate()
  const bank = useBank()
  const [active, setActive] = useState<Profession>(isProfessionEnabled(prof) ? prof : DEFAULT_PROFESSION)
  const [zone, setZone] = useState<Zone>('professions')
  const profsRef = useRef<HTMLUListElement>(null)
  const sectionsRef = useRef<HTMLUListElement>(null)

  const info = PROFESSIONS.find((p) => p.id === active) ?? PROFESSIONS[0]
  const enabled = isProfessionEnabled(active)
  const counts = bank && enabled ? countsFor(bank, active) : null
  const sections = SECTIONS.filter((s) => !s.interviewerOnly || role === 'interviewer')
  const lsCommand = `skillcheck ls ./${info.id}`

  // Сценарий «печати»: каждый шаг — набор команды или строка вывода
  const beats: number[] = []
  const beat = (ms: number) => beats.push(ms) - 1
  const bHelp = beat(typeMs(CMD_HELP))
  const bTitle = beat(PRINT_MS * 2)
  const bLead = beat(PRINT_MS * 3)
  const bStart = beat(typeMs(CMD_START))
  const bAsk = beat(PRINT_MS * 2)
  const bProfs = PROFESSIONS.map(() => beat(PRINT_MS))
  const bLs = beat(typeMs(lsCommand))
  const bRows = sections.map(() => beat(PRINT_MS))
  const bWho = beat(typeMs(CMD_WHOAMI))
  const bWhoOut = beat(PRINT_MS * 3)
  const bKeys = beat(PRINT_MS * 2)
  const bPrompt = beat(0)
  const { stage, done, instant } = useBoot(beats)

  const shown = (i: number) => stage >= i
  const hide = (i: number) => (shown(i) ? '' : 'invisible')
  const cmd = (i: number, text: string) => (
    <Command text={text} shown={shown(i)} typing={!done && stage === i} animate={!instant} />
  )

  // после «загрузки» — фокус на меню, как в CLI (если пользователь ещё никуда не ушёл)
  useEffect(() => {
    if (!done || document.activeElement !== document.body) return
    const i = PROFESSIONS.findIndex((p) => p.id === active)
    profsRef.current?.querySelectorAll('button')[i]?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const start = (id: Profession) => {
    if (!isProfessionEnabled(id)) return
    setProf(id)
    navigate('/solve')
  }

  const focusProfession = (index: number) => profsRef.current?.querySelectorAll('button')[index]?.focus()
  const focusSection = (index: number) => sectionsRef.current?.querySelectorAll('a')[index]?.focus()

  // ↑/↓ — по профессиям (недоступные тоже можно «посмотреть»), → — в разделы
  const onProfessionKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = step(index, PROFESSIONS.length, e.key)
    if (next !== null) {
      e.preventDefault()
      setActive(PROFESSIONS[next].id)
      focusProfession(next)
    } else if (e.key === 'ArrowRight' && isProfessionEnabled(PROFESSIONS[index].id)) {
      e.preventDefault()
      focusSection(0)
    }
  }

  // ↑/↓ — по разделам, ← — назад к профессиям, Enter — открыть
  const onSectionKey = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const next = step(index, sections.length, e.key)
    if (next !== null) {
      e.preventDefault()
      focusSection(next)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusProfession(PROFESSIONS.findIndex((p) => p.id === active))
    }
  }

  return (
    <div className="container mx-auto flex min-h-0 flex-1 px-4 py-4 font-mono md:py-6">
      <section
        aria-busy={!done}
        className="flex min-h-0 w-full flex-col overflow-hidden rounded-lg border bg-card p-0 shadow-[0_24px_60px_-32px_rgb(0_0_0/0.45)]"
      >
        <div className="flex h-10 shrink-0 items-center justify-between gap-4 border-b bg-surface px-4 text-xs text-muted-foreground">
          <span>~/skillcheck — zsh</span>
          <span className="hidden sm:inline">{done ? `${info.title.toLowerCase()} · ru` : 'загрузка…'}</span>
        </div>

        <div className="grid min-h-0 flex-1 content-start gap-10 overflow-y-auto p-5 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:content-center lg:gap-12 lg:p-10">
          <div className="min-w-0 space-y-8">
            <div className="space-y-4">
              {cmd(bHelp, CMD_HELP)}
              <p
                className={cn(
                  'text-balance font-display text-[1.75rem] font-bold leading-[1.25] tracking-[-0.03em] text-foreground sm:text-4xl xl:text-[2.75rem]',
                  hide(bTitle)
                )}
              >
                Тренажёр технических собеседований
              </p>
              <p className={cn('max-w-[56ch] text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]', hide(bLead))}>
                SkillCheck объединяет теорию, практику и оценку в едином инструменте для эффективной подготовки к собеседованиям
              </p>
            </div>

            <div className="space-y-3">
              {cmd(bStart, CMD_START)}
              <h1 className={cn('flex gap-2 text-base font-bold text-foreground', hide(bAsk))}>
                <span className="text-primary-text" aria-hidden>?</span>
                Выберите профессию
              </h1>
              <ul ref={profsRef} className="space-y-1">
                {PROFESSIONS.map((p, i) => {
                  const soon = p.status === 'soon'
                  const isActive = p.id === active
                  return (
                    <li key={p.id} className={hide(bProfs[i])}>
                      <button
                        type="button"
                        aria-disabled={soon || undefined}
                        onClick={() => start(p.id)}
                        onMouseEnter={() => setActive(p.id)}
                        onFocus={() => {
                          setActive(p.id)
                          setZone('professions')
                        }}
                        onKeyDown={(e) => onProfessionKey(e, i)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm transition-colors duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          soon ? 'cursor-not-allowed text-muted-foreground' : 'text-foreground',
                          isActive && (soon ? 'bg-accent' : 'bg-primary/15')
                        )}
                      >
                        <span className={cn('w-3 shrink-0', isActive ? 'text-primary-text' : 'invisible')} aria-hidden>
                          ❯
                        </span>
                        <span className={cn('w-24 shrink-0 font-bold sm:w-28', !soon && 'text-primary-text')}>{p.title}</span>
                        <span className={cn('min-w-0 flex-1 truncate', soon && 'max-sm:invisible')}>
                          {soon ? 'В разработке' : p.subtitle}
                        </span>
                        {soon ? (
                          <span className="shrink-0 rounded-sm border px-1.5 text-xs">Скоро</span>
                        ) : (
                          <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline" aria-hidden>
                            → разделы
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <div className="min-w-0 space-y-3 lg:border-l lg:pl-12">
            {cmd(bLs, lsCommand)}
            {enabled ? (
              <ul ref={sectionsRef} className="divide-y text-sm" aria-label={`Разделы: ${info.title}`}>
                {sections.map(({ to, name, count, tone, note }, i) => (
                  <li key={to} className={hide(bRows[i])}>
                    <Link
                      to={to}
                      onClick={() => setProf(active)}
                      onKeyDown={(e) => onSectionKey(e, i)}
                      onFocus={() => setZone('sections')}
                      className="group relative grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 rounded-sm py-2 pl-6 pr-2 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span
                        className="invisible absolute left-2 top-2 text-primary-text group-hover:visible group-focus-visible:visible"
                        aria-hidden
                      >
                        ❯
                      </span>
                      <span className={cn('font-bold', tone)}>{name}/</span>
                      <span className="text-right tabular-nums text-foreground">{count ? (counts?.[count] ?? '··') : ''}</span>
                      <span className="col-span-2 text-xs text-muted-foreground">{note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-2 px-2 text-sm" aria-live="polite">
                <p className="text-ansi-red">ls: ./{info.id}: банк в разработке</p>
                <p className="text-muted-foreground">
                  {info.title} · {info.subtitle}. Пока задачи, теория и мок-интервью есть только для Frontend.
                </p>
              </div>
            )}

            <div className="space-y-1 pt-5">
              {cmd(bWho, CMD_WHOAMI)}
              <p className={cn('px-2 text-sm', hide(bWhoOut))}>
                <span className="font-bold text-foreground">{role === 'interviewer' ? 'интервьюер' : 'кандидат'}</span>
                <span className="text-muted-foreground"> — {ROLE_NOTE[role]}</span>
              </p>
            </div>
          </div>
        </div>

        <KeyBar zone={zone} canEnter={enabled} className={hide(bKeys)} />

        <button
          type="button"
          onClick={openConsole}
          className={cn(
            'group flex w-full shrink-0 items-center gap-2 border-t px-5 py-3 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-8',
            hide(bPrompt)
          )}
        >
          <span className="text-primary-text" aria-hidden>$</span>
          <span className="h-[1.1em] w-[0.6em] bg-primary motion-safe:animate-blink" aria-hidden />
          <span className="ml-2 text-muted-foreground group-hover:text-foreground">
            Открыть консоль
            <span className="hidden sm:inline"> — навигация, таймер и роль командами на любой странице</span>
          </span>
        </button>
      </section>
    </div>
  )
}
