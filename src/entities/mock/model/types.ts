export type MockItemType = 'theory' | 'task'

export interface MockItemBase {
  id: string
  type: MockItemType
  title: string
}

export interface MockTheoryItem extends MockItemBase {
  type: 'theory'
  questionId: string
  category: string
  difficulty: number
  prompt: string
  // candidate input during session
  answerDraft?: string
  // review stage
  selfScore?: number // 0-5
}

export interface MockTaskItem extends MockItemBase {
  type: 'task'
  taskId: string
  level: string
  description: string
  starter: string
  code?: string
  testPassedRatio?: number
  autoScore?: number // 0-5 mapped from tests
  passedCount?: number
  totalCount?: number
}

export type MockItem = MockTheoryItem | MockTaskItem

export interface MockSessionConfig {
  profession: string
  theoryCount: number
  taskCount: number
  durationSec: number
  allowPause: boolean
  level: 'junior' | 'middle' | 'senior'
  weightTasks: number // 0..1 (e.g., 0.6)
  candidateName?: string
  candidateDept?: string
  candidatePosition?: string
}

export interface MockSessionState {
  id: string
  seed: number
  createdAt: number
  config: MockSessionConfig
  items: MockItem[]
  currentIndex: number
  started: boolean
  finished: boolean
  // timer
  timerMode: 'down'
  remainingSec: number
  running: boolean
}
