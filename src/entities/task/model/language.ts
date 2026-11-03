import type { UITask } from '@/entities/task/model/types'

export const languageLabel = (language?: UITask['language']) =>
  language === 'typescript' ? 'TypeScript' : 'JavaScript'

// Явное поле language у задачи; иначе TS, если в стартовом коде есть типы
export function detectLanguage(task: Pick<UITask, 'language' | 'starter'>): NonNullable<UITask['language']> {
  if (task.language) return task.language
  return /:\s*(string|number|boolean|any|unknown)\b|\binterface\s/.test(task.starter) ? 'typescript' : 'javascript'
}
