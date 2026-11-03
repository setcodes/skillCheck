import type { UITask } from '@/entities/task/model/types'
import { FE } from './tasks/frontend'

export type { UITask }

// Замороженные профессии (backend-java, analyst, devops) лежат в /frozen и в сборку не входят
export { FE }

export const ALL_TASKS: UITask[] = [...FE]

export const TASKS_BY_PROF: Partial<Record<string, UITask[]>> = {
  frontend: FE,
}

export function getTasksByProfession(profession: string): UITask[] {
  return TASKS_BY_PROF[profession] ?? []
}

export function getTasksByLevel(level: UITask['level']): UITask[] {
  return ALL_TASKS.filter((task) => task.level === level)
}

export function getTaskById(id: string): UITask | undefined {
  return ALL_TASKS.find((task) => task.id === id)
}
