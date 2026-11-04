// Движок декларативных проверок. Выполняется только внутри песочницы (как и core.ts).
import type { CallCheck, CheckValue, Expectation, JsExpr } from '@/entities/task/model/checks'
import type { TestResult } from './types'

// ── выражения ────────────────────────────────────────────────────────────────

const isJsExpr = (v: unknown): v is JsExpr =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 1 && typeof (v as JsExpr).$js === 'string'

export function evalJs(expr: string): unknown {
  return new Function('"use strict"; return (' + expr + '\n);')()
}

/** Заменяет все {$js} внутри значения (в том числе во вложенных массивах и объектах). */
export function resolveValue(v: CheckValue): unknown {
  if (isJsExpr(v)) return evalJs(v.$js)
  if (Array.isArray(v)) return v.map(resolveValue)
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, resolveValue(x)]))
  }
  return v
}

function resolveArgs(args: CheckValue[] | JsExpr | undefined): unknown[] {
  if (args === undefined) return []
  const resolved = isJsExpr(args) ? evalJs(args.$js) : resolveValue(args)
  if (!Array.isArray(resolved)) throw new TypeError('аргументы должны быть массивом')
  return resolved
}

// ── сравнение и форматирование ───────────────────────────────────────────────

/** Строгое глубокое равенство: undefined-свойства различаются, NaN равен NaN, Date/RegExp/Map/Set по значению. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a === 'number' && typeof b === 'number') return Number.isNaN(a) && Number.isNaN(b)
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (a instanceof Date || b instanceof Date) return a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
  if (a instanceof RegExp || b instanceof RegExp) {
    return a instanceof RegExp && b instanceof RegExp && a.source === b.source && a.flags === b.flags
  }
  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map && b instanceof Map) || a.size !== b.size) return false
    for (const [k, v] of a) if (!b.has(k) || !deepEqual(v, b.get(k))) return false
    return true
  }
  if (a instanceof Set || b instanceof Set) {
    if (!(a instanceof Set && b instanceof Set) || a.size !== b.size) return false
    for (const v of a) if (!b.has(v)) return false
    return true
  }
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false
  }
  return true
}

/** Короткое читаемое представление значения для сообщений об ошибках. */
export function format(value: unknown, limit = 160): string {
  const MARK = '\u0000' // помеченные строки выводятся без кавычек: undefined, NaN, «функция»…
  const text = (() => {
    try {
      return JSON.stringify(value, function (this: Record<string, unknown>, key: string, v: unknown) {
        // у Date toJSON срабатывает раньше replacer — смотрим на исходное значение
        if (this[key] instanceof Date) return MARK + 'Date ' + (this[key] as Date).toISOString()
        if (v === undefined) return MARK + 'undefined'
        if (typeof v === 'number' && !Number.isFinite(v)) return MARK + String(v)
        if (typeof v === 'function') return MARK + '«функция»'
        if (typeof v === 'bigint') return MARK + v + 'n'
        if (v instanceof RegExp) return MARK + String(v)
        if (v instanceof Promise) return MARK + '«Promise»' // иначе JSON покажет {}, и не понять, что функция асинхронная
        if (v instanceof Map) return { '«Map»': [...v] }
        if (v instanceof Set) return { '«Set»': [...v] }
        return v
      })
    } catch {
      return String(value)
    }
  })()
  const t = text === undefined ? 'undefined' : text.replace(/"\\u0000([^"]*)"/g, '$1')
  return t.length > limit ? t.slice(0, limit - 1) + '…' : t
}

const describeCall = (check: CallCheck, args: unknown[]) =>
  `${check.fn ?? 'fn'}(${args.map((a) => format(a, 60)).join(', ')})`

function matchesError(error: unknown, expected: string | true): boolean {
  if (expected === true) return true
  const e = error as { name?: string; message?: string } | null
  return e?.name === expected || String(e?.message ?? error).includes(expected)
}

// ── выполнение ───────────────────────────────────────────────────────────────

export interface CallContext {
  /** свежий экземпляр модуля решения */
  instantiate: () => Record<string, unknown>
  exportName: string
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

export async function runCall(check: CallCheck, ctx: CallContext): Promise<TestResult> {
  const fail = (detail: string): TestResult => ({ ok: false, message: `${check.title}: ${detail}` })
  const pass = (): TestResult => ({ ok: true, message: check.title })

  const name = check.fn ?? ctx.exportName
  const named = { ...check, fn: name }
  let args: unknown[]
  let thenArgs: unknown[] | undefined
  let snapshot: unknown[] | undefined
  try {
    args = resolveArgs(check.args)
    thenArgs = check.then === undefined ? undefined : resolveArgs(check.then)
    if (check.unchanged) snapshot = structuredClone(args)
  } catch (e) {
    return fail(`ошибка в описании проверки (${(e as Error).message})`)
  }

  let fn: unknown
  try {
    fn = ctx.instantiate()[name]
  } catch (e) {
    return fail(`ошибка в коде решения: ${(e as Error).message}`)
  }
  if (typeof fn !== 'function') return fail(`экспорт «${name}» не найден или не является функцией`)

  const expectation = check.expect as Expectation
  const call = describeCall(named, args) // до вызова: решение может изменить аргументы
  const started = now()
  let value: unknown
  let thrown: unknown
  let didThrow = false
  try {
    value = (fn as (...a: unknown[]) => unknown)(...args)
    if (thenArgs) value = (value as (...a: unknown[]) => unknown)(...thenArgs)
    const wantsAsync = 'resolves' in expectation || 'rejects' in expectation || (value instanceof Promise && 'satisfies' in expectation)
    if (wantsAsync) value = await value
  } catch (e) {
    didThrow = true
    thrown = e
  }
  const elapsed = now() - started

  if ('rejects' in expectation) {
    // для rejects ошибка приходит из await выше
    if (!didThrow) return fail(`ожидался отказ промиса, получено ${format(value)}`)
    return matchesError(thrown, expectation.rejects) ? finish() : fail(`отказ с другой ошибкой: ${(thrown as Error)?.message ?? format(thrown)}`)
  }
  if ('throws' in expectation) {
    if (!didThrow) return fail(`ожидалась ошибка, получено ${format(value)}`)
    return matchesError(thrown, expectation.throws) ? finish() : fail(`другая ошибка: ${(thrown as Error)?.message ?? format(thrown)}`)
  }
  if (didThrow) return fail(`${call} бросил ошибку: ${(thrown as Error)?.message ?? format(thrown)}`)

  if ('equals' in expectation || 'resolves' in expectation) {
    const expected = resolveValue('equals' in expectation ? expectation.equals : expectation.resolves)
    if (!deepEqual(value, expected)) {
      return fail(`${call}: ожидалось ${format(expected)}, получено ${format(value)}`)
    }
  } else if ('satisfies' in expectation) {
    let ok = false
    try {
      ok = !!(evalJs(expectation.satisfies) as (r: unknown, a: unknown[]) => unknown)(value, args)
    } catch (e) {
      return fail(`ошибка в предикате проверки (${(e as Error).message})`)
    }
    if (!ok) return fail(`результат не удовлетворяет условию, получено ${format(value)}`)
  }
  return finish()

  function finish(): TestResult {
    if (snapshot && !deepEqual(args, snapshot)) return fail('функция изменила входные данные')
    if (check.maxMs !== undefined && elapsed > check.maxMs) {
      return fail(`слишком медленно: ${Math.round(elapsed)} мс при допустимых ${check.maxMs} мс`)
    }
    return pass()
  }
}
