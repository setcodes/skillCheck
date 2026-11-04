import type { Level } from './types'

export interface Topic {
  id: string
  label: string
}

// Справочник тем банка Frontend. Новые темы добавляются здесь, валидатор не пропустит неизвестные.
export const FRONTEND_TOPICS: Topic[] = [
  { id: 'js-core', label: 'JavaScript: основы' },
  { id: 'async', label: 'Асинхронность и event loop' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'a11y', label: 'Доступность' },
  { id: 'react', label: 'React' },
  { id: 'state', label: 'Управление состоянием' },
  { id: 'browser-network', label: 'Браузер и сеть' },
  { id: 'performance', label: 'Производительность' },
  { id: 'security', label: 'Безопасность' },
  { id: 'testing', label: 'Тестирование' },
  { id: 'architecture', label: 'Архитектура' },
  { id: 'algorithms', label: 'Алгоритмы' },
  { id: 'general', label: 'Разное' },
]

const BY_ID = new Map(FRONTEND_TOPICS.map((t) => [t.id, t]))

export const TOPIC_IDS = FRONTEND_TOPICS.map((t) => t.id) as [string, ...string[]]
export const isTopic = (id: string) => BY_ID.has(id)
export const topicLabel = (id: string) => BY_ID.get(id)?.label ?? id

export const LEVELS: Level[] = ['junior', 'middle', 'senior']
export const levelNumber = (l: Level) => LEVELS.indexOf(l) + 1
export const levelLabel = (l: Level) => ({ junior: 'Junior', middle: 'Middle', senior: 'Senior' })[l]
