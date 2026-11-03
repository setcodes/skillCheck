import { Monitor, Server, BarChart3, Settings } from 'lucide-react'
import type { Profession, ProfessionInfo } from './types'

export const PROFESSIONS: ProfessionInfo[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    subtitle: 'JavaScript',
    color: 'text-blue-600 dark:text-blue-400',
    status: 'active'
  },
  {
    id: 'backend-java',
    title: 'Backend',
    subtitle: 'Java',
    color: 'text-green-600 dark:text-green-400',
    status: 'soon'
  },
  {
    id: 'analyst',
    title: 'Аналитик',
    subtitle: 'Системный анализ',
    color: 'text-purple-600 dark:text-purple-400',
    status: 'soon'
  },
  {
    id: 'devops',
    title: 'DevOps',
    subtitle: 'Инфраструктура',
    color: 'text-orange-600 dark:text-orange-400',
    status: 'soon'
  }
]

export const ENABLED_PROFESSIONS: Profession[] = PROFESSIONS
  .filter(p => p.status === 'active')
  .map(p => p.id)

export const DEFAULT_PROFESSION: Profession = 'frontend'

export function isProfessionEnabled(id: unknown): id is Profession {
  return ENABLED_PROFESSIONS.includes(id as Profession)
}

export const PROFESSION_ICONS = {
  frontend: Monitor,
  'backend-java': Server,
  analyst: BarChart3,
  devops: Settings
} as const
