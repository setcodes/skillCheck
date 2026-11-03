import { useCallback, useEffect, useRef, useState } from 'react'
import {
  crossedThresholds,
  formatSeconds,
  initialTimer,
  pauseTimer,
  resetTimer,
  setTimerLimit,
  setTimerMode,
  startTimer,
  valueSec,
  type TimerEvent,
  type TimerMode,
  type TimerState,
} from '@/shared/lib/timer'
import { readJSON, writeJSON } from '@/shared/storage/storage'

interface Options {
  storageKey: string
  defaults?: { mode?: TimerMode; limitSec?: number }
  /** остановить таймер, когда компонент размонтируется или ключ сменился */
  pauseOnLeave?: boolean
  onEvent?: (event: TimerEvent, remainingSec: number) => void
}

const isState = (x: unknown): x is TimerState =>
  !!x && typeof x === 'object' && 'mode' in x && 'limitSec' in x && 'elapsedMs' in x

export function useTimer({ storageKey, defaults, pauseOnLeave = false, onEvent }: Options) {
  const load = useCallback((): TimerState => {
    const stored = readJSON<unknown>(storageKey, null)
    const base = initialTimer(defaults?.mode ?? 'up', defaults?.limitSec ?? 900)
    return isState(stored) ? stored : base
  }, [storageKey, defaults?.mode, defaults?.limitSec])

  const [state, setState] = useState<TimerState>(load)
  const [now, setNow] = useState(() => Date.now())
  const loadedKey = useRef(storageKey)

  // смена ключа (другая задача) — загружаем её таймер
  useEffect(() => {
    if (loadedKey.current === storageKey) return
    loadedKey.current = storageKey
    setState(load())
  }, [storageKey, load])

  useEffect(() => {
    if (loadedKey.current === storageKey) writeJSON(storageKey, state)
  }, [storageKey, state])

  useEffect(() => {
    if (!state.running) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [state.running])

  const value = valueSec(state, state.running ? now : Date.now())

  // события порогов и остановка по истечении
  const prev = useRef(value)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent
  useEffect(() => {
    if (state.mode === 'down' && state.running) {
      for (const e of crossedThresholds(prev.current, value, state.limitSec)) onEventRef.current?.(e, value)
      if (value === 0) setState((s) => pauseTimer(s, Date.now()))
    }
    prev.current = value
  }, [value, state.mode, state.running, state.limitSec])

  useEffect(() => {
    if (!pauseOnLeave) return
    return () => setState((s) => pauseTimer(s, Date.now()))
  }, [pauseOnLeave, storageKey])

  return {
    valueSec: value,
    display: formatSeconds(value),
    mode: state.mode,
    limitSec: state.limitSec,
    running: state.running,
    start: () => setState((s) => startTimer(s, Date.now())),
    pause: () => setState((s) => pauseTimer(s, Date.now())),
    toggle: () => setState((s) => (s.running ? pauseTimer(s, Date.now()) : startTimer(s, Date.now()))),
    reset: () => setState((s) => resetTimer(s)),
    setMode: (m: TimerMode) => setState((s) => setTimerMode(s, m)),
    setLimitSec: (sec: number) => setState((s) => setTimerLimit(s, sec)),
  }
}
