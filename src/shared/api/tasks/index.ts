import type { UITask } from '@/entities/task/model/types'
import { DECLARATIVE_CHECKS } from './checks-declarative'
import { SCRIPT_CHECKS } from './checks-script'
import { FE } from './frontend'
import { FE_EXTRA } from './frontend-extra'
import { META_CORE } from './frontend-meta-core'
import { META_EXTRA } from './frontend-meta-extra'

const META = { ...META_CORE, ...META_EXTRA }
const CHECKS = { ...SCRIPT_CHECKS, ...DECLARATIVE_CHECKS }

/** Все встроенные задачи Frontend: условие + проверки + подсказки, рубрики, типичные ошибки. */
export const FRONTEND_TASKS: UITask[] = [...FE, ...FE_EXTRA].map((def) => {
  const checks = CHECKS[def.id]
  if (!checks) throw new Error('У задачи нет проверок: ' + def.id)
  return { ...def, ...META[def.id], checks }
})
