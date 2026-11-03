import type { TaskDef } from './meta-types'

/* =============== FRONTEND TASKS =============== */
export const FE: TaskDef[] = [
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
    description: 'Проверить, что строка — палиндром, игнорируя регистр и пробелы. Не строка — false.',
    starter: `export function isPalindrome(str: unknown): boolean {
  // TODO: Реализуйте проверку палиндрома
  // Игнорируйте регистр и пробелы
  // Примеры: 'А роза упала на лапу Азора' → true, 'hello' → false
  throw new Error('Not implemented');
}`,
    solution: `export function isPalindrome(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  
  // Нормализуем строку: убираем пробелы и приводим к нижнему регистру
  const normalized = str.replace(/\\s/g, '').toLowerCase();
  
  // Сравниваем с обратной строкой. [...s], а не split(''): split рвёт эмодзи на половинки суррогатной пары
  return normalized === [...normalized].reverse().join('');
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
    solution: `export function sumBy<T>(arr: T[], it: keyof T | ((x: T) => number)): number {
  return arr.reduce((sum, item) => {
    const value = typeof it === 'function' ? it(item) : item[it];
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
}`
  },

  { 
    id: 'fe_throttle', 
    level: 'middle', 
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
    solution: `export function throttle<T extends (...a: any[]) => any>(fn: T, delay = 200) {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function(this: any, ...args: any[]) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      // таймер мог опоздать: отложенный вызов уже не нужен, иначе получим два вызова подряд
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
      lastCall = now;
      return fn.apply(this, args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        timeoutId = null;
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
    description: 'Безопасно получить значение по пути "a.b.c" (индексы массива — тоже через точку). Если путь обрывается на null/undefined или итоговое значение undefined — вернуть defaultValue. Ложные значения 0, "" и false — найденные значения.',
    starter: `export function safeGet(obj: any, path: string, defaultValue?: any): any {
  // TODO: Реализуйте функцию safeGet
  // Безопасно получает значение по пути в объекте
  // Пример: safeGet({a:{b:{c:1}}}, 'a.b.c') → 1
  // Пример: safeGet({a:{b:{c:1}}}, 'a.b.d', 'default') → 'default'
  throw new Error('Not implemented');
}`,
    solution: `export function safeGet(obj: any, path: string, defaultValue?: any): any {
  let current = obj;
  for (const key of path.split('.')) {
    // null и undefined не имеют свойств; '' и 0 — имеют (у строки есть length)
    if (current == null) return defaultValue;
    current = current[key];
  }
  // reduce с подстановкой defaultValue посреди пути продолжил бы обход уже по нему
  return current === undefined ? defaultValue : current;
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
    solution: `export async function promiseAllSettled<T>(promises: Promise<T>[]): Promise<Array<{status: 'fulfilled'|'rejected', value?: T, reason?: any}>> {
  // Promise.resolve: во входе могут оказаться обычные значения, у них нет .then
  return Promise.all(promises.map(promise =>
    Promise.resolve(promise).then(
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
    solution: `export function debounce<T extends (...a: any[]) => any>(fn: T, delay = 200) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

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
    title: 'createEffects()',
    exportName: 'createEffects',
    description:
      'Мини-аналог useEffect без React: createEffects() возвращает { effect, unmount }. effect(fn, deps?) выполняет fn при первом вызове и каждый раз, когда зависимости изменились (Object.is по элементам); без deps — при каждом вызове, с пустым [] — один раз. Перед новым запуском вызывается cleanup предыдущего. unmount() вызывает последний cleanup.',
    starter: `export function createEffects() {
  // TODO: Реализуйте createEffects
  // effect(fn, deps?) — fn может вернуть функцию очистки (cleanup)
  //   первый вызов — всегда выполняет fn
  //   без deps — выполняет fn при каждом вызове
  //   с deps — только если deps изменились (сравнение каждого элемента через Object.is)
  //   перед повторным запуском вызывает cleanup предыдущего эффекта
  // unmount() — вызывает последний cleanup (один раз)
  throw new Error('Not implemented');
}`,
    solution: `export function createEffects() {
  let started = false;
  let lastDeps: unknown[] | undefined;
  let cleanup: (() => void) | undefined;

  function effect(fn: () => void | (() => void), deps?: unknown[]) {
    const changed =
      !started ||
      !deps ||
      !lastDeps ||
      deps.length !== lastDeps.length ||
      deps.some((d, i) => !Object.is(d, lastDeps![i]));
    if (!changed) return;

    cleanup?.(); // сначала убираем за предыдущим запуском
    cleanup = undefined;
    started = true;
    lastDeps = deps;
    const result = fn();
    if (typeof result === 'function') cleanup = result;
  }

  function unmount() {
    cleanup?.();
    cleanup = undefined;
  }

  return { effect, unmount };
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
    description: 'Глубокое копирование примитивов, массивов, обычных объектов (в том числе без прототипа), Date и RegExp. Функции и циклические ссылки не поддерживаются.',
    starter: `export function deepClone<T>(x: T): T {
  // TODO: Реализуйте глубокое копирование
  // Поддерживает объекты, массивы, примитивы
  // Обрабатывает Date, RegExp, Array
  // Не копирует функции и циклические ссылки
  throw new Error('Not implemented');
}`,
    solution: `export function deepClone<T>(x: T): T {
  if (x === null || typeof x !== 'object') return x;
  
  if (x instanceof Date) return new Date(x.getTime()) as T;
  if (x instanceof Array) return x.map(item => deepClone(item)) as T;
  if (x instanceof RegExp) return new RegExp(x.source, x.flags) as T;
  
  // Object.keys вместо for…in + x.hasOwnProperty: у Object.create(null) метода hasOwnProperty нет
  const cloned = {} as T;
  for (const key of Object.keys(x) as (keyof T)[]) {
    cloned[key] = deepClone(x[key]);
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
    description:
      'Разобрать строку запроса (с ведущим ? или без): ?a=1&b=2&a=3 → { a: ["1","3"], b: "2" }. Повторяющиеся ключи собираются в массив, ключ без значения даёт пустую строку, значения и ключи декодируются (%XX, + как пробел). Служебные имена вроде constructor — обычные ключи.',
    starter: `export function parseQueryString(qs: string): Record<string, string | string[]> {
  // TODO: Реализуйте parseQueryString
  // Один ключ — строка, повторяющийся — массив строк в порядке появления
  // Декодируйте ключи и значения; "+" — пробел; сломанные %-последовательности не должны бросать ошибку
  throw new Error('Not implemented');
}`,
    solution: `export function parseQueryString(qs: string): Record<string, string | string[]> {
  const decode = (s: string) => {
    try {
      return decodeURIComponent(s.replace(/\\+/g, ' '));
    } catch {
      return s; // сломанная последовательность — оставляем как есть
    }
  };
  const query = qs.startsWith('?') ? qs.slice(1) : qs;
  const map = new Map<string, string | string[]>();
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = decode(eq === -1 ? pair : pair.slice(0, eq));
    const value = eq === -1 ? '' : decode(pair.slice(eq + 1));
    if (!key) continue;
    const prev = map.get(key);
    if (prev === undefined) map.set(key, value);
    else map.set(key, Array.isArray(prev) ? [...prev, value] : [prev, value]);
  }
  // Map не страдает от ключей вроде constructor и __proto__
  return Object.fromEntries(map);
}`
  },

  {
    id: 'fe_eventDelegate',
    level: 'middle',
    title: 'delegate(root, selector, type, handler)',
    exportName: 'delegate',
    description: 'Делегирование событий: один обработчик на root, срабатывает для потомков, подходящих под selector (через .closest()); элемент, найденный выше root, не считается. Вернуть функцию отписки. В тестах используются лёгкие заглушки элементов: closest и contains.',
    starter: `export function delegate(root: Element, selector: string, type: string, handler: (this: Element, ev: Event) => void) {
  // TODO: Реализуйте делегирование событий
  // Привязывает ОДИН обработчик к root
  // Вызывает handler (с this = найденный элемент) только если event.target.closest(selector) нашёл элемент внутри root
  // Возвращает функцию, снимающую обработчик
  throw new Error('Not implemented');
}`,
    solution: `export function delegate(root: Element, selector: string, type: string, handler: (this: Element, ev: Event) => void) {
  const eventHandler = (event: Event) => {
    const target = event.target as Element | null;
    const match = target?.closest(selector);
    // closest идёт вверх и за пределы root: элемент выше по дереву — не наш
    if (match && root.contains(match)) handler.call(match, event);
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
    description:
      'Безопасная обёртка над fetch: ответ вне 2xx — ошибка со статусом в сообщении; 204 — null; иначе разобранный JSON. Опции и заголовки пользователя пробрасываются (headers может быть объектом или Headers), Content-Type: application/json ставится, только если есть body. Отмена через signal пробрасывается как есть — с именем AbortError, чтобы вызывающий код отличал её от сбоя.',
    starter: `export async function fetchJSON(url: string, opts: RequestInit = {}) {
  // TODO: Реализуйте безопасный fetch
  // Проверяет response.ok (fetch не отклоняется на 404 и 500)
  // 204 No Content — вернуть null; иначе разобрать JSON
  // Content-Type: application/json — только когда есть body
  // Ошибку отмены (AbortError) не переупаковывать
  throw new Error('Not implemented');
}`,
    solution: `export async function fetchJSON(url: string, opts: RequestInit = {}) {
  // new Headers принимает и объект, и Headers; спред Headers дал бы пустой объект
  const headers = new Headers(opts.headers);
  // Content-Type на GET без тела превращает запрос в «непростой» и вызывает лишний preflight
  if (opts.body != null && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  // Ошибку отмены не ловим и не переупаковываем: вызывающий код отличает её по name === 'AbortError'
  const response = await fetch(url, { ...opts, headers });
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status} \${response.statusText}\`.trim());
  }
  if (response.status === 204) return null; // тела нет — response.json() бросил бы SyntaxError
  return response.json();
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
  constructor(capacity: number) {
    throw new Error('Not implemented');
  }

  get(key: K): V | undefined {
    throw new Error('Not implemented');
  }

  set(key: K, value: V): void {
    throw new Error('Not implemented');
  }
}`,
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
    if (this.capacity <= 0) return; // кэш нулевой ёмкости ничего не хранит
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
    description: 'Глубокое сравнение: примитивы (NaN равен NaN), массивы, обычные объекты (порядок ключей не важен), Date, RegExp, Map и Set. Значения разных типов и с разными прототипами не равны. Циклические ссылки не поддерживаются.',
    starter: `export function deepEqual(a: any, b: any): boolean {
  // TODO: Реализуйте глубокое сравнение
  // Сравнивает объекты, массивы, примитивы
  // Обрабатывает Date, RegExp, Array
  // Не обрабатывает циклические ссылки
  throw new Error('Not implemented');
}`,
    solution: `export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  // NaN не равен самому себе по ===, но два NaN — одинаковые значения
  if (Number.isNaN(a) && Number.isNaN(b)) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== 'object' || typeof b !== 'object') return false;

  // Разные прототипы — разные сущности: Date и {}, массив и объект, Map и {}
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

  if (a instanceof Date) return a.getTime() === b.getTime();

  if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags;

  // У Map и Set нет собственных ключей — без отдельной ветки любые два Map «равны»
  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !deepEqual(value, b.get(key))) return false;
    }
    return true;
  }

  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    for (const value of a) if (!b.has(value)) return false;
    return true;
  }

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    // hasOwn вместо keysB.includes: O(1) на ключ вместо O(n)
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}`
  },

  { 
    id: 'fe_formatBytes', 
    level: 'middle', 
    title: 'formatBytes(n)', 
    exportName: 'formatBytes',
    description: 'Форматировать размер: до 1024 — "N Bytes", далее KB, MB, GB…; округление до двух знаков без хвостовых нулей (1536 → "1.5 KB", 0 → "0 Bytes").',
    starter: `export function formatBytes(n: number): string {
  // TODO: Реализуйте форматирование байтов
  // Принимает число байтов
  // Возвращает строку в человекочитаемом формате
  // Примеры: 1024 → "1 KB", 1536 → "1.5 KB", 1048576 → "1 MB"
  throw new Error('Not implemented');
}`,
    solution: `export function formatBytes(n: number): string {
  if (n === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  // Ограничиваем индекс: дробное n < 1 дало бы -1, огромное — выход за массив
  let i = Math.min(Math.max(0, Math.floor(Math.log(n) / Math.log(k))), sizes.length - 1);
  let value = parseFloat((n / Math.pow(k, i)).toFixed(2));
  // 1048575 байт округляются до 1024 KB — это уже 1 MB
  if (value >= k && i < sizes.length - 1) {
    i++;
    value = parseFloat((n / Math.pow(k, i)).toFixed(2));
  }

  return value + ' ' + sizes[i];
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
    level: 'middle', 
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
    level: 'middle', 
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
    title: 'VirtualScroll',
    exportName: 'VirtualScroll',
    description:
      'Расчёт виртуального списка. new VirtualScroll({ items, height, itemHeight }); setScrollTop(top) — положение прокрутки (ограничивается диапазоном [0, общая высота − height]); getRange() — { start, end } индексов видимых элементов (end не включается; частично видимая строка входит в диапазон); getVisibleItems() — видимые элементы; getOffsetTop() — смещение первого видимого элемента в пикселях; getTotalHeight() — высота всего списка.',
    starter: `export class VirtualScroll {
  constructor(options: { items: any[]; height: number; itemHeight: number }) {
    // TODO: сохраните параметры
  }

  setScrollTop(top: number): void {
    // TODO: запомните положение прокрутки, ограничив его допустимым диапазоном
    throw new Error('Not implemented');
  }

  getRange(): { start: number; end: number } {
    // TODO: индексы видимых элементов [start, end)
    throw new Error('Not implemented');
  }

  getVisibleItems(): any[] {
    throw new Error('Not implemented');
  }

  getOffsetTop(): number {
    throw new Error('Not implemented');
  }

  getTotalHeight(): number {
    throw new Error('Not implemented');
  }
}`,
    solution: `export class VirtualScroll {
  private scrollTop = 0;
  private items: any[];
  private height: number;
  private itemHeight: number;

  constructor({ items, height, itemHeight }: { items: any[]; height: number; itemHeight: number }) {
    this.items = items;
    this.height = height;
    this.itemHeight = itemHeight;
  }

  getTotalHeight(): number {
    return this.items.length * this.itemHeight;
  }

  setScrollTop(top: number): void {
    const max = Math.max(0, this.getTotalHeight() - this.height);
    this.scrollTop = Math.min(Math.max(0, top), max);
  }

  getRange(): { start: number; end: number } {
    const start = Math.floor(this.scrollTop / this.itemHeight);
    // ceil: частично видимая нижняя строка тоже должна быть отрисована
    const end = Math.min(this.items.length, Math.ceil((this.scrollTop + this.height) / this.itemHeight));
    return { start, end };
  }

  getVisibleItems(): any[] {
    const { start, end } = this.getRange();
    return this.items.slice(start, end);
  }

  getOffsetTop(): number {
    return this.getRange().start * this.itemHeight;
  }
}`
  }
]
