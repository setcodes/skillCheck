import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { complete as completeInput, run, type BankCounts, type ConsoleEntry, type ConsoleEnv } from '@/features/command-console'
import { DEFAULT_PROFESSION } from '@/entities/profession/model/constants'
import { useTheme } from '@/shared/hooks/use-theme'
import { useApp } from './AppProvider'
import { useInterviewTimer } from './InterviewTimerProvider'

const MAX_ENTRIES = 300

interface ConsoleContextValue {
  entries: ConsoleEntry[]
  history: string[]
  submit: (text: string) => void
  complete: (text: string) => string[]
  counts: BankCounts | null
  loadCounts: () => void
  panelOpen: boolean
  open: () => void
  close: () => void
}

const ConsoleContext = createContext<ConsoleContextValue | null>(null)

const WELCOME: ConsoleEntry = { id: 0, kind: 'output', tone: 'muted', text: 'Введите help — список команд. Tab дополняет, ↑/↓ — история.' }

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || !!el.closest('.monaco-editor'))

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const { role, setRole, setProf } = useApp()
  const { theme, setTheme } = useTheme()
  const timer = useInterviewTimer()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [entries, setEntries] = useState<ConsoleEntry[]>([WELCOME])
  const [history, setHistory] = useState<string[]>([])
  const [counts, setCounts] = useState<BankCounts | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const nextId = useRef(1)
  const countsRequested = useRef(false)

  // Банк грузится отдельным чанком и только когда нужен.
  const loadCounts = useCallback(() => {
    if (countsRequested.current) return
    countsRequested.current = true
    import('@/shared/bank').then(({ getTasks, getQuestions, getQuiz, getCases }) =>
      setCounts({
        tasks: getTasks(DEFAULT_PROFESSION).length,
        questions: getQuestions(DEFAULT_PROFESSION).length,
        quiz: getQuiz(DEFAULT_PROFESSION).length,
        cases: getCases(DEFAULT_PROFESSION).length,
      })
    )
  }, [])

  const env: ConsoleEnv = {
    role,
    setRole,
    theme,
    setTheme,
    pathname,
    counts,
    navigate: (path) => {
      if (path !== '/') setProf(DEFAULT_PROFESSION)
      navigate(path)
    },
    timer: {
      display: timer.display,
      running: timer.running,
      mode: timer.mode,
      start: timer.start,
      pause: timer.pause,
      reset: timer.reset,
      countdown: (minutes) => {
        timer.setMode('down')
        timer.setLimitSec(minutes * 60)
        timer.start()
      },
      stopwatch: () => timer.setMode('up'),
    },
  }
  const envRef = useRef(env)
  envRef.current = env

  const submit = useCallback((text: string) => {
    const trimmed = text.trim()
    const result = run(trimmed, envRef.current)
    if (trimmed) setHistory((h) => (h[h.length - 1] === trimmed ? h : [...h, trimmed].slice(-50)))
    setEntries((prev) => {
      if (result.clear) return []
      const added: ConsoleEntry[] = [
        { id: nextId.current++, kind: 'input', text: trimmed },
        ...result.lines.map((l) => ({ id: nextId.current++, kind: 'output' as const, text: l.text, tone: l.tone })),
      ]
      return [...prev, ...added].slice(-MAX_ENTRIES)
    })
    if (result.close || result.navigated) setPanelOpen(false)
  }, [])

  const open = useCallback(() => setPanelOpen(true), [])
  const close = useCallback(() => setPanelOpen(false), [])

  useEffect(() => {
    if (panelOpen) loadCounts()
  }, [panelOpen, loadCounts])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const combo = (e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k'
      const backtick = e.key === '`' && !e.metaKey && !e.ctrlKey && !isEditable(e.target)
      if (!combo && !backtick) return
      e.preventDefault()
      if (panelOpen) setPanelOpen(false)
      else open()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen, open])

  const value = useMemo<ConsoleContextValue>(
    () => ({
      entries,
      history,
      submit,
      complete: (text) => completeInput(text, role),
      counts,
      loadCounts,
      panelOpen,
      open,
      close,
    }),
    [entries, history, submit, role, counts, loadCounts, panelOpen, open, close]
  )

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>
}

export function useConsole(): ConsoleContextValue {
  const ctx = useContext(ConsoleContext)
  if (!ctx) throw new Error('useConsole вне ConsoleProvider')
  return ctx
}
