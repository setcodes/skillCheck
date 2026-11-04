import type { Profession, ProfessionInfo } from './types'

export const PROFESSIONS: ProfessionInfo[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    subtitle: 'JavaScript',
    status: 'active'
  },
  {
    id: 'backend-java',
    title: 'Backend',
    subtitle: 'Java',
    status: 'soon'
  },
  {
    id: 'analyst',
    title: 'Аналитик',
    subtitle: 'Системный анализ',
    status: 'soon'
  },
  {
    id: 'devops',
    title: 'DevOps',
    subtitle: 'Инфраструктура',
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
