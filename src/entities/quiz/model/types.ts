import type { Level } from '@/entities/question/model/types'

/** Задача на предсказание вывода: фрагмент кода, варианты ответа и разбор. */
export interface QuizItem {
  id: string
  version: number
  title: string
  level: Level
  topic: string
  tags: string[]
  prompt: string
  code: string
  /** варианты ответа: каждый — вывод целиком, строки через \n */
  options: string[]
  correct: number
  /** фактический вывод кода построчно — проверяется запуском в тестах */
  output: string[]
  explanation: string
  pitfalls: string[]
  reviewedAt: string | null
}
