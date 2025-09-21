export type TaskLevel = 'junior' | 'middle' | 'senior'

export interface UITask {
  id: string
  level: TaskLevel
  title: string
  exportName: string
  description: string
  starter: string
  tests: string
  language?: 'javascript' | 'typescript' | 'java' | 'sql' | 'yaml' | 'python' | 'dockerfile' | 'mermaid'
  testsSql?: {
    schema?: string[]
    data?: string[]
    expectedRows: any[]
    check?: string
    queryVar?: string
  }
  testsYaml?: {
    rules: {
      path: string
      equals?: any
      regex?: string
      exists?: boolean
      length?: number
    }[]
  }
  solution?: string // Эталонное решение для интервьюера
}

export interface TaskSolution {
  code: string
  lastResult?: { ok: boolean; message: string }[]
  score?: number
  comment?: string
}
