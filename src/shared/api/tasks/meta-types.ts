import type { UITask } from '@/entities/task/model/types'

export type TaskMeta = Pick<UITask, 'hints' | 'rubric' | 'commonMistakes' | 'hiddenTests'>

const PRELUDE = "import { strict as assert } from 'assert';\nimport * as m from 'MODULE';\n"

/** Скрытые проверки: тот же формат, что у обычных тестов, плюс деструктуризация экспорта. */
export const t = (exportName: string, body: string) => `${PRELUDE}const { ${exportName} } = m;${body}\n`
