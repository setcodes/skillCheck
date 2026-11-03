import type { UITask } from '@/entities/task/model/types'
import { FE } from './frontend'
import { FE_EXTRA } from './frontend-extra'
import { META_CORE } from './frontend-meta-core'
import { META_EXTRA } from './frontend-meta-extra'

const META = { ...META_CORE, ...META_EXTRA }

/** Все встроенные задачи Frontend: условие и тесты + подсказки, рубрики, типичные ошибки, скрытые проверки. */
export const FRONTEND_TASKS: UITask[] = [...FE, ...FE_EXTRA].map((task) => ({ ...task, ...META[task.id] }))
