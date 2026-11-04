import type { UserRole } from '@/entities/user/model/types'
import { nextTheme, type Theme } from '@/shared/hooks/use-theme'

export type Tone = 'out' | 'muted' | 'ok' | 'error' | 'accent'

export interface OutputLine {
  text: string
  tone?: Tone
}

export interface BankCounts {
  tasks: number
  questions: number
  quiz: number
  cases: number
}

/** То, что консоль умеет делать с приложением. Реализацию даёт слой app. */
export interface ConsoleEnv {
  role: UserRole
  setRole: (role: UserRole) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  pathname: string
  navigate: (path: string) => void
  counts: BankCounts | null
  timer: {
    display: string
    running: boolean
    mode: 'up' | 'down'
    start: () => void
    pause: () => void
    reset: () => void
    countdown: (minutes: number) => void
    stopwatch: () => void
  }
}

export interface CommandResult {
  lines: OutputLine[]
  clear?: boolean
  close?: boolean
  navigated?: boolean
}

interface Section {
  path: string
  name: string
  aliases: string[]
  note: string
  count?: keyof BankCounts
  interviewerOnly?: boolean
}

export const SECTIONS: Section[] = [
  { path: '/solve', name: 'задачи', aliases: ['solve', 'tasks', 'практика'], note: 'песочница, видимые и скрытые проверки', count: 'tasks' },
  { path: '/theory', name: 'теория', aliases: ['theory', 'вопросы'], note: 'вопросы с эталонными ответами', count: 'questions' },
  { path: '/quiz', name: 'квиз', aliases: ['quiz', 'что-выведет-код', 'вывод'], note: '«Что выведет код?»', count: 'quiz' },
  { path: '/cases', name: 'кейсы', aliases: ['cases', 'ревью'], note: 'ревью чужого кода и live coding', count: 'cases' },
  { path: '/mock', name: 'мок', aliases: ['mock', 'мок-интервью'], note: 'таймер, баланс тем, отчёт' },
  { path: '/interview', name: 'интервью', aliases: ['interview', 'режим-интервью'], note: 'оценки, рубрики, отчёт', interviewerOnly: true },
  { path: '/data', name: 'данные', aliases: ['data', 'импорт', 'экспорт'], note: 'импорт и экспорт банка', interviewerOnly: true },
]

const HOME_ALIASES = ['~', '/', 'home', 'главная']

const ROLE_ALIASES: Record<string, UserRole> = {
  интервьюер: 'interviewer',
  interviewer: 'interviewer',
  кандидат: 'candidate',
  candidate: 'candidate',
}
const ROLE_TITLE: Record<UserRole, string> = { interviewer: 'интервьюер', candidate: 'кандидат' }

const THEME_ALIASES: Record<string, Theme> = {
  dark: 'dark',
  тёмная: 'dark',
  темная: 'dark',
  графит: 'dark',
  graphite: 'dark',
  light: 'light',
  светлая: 'light',
  dracula: 'dracula',
  дракула: 'dracula',
  monokai: 'monokai',
  монокай: 'monokai',
}

const HELP: [string, string][] = [
  ['help', 'список команд'],
  ['ls', 'разделы и размер банка'],
  ['cd <раздел>', 'перейти в раздел: задачи, теория, квиз, кейсы, мок…'],
  ['cd ~', 'на главную'],
  ['timer [start|pause|reset]', 'глобальный таймер интервью'],
  ['timer <минуты>', 'обратный отсчёт, например timer 45'],
  ['role [кандидат|интервьюер]', 'показать или сменить роль'],
  ['theme [dark|dracula|monokai|light]', 'сменить тему'],
  ['clear', 'очистить экран'],
  ['exit', 'закрыть консоль'],
]

const COMMANDS = ['help', 'ls', 'cd', 'timer', 'role', 'theme', 'whoami', 'pwd', 'clear', 'exit']

const TIMER_ARGS = ['start', 'pause', 'reset', 'up']

const out = (text: string, tone: Tone = 'out'): OutputLine => ({ text, tone })

export function findSection(arg: string): Section | undefined {
  const key = arg.toLowerCase().replace(/\/$/, '')
  return SECTIONS.find((s) => s.name === key || s.aliases.includes(key))
}

function visibleSections(role: UserRole) {
  return SECTIONS.filter((s) => !s.interviewerOnly || role === 'interviewer')
}

function cd(arg: string | undefined, env: ConsoleEnv): CommandResult {
  if (!arg || HOME_ALIASES.includes(arg)) {
    env.navigate('/')
    return { lines: [out('→ главная', 'muted')], navigated: true }
  }
  const section = findSection(arg)
  if (!section) return { lines: [out(`cd: нет такого раздела: ${arg}. Список — ls`, 'error')] }
  if (section.interviewerOnly && env.role !== 'interviewer') {
    return { lines: [out(`cd: «${section.name}» доступен только интервьюеру — role интервьюер`, 'error')] }
  }
  env.navigate(section.path)
  return { lines: [out(`→ ${section.name}`, 'muted')], navigated: true }
}

function ls(env: ConsoleEnv): CommandResult {
  const sections = visibleSections(env.role)
  const width = Math.max(...sections.map((s) => s.name.length)) + 2
  return {
    lines: sections.map((s) => {
      const count = s.count ? (env.counts ? String(env.counts[s.count]) : '··') : ''
      return out(`${(s.name + '/').padEnd(width)}${count.padStart(4)}  ${s.note}`, 'accent')
    }),
  }
}

function timer(arg: string | undefined, env: ConsoleEnv): CommandResult {
  const t = env.timer
  const status = () => out(`таймер ${t.display} · ${t.running ? 'идёт' : 'на паузе'} · ${t.mode === 'down' ? 'обратный отсчёт' : 'секундомер'}`)
  if (!arg) return { lines: [status()] }
  if (arg === 'start') {
    t.start()
    return { lines: [out('таймер запущен', 'ok')] }
  }
  if (arg === 'pause' || arg === 'stop') {
    t.pause()
    return { lines: [out('таймер на паузе', 'ok')] }
  }
  if (arg === 'reset') {
    t.reset()
    return { lines: [out('таймер сброшен', 'ok')] }
  }
  if (arg === 'up') {
    t.stopwatch()
    return { lines: [out('режим секундомера', 'ok')] }
  }
  const minutes = Number(arg.replace(/m$|мин$/, ''))
  if (Number.isInteger(minutes) && minutes > 0 && minutes <= 600) {
    t.countdown(minutes)
    return { lines: [out(`обратный отсчёт ${minutes} мин запущен`, 'ok')] }
  }
  return { lines: [out(`timer: непонятный аргумент «${arg}». Пример: timer 45`, 'error')] }
}

function role(arg: string | undefined, env: ConsoleEnv): CommandResult {
  if (!arg) return { lines: [out(`роль: ${ROLE_TITLE[env.role]}`)] }
  const next = ROLE_ALIASES[arg.toLowerCase()]
  if (!next) return { lines: [out('role: укажите кандидат или интервьюер', 'error')] }
  env.setRole(next)
  return { lines: [out(`роль: ${ROLE_TITLE[next]}`, 'ok')] }
}

function theme(arg: string | undefined, env: ConsoleEnv): CommandResult {
  const next = arg ? THEME_ALIASES[arg.toLowerCase()] : nextTheme(env.theme)
  if (!next) return { lines: [out('theme: укажите dark, dracula, monokai или light', 'error')] }
  env.setTheme(next)
  return { lines: [out(`тема: ${next}`, 'ok')] }
}

export function parse(input: string): { cmd: string; args: string[] } {
  const [cmd = '', ...args] = input.trim().split(/\s+/)
  return { cmd: cmd.toLowerCase(), args }
}

export function run(input: string, env: ConsoleEnv): CommandResult {
  const { cmd, args } = parse(input)
  if (!cmd) return { lines: [] }
  switch (cmd) {
    case 'help':
    case 'помощь':
    case '?': {
      const width = Math.max(...HELP.map(([c]) => c.length)) + 2
      return { lines: HELP.map(([c, d]) => out(`${c.padEnd(width)}${d}`)) }
    }
    case 'ls':
      return ls(env)
    case 'cd':
    case 'open':
      return cd(args[0], env)
    case 'timer':
    case 'таймер':
      return timer(args[0], env)
    case 'role':
    case 'роль':
      return role(args[0], env)
    case 'whoami':
      return role(undefined, env)
    case 'theme':
    case 'тема':
      return theme(args[0], env)
    case 'pwd':
      return { lines: [out(env.pathname)] }
    case 'clear':
      return { lines: [], clear: true }
    case 'exit':
    case 'close':
      return { lines: [], close: true }
    default:
      // имя раздела без cd — тоже переход
      if (findSection(cmd) || HOME_ALIASES.includes(cmd)) return cd(cmd, env)
      return { lines: [out(`команда не найдена: ${cmd}. Введите help`, 'error')] }
  }
}

/** Варианты дополнения для последнего слова ввода. */
export function complete(input: string, role: UserRole): string[] {
  const parts = input.replace(/^\s+/, '').split(/\s+/)
  if (parts.length <= 1) {
    const prefix = (parts[0] ?? '').toLowerCase()
    return COMMANDS.filter((c) => c.startsWith(prefix))
  }
  const [cmd, prefix = ''] = [parts[0].toLowerCase(), parts[parts.length - 1].toLowerCase()]
  const pool =
    cmd === 'cd' || cmd === 'open'
      ? [...visibleSections(role).map((s) => s.name), '~']
      : cmd === 'role'
        ? ['кандидат', 'интервьюер']
        : cmd === 'theme'
          ? ['dark', 'dracula', 'monokai', 'light']
          : cmd === 'timer'
            ? TIMER_ARGS
            : []
  return pool.filter((v) => v.startsWith(prefix))
}

/** Применяет единственный вариант дополнения (или общий префикс нескольких). */
export function applyCompletion(input: string, options: string[]): string {
  if (options.length === 0) return input
  const head = input.replace(/\S*$/, '')
  if (options.length === 1) return `${head}${options[0]} `
  let common = options[0]
  for (const o of options) while (!o.startsWith(common)) common = common.slice(0, -1)
  const last = input.match(/\S*$/)?.[0] ?? ''
  return common.length > last.length ? head + common : input
}
