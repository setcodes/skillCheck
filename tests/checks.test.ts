import { describe, it, expect } from 'vitest'
import { runInSandbox } from '@/shared/runner/core'
import { deepEqual, format } from '@/shared/runner/checks'
import { describeChecks } from '@/shared/runner/describe-checks'
import type { Check } from '@/entities/task/model/checks'

const run = (code: string, checks: Check[], exportName = 'f') => runInSandbox({ code, checks, exportName })

describe('deepEqual', () => {
  it('строгое равенство по значению', () => {
    expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true)
    expect(deepEqual(NaN, NaN)).toBe(true)
    expect(deepEqual(0, -0)).toBe(true)
    expect(deepEqual(new Date(1), new Date(1))).toBe(true)
    expect(deepEqual(new Map([[1, { a: 1 }]]), new Map([[1, { a: 1 }]]))).toBe(true)
    expect(deepEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true)
  })
  it('различает undefined-свойства, массив и объект, типы', () => {
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false)
    expect(deepEqual([1], { 0: 1 })).toBe(false)
    expect(deepEqual(1, '1')).toBe(false)
    expect(deepEqual(null, undefined)).toBe(false)
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
  })
})

describe('format', () => {
  it('показывает undefined, NaN, функции, даты и обрезает длинное', () => {
    expect(format({ a: undefined, b: NaN })).toBe('{"a":undefined,"b":NaN}')
    expect(format([() => 1])).toBe('[«функция»]')
    expect(format({ d: new Date(0) })).toBe('{"d":Date 1970-01-01T00:00:00.000Z}')
    expect(format('x'.repeat(500), 50).length).toBe(50)
    expect(format(undefined)).toBe('undefined')
  })
})

describe('декларативные проверки: вызов и ожидание', () => {
  const code = `export function f(a, b) { return a + b }`

  it('equals: успех и сообщение «ожидалось / получено» при провале', async () => {
    const { results } = await run(code, [
      { type: 'call', title: 'сумма', args: [1, 2], expect: { equals: 3 } },
      { type: 'call', title: 'сумма неверно', args: [1, 2], expect: { equals: 4 } },
    ])
    expect(results[0]).toEqual({ ok: true, message: 'сумма' })
    expect(results[1].ok).toBe(false)
    expect(results[1].message).toBe('сумма неверно: f(1, 2): ожидалось 4, получено 3')
  })

  it('$js в аргументах и ожидаемом значении (функции, undefined, Date)', async () => {
    const { results } = await run(`export function f(list, fn) { return list.map(fn) }`, [
      { type: 'call', title: 'map', args: [[1, 2], { $js: 'x => x * 2' }], expect: { equals: [2, 4] } },
      { type: 'call', title: 'undefined', args: { $js: '[[undefined], x => x]' }, expect: { equals: { $js: '[undefined]' } } },
    ])
    expect(results.map((r) => r.ok)).toEqual([true, true])
  })

  it('then: вызов результата; throws и rejects; resolves', async () => {
    const { results } = await run(
      `export const f = (a) => (b) => a * b
       export function boom() { throw new TypeError('плохо') }
       export async function later(x) { return x + 1 }
       export async function bad() { throw new Error('async плохо') }`,
      [
        { type: 'call', title: 'then', args: [3], then: [4], expect: { equals: 12 } },
        { type: 'call', title: 'throws по имени', fn: 'boom', args: [], expect: { throws: 'TypeError' } },
        { type: 'call', title: 'throws по сообщению', fn: 'boom', args: [], expect: { throws: 'плох' } },
        { type: 'call', title: 'не бросает', fn: 'later', args: [1], expect: { throws: true } },
        { type: 'call', title: 'resolves', fn: 'later', args: [1], expect: { resolves: 2 } },
        { type: 'call', title: 'rejects', fn: 'bad', args: [], expect: { rejects: 'async' } },
      ]
    )
    expect(results.map((r) => r.ok)).toEqual([true, true, true, false, true, true])
    expect(results[3].message).toContain('ожидалась ошибка')
  })

  it('satisfies: предикат получает результат и аргументы', async () => {
    const { results } = await run(code, [
      { type: 'call', title: 'ok', args: [2, 3], expect: { satisfies: '(r, a) => r === a[0] + a[1]' } },
      { type: 'call', title: 'не ok', args: [2, 3], expect: { satisfies: '(r) => r === 0' } },
    ])
    expect(results.map((r) => r.ok)).toEqual([true, false])
  })

  it('unchanged ловит мутацию входных данных', async () => {
    const { results } = await run(`export function f(a) { a.push(1); return a.length }`, [
      { type: 'call', title: 'мутирует', args: [[]], expect: { equals: 1 }, unchanged: true },
      { type: 'call', title: 'не проверяем', args: [[]], expect: { equals: 1 } },
    ])
    expect(results[0]).toMatchObject({ ok: false, message: 'мутирует: функция изменила входные данные' })
    expect(results[1].ok).toBe(true)
  })

  it('maxMs ловит медленные решения', async () => {
    const { results } = await run(`export function f() { const t = Date.now(); while (Date.now() - t < 30) {} return 1 }`, [
      { type: 'call', title: 'быстро', args: [], expect: { equals: 1 }, maxMs: 5 },
    ])
    expect(results[0].ok).toBe(false)
    expect(results[0].message).toContain('слишком медленно')
  })

  it('отсутствующий экспорт, исключение в решении и ошибка в описании проверки — понятные сообщения', async () => {
    const out = await run(`export function g() { throw new Error('упало') }`, [
      { type: 'call', title: 'нет f', args: [], expect: { equals: 1 } },
      { type: 'call', title: 'падает', fn: 'g', args: [], expect: { equals: 1 } },
      { type: 'call', title: 'плохой $js', args: { $js: '[' }, fn: 'g', expect: { equals: 1 } },
    ])
    expect(out.results[0].message).toContain('экспорт «f» не найден')
    expect(out.results[1].message).toContain('бросил ошибку: упало')
    expect(out.results[2].message).toContain('ошибка в описании проверки')
  })

  it('hidden помечает результаты; сценарные проверки работают рядом с декларативными', async () => {
    const { results } = await run(code, [
      { type: 'call', title: 'видимая', args: [1, 1], expect: { equals: 2 } },
      { type: 'call', title: 'скрытая', args: [2, 2], expect: { equals: 4 }, hidden: true },
      { type: 'script', hidden: true, code: "import * as m from 'MODULE'; const { f } = m; assert.equal(f(1, 2), 3, 'сценарий');" },
    ])
    expect(results.map((r) => [r.message, !!r.hidden])).toEqual([['видимая', false], ['скрытая', true], ['сценарий', true]])
  })

  it('каждая проверка получает свежий экземпляр модуля решения (состояние не протекает)', async () => {
    const { results } = await run(`let n = 0; export function f() { return ++n }`, [
      { type: 'call', title: 'первый вызов', args: [], expect: { equals: 1 } },
      { type: 'call', title: 'снова первый', args: [], expect: { equals: 1 } },
    ])
    expect(results.map((r) => r.ok)).toEqual([true, true])
  })

  it('синтаксическая ошибка решения — один понятный результат', async () => {
    const out = await run('export function f( {', [{ type: 'call', title: 'x', args: [], expect: { equals: 1 } }])
    expect(out.results).toHaveLength(1)
    expect(out.results[0].message).toMatch(/Ошибка в коде решения/)
  })
})

describe('describeChecks', () => {
  it('описывает видимые проверки читаемо, скрытые не раскрывает', () => {
    const text = describeChecks(
      [
        { type: 'call', title: 'сумма', args: [1, 2], expect: { equals: 3 } },
        { type: 'call', title: 'с функцией', args: [[1], { $js: 'x => x' }], expect: { equals: [1] }, unchanged: true },
        { type: 'call', title: 'скрытая', args: [9], expect: { equals: 9 }, hidden: true },
      ],
      'f'
    )
    expect(text).toContain('// сумма\nf(1, 2) → 3')
    expect(text).toContain('f([1], x => x) → [1]')
    expect(text).toContain('вход не меняется')
    expect(text).not.toContain('скрытая')
  })
})
