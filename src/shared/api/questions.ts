import type { TheoryQuestion } from '@/entities/question/model/types'
import type { Profession } from '@/entities/profession/model/types'
import type { UITask } from '@/entities/task/model/types'
import type { Profession } from '@/entities/profession/model/types'
import { TASKS_BY_PROF } from './tasks'

// Импорт базовых пулов вопросов из JSON
// Эти файлы можно редактировать и расширять; они служат дефолтной базой
// при отсутствии пользовательских данных в LocalStorage
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON imports
import FRONTEND_QA from '@/shared/questions/frontend-qa-100.json'
// @ts-ignore
import BACKEND_JAVA_QA from '@/shared/questions/backend-java-qa-100.json'
// @ts-ignore
import ANALYST_QA from '@/shared/questions/ba-qa-100.json'
// @ts-ignore
import DEVOPS_QA from '@/shared/questions/devops-qa-100.json'

// Optional: Markdown-based questions (for contributions via PR)
// Place files under src/shared/questions/md/<profession>/*.md
// Each file may contain frontmatter-like header and sections "## Вопрос" / "## Ответ"
// Example:
// ---\n
// id: fe_md_1\n
// category: JavaScript\n
// difficulty: 2\n
// bucket: screening\n
// title: Замыкание\n
// ---\n
// ## Вопрос\n
// Объясните замыкание...\n
// ## Ответ\n
// Замыкание — ...
const MD_GLOB: Record<string, any> = import.meta.glob('@/shared/questions/md/**/*.{md,MD}', { query: '?raw', import: 'default', eager: true as any })

function parseMd(raw: string): Omit<TheoryQuestion, 'id'|'title'|'category'|'difficulty'|'bucket'|'prompt'|'answer'> & Partial<TheoryQuestion> {
  const res: any = {}
  try {
    const m = raw.match(/^---([\s\S]*?)---/)
    let body = raw
    if (m) {
      body = raw.slice(m[0].length)
      const lines = m[1].split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
      for (const line of lines) {
        const idx = line.indexOf(':')
        if (idx>0) {
          const k = line.slice(0, idx).trim()
          const v = line.slice(idx+1).trim()
          res[k] = v
        }
      }
    }
    // split sections
    const qMatch = body.split(/\n##\s*Вопрос\s*\n/i)
    let prompt = ''
    let answer = ''
    if (qMatch.length>1) {
      const afterQ = qMatch[1]
      const aMatch = afterQ.split(/\n##\s*Ответ\s*\n/i)
      prompt = (aMatch[0]||'').trim()
      answer = (aMatch[1]||'').trim()
    } else {
      // fallback: split by Ответ only
      const aMatch = body.split(/\n##\s*Ответ\s*\n/i)
      prompt = (aMatch[0]||'').trim()
      answer = (aMatch[1]||'').trim()
    }
    res.prompt = prompt
    res.answer = answer
  } catch {}
  return res
}

function loadMdForProf(prof: Profession): TheoryQuestion[] {
  const out: TheoryQuestion[] = []
  const prefix = `/src/shared/questions/md/${prof}/`
  for (const [k, v] of Object.entries(MD_GLOB)) {
    if (!k.includes(prefix)) continue
    const raw = v as string
    const meta = parseMd(raw)
    if (!meta) continue
    // minimal required fields
    const q: TheoryQuestion = {
      id: (meta.id as string) || k,
      title: (meta.title as string) || 'Без названия',
      category: (meta.category as string) || 'Разное',
      difficulty: Number(meta.difficulty)||1,
      bucket: (meta.bucket as any) || 'screening',
      prompt: (meta.prompt as string) || '',
      answer: (meta.answer as string) || ''
    }
    out.push(q)
  }
  // sort by difficulty and title for determinism
  return out.sort((a,b)=> a.difficulty-b.difficulty || a.title.localeCompare(b.title))
}

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

const QUESTIONS_FRONTEND: TheoryQuestion[] = (FRONTEND_QA as TheoryQuestion[]) || []
const QUESTIONS_BACKEND_JAVA: TheoryQuestion[] = (BACKEND_JAVA_QA as TheoryQuestion[]) || []
const QUESTIONS_ANALYST: TheoryQuestion[] = (ANALYST_QA as TheoryQuestion[]) || []
const QUESTIONS_DEVOPS: TheoryQuestion[] = (DEVOPS_QA as TheoryQuestion[]) || []

const QUESTIONS_BY_PROF: Record<Profession, TheoryQuestion[]> = {
  'frontend': QUESTIONS_FRONTEND,
  'backend-java': QUESTIONS_BACKEND_JAVA,
  'analyst': QUESTIONS_ANALYST,
  'devops': QUESTIONS_DEVOPS
}

export function getQuestions(prof: Profession): TheoryQuestion[] {
  try {
    const raw = localStorage.getItem(lsKeyQuestions(prof))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Если в локальном банке есть неполные записи — нормализуем и перезаписываем
        const needsFix = parsed.some((q: any)=> !q || !q.title || !q.prompt)
        if (needsFix) {
          const fixed = normalize(parsed)
          try { localStorage.setItem(lsKeyQuestions(prof), JSON.stringify(fixed)) } catch {}
          return fixed
        }
        return parsed as TheoryQuestion[]
      }
    }
  } catch {}
  // Prefer Markdown contributions if present, else fallback to JSON base
  const md = loadMdForProf(prof)
  const base = normalize(md.length ? md : (QUESTIONS_BY_PROF[prof] || []))
  // Auto-seed LocalStorage with base so user can edit locally, works offline too
  try { localStorage.setItem(lsKeyQuestions(prof), JSON.stringify(base)) } catch {}
  return base
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
