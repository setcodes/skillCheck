import type { UITask } from '@/entities/task/model/types'

/** Описание задачи без проверок: проверки собираются в index.ts из декларативных и сценарных. */
export type TaskDef = Omit<UITask, 'checks'>

export type TaskMeta = Pick<UITask, 'hints' | 'rubric' | 'commonMistakes'>
