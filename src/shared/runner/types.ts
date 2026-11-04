import type { Check } from '@/entities/task/model/checks'

export type TestResult = { ok: boolean; message: string; hidden?: boolean }

/**
 * Что выполнить: либо декларативные `checks` (с `exportName` задачи),
 * либо исходный код теста `tests` (прежний формат, остаётся для совместимости).
 */
export type SandboxInput = {
  code: string
  tests?: string
  checks?: Check[]
  exportName?: string
}

export type SandboxOutput = { results: TestResult[]; logs: string[] }
