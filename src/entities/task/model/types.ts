export type TaskLevel = 'junior' | 'middle' | 'senior'

export interface UITask {
  id: string
  level: TaskLevel
  title: string
  exportName: string
  description: string
  starter: string
  tests: string
  language?: 'javascript' | 'typescript'
  solution?: string // Эталонное решение для интервьюера
  /** три подсказки от общего направления к почти готовой идее */
  hints?: string[]
  /** критерии оценки для интервьюера; веса в сумме дают 100 */
  rubric?: { criterion: string; weight: number }[]
  commonMistakes?: string[]
  /** проверки, которых кандидат не видит (граничные случаи, производительность) */
  hiddenTests?: string
}

export interface TaskSolution {
  code: string
  lastResult?: { ok: boolean; message: string }[]
  score?: number
  comment?: string
}
