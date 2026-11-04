import { useSyncExternalStore } from 'react'

/** Совпадает ли медиазапрос сейчас; перерисовывает при изменении (поворот, ресайз окна). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}
