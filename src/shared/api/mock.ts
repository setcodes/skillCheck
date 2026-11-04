import type { Profession } from '@/entities/profession/model/types'
import { getQuestions, getTasks } from '@/shared/bank'
import { levelNumber, topicLabel } from '@/entities/question/model/topics'
import type { MockSessionConfig, MockSessionState, MockItem, MockTheoryItem, MockTaskItem } from '@/entities/mock/model/types'

const LS_KEY = 'mock.session.v1'

export function saveSession(s: MockSessionState){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(s)) }catch{}
}
export function loadSession(): MockSessionState | null{
  try{ const raw=localStorage.getItem(LS_KEY); if(raw) return JSON.parse(raw) as MockSessionState }catch{}
  return null
}
export function clearSession(){ try{ localStorage.removeItem(LS_KEY) }catch{} }

type Level = 'junior' | 'middle' | 'senior'
const levelOf = (l: string): Level => (l === 'middle' || l === 'senior' ? l : 'junior')

/** Криптостойкий сид: сессию можно воспроизвести по сохранённому seed. */
export function randomSeed(): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0]
}

function rng(seed: number){ let x = seed >>> 0; return ()=> (x = (x*1664525 + 1013904223) >>> 0) / 0x100000000 }

function shuffled<T>(arr: T[], rnd: ()=>number): T[]{
  const a = arr.slice()
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]] }
  return a
}

/** Элементы выбранного уровня; если их мало, добираем ближайшими по уровню. */
export function poolByLevel<T extends { level: string }>(items: T[], level: Level, need: number): T[] {
  const distance = (l: string) => Math.abs(levelNumber(levelOf(l)) - levelNumber(level))
  const sorted = [...items].sort((a, b) => distance(a.level) - distance(b.level))
  const same = sorted.filter((x) => x.level === level)
  return same.length >= need ? same : sorted.slice(0, Math.max(need, same.length))
}

/** Выбор n элементов с равномерным охватом тем: по кругу берём по одному из каждой темы. */
export function pickBalanced<T>(items: T[], n: number, topicOf: (x: T) => string, rnd: ()=>number): T[] {
  const groups = new Map<string, T[]>()
  for (const item of shuffled(items, rnd)) {
    const t = topicOf(item)
    if (!groups.has(t)) groups.set(t, [])
    groups.get(t)!.push(item)
  }
  const queues = shuffled([...groups.values()], rnd)
  const out: T[] = []
  while (out.length < Math.min(n, items.length)) {
    for (const q of queues) {
      const next = q.shift()
      if (next !== undefined) out.push(next)
      if (out.length >= n) break
    }
  }
  return out
}

function pickN<T>(arr: T[], n: number, rnd: ()=>number): T[]{
  return shuffled(arr, rnd).slice(0, Math.min(n, arr.length))
}

export function createSession(
  prof: Profession,
  cfg: Partial<Omit<MockSessionConfig,'profession'>>,
  opts: { seed?: number; now?: number; persist?: boolean } = {}
): MockSessionState{
  const seed = opts.seed ?? randomSeed()
  const now = opts.now ?? Date.now()
  const rnd = rng(seed)
  const theoryCount = cfg.theoryCount ?? 12
  const taskCount = cfg.taskCount ?? 8
  const durationSec = cfg.durationSec ?? 90*60
  const allowPause = cfg.allowPause ?? true
  const weightTasks = cfg.weightTasks ?? 0.6
  const level = levelOf(cfg.level ?? 'junior')

  // вопросы: уровень + равномерный охват тем; задачи: уровень с добором ближайших
  const questionPool = poolByLevel(getQuestions(prof), level, theoryCount)
  const theory = pickBalanced(questionPool, theoryCount, (q) => q.topic, rnd).map<MockTheoryItem>((q,i)=>({
    id: `theory-${i}`,
    type: 'theory',
    questionId: q.id,
    title: q.title,
    category: topicLabel(q.topic),
    difficulty: levelNumber(q.level),
    prompt: q.prompt,
  }))
  const taskPool = poolByLevel(getTasks(prof), level, taskCount)
  const tasks = pickN(taskPool, taskCount, rnd).map<MockTaskItem>((t,i)=>({
    id: `task-${i}`,
    type: 'task',
    taskId: t.id,
    title: t.title,
    level: t.level,
    description: t.description,
    starter: t.starter,
  }))
  const items: MockItem[] = shuffled<MockItem>([...theory, ...tasks], rnd)
  const s: MockSessionState={
    id: `mock-${now}`,
    seed,
    createdAt: now,
    config: {
      profession: prof,
      theoryCount,
      taskCount,
      durationSec,
      allowPause,
      level,
      weightTasks,
      candidateName: cfg.candidateName || '',
      candidateDept: cfg.candidateDept || '',
      candidatePosition: cfg.candidatePosition || ''
    },
    items,
    currentIndex: 0,
    started: true,
    finished: false,
    timerMode: 'down',
    remainingSec: durationSec,
    running: true,
    tickedAt: now,
  }
  if (opts.persist !== false) saveSession(s)
  return s
}

/**
 * Время сессии считается по меткам Date.now(), а не по числу тиков: не дрейфует,
 * не замирает в фоновой вкладке и учитывает время, пока страница была закрыта.
 */
export function advanceSession(s: MockSessionState, now: number): MockSessionState {
  if (!s.running || s.finished) return s
  const last = s.tickedAt ?? now
  const whole = Math.floor((now - last) / 1000)
  if (whole <= 0) return s.tickedAt == null ? { ...s, tickedAt: now } : s
  const remainingSec = Math.max(0, s.remainingSec - whole)
  const tickedAt = last + whole * 1000
  if (remainingSec === 0) return { ...s, remainingSec: 0, running: false, finished: true, tickedAt }
  return { ...s, remainingSec, tickedAt }
}

/** Пауза / продолжение: на паузе метка не двигается, при продолжении отсчёт идёт с текущего момента. */
export function toggleRunning(s: MockSessionState, now: number): MockSessionState {
  if (s.finished) return s
  if (s.running) return { ...advanceSession(s, now), running: false }
  return { ...s, running: true, tickedAt: now }
}

export function resetClock(s: MockSessionState, now: number): MockSessionState {
  return { ...s, remainingSec: s.config.durationSec, running: false, tickedAt: now }
}

export interface MockReport {
  tasksAvg: number
  theoryAvg: number
  /** итог по шкале 0–5 */
  final: number
  finalPct: number
  level: 'Senior' | 'Middle' | 'Junior-'
  /** теория по темам: сколько вопросов и средняя самооценка */
  topics: { topic: string; count: number; avg: number }[]
}

export function buildReport(s: MockSessionState): MockReport {
  const tasks = s.items.filter((it): it is MockTaskItem => it.type === 'task')
  const theory = s.items.filter((it): it is MockTheoryItem => it.type === 'theory')
  const tasksAvg = tasks.length ? tasks.reduce((sum, i) => sum + (i.autoScore || 0), 0) / tasks.length : 0
  const theoryAvg = theory.length ? theory.reduce((sum, i) => sum + (i.selfScore || 0), 0) / theory.length : 0
  const final = tasksAvg * s.config.weightTasks + theoryAvg * (1 - s.config.weightTasks)
  const finalPct = Math.round((final / 5) * 100)
  const byTopic = new Map<string, { count: number; sum: number }>()
  for (const q of theory) {
    const e = byTopic.get(q.category) ?? { count: 0, sum: 0 }
    e.count++
    e.sum += q.selfScore || 0
    byTopic.set(q.category, e)
  }
  const topics = [...byTopic].map(([topic, e]) => ({ topic, count: e.count, avg: e.sum / e.count })).sort((a, b) => a.avg - b.avg || a.topic.localeCompare(b.topic))
  return { tasksAvg, theoryAvg, final, finalPct, level: finalPct >= 85 ? 'Senior' : finalPct >= 65 ? 'Middle' : 'Junior-', topics }
}

/** Сохранённая сессия с учётом времени, прошедшего после последней записи. */
export function restoreSession(now = Date.now()): MockSessionState | null {
  const s = loadSession()
  return s ? advanceSession(s, now) : null
}

export function mapTaskScore(passed: number, total: number): number{
  if (total<=0) return 0
  const ratio = passed/total
  if (ratio>=1) return 5
  if (ratio>=0.8) return 4.5
  if (ratio>=0.6) return 3.5
  if (ratio>=0.4) return 2.5
  if (ratio>=0.2) return 1.5
  return 0.5
}
