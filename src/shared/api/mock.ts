import type { Profession } from '@/entities/profession/model/types'
import type { TheoryQuestion } from '@/entities/question/model/types'
import type { UITask } from '@/entities/task/model/types'
import { getQuestions, getTasks } from './questions'
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

function rng(seed: number){ let x = seed >>> 0; return ()=> (x = (x*1664525 + 1013904223) >>> 0) / 0x100000000 }

function pickN<T>(arr: T[], n: number, rnd: ()=>number): T[]{
  const a = arr.slice()
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]] }
  return a.slice(0, Math.min(n, a.length))
}

export function createSession(prof: Profession, cfg: Partial<Omit<MockSessionConfig,'profession'>>): MockSessionState{
  const seed = Math.floor(Math.random()*1e9)
  const rnd = rng(seed)
  const theoryCount = cfg.theoryCount ?? 12
  const taskCount = cfg.taskCount ?? 8
  const durationSec = cfg.durationSec ?? 90*60
  const allowPause = cfg.allowPause ?? true
  const weightTasks = cfg.weightTasks ?? 0.6
  const level = (cfg as any).level ?? 'junior'
  const qs = getQuestions(prof)
  const ts = getTasks(prof).filter((t:any)=> t.level===level)
  // naive diversity: sample categories for questions
  const theory = pickN(qs, theoryCount, rnd).map<MockTheoryItem>((q,i)=>({
    id: `theory-${i}`,
    type: 'theory',
    questionId: q.id,
    title: q.title,
    category: (q as any).category,
    difficulty: (q as any).difficulty,
    prompt: q.prompt,
  }))
  const tasks = pickN(ts, taskCount, rnd).map<MockTaskItem>((t,i)=>({
    id: `task-${i}`,
    type: 'task',
    taskId: t.id,
    title: t.title,
    level: t.level,
    description: t.description,
    starter: t.starter,
  }))
  const items: MockItem[] = pickN([...theory, ...tasks], theory.length+tasks.length, rnd)
  const s: MockSessionState={
    id: `mock-${Date.now()}`,
    seed,
    createdAt: Date.now(),
    config: { 
      profession: prof, 
      theoryCount, 
      taskCount, 
      durationSec, 
      allowPause, 
      level, 
      weightTasks,
      candidateName: (cfg as any).candidateName || '',
      candidateDept: (cfg as any).candidateDept || '',
      candidatePosition: (cfg as any).candidatePosition || ''
    },
    items,
    currentIndex: 0,
    started: true,
    finished: false,
    timerMode: 'down',
    remainingSec: durationSec,
    running: true,
  }
  saveSession(s)
  return s
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
