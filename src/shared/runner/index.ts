import { runWithWorker, spawnSandboxWorker } from './supervisor'
import type { SandboxOutput, TestResult } from './types'

export type { TestResult, SandboxOutput }

export function runModuleWithLogs(code: string, tests: string): Promise<SandboxOutput> {
  return runWithWorker(spawnSandboxWorker, { code, tests })
}

export async function runModule(code: string, tests: string): Promise<TestResult[]> {
  return (await runModuleWithLogs(code, tests)).results
}
