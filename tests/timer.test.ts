import { describe, it, expect } from 'vitest'
import {
  initialTimer, startTimer, pauseTimer, resetTimer, valueSec, crossedThresholds, formatSeconds, setTimerMode,
} from '@/shared/lib/timer'

describe('timer', () => {
  it('прямой отсчёт считается от меток времени, а не тиков', () => {
    let s = startTimer(initialTimer('up'), 1000)
    expect(valueSec(s, 1000)).toBe(0)
    expect(valueSec(s, 61_500)).toBe(60)
    s = pauseTimer(s, 11_000)
    expect(valueSec(s, 99_000)).toBe(10) // на паузе не идёт
    s = startTimer(s, 100_000)
    expect(valueSec(s, 105_000)).toBe(15)
  })

  it('обратный отсчёт не уходит ниже нуля и не стартует с нуля', () => {
    let s = startTimer(initialTimer('down', 10), 0)
    expect(valueSec(s, 4_000)).toBe(6)
    expect(valueSec(s, 99_000)).toBe(0)
    s = pauseTimer(s, 99_000)
    expect(startTimer(s, 100_000).running).toBe(false)
    expect(valueSec(startTimer(resetTimer(s), 0), 0)).toBe(10)
  })

  it('смена режима сбрасывает таймер', () => {
    const s = startTimer(initialTimer('up'), 0)
    expect(setTimerMode(s, 'down')).toMatchObject({ mode: 'down', running: false, elapsedMs: 0 })
  })

  it('пороги срабатывают один раз при пересечении', () => {
    expect(crossedThresholds(100, 90, 100)).toEqual([])
    expect(crossedThresholds(51, 50, 100)).toEqual(['half'])
    expect(crossedThresholds(11, 10, 100)).toEqual(['tenPercent'])
    expect(crossedThresholds(1, 0, 100)).toEqual(['expired'])
    expect(crossedThresholds(50, 50, 100)).toEqual([])
    // большой скачок (фоновая вкладка) отдаёт все пересечённые пороги разом
    expect(crossedThresholds(80, 0, 100)).toEqual(['half', 'tenPercent', 'expired'])
  })

  it('форматирует секунды', () => {
    expect(formatSeconds(3661)).toBe('01:01:01')
    expect(formatSeconds(-5)).toBe('00:00:00')
  })
})
