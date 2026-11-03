import { describe, it, expect, vi } from 'vitest'
import { runInSandbox } from '@/shared/runner/core'
import { lockDownScope, BLOCKED_GLOBALS } from '@/shared/runner/harden'
import { runWithWorker, type WorkerLike } from '@/shared/runner/supervisor'

const T = (body: string) =>
  `import { strict as assert } from 'assert';\nimport * as m from 'MODULE';\n${body}`

describe('runInSandbox', () => {
  it('поддерживает стрелочные типы, дженерики и async', async () => {
    const code = `export async function twice<T>(f: (x: T) => Promise<T>, x: T): Promise<T[]> {
      return [await f(x), await f(x)]
    }`
    const tests = T(`const { twice } = m;
      const r = await twice(async (x: number) => x + 1, 1);
      assert.deepEqual(r, [2, 2]);`)
    const { results } = await runInSandbox({ code, tests })
    expect(results).toEqual([{ ok: true, message: 'deepEqual' }])
  })

  it('находит функции без export', async () => {
    const { results } = await runInSandbox({
      code: 'function add(a: number, b: number) { return a + b }',
      tests: T('const { add } = m; assert.equal(add(1, 2), 3);'),
    })
    expect(results.every((r) => r.ok)).toBe(true)
  })

  it('синтаксическая ошибка решения — понятное сообщение, а не падение', async () => {
    const { results } = await runInSandbox({
      code: 'export function f( { return 1 }',
      tests: T('const { f } = m; assert.ok(f());'),
    })
    expect(results).toHaveLength(1)
    expect(results[0].ok).toBe(false)
    expect(results[0].message).toMatch(/Ошибка в коде решения/)
  })

  it('собирает console.log кандидата без подмены глобального console', async () => {
    const before = console.log
    const { logs } = await runInSandbox({
      code: 'export function f() { console.log("hi", {a: 1}); return 1 }',
      tests: T('const { f } = m; f(); assert.equal(f(), 1);'),
    })
    expect(logs).toEqual(['hi {"a":1}', 'hi {"a":1}'])
    expect(console.log).toBe(before)
  })

  it('исключение в тестах превращается в проваленный результат', async () => {
    const { results } = await runInSandbox({
      code: 'export function f() { throw new Error("boom") }',
      tests: T('const { f } = m; f();'),
    })
    expect(results).toEqual([{ ok: false, message: 'Test execution error: boom' }])
  })

  it('без ассертов — явная ошибка', async () => {
    const { results } = await runInSandbox({
      code: 'export function f() { return 1 }',
      tests: T('const { f } = m; f();'),
    })
    expect(results[0].message).toBe('No test assertions were executed')
  })
})

describe('lockDownScope', () => {
  it('убирает сеть и каналы связи у скоупа', () => {
    const scope: Record<string, unknown> = {}
    for (const name of BLOCKED_GLOBALS) scope[name] = () => 'real'
    lockDownScope(scope)
    for (const name of BLOCKED_GLOBALS) expect(scope[name], name).toBeUndefined()
  })
})

function fakeWorker(onPost?: (w: FakeWorker, msg: Record<string, unknown>) => void) {
  const w: FakeWorker = {
    onmessage: null,
    onerror: null,
    terminate: vi.fn(),
    postMessage(msg) {
      onPost?.(w, msg as Record<string, unknown>)
    },
  }
  return w
}
type FakeWorker = WorkerLike & { terminate: ReturnType<typeof vi.fn> }

describe('runWithWorker', () => {
  it('зависший воркер (бесконечный цикл) убивается по таймауту', async () => {
    const w = fakeWorker() // никогда не отвечает
    const out = await runWithWorker(() => w, { code: '', tests: '' }, 20)
    expect(out.results[0]).toMatchObject({ ok: false })
    expect(out.results[0].message).toMatch(/Превышено время выполнения/)
    expect(w.terminate).toHaveBeenCalledOnce()
  })

  it('возвращает результат воркера и завершает его', async () => {
    const w = fakeWorker((worker, msg) =>
      worker.onmessage?.({
        data: { token: msg.token, results: [{ ok: true, message: 'ok' }], logs: ['x'] },
      })
    )
    const out = await runWithWorker(() => w, { code: '', tests: '' })
    expect(out).toEqual({ results: [{ ok: true, message: 'ok' }], logs: ['x'] })
    expect(w.terminate).toHaveBeenCalledOnce()
  })

  it('игнорирует сообщения с чужим токеном (подделка результата кандидатом)', async () => {
    const w = fakeWorker((worker) => {
      worker.onmessage?.({ data: { token: 'forged', results: [{ ok: true, message: 'fake' }], logs: [] } })
    })
    const out = await runWithWorker(() => w, { code: '', tests: '' }, 30)
    expect(out.results[0].message).toMatch(/Превышено время/)
  })

  it('ошибка воркера — проваленный результат', async () => {
    const w = fakeWorker((worker) => worker.onerror?.({ message: 'oops' }))
    const out = await runWithWorker(() => w, { code: '', tests: '' })
    expect(out.results[0]).toEqual({ ok: false, message: 'Ошибка выполнения: oops' })
  })
})
