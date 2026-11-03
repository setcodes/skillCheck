import type { Check } from '@/entities/task/model/checks'
import { runWithWorker, spawnSandboxWorker } from './supervisor'
import type { SandboxOutput, TestResult } from './types'

export type { TestResult, SandboxOutput }

/** Прежний формат: исходный код теста со строками assert. */
export function runModuleWithLogs(code: string, tests: string): Promise<SandboxOutput> {
  return runWithWorker(spawnSandboxWorker, { code, tests })
}

export async function runModule(code: string, tests: string): Promise<TestResult[]> {
  return (await runModuleWithLogs(code, tests)).results
}

/** Декларативные проверки задачи в одном запуске песочницы. */
export function runChecksWithLogs(code: string, checks: Check[], exportName: string): Promise<SandboxOutput> {
  return runWithWorker(spawnSandboxWorker, { code, checks, exportName })
}
