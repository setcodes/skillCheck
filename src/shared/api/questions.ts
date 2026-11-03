import type { TheoryQuestion } from '@/entities/question/model/types'
import type { Profession } from '@/entities/profession/model/types'
import type { UITask } from '@/entities/task/model/types'
import { TASKS_BY_PROF } from './tasks'

// Импорт базовых пулов вопросов из JSON
// Эти файлы можно редактировать и расширять; они служат дефолтной базой
// при отсутствии пользовательских данных в LocalStorage
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON imports
import FRONTEND_QA from '@/shared/questions/frontend-qa-100.json'

function normalize(arr: any[]): TheoryQuestion[] {
  return (arr || []).map((q: any, idx: number) => {
    const id = String(q?.id ?? `q_${idx}`)
    // Если нет title — берем первую строку prompt как заголовок
    const promptRaw = String(q?.prompt ?? '')
    const inferredTitle = promptRaw ? String(promptRaw).split(/\r?\n/)[0].trim().slice(0, 140) : ''
    const title = String((q?.title ?? inferredTitle) || 'Без названия')
    const category = String(q?.category ?? 'Разное')
    const difficulty = Number.isFinite(q?.difficulty) ? Number(q.difficulty) : 1
    const bucket = ((): TheoryQuestion['bucket'] => {
      const b = String(q?.bucket ?? 'screening')
      return (b==='screening' || b==='deep' || b==='architecture') ? (b as any) : 'screening'
    })()
    const prompt = promptRaw || String(q?.prompt ?? '')
    const answer = String(q?.answer ?? '')
    return { id, title, category, difficulty, bucket, prompt, answer }
  })
}

// Замороженные профессии (backend-java, analyst, devops) лежат в /frozen и в сборку не входят
const QUESTIONS_BY_PROF: Partial<Record<Profession, TheoryQuestion[]>> = {
  frontend: (FRONTEND_QA as TheoryQuestion[]) || [],
}

export function getQuestions(prof: Profession): TheoryQuestion[] {
  // Helper to lazily compute base and normalize
  let baseCache: TheoryQuestion[] | null = null
  const base = () => {
    if (baseCache) return baseCache
    baseCache = normalize(QUESTIONS_BY_PROF[prof] || [])
      .sort((a,b)=> (a.difficulty||0)-(b.difficulty||0) || String(a.title||'').localeCompare(String(b.title||'')))
    return baseCache
  }
  try {
    const raw = localStorage.getItem(lsKeyQuestions(prof))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Если в локальном банке есть неполные записи — 
        // заполняем недостающие поля из базовой поставки по id, 
        // и финально нормализуем.
        const needsFix = parsed.some((q: any)=> !q || !q.title || !q.prompt)
        if (needsFix) {
          const b = base()
          const byId = Object.fromEntries(b.map(q=> [q.id, q])) as Record<string, TheoryQuestion>
          const normKey = (s: string) => String(s||'').trim().toLowerCase()
          const firstLine = (s: string) => normKey(String(s||'').split(/\r?\n/)[0])
          const byTitle = new Map<string, TheoryQuestion>()
          const byPrompt = new Map<string, TheoryQuestion>()
          for (const q of b) {
            if (q.title) byTitle.set(normKey(q.title), q)
            if (q.prompt) byPrompt.set(firstLine(q.prompt), q)
          }
          const merged = parsed.map((q: any, i: number)=>{
            const id = String(q?.id ?? `q_${i}`)
            let baseQ: TheoryQuestion | undefined = byId[id]
            if (!baseQ) {
              const kTitle = normKey(q?.title||'')
              const kPrompt = firstLine(q?.prompt||'')
              const baseQFromTitle = kTitle ? byTitle.get(kTitle) : undefined
              const baseQFromPrompt = kPrompt ? byPrompt.get(kPrompt) : undefined
              baseQ = baseQFromTitle || baseQFromPrompt
            }
            const combined: any = { id }
            // strings prefer non-empty local, else base
            combined.title = (q && q.title && String(q.title).trim()) ? String(q.title) : (baseQ?.title || '')
            combined.category = (q && q.category && String(q.category).trim()) ? String(q.category) : (baseQ?.category || 'Разное')
            combined.prompt = (q && q.prompt && String(q.prompt).trim()) ? String(q.prompt) : (baseQ?.prompt || '')
            combined.answer = (q && q.answer && String(q.answer).trim()) ? String(q.answer) : (baseQ?.answer || '')
            // difficulty/bucket
            combined.difficulty = Number.isFinite(q?.difficulty) ? Number(q.difficulty) : (baseQ?.difficulty ?? 1)
            combined.bucket = ((): any => {
              const bLocal = q?.bucket
              const bval = (bLocal ?? baseQ?.bucket ?? 'screening') as any
              return (bval==='screening'||bval==='deep'||bval==='architecture') ? bval : 'screening'
            })()
            return combined
          })
          let fixed = normalize(merged)
          // If still too many blanks, fall back entirely to base
          const okTitles = fixed.filter(q=> q.title && q.title!=='Без названия').length
          if (okTitles < Math.max(1, Math.floor(b.length*0.6))) {
            fixed = b
          }
          try { localStorage.setItem(lsKeyQuestions(prof), JSON.stringify(fixed)) } catch {}
          return fixed
        }
        return parsed as TheoryQuestion[]
      }
    }
  } catch {}
  const seeded = base()
  // Auto-seed LocalStorage with base so user can edit locally, works offline too
  try { localStorage.setItem(lsKeyQuestions(prof), JSON.stringify(seeded)) } catch {}
  return seeded
}

export function putQuestions(prof: Profession, questions: TheoryQuestion[]): void {
  try {
    localStorage.setItem(lsKeyQuestions(prof), JSON.stringify(questions))
  } catch (e) {
    console.error('Failed to save questions', e)
  }
}

export function getTasks(prof: Profession): UITask[] {
  try {
    const raw = localStorage.getItem(lsKeyTasks(prof))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as UITask[]
    }
  } catch {}
  return TASKS_BY_PROF[prof] || []
}

export function putTasks(prof: Profession, tasks: UITask[]): void {
  try {
    localStorage.setItem(lsKeyTasks(prof), JSON.stringify(tasks))
  } catch (e) {
    console.error('Failed to save tasks', e)
  }
}

// LocalStorage keys
function lsKeyQuestions(prof: Profession) { return `bank:${prof}:questions` }
function lsKeyTasks(prof: Profession) { return `bank:${prof}:tasks` }
