import type { Level } from '@/entities/question/model/types'

export type CaseKind = 'review' | 'live'

/** critical — пользователь увидит неверные данные/потеряет работу; important — неверные состояния, лишние запросы;
 *  quality — доступность, производительность, семантика; cosmetic — нейминг и декомпозиция */
export type IssueRisk = 'critical' | 'important' | 'quality' | 'cosmetic'

export interface CaseIssue {
  title: string
  risk: IssueRisk
  /** чем это грозит пользователю — главное, что должен сформулировать кандидат */
  consequence: string
  fix: string
}

export interface CaseFile {
  name: string
  language: 'tsx' | 'ts' | 'js'
  code: string
}

export interface Case {
  id: string
  version: number
  title: string
  kind: CaseKind
  level: Level
  topic: string
  tags: string[]
  /** формулировка, как её дают на секции */
  brief: string
  /** что интервьюер сообщает по ходу */
  context: string[]
  /** для live: что должно получиться */
  requirements: string[]
  /** review: код с проблемами; live: стартовый шаблон */
  files: CaseFile[]
  /** эталон (live) */
  solution: CaseFile[]
  /** review: ожидаемые находки */
  issues: CaseIssue[]
  /** что оценивает интервьюер */
  grading: string[]
  followUps: string[]
  /** какие проверки и тесты стоит назвать в конце */
  testsToMention: string[]
  reviewedAt: string | null
}
