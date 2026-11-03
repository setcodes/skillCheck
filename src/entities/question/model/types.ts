export type Level = 'junior' | 'middle' | 'senior'

export type QuestionKind = 'screening' | 'deep' | 'practical' | 'architecture'

export interface QuestionAnswer {
  /** 1–2 предложения: суть ответа */
  short: string
  /** развёрнутый ответ в markdown (с примером кода) */
  full?: string
  /** что обязательно должно прозвучать в хорошем ответе */
  mustMention: string[]
  commonMistakes: string[]
  redFlags: string[]
}

export interface Question {
  /** стабильный ASCII-id: fe-<тема>-<номер>, например fe-js-core-007 */
  id: string
  /** прежние id (для ссылок, черновиков оценок и сохранённых сессий) */
  aliases?: string[]
  version: number
  title: string
  prompt: string
  level: Level
  kind: QuestionKind
  topic: string
  tags: string[]
  answer: QuestionAnswer
  followUps: string[]
  sources: string[]
  /** дата вычитки (YYYY-MM-DD); null — ответ ещё не проверен человеком */
  reviewedAt: string | null
  author?: string
}

export type TheoryQuestion = Question
