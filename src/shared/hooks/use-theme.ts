import { useSyncExternalStore } from 'react'
import { KEYS, readString, writeString } from '@/shared/storage/storage'

export type Theme = 'dark' | 'light' | 'dracula' | 'monokai'

/** Порядок переключения по кругу и подписи. */
export const THEMES: { id: Theme; label: string }[] = [
  { id: 'dark', label: 'dark' },
  { id: 'dracula', label: 'dracula' },
  { id: 'monokai', label: 'monokai' },
  { id: 'light', label: 'light' },
]

const isTheme = (x: unknown): x is Theme => THEMES.some((t) => t.id === x)

function initialTheme(): Theme {
  const saved = readString(KEYS.theme)
  if (isTheme(saved)) return saved
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

// Тема — общее состояние: её меняют и шапка, и консоль, поэтому храним вне компонентов.
let current: Theme = initialTheme()
const listeners = new Set<() => void>()

function apply(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  // Dracula и Monokai — разновидности тёмной: класс .dark нужен dark:-вариантам Tailwind и редактору
  root.classList.toggle('dark', theme !== 'light')
  if (theme === 'dracula' || theme === 'monokai') root.dataset.theme = theme
  else delete root.dataset.theme
}
apply(current)

export function setTheme(theme: Theme) {
  if (theme === current) return
  current = theme
  apply(theme)
  writeString(KEYS.theme, theme)
  listeners.forEach((l) => l())
}

export function nextTheme(theme: Theme): Theme {
  const i = THEMES.findIndex((t) => t.id === theme)
  return THEMES[(i + 1) % THEMES.length].id
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => current)
  return { theme, setTheme, toggle: () => setTheme(nextTheme(current)) }
}
