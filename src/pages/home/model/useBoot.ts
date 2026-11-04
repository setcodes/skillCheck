import { useEffect, useRef, useState } from 'react'

const PLAYED_KEY = 'home.boot.v1'

function alreadyPlayed(): boolean {
  if (typeof window === 'undefined') return true
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true
  try {
    return sessionStorage.getItem(PLAYED_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Пошаговая «печать» главной: шаг i виден, когда stage >= i; durations[i] — пауза перед следующим.
 * Играется раз за сессию вкладки, сразу завершается при reduced-motion, любая клавиша или клик — пропуск.
 */
export function useBoot(durations: number[]) {
  const total = durations.length
  const [instant, setInstant] = useState(alreadyPlayed)
  const [stage, setStage] = useState(() => (instant ? total : 0))
  const durationsRef = useRef(durations)
  durationsRef.current = durations
  const done = stage >= total

  useEffect(() => {
    if (done) return
    const id = setTimeout(() => setStage((s) => s + 1), durationsRef.current[stage])
    return () => clearTimeout(id)
  }, [stage, done])

  useEffect(() => {
    if (done) {
      try {
        sessionStorage.setItem(PLAYED_KEY, '1')
      } catch {
        // приватный режим — анимация просто сыграет ещё раз
      }
      return
    }
    const skip = () => {
      setInstant(true)
      setStage(total)
    }
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [done, total])

  return { stage, done, instant }
}
