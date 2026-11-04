import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/app/providers/AppProvider'
import { advanceSession, clearSession, createSession, mapTaskScore, resetClock, restoreSession, saveSession, toggleRunning } from '@/shared/api/mock'
import { getQuestions, getTasks } from '@/shared/bank'
import { runTaskChecks } from '@/shared/api/runner'
import { useToast } from '@/shared/hooks/use-sonner'
import { crossedThresholds, formatSeconds } from '@/shared/lib/timer'
import { answerText } from '@/entities/question/model/answer'
import { detectLanguage } from '@/entities/task/model/language'
import type { Profession } from '@/entities/profession/model/types'
import type { MockItem, MockSessionState, MockTaskItem } from '@/entities/mock/model/types'
import { MockItems } from './ui/MockItems'
import { MockReport } from './ui/MockReport'
import { MockSession } from './ui/MockSession'
import { MockSetup, type MockSetupValues } from './ui/MockSetup'

// данные кандидата переживают перезагрузку — их вводят один раз
const CANDIDATE_KEYS = {
  candName: 'mock.candidateName',
  candDept: 'mock.candidateDept',
  candPos: 'mock.candidatePosition',
} as const

function readLocal(key: string): string {
  try {
    return localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function writeLocal(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // приватный режим — просто не запоминаем
  }
}

export default function MockPage() {
  const { prof } = useApp()
  const { toast } = useToast()
  const [s, setS] = useState<MockSessionState | null>(() => restoreSession())
  const [setup, setSetup] = useState<MockSetupValues>(() => ({
    theoryCount: 12,
    taskCount: 8,
    durationMin: 90,
    allowPause: true,
    level: 'junior',
    weightTasks: 0.6,
    candName: readLocal(CANDIDATE_KEYS.candName),
    candDept: readLocal(CANDIDATE_KEYS.candDept),
    candPos: readLocal(CANDIDATE_KEYS.candPos),
    showExtra: readLocal('mock.showExtraProps') === '1',
  }))
  const [logs, setLogs] = useState<string[]>([])
  const [running, setRunning] = useState(false)

  useEffect(() => {
    writeLocal(CANDIDATE_KEYS.candName, setup.candName)
    writeLocal(CANDIDATE_KEYS.candDept, setup.candDept)
    writeLocal(CANDIDATE_KEYS.candPos, setup.candPos)
    writeLocal('mock.showExtraProps', setup.showExtra ? '1' : '0')
  }, [setup.candName, setup.candDept, setup.candPos, setup.showExtra])

  // Таймер: время берётся из Date.now(), поэтому дрейфа и «замирания» нет
  useEffect(() => {
    if (s) saveSession(s)
  }, [s])
  useEffect(() => {
    if (!s?.running || s.finished) return
    const id = setInterval(() => setS((prev) => (prev ? advanceSession(prev, Date.now()) : prev)), 250)
    return () => clearInterval(id)
  }, [s?.running, s?.finished, s?.id])

  // Пороги времени (половина / 10% / истекло) — общая логика с остальными таймерами
  const prevRemaining = useRef<number>(s?.remainingSec ?? 0)
  useEffect(() => {
    if (!s || s.finished) {
      prevRemaining.current = s?.remainingSec ?? 0
      return
    }
    if (s.running) {
      for (const e of crossedThresholds(prevRemaining.current, s.remainingSec, s.config.durationSec)) {
        if (e === 'half') toast.info('Половина времени Mock‑сессии', formatSeconds(s.remainingSec))
        if (e === 'tenPercent') toast.warning('Меньше 10% времени', formatSeconds(s.remainingSec))
        if (e === 'expired') toast.error('Время истекло', 'Сессия завершена')
      }
    }
    prevRemaining.current = s.remainingSec
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s?.remainingSec, s?.running])

  const profession = (s?.config.profession ?? prof) as Profession
  const questions = useMemo(() => new Map(getQuestions(profession).map((q) => [q.id, q])), [profession])
  const tasks = useMemo(() => new Map(getTasks(profession).map((t) => [t.id, t])), [profession])

  const patchItem = (id: string, patch: Partial<MockItem>) =>
    setS((prev) => (prev ? { ...prev, items: prev.items.map((it) => (it.id === id ? ({ ...it, ...patch } as MockItem) : it)) } : prev))

  const start = () =>
    setS(
      createSession(prof, {
        theoryCount: setup.theoryCount,
        taskCount: setup.taskCount,
        durationSec: setup.durationMin * 60,
        allowPause: setup.allowPause,
        level: setup.level,
        weightTasks: setup.weightTasks,
        candidateName: setup.candName,
        candidateDept: setup.candDept,
        candidatePosition: setup.candPos,
      })
    )

  const reset = () => {
    clearSession()
    setS(null)
    setLogs([])
  }

  const runTests = async () => {
    if (!s || s.finished || running) return
    const item = s.items[s.currentIndex]
    if (item.type !== 'task') return
    const t = item as MockTaskItem
    const task = tasks.get(t.taskId)
    if (!task) return
    setRunning(true)
    try {
      const out = await runTaskChecks(task, t.code ?? t.starter)
      const passed = out.results.filter((r) => r.ok).length
      const total = out.results.length
      patchItem(t.id, { testPassedRatio: total ? passed / total : 0, autoScore: mapTaskScore(passed, total), passedCount: passed, totalCount: total })
      setLogs(out.logs)
      if (total > 0 && passed === total) toast.success('Все тесты пройдены', `Пройдено ${passed}/${total}`)
      else toast.error('Тесты не пройдены', `Пройдено ${passed}/${total}. ${out.results.find((r) => !r.ok)?.message ?? ''}`)
    } finally {
      setRunning(false)
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Решение скопировано', 'Эталонное решение скопировано в буфер обмена')
    } catch {
      toast.error('Не удалось скопировать', 'Выделите решение и скопируйте вручную')
    }
  }

  if (!s) return <MockSetup values={setup} onChange={(p) => setSetup((v) => ({ ...v, ...p }))} onStart={start} />

  const review = s.finished
  const cur = s.items[s.currentIndex]
  const curTask = cur?.type === 'task' ? tasks.get((cur as MockTaskItem).taskId) : undefined
  const language = curTask ? detectLanguage(curTask) : 'javascript'

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden print:block print:overflow-visible">
      <MockItems
        items={s.items}
        currentIndex={s.currentIndex}
        review={review}
        className="max-lg:w-full max-lg:border-b max-lg:border-r-0 max-lg:max-h-64 print:hidden"
        onSelect={(i) => {
          if (review) document.getElementById(`mock-item-${i}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
          else {
            setS((prev) => (prev ? { ...prev, currentIndex: i } : prev))
            setLogs([])
          }
        }}
      />
      {review ? (
        <MockReport
          s={s}
          answerOf={(id) => {
            const q = questions.get(id)
            return q ? answerText(q) : undefined
          }}
          solutionOf={(id) => tasks.get(id)?.solution}
          onSelfScore={(id, selfScore) => patchItem(id, { selfScore })}
          onCopy={copy}
          onReset={reset}
        />
      ) : (
        <MockSession
          s={s}
          language={language}
          logs={logs}
          running={running}
          onIndex={(i) => {
            setS((prev) => (prev ? { ...prev, currentIndex: i } : prev))
            setLogs([])
          }}
          onAnswer={(id, answerDraft) => patchItem(id, { answerDraft })}
          onCode={(id, code) => patchItem(id, { code })}
          onRun={runTests}
          onToggleTimer={() => s.config.allowPause && setS((prev) => (prev ? toggleRunning(prev, Date.now()) : prev))}
          onResetTimer={() => setS((prev) => (prev ? resetClock(prev, Date.now()) : prev))}
          onFinish={() => {
            setS((prev) => (prev ? { ...prev, finished: true, running: false } : prev))
            toast.success('Сессия завершена', 'Отчёт открыт — можно распечатать или сохранить в PDF')
          }}
        />
      )}
    </div>
  )
}
