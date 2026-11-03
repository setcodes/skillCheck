import type { UITask } from '@/entities/task/model/types'

/* =============== FRONTEND TASKS =============== */
export const FE: UITask[] = [
  // JUNIOR (8 задач) - Основы JavaScript
  { 
    id: 'fe_classNames', 
    level: 'junior', 
    title: 'classNames(...inputs)', 
    exportName: 'classNames',
    description: 'Собрать классы из строк/массивов/объектов, уникально, в порядке появления.',
    starter: `export function classNames(...inputs: any[]): string {
  // TODO: Реализуйте функцию classNames
  // Принимает: строки, массивы, объекты с boolean значениями
  // Возвращает: строку с уникальными классами в порядке появления
  // Пример: classNames('a', ['b', {c: true, b: false}], {a: true}, 'c') → 'a b c'
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { classNames } = m; 
assert.equal(classNames('a', ['b', {c: true, b: false}], {a: true}, 'c'), 'a b c');`,
    solution: `export function classNames(...inputs: any[]): string {
  const result: string[] = [];
  const seen = new Set<string>();
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string' || typeof input === 'number') {
      const str = String(input);
      if (!seen.has(str)) {
        seen.add(str);
        result.push(str);
      }
    } else if (Array.isArray(input)) {
      const inner = classNames(...input);
      if (inner) {
        const classes = inner.split(' ');
        for (const cls of classes) {
          if (cls && !seen.has(cls)) {
            seen.add(cls);
            result.push(cls);
          }
        }
      }
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value && !seen.has(key)) {
          seen.add(key);
          result.push(key);
        }
      }
    }
  }
  
  return result.join(' ');
}`
  },

  { 
    id: 'fe_isPalindrome', 
    level: 'junior', 
    title: 'isPalindrome(str)', 
    exportName: 'isPalindrome',
    description: 'Палиндром по графемам, игнорируя регистр и пробелы.',
    starter: `export function isPalindrome(str: unknown): boolean {
  // TODO: Реализуйте проверку палиндрома
  // Игнорируйте регистр и пробелы
  // Примеры: 'А роза упала на лапу Азора' → true, 'hello' → false
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { isPalindrome } = m; 
assert.equal(isPalindrome('А роза упала на лапу Азора'), true); 
assert.equal(isPalindrome('hello'), false);`,
    solution: `export function isPalindrome(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  
  // Нормализуем строку: убираем пробелы и приводим к нижнему регистру
  const normalized = str.replace(/\\s/g, '').toLowerCase();
  
  // Сравниваем с обратной строкой
  return normalized === normalized.split('').reverse().join('');
}`
  },

  { 
    id: 'fe_uniqueBy', 
    level: 'junior', 
    title: 'uniqueBy(arr, key)', 
    exportName: 'uniqueBy',
    description: 'Уникальные по ключу (строка или коллбек).',
    starter: `export function uniqueBy<T>(arr: T[], key: keyof T | ((x: T) => any)): T[] {
  // TODO: Реализуйте функцию uniqueBy
  // Принимает массив и ключ (строку или функцию)
  // Возвращает массив уникальных элементов по ключу
  // Пример: uniqueBy([{id:1}, {id:1}, {id:2}], 'id') → [{id:1}, {id:2}]
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { uniqueBy } = m; 
const a = [{id: 1}, {id: 1}, {id: 2}]; 
assert.deepEqual(uniqueBy(a, 'id'), [{id: 1}, {id: 2}]);`,
    solution: `export function uniqueBy<T>(arr: T[], key: keyof T | ((x: T) => any)): T[] {
  const seen = new Set();
  const result: T[] = [];
  
  for (const item of arr) {
    const keyValue = typeof key === 'function' ? key(item) : item[key];
    
    if (!seen.has(keyValue)) {
      seen.add(keyValue);
      result.push(item);
    }
  }
  
  return result;
}`
  },

  { 
    id: 'fe_chunk', 
    level: 'junior', 
    title: 'chunk(arr, size)', 
    exportName: 'chunk',
    description: 'Разбить массив на чанки.',
    starter: `export function chunk<T>(arr: T[], size: number): T[][] {
  // TODO: Реализуйте функцию chunk
  // Разбивает массив на чанки указанного размера
  // Пример: chunk([1,2,3,4,5], 2) → [[1,2], [3,4], [5]]
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { chunk } = m; 
assert.deepEqual(chunk([1,2,3,4,5], 2), [[1,2], [3,4], [5]]);`,
    solution: `export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [];
  
  const result: T[][] = [];
  
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  
  return result;
}`
  },

  { 
    id: 'fe_sumBy', 
    level: 'junior', 
    title: 'sumBy(arr, iteratee)', 
    exportName: 'sumBy',
    description: 'Сумма по свойству или функции.',
    starter: `export function sumBy<T>(arr: T[], it: keyof T | ((x: T) => number)): number {
  // TODO: Реализуйте функцию sumBy
  // Принимает массив и итератор (ключ или функцию)
  // Возвращает сумму значений
  // Пример: sumBy([{a:2}, {a:3}], 'a') → 5
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { sumBy } = m; 
assert.equal(sumBy([{a: 2}, {a: 3}], 'a'), 5);`,
    solution: `export function sumBy<T>(arr: T[], it: keyof T | ((x: T) => number)): number {
  return arr.reduce((sum, item) => {
    const value = typeof it === 'function' ? it(item) : item[it];
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
}`
  },

  { 
    id: 'fe_throttle', 
    level: 'junior', 
    title: 'throttle(fn, delay)', 
    exportName: 'throttle',
    description: 'Не чаще чем раз в delay мс (trailing=true).',
    starter: `export function throttle<T extends (...a: any[]) => any>(fn: T, delay = 200) {
  // TODO: Реализуйте функцию throttle
  // Ограничивает частоту вызовов функции
  // delay - минимальный интервал между вызовами в миллисекундах
  // trailing=true означает выполнение в конце интервала
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { throttle } = m; 
let n = 0; 
const f = () => n++; 
const t = throttle(f, 10); 
t(); 
t(); 
assert.equal(n, 1, 'throttle должен выполнить функцию только один раз при быстрых вызовах');`,
    solution: `export function throttle<T extends (...a: any[]) => any>(fn: T, delay = 200) {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: any[]) {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
      }, delay - (now - lastCall));
    }
  } as T;
}`
  },

  { 
    id: 'fe_safeGet', 
    level: 'junior', 
    title: 'safeGet(obj, path)', 
    exportName: 'safeGet',
    description: 'Безопасное получение значения по пути (a.b.c) с fallback.',
    starter: `export function safeGet(obj: any, path: string, defaultValue?: any): any {
  // TODO: Реализуйте функцию safeGet
  // Безопасно получает значение по пути в объекте
  // Пример: safeGet({a:{b:{c:1}}}, 'a.b.c') → 1
  // Пример: safeGet({a:{b:{c:1}}}, 'a.b.d', 'default') → 'default'
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { safeGet } = m; 
assert.equal(safeGet({a:{b:{c:1}}}, 'a.b.c'), 1); 
assert.equal(safeGet({a:{b:{c:1}}}, 'a.b.d', 'default'), 'default');`,
    solution: `export function safeGet(obj: any, path: string, defaultValue?: any): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
}`
  },

  { 
    id: 'fe_promiseAllSettled', 
    level: 'junior', 
    title: 'promiseAllSettled(promises)', 
    exportName: 'promiseAllSettled',
    description: 'Выполнить все промисы и вернуть результаты (успешные + ошибки).',
    starter: `export async function promiseAllSettled<T>(promises: Promise<T>[]): Promise<Array<{status: 'fulfilled'|'rejected', value?: T, reason?: any}>> {
  // TODO: Реализуйте функцию promiseAllSettled
  // Выполняет все промисы и возвращает результаты (успешные и с ошибками)
  // Не отклоняется при ошибке в любом из промисов
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { promiseAllSettled } = m; 
const results = await promiseAllSettled([Promise.resolve(1), Promise.reject('error')]); 
assert.equal(results.length, 2); 
assert.equal(results[0].status, 'fulfilled');`,
    solution: `export async function promiseAllSettled<T>(promises: Promise<T>[]): Promise<Array<{status: 'fulfilled'|'rejected', value?: T, reason?: any}>> {
  return Promise.all(promises.map(promise => 
    promise.then(
      value => ({ status: 'fulfilled' as const, value }),
      reason => ({ status: 'rejected' as const, reason })
    )
  ));
}`
  },

  // MIDDLE (8 задач) - React & Hooks
  { 
    id: 'fe_debounce', 
    level: 'middle', 
    title: 'debounce(fn, delay)', 
    exportName: 'debounce',
    description: 'Задержка последнего вызова, сохранить this/args; cancel().',
    starter: `export function debounce<T extends (...a: any[]) => any>(fn: T, delay = 200) {
  // TODO: Реализуйте функцию debounce
  // Откладывает выполнение функции до истечения delay мс после последнего вызова
  // Должна сохранять контекст (this) и аргументы
  // Должна иметь метод cancel() для отмены
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { debounce } = m; 
let n = 0; 
const d = debounce(() => n++, 20); 
assert.equal(typeof d, 'function', 'debounce должен вернуть функцию');
assert.equal(typeof d.cancel, 'function', 'debounce должен иметь метод cancel');
d(); 
d(); 
assert.equal(n, 0, 'Функция не должна выполниться сразу');
d.cancel();
assert.equal(typeof d.cancel, 'function', 'cancel должен быть функцией');`,
    solution: `export function debounce<T extends (...a: any[]) => any>(fn: T, delay = 200) {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debounced = function(this: any, ...args: any[]) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  } as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debounced;
}`
  },

  {
    id: 'fe_useState',
    level: 'middle',
    title: 'createState(initial)',
    exportName: 'createState',
    description: 'Мини-аналог useState без React: вернуть пару [getState, setState]. setState принимает значение или функцию от предыдущего значения.',
    starter: `export function createState<T>(initial: T): [() => T, (value: T | ((prev: T) => T)) => void] {
  // TODO: Реализуйте createState
  // Возвращает [getState, setState]
  // getState() всегда отдаёт актуальное значение
  // setState принимает значение или функцию (prev) => next
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createState } = m;
const [get, set] = createState(0);
assert.equal(get(), 0, 'начальное значение');
set(5);
assert.equal(get(), 5, 'set(5) заменяет значение');
set(prev => prev + 1);
assert.equal(get(), 6, 'функциональное обновление использует предыдущее значение');
const [getObj] = createState({ a: 1 });
assert.deepEqual(getObj(), { a: 1 }, 'работает с объектами');`,
    solution: `export function createState<T>(initial: T): [() => T, (value: T | ((prev: T) => T)) => void] {
  let state = initial;
  const get = () => state;
  const set = (value: T | ((prev: T) => T)) => {
    state = typeof value === 'function' ? (value as (prev: T) => T)(state) : value;
  };
  return [get, set];
}`
  },

  { 
    id: 'fe_useEffect', 
    level: 'middle', 
    title: 'useEffect(effect, deps?)', 
    exportName: 'useEffect',
    description: 'Реализовать useEffect хук с зависимостями и cleanup.',
    starter: `export function useEffect(effect: () => void | (() => void), deps?: any[]): void {
  // TODO: Реализуйте useEffect хук
  // Принимает функцию эффекта и массив зависимостей
  // Выполняет эффект при изменении зависимостей
  // Поддерживает cleanup функцию
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { useEffect } = m; 
let calls = 0; 
useEffect(() => { calls++; }); 
assert.equal(calls, 1);`,
    solution: `export function useEffect(effect: () => void | (() => void), deps?: any[]): void {
  // Упрощенная реализация - в реальности нужен более сложный механизм
  const cleanup = effect();
  if (typeof cleanup === 'function') {
    // В реальности cleanup вызывается при размонтировании
  }
}`
  },

  {
    id: 'fe_useMemo',
    level: 'middle',
    title: 'createMemo() → memo(fn, deps)',
    exportName: 'createMemo',
    description: 'Мини-аналог useMemo без React: createMemo() возвращает функцию memo(fn, deps), которая пересчитывает значение только при изменении зависимостей (сравнение по Object.is).',
    starter: `export function createMemo() {
  // TODO: Реализуйте createMemo
  // Возвращает функцию memo(fn, deps)
  // fn вызывается только если deps изменились (по Object.is) с прошлого вызова
  // Иначе возвращается прошлый результат
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createMemo } = m;
const memo = createMemo();
let calls = 0;
const compute = () => { calls++; return calls * 10; };
const first = memo(compute, [1, 'a']);
const second = memo(compute, [1, 'a']);
assert.equal(calls, 1, 'при тех же зависимостях fn вызывается один раз');
assert.equal(second, first, 'возвращается прошлый результат');
const third = memo(compute, [2, 'a']);
assert.equal(calls, 2, 'при изменении зависимостей значение пересчитывается');
assert.equal(third, 20, 'возвращается новое значение');
memo(compute, [2, 'a']);
assert.equal(calls, 2, 'после пересчёта снова кэшируется');`,
    solution: `export function createMemo() {
  let lastDeps: unknown[] | undefined;
  let lastValue: unknown;
  return function memo<T>(fn: () => T, deps: unknown[]): T {
    const changed =
      !lastDeps ||
      lastDeps.length !== deps.length ||
      deps.some((d, i) => !Object.is(d, lastDeps![i]));
    if (changed) {
      lastValue = fn();
      lastDeps = deps;
    }
    return lastValue as T;
  };
}`
  },

  { 
    id: 'fe_deepClone', 
    level: 'middle', 
    title: 'deepClone(obj)', 
    exportName: 'deepClone',
    description: 'Глубокое копирование (без функций/циклов).',
    starter: `export function deepClone<T>(x: T): T {
  // TODO: Реализуйте глубокое копирование
  // Поддерживает объекты, массивы, примитивы
  // Обрабатывает Date, RegExp, Array
  // Не копирует функции и циклические ссылки
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { deepClone } = m; 
const a = {u: {v: 1}, arr: [1, 2]}; 
const b = deepClone(a); 
(b as any).u.v = 2; 
assert.equal(a.u.v, 1);`,
    solution: `export function deepClone<T>(x: T): T {
  if (x === null || typeof x !== 'object') return x;
  
  if (x instanceof Date) return new Date(x.getTime()) as T;
  if (x instanceof Array) return x.map(item => deepClone(item)) as T;
  if (x instanceof RegExp) return new RegExp(x.source, x.flags) as T;
  
  const cloned = {} as T;
  for (const key in x) {
    if (x.hasOwnProperty(key)) {
      cloned[key] = deepClone(x[key]);
    }
  }
  
  return cloned;
}`
  },

  { 
    id: 'fe_curry', 
    level: 'middle', 
    title: 'curry(fn)', 
    exportName: 'curry',
    description: 'Каррирование функции произвольной арности.',
    starter: `export function curry(fn: Function) {
  // TODO: Реализуйте каррирование
  // Принимает функцию произвольной арности
  // Возвращает каррированную версию
  // Пример: curry((a,b,c) => a+b+c)(1)(2)(3) → 6
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { curry } = m; 
const add = (a: any, b: any, c: any) => a + b + c; 
const cur: any = curry(add); 
assert.equal(cur(1)(2)(3), 6);`,
    solution: `export function curry(fn: Function) {
  return function curried(...args: any[]) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2: any[]) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}`
  },

  { 
    id: 'fe_parseQuery', 
    level: 'middle', 
    title: 'parseQueryString(qs)', 
    exportName: 'parseQueryString',
    description: 'Разобрать ?a=1&b=2&a=3 → {a:[1,3],b:"2"}.',
    starter: `export function parseQueryString(qs: string) {
  // TODO: Реализуйте парсинг query string
  // Принимает строку вида "?a=1&b=2&a=3"
  // Возвращает объект с массивами для повторяющихся ключей
  // Пример: "?a=1&b=2&a=3" → {a: ['1', '3'], b: '2'}
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { parseQueryString } = m; 
assert.deepEqual(parseQueryString('?a=1&b=2&a=3'), {a: ['1', '3'], b: '2'});`,
    solution: `export function parseQueryString(qs: string) {
  if (!qs || qs[0] !== '?') return {};
  
  const params = qs.slice(1).split('&');
  const result: any = {};
  
  for (const param of params) {
    const [key, value] = param.split('=');
    if (key) {
      if (result[key]) {
        if (Array.isArray(result[key])) {
          result[key].push(value || '');
        } else {
          result[key] = [result[key], value || ''];
        }
      } else {
        result[key] = value || '';
      }
    }
  }
  
  return result;
}`
  },

  {
    id: 'fe_eventDelegate',
    level: 'middle',
    title: 'delegate(root, selector, type, handler)',
    exportName: 'delegate',
    description: 'Делегирование событий: один обработчик на root, срабатывает для потомков, подходящих под selector (через .closest()). Вернуть функцию отписки. В тестах используются лёгкие заглушки элементов.',
    starter: `export function delegate(root: Element, selector: string, type: string, handler: (this: Element, ev: Event) => void) {
  // TODO: Реализуйте делегирование событий
  // Привязывает ОДИН обработчик к root
  // Вызывает handler (с this = найденный элемент) только если event.target.closest(selector) нашёл элемент
  // Возвращает функцию, снимающую обработчик
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { delegate } = m;
const listeners: Record<string, (e: any) => void> = {};
const root: any = {
  addEventListener: (t: string, h: (e: any) => void) => { listeners[t] = h; },
  removeEventListener: (t: string, h: (e: any) => void) => { if (listeners[t] === h) delete listeners[t]; },
};
const li: any = { closest: (sel: string) => (sel === 'li.x' ? li : null), tag: 'li' };
const span: any = { closest: () => null, tag: 'span' };
const calls: any[] = [];
const off = delegate(root, 'li.x', 'click', function (this: any) { calls.push(this); });
assert.equal(typeof listeners.click, 'function', 'обработчик навешен на root');
listeners.click({ target: li });
assert.equal(calls.length, 1, 'срабатывает для подходящего элемента');
assert.ok(calls[0] === li, 'this — найденный элемент');
listeners.click({ target: span });
assert.equal(calls.length, 1, 'не срабатывает для неподходящего элемента');
off();
assert.equal(listeners.click, undefined, 'отписка снимает обработчик');`,
    solution: `export function delegate(root: Element, selector: string, type: string, handler: (this: Element, ev: Event) => void) {
  const eventHandler = (event: Event) => {
    const target = event.target as Element | null;
    const match = target?.closest(selector);
    if (match) handler.call(match, event);
  };
  root.addEventListener(type, eventHandler);
  return () => root.removeEventListener(type, eventHandler);
}`
  },

  { 
    id: 'fe_fetchJSON', 
    level: 'middle', 
    title: 'fetchJSON(url, {signal})', 
    exportName: 'fetchJSON',
    description: 'Безопасный fetch: ok/json/ошибки/отмена.',
    starter: `export async function fetchJSON(url: string, opts: RequestInit = {}) {
  // TODO: Реализуйте безопасный fetch
  // Проверяет response.ok
  // Парсит JSON
  // Обрабатывает ошибки
  // Поддерживает AbortController
  throw new Error('Not implemented');
}`,
    tests: `const orig = (global as any).fetch; 
(global as any).fetch = async (_u: any) => new Response(JSON.stringify({ok: true}), {status: 200}); 
import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { fetchJSON } = m; 
const r = await fetchJSON('/ok'); 
assert.equal(r.ok, true); 
(global as any).fetch = orig;`,
    solution: `export async function fetchJSON(url: string, opts: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...opts.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request was aborted');
    }
    throw error;
  }
}`
  },

  // SENIOR (8 задач) - Производительность и оптимизация
  { 
    id: 'fe_LRU', 
    level: 'senior', 
    title: 'LRUCache<K,V>', 
    exportName: 'LRUCache',
    description: 'Кэш с вытеснением LRU.',
    starter: `export class LRUCache<K, V> {
  // TODO: Реализуйте LRU Cache
  // Принимает максимальный размер
  // get(key) - получить значение
  // set(key, value) - установить значение
  // При превышении размера удаляет наименее используемый элемент
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { LRUCache } = m; 
const c = new LRUCache(2); 
c.set('a', 1); 
c.set('b', 2); 
assert.equal(c.get('a'), 1, 'get("a") должен вернуть 1');
c.set('c', 3); // должен вытеснить 'b'
assert.equal(c.get('b'), undefined, 'get("b") должен вернуть undefined после eviction');
assert.equal(c.get('c'), 3, 'get("c") должен вернуть 3');
assert.equal(c.get('a'), 1, 'get("a") должен все еще вернуть 1');`,
    solution: `export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Перемещаем в конец (наиболее недавно использованный)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Обновляем существующий ключ
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Удаляем наименее недавно использованный (первый элемент)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
}`
  },

  { 
    id: 'fe_deepEqual', 
    level: 'senior', 
    title: 'deepEqual(a, b)', 
    exportName: 'deepEqual',
    description: 'Глубокое сравнение без циклов.',
    starter: `export function deepEqual(a: any, b: any): boolean {
  // TODO: Реализуйте глубокое сравнение
  // Сравнивает объекты, массивы, примитивы
  // Обрабатывает Date, RegExp, Array
  // Не обрабатывает циклические ссылки
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { deepEqual } = m; 
assert.equal(deepEqual({x: [1, {y: 2}]}, {x: [1, {y: 2}]}), true);`,
    solution: `export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  if (Array.isArray(a) || Array.isArray(b)) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}`
  },

  { 
    id: 'fe_formatBytes', 
    level: 'senior', 
    title: 'formatBytes(n)', 
    exportName: 'formatBytes',
    description: 'Форматировать байты: 1536 → "1.5 KB".',
    starter: `export function formatBytes(n: number): string {
  // TODO: Реализуйте форматирование байтов
  // Принимает число байтов
  // Возвращает строку в человекочитаемом формате
  // Примеры: 1024 → "1 KB", 1536 → "1.5 KB", 1048576 → "1 MB"
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { formatBytes } = m; 
assert.equal(formatBytes(1536), '1.5 KB');`,
    solution: `export function formatBytes(n: number): string {
  if (n === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(n) / Math.log(k));
  
  return parseFloat((n / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}`
  },

  { 
    id: 'fe_memoize', 
    level: 'senior', 
    title: 'memoize(fn, keyFn?)', 
    exportName: 'memoize',
    description: 'Кэшировать результаты по ключу.',
    starter: `export function memoize<T extends (...a: any[]) => any>(fn: T, keyFn?: (...a: any[]) => string): T {
  // TODO: Реализуйте мемоизацию
  // Принимает функцию и опциональную функцию ключа
  // Кэширует результаты по ключу
  // Возвращает мемоизированную версию функции
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { memoize } = m; 
let n = 0; 
const f = (x: number) => {n++; return x * x}; 
const mfn: any = memoize(f); 
mfn(2); 
mfn(2); 
assert.equal(n, 1);`,
    solution: `export function memoize<T extends (...a: any[]) => any>(fn: T, keyFn?: (...a: any[]) => string): T {
  const cache = new Map<string, any>();
  
  return function(...args: any[]) {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}`
  },

  { 
    id: 'fe_flatten', 
    level: 'senior', 
    title: 'flatten(arr, depth=Infinity)', 
    exportName: 'flatten',
    description: 'Флэттенинг массива до глубины.',
    starter: `export function flatten(arr: any[], depth = Infinity): any[] {
  // TODO: Реализуйте флэттенинг массива
  // Принимает массив и глубину
  // Возвращает плоский массив
  // Примеры: flatten([1, [2, [3]]], 1) → [1, 2, [3]]; flatten([1, [2, [3]]], 2) → [1, 2, 3]
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { flatten } = m; 
assert.deepEqual(flatten([1, [2, [3]]], 1), [1, 2, [3]], 'depth=1');
assert.deepEqual(flatten([1, [2, [3]]], 2), [1, 2, 3], 'depth=2');
assert.deepEqual(flatten([1, [2, [3, [4]]]]), [1, 2, 3, 4], 'по умолчанию — до конца');
assert.deepEqual(flatten([1, [2]], 0), [1, [2]], 'depth=0 ничего не разворачивает');`,
    solution: `export function flatten(arr: any[], depth = Infinity): any[] {
  if (depth === 0) return arr;
  
  const result: any[] = [];
  
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatten(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  
  return result;
}`
  },

  { 
    id: 'fe_diffShallow', 
    level: 'senior', 
    title: 'diffShallow(a, b)', 
    exportName: 'diffShallow',
    description: 'Разница ключей (added/removed/changed).',
    starter: `export function diffShallow(a: any, b: any) {
  // TODO: Реализуйте поверхностное сравнение объектов
  // Принимает два объекта
  // Возвращает объект с added, removed, changed массивами
  // Пример: diffShallow({a:1, b:2}, {b:3, c:4}) → {added: ['c'], removed: ['a'], changed: ['b']}
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { diffShallow } = m; 
const d = diffShallow({a: 1, b: 2}, {b: 3, c: 4}); 
assert.equal(d.added[0], 'c'); 
assert.equal(d.removed[0], 'a');`,
    solution: `export function diffShallow(a: any, b: any) {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));
  
  // Находим добавленные ключи
  for (const key of keysB) {
    if (!keysA.has(key)) {
      added.push(key);
    }
  }
  
  // Находим удаленные ключи
  for (const key of keysA) {
    if (!keysB.has(key)) {
      removed.push(key);
    }
  }
  
  // Находим измененные ключи
  for (const key of keysA) {
    if (keysB.has(key) && a[key] !== b[key]) {
      changed.push(key);
    }
  }
  
  return { added, removed, changed };
}`
  },

  { 
    id: 'fe_compose', 
    level: 'senior', 
    title: 'compose(...fns)', 
    exportName: 'compose',
    description: 'Композиция функций справа налево.',
    starter: `export function compose(...fns: Function[]) {
  // TODO: Реализуйте композицию функций
  // Принимает массив функций
  // Возвращает функцию, которая применяет их справа налево
  // Пример: compose(f, g)(x) === f(g(x))
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { compose } = m; 
const f = (x: number) => x + 1; 
const g = (x: number) => x * 2; 
assert.equal((compose(f, g) as any)(3), f(g(3)));`,
    solution: `export function compose(...fns: Function[]) {
  if (fns.length === 0) {
    return (arg: any) => arg;
  }
  
  if (fns.length === 1) {
    return fns[0];
  }
  
  return fns.reduce((a, b) => (...args: any[]) => a(b(...args)));
}`
  },

  { 
    id: 'fe_virtualScroll', 
    level: 'senior', 
    title: 'VirtualScroll({items, height, itemHeight})', 
    exportName: 'VirtualScroll',
    description: 'Виртуальный скролл для больших списков.',
    starter: `export class VirtualScroll {
  // TODO: Реализуйте виртуальный скролл
  // Принимает items, height, itemHeight
  // Возвращает только видимые элементы
  // Оптимизирует рендеринг больших списков
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { VirtualScroll } = m; 
const vs = new VirtualScroll({items: Array.from({length: 1000}, (_, i) => i), height: 400, itemHeight: 20}); 
assert.ok(vs);`,
    solution: `export class VirtualScroll {
  private items: any[];
  private height: number;
  private itemHeight: number;
  private scrollTop: number = 0;
  
  constructor({items, height, itemHeight}: {items: any[], height: number, itemHeight: number}) {
    this.items = items;
    this.height = height;
    this.itemHeight = itemHeight;
  }
  
  getVisibleItems() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + Math.ceil(this.height / this.itemHeight), this.items.length);
    return this.items.slice(startIndex, endIndex);
  }
  
  setScrollTop(scrollTop: number) {
    this.scrollTop = scrollTop;
  }
}`
  }
]
