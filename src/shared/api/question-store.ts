import type { TheoryQuestion } from '@/entities/question/model/types'
import type { Profession } from '@/entities/profession/model/types'

// Типы для различных источников вопросов
export interface QuestionSource {
  type: 'json' | 'markdown' | 'local' | 'pr'
  priority: number // 1 = высший приоритет
  data: TheoryQuestion[]
  metadata?: {
    file?: string
    lastModified?: number
    contributor?: string
  }
}

// Центральное хранилище вопросов
export class QuestionStore {
  private sources: Map<string, QuestionSource[]> = new Map()
  private cache: Map<string, TheoryQuestion[]> = new Map()

  // Добавить источник вопросов
  addSource(profession: Profession, source: QuestionSource): void {
    if (!this.sources.has(profession)) {
      this.sources.set(profession, [])
    }
    
    const sources = this.sources.get(profession)!
    const existingIndex = sources.findIndex(s => s.type === source.type && s.metadata?.file === source.metadata?.file)
    
    if (existingIndex >= 0) {
      sources[existingIndex] = source
    } else {
      sources.push(source)
    }
    
    // Сортируем по приоритету (1 = высший)
    sources.sort((a, b) => a.priority - b.priority)
    
    // Очищаем кэш
    this.cache.delete(profession)
  }

  // Получить все вопросы для профессии
  getQuestions(profession: Profession): TheoryQuestion[] {
    // Проверяем кэш
    if (this.cache.has(profession)) {
      return this.cache.get(profession)!
    }

    const sources = this.sources.get(profession) || []
    const questionMap = new Map<string, TheoryQuestion>()

    // Объединяем вопросы из всех источников по приоритету
    for (const source of sources) {
      for (const question of source.data) {
        // Вопросы с более высоким приоритетом перезаписывают существующие
        questionMap.set(question.id, question)
      }
    }

    const questions = Array.from(questionMap.values())
      .sort((a, b) => {
        const diff = (a.difficulty || 0) - (b.difficulty || 0)
        if (diff !== 0) return diff
        return String(a.title || '').localeCompare(String(b.title || ''))
      })

    // Кэшируем результат
    this.cache.set(profession, questions)
    return questions
  }

  // Очистить кэш
  clearCache(profession?: Profession): void {
    if (profession) {
      this.cache.delete(profession)
    } else {
      this.cache.clear()
    }
  }

  // Получить статистику по источникам
  getSourceStats(profession: Profession): Array<{ type: string; count: number; priority: number }> {
    const sources = this.sources.get(profession) || []
    return sources.map(source => ({
      type: source.type,
      count: source.data.length,
      priority: source.priority
    }))
  }
}

// Глобальный экземпляр хранилища
export const questionStore = new QuestionStore()

// Утилиты для работы с вопросами
export function validateQuestion(question: any): question is TheoryQuestion {
  return (
    question &&
    typeof question.id === 'string' &&
    typeof question.title === 'string' &&
    typeof question.category === 'string' &&
    typeof question.prompt === 'string' &&
    typeof question.answer === 'string' &&
    typeof question.difficulty === 'number' &&
    ['screening', 'deep', 'architecture'].includes(question.bucket)
  )
}

export function normalizeQuestion(raw: any): TheoryQuestion {
  const id = String(raw?.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2))
  const title = String(raw?.title ?? raw?.question ?? 'Без названия')
  const prompt = String(raw?.prompt ?? raw?.question ?? '')
  const answer = String(raw?.answer ?? '')
  const category = String(raw?.category ?? 'General')
  
  const difficulty = Number.isFinite(raw?.difficulty) 
    ? Number(raw.difficulty) 
    : (() => {
        const level = String(raw?.level || '').toLowerCase()
        if (level === 'junior') return 1
        if (level === 'middle' || level === 'mid') return 2
        if (level === 'senior') return 3
        return 2
      })()

  const bucket: 'screening' | 'deep' | 'architecture' = (() => {
    const b = String(raw?.bucket || '').toLowerCase()
    if (['screening', 'deep', 'architecture'].includes(b)) return b as any
    return 'screening'
  })()

  return { id, title, category, difficulty, bucket, prompt, answer }
}
