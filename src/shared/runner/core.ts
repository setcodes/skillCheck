// Ядро раннера: транспиляция и выполнение кода задачи + тестов.
// Не знает про Worker и таймауты — они в supervisor.ts. Выполнять его нужно ТОЛЬКО
// внутри воркера (sandbox.worker.ts): на главном потоке код кандидата получил бы доступ к странице.
// Для golden-тестов в Node вызывается напрямую.

import { transform } from 'sucrase'
import type { SandboxInput, SandboxOutput, TestResult } from './types'

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
    deepEqual: (a: unknown, b: unknown, m?: string) =>
      ok(
        JSON.stringify(a) === JSON.stringify(b),
        'deepEqual',
        `deep diff: ${formatLogArg(a)} !== ${formatLogArg(b)}`,
        m
      ),
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
    .replace(/import\s+\*\s+as\s+m\s+from\s+['"]MODULE['"];?/g, '')
    .replace(/const\s+\{\s*(\w+)\s*\}\s*=\s*m;?/g, 'const { $1 } = userModule;')
    .replace(/import\s+\{\s*(\w+)\s*\}\s+from\s+['"]MODULE['"];?/g, 'const { $1 } = userModule;')
    .replace(/assert\.equal/g, 'assert.strict.equal')
    .replace(/assert\.deepEqual/g, 'assert.strict.deepEqual')
    .replace(/assert\.ok/g, 'assert.strict.ok')
  return transform(withoutImports, { transforms: ['typescript'], disableESTransforms: true }).code
}

export async function runInSandbox({ code, tests }: SandboxInput): Promise<SandboxOutput> {
  const logs: string[] = []
  const results: TestResult[] = []
  const fail = (message: string): SandboxOutput => ({ results: [{ ok: false, message }], logs })
  const sandboxConsole = createConsole(logs)

  let userModule: Record<string, unknown>
  try {
    const compiled = compileUserModule(code)
    const module = { exports: {} as Record<string, unknown> }
    new Function('exports', 'module', 'console', compiled)(module.exports, module, sandboxConsole)
    userModule = module.exports
  } catch (e) {
    return fail(`Ошибка в коде решения: ${errorMessage(e)}`)
  }

  if (Object.keys(userModule).filter((k) => k !== '__esModule').length === 0) {
    return fail('No functions found in user code')
  }

  let testFn: (...args: unknown[]) => Promise<unknown>
  try {
    testFn = new AsyncFunction('assert', 'userModule', 'global', 'console', prepareTests(tests))
  } catch (e) {
    return fail(`Ошибка в тестах: ${errorMessage(e)}`)
  }

  const assert = createAssert((r) => results.push(r))
  try {
    await testFn(assert, userModule, globalThis, sandboxConsole)
  } catch (e) {
    results.push({ ok: false, message: `Test execution error: ${errorMessage(e)}` })
  }

  if (results.length === 0) results.push({ ok: false, message: 'No test assertions were executed' })
  return { results, logs }
}
