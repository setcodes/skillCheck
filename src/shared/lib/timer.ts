// Чистая логика таймера: время считается от меток Date.now(), а не счётом тиков,
// поэтому таймер не дрейфует и не замирает в фоновой вкладке.

export type TimerMode = 'up' | 'down'
export type TimerEvent = 'half' | 'tenPercent' | 'expired'

export interface TimerState {
  mode: TimerMode
  limitSec: number
  running: boolean
  /** накоплено до последнего старта */
  elapsedMs: number
  /** метка последнего старта, null на паузе */
  startedAt: number | null
}

export const initialTimer = (mode: TimerMode = 'up', limitSec = 900): TimerState => ({
  mode,
  limitSec,
  running: false,
  elapsedMs: 0,
  startedAt: null,
})

export function elapsedMs(s: TimerState, now: number): number {
  const live = s.running && s.startedAt != null ? Math.max(0, now - s.startedAt) : 0
  return s.elapsedMs + live
}

export function valueSec(s: TimerState, now: number): number {
  const sec = Math.floor(elapsedMs(s, now) / 1000)
  return s.mode === 'up' ? sec : Math.max(0, s.limitSec - sec)
}

export const startTimer = (s: TimerState, now: number): TimerState =>
  s.running || (s.mode === 'down' && valueSec(s, now) === 0) ? s : { ...s, running: true, startedAt: now }

export const pauseTimer = (s: TimerState, now: number): TimerState =>
  s.running ? { ...s, running: false, elapsedMs: elapsedMs(s, now), startedAt: null } : s

export const resetTimer = (s: TimerState): TimerState => ({
  ...s,
  running: false,
  elapsedMs: 0,
  startedAt: null,
})

export const setTimerMode = (s: TimerState, mode: TimerMode): TimerState =>
  resetTimer({ ...s, mode })

export const setTimerLimit = (s: TimerState, limitSec: number): TimerState => ({
  ...s,
  limitSec: Math.max(1, Math.floor(limitSec)),
})

/** События, пересечённые при переходе prev → next (оставшееся время, обратный отсчёт). */
export function crossedThresholds(prevRemaining: number, remaining: number, limitSec: number): TimerEvent[] {
  if (limitSec <= 0 || remaining >= prevRemaining) return []
  const half = Math.floor(limitSec / 2)
  const ten = Math.ceil(limitSec * 0.1)
  const events: TimerEvent[] = []
  if (prevRemaining > half && remaining <= half) events.push('half')
  if (prevRemaining > ten && remaining <= ten) events.push('tenPercent')
  if (prevRemaining > 0 && remaining === 0) events.push('expired')
  return events
}

export function formatSeconds(total: number): string {
  const t = Math.max(0, Math.floor(total))
  const h = String(Math.floor(t / 3600)).padStart(2, '0')
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, '0')
  const s = String(t % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}
