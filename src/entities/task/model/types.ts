export type TaskLevel = 'junior' | 'middle' | 'senior'

export interface UITask {
  id: string
  level: TaskLevel
  title: string
  exportName: string
  description: string
  starter: string
  tests: string
  solution?: string // Эталонное решение для интервьюера
}

export interface TaskSolution {
  code: string
  lastResult?: { ok: boolean; message: string }[]
  score?: number
  comment?: string
}
