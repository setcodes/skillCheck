import type { SandboxInput, SandboxOutput } from './types'

export const MAX_EXECUTION_MS = 5000

export interface WorkerLike {
  postMessage(message: unknown): void
  terminate(): void
  onmessage: ((event: { data: unknown }) => void) | null
  onerror: ((event: { message?: string }) => void) | null
}

// Запускает код в свежем воркере и убивает его по таймауту: бесконечный цикл не вешает страницу.
export function runWithWorker(
  spawn: () => WorkerLike,
  input: SandboxInput,
  timeoutMs = MAX_EXECUTION_MS
): Promise<SandboxOutput> {
  return new Promise((resolve) => {
    const token = crypto.randomUUID()
    const worker = spawn()
    let done = false

    const finish = (out: SandboxOutput) => {
      if (done) return
      done = true
      clearTimeout(timer)
      worker.terminate()
      resolve(out)
    }
    const fail = (message: string) => finish({ results: [{ ok: false, message }], logs: [] })

    const timer = setTimeout(
      () => fail(`Превышено время выполнения (${Math.round(timeoutMs / 1000)} секунд)`),
      timeoutMs
    )

    worker.onmessage = (event) => {
      const data = event.data as (SandboxOutput & { token?: string }) | null
      if (!data || data.token !== token) return // чужое сообщение — игнорируем
      finish({ results: data.results, logs: data.logs })
    }
    worker.onerror = (event) => fail(`Ошибка выполнения: ${event.message || 'unknown'}`)
    worker.postMessage({ token, ...input })
  })
}

export function spawnSandboxWorker(): WorkerLike {
  return new Worker(new URL('./sandbox.worker.ts', import.meta.url), {
    type: 'module',
  }) as unknown as WorkerLike
}
