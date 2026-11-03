export type TestResult = { ok: boolean; message: string; hidden?: boolean }

export type SandboxInput = { code: string; tests: string }

export type SandboxOutput = { results: TestResult[]; logs: string[] }
