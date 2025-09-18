import { Monitor, Server, BarChart3, Settings } from 'lucide-react'
import type { ProfessionInfo } from './types'

export const PROFESSIONS: ProfessionInfo[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    subtitle: 'JavaScript',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'backend-java',
    title: 'Backend',
    subtitle: 'Java',
    color: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'analyst',
    title: 'Аналитик',
    subtitle: 'Системный анализ',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'devops',
    title: 'DevOps',
    subtitle: 'Инфраструктура',
    color: 'text-orange-600 dark:text-orange-400'
  }
]

export const PROFESSION_ICONS = {
  frontend: Monitor,
  'backend-java': Server,
  analyst: BarChart3,
  devops: Settings
} as const
