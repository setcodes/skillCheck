import { useEffect, useState } from 'react'
import { KEYS, readString, writeString } from '@/shared/storage/storage'

export type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  const saved = readString(KEYS.theme)
  if (saved === 'light' || saved === 'dark') return saved
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    writeString(KEYS.theme, theme)
  }, [theme])
  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}
