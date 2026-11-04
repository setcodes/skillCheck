// Ядро раннера: транспиляция и выполнение кода задачи + тестов.
// Не знает про Worker и таймауты — они в supervisor.ts. Выполнять его нужно ТОЛЬКО
// внутри воркера (sandbox.worker.ts): на главном потоке код кандидата получил бы доступ к странице.
// Для golden-тестов в Node вызывается напрямую.

import { transform } from 'sucrase'
import { deepEqual, runCall } from './checks'
import type { SandboxInput, SandboxOutput, TestResult } from './types'

// Проверка, которая так и не завершилась (промис без resolve), иначе дожидалась бы общего таймаута
// воркера и уносила с собой результаты всех проверок. Синхронный бесконечный цикл ловит только supervisor.
export const CHECK_TIMEOUT_MS = 2000

async function withTimeout(run: () => Promise<TestResult[]>): Promise<TestResult[]> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<TestResult[]>((resolve) => {
    timer = setTimeout(
      () => resolve([{ ok: false, message: `Проверка не завершилась за ${CHECK_TIMEOUT_MS / 1000} с — вероятно, промис никогда не выполняется` }]),
      CHECK_TIMEOUT_MS
    )
  })
  try {
    return await Promise.race([run(), timeout])
  } finally {
    clearTimeout(timer)
  }
}

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e ?? 'Unknown error')
}

function formatLogArg(a: unknown): string {
  if (typeof a === 'string') return a
  try {
    return JSON.stringify(a) ?? String(a)
  } catch {
    return String(a)
  }
}

function createConsole(logs: string[]) {
  const push = (prefix: string) => (...args: unknown[]) => {
    logs.push(prefix + args.map(formatLogArg).join(' '))
  }
  return {
    log: push(''),
    info: push('[info] '),
    warn: push('[warn] '),
    error: push('[error] '),
    debug: push(''),
  }
}

function createAssert(report: (r: TestResult) => void) {
  const ok = (cond: boolean, pass: string, fail: string, m?: string) =>
    report({ ok: cond, message: m || (cond ? pass : fail) })
  const strict = {
    equal: (a: unknown, b: unknown, m?: string) =>
      ok(Object.is(a, b), 'equal', `expected ${formatLogArg(a)} === ${formatLogArg(b)}`, m),
    // структурное сравнение, а не JSON.stringify: порядок ключей не важен, NaN ≠ null, Date ≠ строка
    deepEqual: (a: unknown, b: unknown, m?: string) =>
      ok(deepEqual(a, b), 'deepEqual', `deep diff: ${formatLogArg(a)} !== ${formatLogArg(b)}`, m),
    ok: (v: unknown, m?: string) => ok(!!v, 'ok', 'ok(false)', m),
  }
  return { strict }
}

// Имена функций/классов верхнего уровня — на случай, если кандидат забыл `export`
function declaredNames(code: string): string[] {
  const names = new Set<string>()
  for (const m of code.matchAll(/^\s*(?:async\s+)?(?:function\*?|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    names.add(m[1])
  }
  return [...names]
}

function compileUserModule(code: string): string {
  const js = transform(code, { transforms: ['typescript', 'imports'], disableESTransforms: true }).code
  const fallback = declaredNames(code)
    .map((n) => `;try{if(typeof ${n}!=='undefined'&&!('${n}' in exports))exports.${n}=${n}}catch(_){}`)
    .join('')
  return `"use strict";${js}${fallback}`
}

function prepareTests(tests: string): string {
  const withoutImports = tests
    .replace(/import\s+\{\s*strict\s+as\s+assert\s*\}\s+from\s+['"]assert['"];?/g, '')
    // модуль решения приходит параметром m, поэтому годится любая деструктуризация: const { a, b } = m
    .replace(/import\s+\*\s+as\s+m\s+from\s+['"]MODULE['"];?/g, '')
    .replace(/import\s*\{([^}]*)\}\s*from\s*['"]MODULE['"];?/g, (_, names: string) => `const {${names.replace(/\bas\b/g, ':')}} = m;`)
    .replace(/assert\.equal/g, 'assert.strict.equal')
    .replace(/assert\.deepEqual/g, 'assert.strict.deepEqual')
    .replace(/assert\.ok/g, 'assert.strict.ok')
  return transform(withoutImports, { transforms: ['typescript'], disableESTransforms: true }).code
}

async function runScript(
  source: string,
  userModule: Record<string, unknown>,
  sandboxConsole: ReturnType<typeof createConsole>
): Promise<TestResult[]> {
  const results: TestResult[] = []
  let testFn: (...args: unknown[]) => Promise<unknown>
  try {
    testFn = new AsyncFunction('assert', 'm', 'global', 'console', prepareTests(source))
  } catch (e) {
    return [{ ok: false, message: `Ошибка в тестах: ${errorMessage(e)}` }]
  }
  const assert = createAssert((r) => results.push(r))
  try {
    await testFn(assert, userModule, globalThis, sandboxConsole)
  } catch (e) {
    results.push({ ok: false, message: `Test execution error: ${errorMessage(e)}` })
  }
  if (results.length === 0) results.push({ ok: false, message: 'No test assertions were executed' })
  return results
}

export async function runInSandbox({ code, tests, checks, exportName }: SandboxInput): Promise<SandboxOutput> {
  const logs: string[] = []
  const fail = (message: string): SandboxOutput => ({ results: [{ ok: false, message }], logs })
  const sandboxConsole = createConsole(logs)

  let compiled: string
  try {
    compiled = compileUserModule(code)
  } catch (e) {
    return fail(`Ошибка в коде решения: ${errorMessage(e)}`)
  }

  // Каждая проверка получает свежий экземпляр модуля решения: состояние не протекает между проверками
  const instantiate = () => {
    const module = { exports: {} as Record<string, unknown> }
    new Function('exports', 'module', 'console', compiled)(module.exports, module, sandboxConsole)
    return module.exports
  }

  try {
    const probe = instantiate()
    if (Object.keys(probe).filter((k) => k !== '__esModule').length === 0) return fail('No functions found in user code')
  } catch (e) {
    return fail(`Ошибка в коде решения: ${errorMessage(e)}`)
  }

  if (!checks) return { results: await withTimeout(() => runScript(tests ?? '', instantiate(), sandboxConsole)), logs }

  const results: TestResult[] = []
  for (const check of checks) {
    const produced = await withTimeout(async () => {
      if (check.type === 'call') return [await runCall(check, { instantiate, exportName: exportName ?? '' })]
      try {
        return await runScript(check.code, instantiate(), sandboxConsole)
      } catch (e) {
        return [{ ok: false, message: `Ошибка в коде решения: ${errorMessage(e)}` }]
      }
    })
    // у call-проверки есть название — подставляем его в сообщение о тайм-ауте
    if (check.type === 'call' && produced.length === 1 && !produced[0].message.startsWith(check.title)) {
      produced[0] = { ...produced[0], message: `${check.title}: ${produced[0].message}` }
    }
    for (const r of produced) results.push(check.hidden ? { ...r, hidden: true } : r)
  }
  return { results, logs }
}
