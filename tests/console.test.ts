import { describe, expect, it, vi } from 'vitest'
import { applyCompletion, complete, run, type ConsoleEnv } from '@/features/command-console/model/commands'

function makeEnv(over: Partial<ConsoleEnv> = {}): ConsoleEnv {
  return {
    role: 'interviewer',
    setRole: vi.fn(),
    theme: 'dark',
    setTheme: vi.fn(),
    pathname: '/',
    navigate: vi.fn(),
    counts: { tasks: 38, questions: 159, quiz: 15, cases: 8 },
    timer: {
      display: '00:00:00',
      running: false,
      mode: 'up',
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      countdown: vi.fn(),
      stopwatch: vi.fn(),
    },
    ...over,
  }
}

describe('консоль: команды', () => {
  it('cd переходит по имени раздела и по алиасу', () => {
    const env = makeEnv()
    expect(run('cd теория', env).navigated).toBe(true)
    expect(env.navigate).toHaveBeenLastCalledWith('/theory')
    run('cd tasks', env)
    expect(env.navigate).toHaveBeenLastCalledWith('/solve')
    run('кейсы', env)
    expect(env.navigate).toHaveBeenLastCalledWith('/cases')
    run('cd ~', env)
    expect(env.navigate).toHaveBeenLastCalledWith('/')
  })

  it('кандидат не попадает в разделы интервьюера', () => {
    const env = makeEnv({ role: 'candidate' })
    const res = run('cd интервью', env)
    expect(env.navigate).not.toHaveBeenCalled()
    expect(res.lines[0].tone).toBe('error')
    expect(run('ls', env).lines.some((l) => l.text.startsWith('данные/'))).toBe(false)
  })

  it('ls показывает счётчики банка', () => {
    const lines = run('ls', makeEnv()).lines.map((l) => l.text)
    expect(lines.find((l) => l.startsWith('теория/'))).toContain('159')
    expect(run('ls', makeEnv({ counts: null })).lines[0].text).toContain('··')
  })

  it('timer: старт, пауза, обратный отсчёт и ошибка аргумента', () => {
    const env = makeEnv()
    run('timer start', env)
    expect(env.timer.start).toHaveBeenCalled()
    run('timer pause', env)
    expect(env.timer.pause).toHaveBeenCalled()
    run('timer 45', env)
    expect(env.timer.countdown).toHaveBeenCalledWith(45)
    expect(run('timer abc', env).lines[0].tone).toBe('error')
    expect(run('timer', env).lines[0].text).toContain('00:00:00')
  })

  it('role и theme меняют состояние', () => {
    const env = makeEnv()
    run('role кандидат', env)
    expect(env.setRole).toHaveBeenCalledWith('candidate')
    run('theme', env)
    expect(env.setTheme).toHaveBeenCalledWith('dracula')
    run('theme дракула', env)
    expect(env.setTheme).toHaveBeenLastCalledWith('dracula')
    run('theme monokai', env)
    expect(env.setTheme).toHaveBeenLastCalledWith('monokai')
    run('theme light', env)
    expect(env.setTheme).toHaveBeenLastCalledWith('light')
    expect(run('theme neon', env).lines[0].tone).toBe('error')
  })

  it('clear, exit и неизвестная команда', () => {
    const env = makeEnv()
    expect(run('clear', env).clear).toBe(true)
    expect(run('exit', env).close).toBe(true)
    expect(run('rm -rf /', env).lines[0].text).toContain('команда не найдена')
    expect(run('   ', env).lines).toEqual([])
  })
})

describe('консоль: дополнение', () => {
  it('дополняет команды и аргументы', () => {
    expect(complete('ti', 'interviewer')).toEqual(['timer'])
    expect(complete('cd те', 'interviewer')).toEqual(['теория'])
    expect(complete('cd ', 'candidate')).not.toContain('интервью')
    expect(complete('role к', 'interviewer')).toEqual(['кандидат'])
  })

  it('применяет единственный вариант или общий префикс', () => {
    expect(applyCompletion('ti', ['timer'])).toBe('timer ')
    expect(applyCompletion('cd к', ['кейсы', 'квиз'])).toBe('cd к')
    expect(applyCompletion('cd ', ['мок', 'мок-интервью'])).toBe('cd мок')
    expect(applyCompletion('x', [])).toBe('x')
  })
})
