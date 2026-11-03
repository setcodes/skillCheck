import { useCallback, useEffect, useState } from 'react'
import type { TestResult } from '@/shared/api/runner'
import { KEYS, readJSON, writeJSON } from '@/shared/storage/storage'

export interface Solution {
  code?: string
  lastResult?: TestResult[]
  score?: number
  comment?: string
}

type Solutions = Record<string, Solution>

// Решения кандидата и оценки интервьюера по задачам (общий ключ для всех профессий).
export function useSolutions() {
  const [solutions, setSolutions] = useState<Solutions>(() => readJSON<Solutions>(KEYS.solutions, {}))

  useEffect(() => {
    writeJSON(KEYS.solutions, solutions)
  }, [solutions])

  const patch = useCallback((taskId: string, p: Partial<Solution>) => {
    setSolutions((all) => ({ ...all, [taskId]: { ...all[taskId], ...p } }))
  }, [])

  const clearAll = useCallback(() => setSolutions({}), [])

  return { solutions, patch, clearAll }
}
