import type { TheoryQuestion } from '@/entities/question/model/types'
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
      if (Array.isArray(parsed)) return parsed as TheoryQuestion[]
    }
  } catch {}
  // Фоллбек к базовой поставке из JSON
  return QUESTIONS_BY_PROF[prof] || []
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
