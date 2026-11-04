import type { TaskDef } from './meta-types'

/* =============== FRONTEND TASKS: расширение банка (из материалов подготовки) =============== */
export const FE_EXTRA: TaskDef[] = [
  // ───────────── JUNIOR ─────────────
  {
    id: 'fe_groupBy',
    level: 'junior',
    title: 'groupBy(arr, iteratee)',
    exportName: 'groupBy',
    description:
      'Сгруппировать элементы по ключу (имя поля или функция). Порядок внутри группы сохраняется, исходный массив не меняется. Ключи — произвольный текст, в том числе constructor и toString.',
    starter: `export function groupBy<T>(arr: T[], iteratee: keyof T | ((item: T) => string | number)): Record<string, T[]> {
  // TODO: Реализуйте groupBy
  // iteratee — имя поля или функция, возвращающая ключ группы
  // Порядок элементов внутри группы — как во входном массиве
  // Ключи вроде "constructor" не должны ломать результат
  throw new Error('Not implemented');
}`,
    solution: `export function groupBy<T>(arr: T[], iteratee: keyof T | ((item: T) => string | number)): Record<string, T[]> {
  const getKey = typeof iteratee === 'function' ? iteratee : (item: T) => item[iteratee] as unknown as string | number;
  const groups = new Map<string, T[]>();
  for (const item of arr) {
    const key = String(getKey(item));
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  // Map не страдает от ключей вроде constructor; fromEntries создаёт собственные свойства
  return Object.fromEntries(groups);
}`,
  },
  {
    id: 'fe_once',
    level: 'junior',
    title: 'once(fn)',
    exportName: 'once',
    description:
      'Вернуть функцию, которая вызывает fn только один раз: следующие вызовы возвращают результат первого. this и аргументы берутся из первого вызова.',
    starter: `export function once<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {
  // TODO: Реализуйте once
  // Первый вызов выполняет fn и запоминает результат
  // Последующие вызовы fn не запускают и возвращают запомненный результат
  throw new Error('Not implemented');
}`,
    solution: `export function once<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {
  let called = false;
  let result: ReturnType<T>;
  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true; // флаг отдельно от результата: результат может быть 0, '' или undefined
      result = fn.apply(this, args);
    }
    return result;
  };
}`,
  },
  {
    id: 'fe_wordFrequency',
    level: 'junior',
    title: 'wordFrequency(text)',
    exportName: 'wordFrequency',
    description:
      'Подсчитать частоту слов без учёта регистра и знаков препинания. Вернуть пары [слово, количество], отсортированные по убыванию количества, при равенстве — по алфавиту.',
    starter: `export function wordFrequency(text: string): [string, number][] {
  // TODO: Реализуйте wordFrequency
  // Слова — последовательности букв и цифр (любой язык), регистр не важен
  // Сортировка: количество по убыванию, затем слово по алфавиту
  throw new Error('Not implemented');
}`,
    solution: `export function wordFrequency(text: string): [string, number][] {
  const counts = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[\\p{L}\\p{N}]+/gu) ?? []) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}`,
  },
  {
    id: 'fe_flattenObject',
    level: 'junior',
    title: 'flattenObject(obj)',
    exportName: 'flattenObject',
    description:
      'Превратить вложенный объект в плоский с ключами через точку: { a: { b: 1 } } → { "a.b": 1 }. Разворачиваются только обычные объекты; массивы, Date, null и примитивы остаются значениями.',
    starter: `export function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  // TODO: Реализуйте flattenObject
  // Вложенные обычные объекты разворачиваются: ключи склеиваются через точку
  // Массивы, Date, null и примитивы — конечные значения
  throw new Error('Not implemented');
}`,
    solution: `export function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? prefix + '.' + key : key;
    // обычный объект — только с прототипом Object.prototype или null: Date, Map и массивы остаются значениями
    const proto = value !== null && typeof value === 'object' ? Object.getPrototypeOf(value) : undefined;
    const isPlainObject = proto === Object.prototype || proto === null;
    if (isPlainObject) Object.assign(result, flattenObject(value, path));
    else result[path] = value;
  }
  return result;
}`,
  },

  // ───────────── MIDDLE ─────────────
  {
    id: 'fe_promiseAll',
    level: 'middle',
    title: 'promiseAll(items)',
    exportName: 'promiseAll',
    description:
      'Свой Promise.all: результаты в порядке входа, запуск параллельно, пустой массив даёт [], значения без промисов принимаются, первая ошибка отклоняет результат.',
    starter: `export function promiseAll<T>(items: (T | Promise<T>)[]): Promise<T[]> {
  // TODO: Реализуйте promiseAll без использования Promise.all
  // Результаты — в порядке входа, независимо от порядка завершения
  // Пустой массив — сразу []
  // Первая ошибка отклоняет итоговый промис
  throw new Error('Not implemented');
}`,
    solution: `export function promiseAll<T>(items: (T | Promise<T>)[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const result: T[] = [];
    let done = 0;
    if (items.length === 0) {
      resolve(result);
      return;
    }
    items.forEach((item, index) => {
      Promise.resolve(item).then((value) => {
        result[index] = value; // по индексу: элементы завершаются вразнобой
        done++;
        if (done === items.length) resolve(result);
      }, reject);
    });
  });
}`,
  },
  {
    id: 'fe_myBind',
    level: 'middle',
    title: 'myBind(fn, context, ...bound)',
    exportName: 'myBind',
    description:
      'Свой bind: вернуть функцию с прибитым контекстом и предзаданными аргументами. Контекст нельзя переопределить через call и apply.',
    starter: `export function myBind(fn: Function, context: any, ...bound: any[]): (...args: any[]) => any {
  // TODO: Реализуйте myBind без использования Function.prototype.bind
  // Возвращаемая функция вызывает fn с this = context
  // Аргументы: сначала bound, затем переданные при вызове
  throw new Error('Not implemented');
}`,
    solution: `export function myBind(fn: Function, context: any, ...bound: any[]): (...args: any[]) => any {
  return function (...callArgs: any[]) {
    return fn.apply(context, [...bound, ...callArgs]);
  };
}`,
  },
  {
    id: 'fe_buildTree',
    level: 'middle',
    title: 'buildTree(items)',
    exportName: 'buildTree',
    description:
      'Превратить плоский список с parentId в дерево. Порядок на входе произволен (потомок может идти раньше родителя), порядок детей сохраняется, элементы без найденного родителя отбрасываются, входные объекты не меняются.',
    starter: `export function buildTree(items: { id: number; parentId: number | null; [key: string]: any }[]): any[] {
  // TODO: Реализуйте buildTree за O(n)
  // У каждого узла результата — поле children (массив)
  // Корни — элементы с parentId === null
  // Сироты (родителя нет в списке) отбрасываются
  throw new Error('Not implemented');
}`,
    solution: `export function buildTree(items: { id: number; parentId: number | null; [key: string]: any }[]): any[] {
  const byId = new Map<number, any>();
  // Проход 1: узел для каждого элемента (копия: входные объекты менять нельзя)
  for (const item of items) byId.set(item.id, { ...item, children: [] });

  const roots: any[] = [];
  // Проход 2: связываем. Родитель может стоять в списке позже ребёнка — поэтому два прохода
  for (const item of items) {
    const node = byId.get(item.id);
    if (item.parentId === null) {
      roots.push(node);
      continue;
    }
    byId.get(item.parentId)?.children.push(node);
  }
  return roots;
}`,
  },
  {
    id: 'fe_buildPostsView',
    level: 'middle',
    title: 'buildPostsView(posts, comments, users)',
    exportName: 'buildPostsView',
    description:
      'Склеить три набора данных: для каждого поста вернуть { id, title, userName, commentsCount }. Порядок — как у постов. Требование: оптимально по времени и памяти.',
    starter: `export function buildPostsView(
  posts: { id: number; userId: number; title: string }[],
  comments: { id: number; postId: number }[],
  users: { id: number; name: string }[]
): { id: number; title: string; userName: string; commentsCount: number }[] {
  // TODO: Реализуйте buildPostsView
  // userName — name пользователя с id === post.userId
  // commentsCount — число комментариев с postId === post.id
  // Не перебирайте users и comments заново для каждого поста
  throw new Error('Not implemented');
}`,
    solution: `export function buildPostsView(
  posts: { id: number; userId: number; title: string }[],
  comments: { id: number; postId: number }[],
  users: { id: number; name: string }[]
): { id: number; title: string; userName: string; commentsCount: number }[] {
  const userNames = new Map<number, string>();
  for (const user of users) userNames.set(user.id, user.name);

  const commentCounts = new Map<number, number>();
  for (const comment of comments) {
    commentCounts.set(comment.postId, (commentCounts.get(comment.postId) ?? 0) + 1);
  }

  // O(u + c + p) вместо O(p * u + p * c)
  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    userName: userNames.get(post.userId) as string,
    commentsCount: commentCounts.get(post.id) ?? 0,
  }));
}`,
  },
  {
    id: 'fe_retry',
    level: 'middle',
    title: 'retry(fn, attempts)',
    exportName: 'retry',
    description:
      'Выполнить асинхронную fn до attempts раз: вернуть результат первой удачной попытки, а если все неудачны — отклониться последней ошибкой. fn получает номер попытки (с 0).',
    starter: `export async function retry<T>(fn: (attempt: number) => Promise<T>, attempts: number): Promise<T> {
  // TODO: Реализуйте retry
  // До attempts попыток; первая успешная — результат
  // Если все попытки неудачны — бросить ошибку ПОСЛЕДНЕЙ попытки
  // attempts < 1 — RangeError
  throw new Error('Not implemented');
}`,
    solution: `export async function retry<T>(fn: (attempt: number) => Promise<T>, attempts: number): Promise<T> {
  if (attempts < 1) throw new RangeError('attempts must be >= 1');
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}`,
  },
  {
    id: 'fe_eventEmitter',
    level: 'middle',
    title: 'createEmitter()',
    exportName: 'createEmitter',
    description:
      'Простой эмиттер событий: on (возвращает функцию отписки), off, once, emit. Отписка во время emit не должна пропускать других подписчиков; off(event, handler) снимает и подписку, сделанную через once.',
    starter: `export function createEmitter() {
  // TODO: Реализуйте createEmitter
  // on(event, handler) — подписка, возвращает функцию отписки
  // off(event, handler) — отписка
  // once(event, handler) — сработать один раз
  // emit(event, ...args) — вызвать подписчиков в порядке подписки
  throw new Error('Not implemented');
}`,
    solution: `export function createEmitter() {
  const handlers = new Map<string, Set<(...args: any[]) => void>>();

  // once подписывает обёртку; запоминаем, какой исходный обработчик она представляет
  const originals = new WeakMap<(...args: any[]) => void, (...args: any[]) => void>();

  function off(event: string, handler: (...args: any[]) => void) {
    const set = handlers.get(event);
    if (!set) return;
    if (set.delete(handler)) return;
    for (const h of set) {
      if (originals.get(h) === handler) {
        set.delete(h);
        return;
      }
    }
  }
  function on(event: string, handler: (...args: any[]) => void) {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
    return () => off(event, handler);
  }
  function once(event: string, handler: (...args: any[]) => void) {
    const wrapper = (...args: any[]) => {
      off(event, wrapper);
      handler(...args);
    };
    originals.set(wrapper, handler);
    return on(event, wrapper);
  }
  function emit(event: string, ...args: any[]) {
    // копия: подписчики могут отписываться прямо во время вызова
    for (const handler of [...(handlers.get(event) ?? [])]) handler(...args);
  }
  return { on, off, once, emit };
}`,
  },

  // ───────────── SENIOR ─────────────
  {
    id: 'fe_promisePool',
    level: 'senior',
    title: 'promisePool(tasks, limit)',
    exportName: 'promisePool',
    description:
      'Выполнить асинхронные задачи с ограничением параллелизма: одновременно не больше limit. Результаты — в порядке входа. При первой ошибке (в том числе синхронном исключении задачи) новые задачи не запускаются, итоговый промис отклоняется. limit < 1 — RangeError.',
    starter: `export function promisePool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  // TODO: Реализуйте promisePool
  // Одновременно выполняется не больше limit задач
  // Результаты — в порядке входа (а не в порядке завершения)
  // Первая ошибка отклоняет результат и останавливает запуск новых задач
  throw new Error('Not implemented');
}`,
    solution: `export function promisePool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  return new Promise((resolve, reject) => {
    // при limit 0 ни одна задача не стартует и промис повис бы навсегда
    if (!(limit >= 1)) {
      reject(new RangeError('limit must be >= 1'));
      return;
    }
    const results: T[] = new Array(tasks.length);
    let next = 0;
    let finished = 0;
    let failed = false;

    if (tasks.length === 0) {
      resolve(results);
      return;
    }

    const launch = () => {
      if (failed || next >= tasks.length) return;
      const index = next++;
      // Promise.resolve().then: синхронный throw задачи станет отказом, а не исключением внутри then-колбэка
      Promise.resolve()
        .then(() => tasks[index]())
        .then(
          (value) => {
            results[index] = value;
            finished++;
            if (finished === tasks.length) resolve(results);
            else launch(); // освободился слот — берём следующую задачу
          },
          (error) => {
            failed = true;
            reject(error);
          }
        );
    };

    for (let i = 0; i < Math.min(limit, tasks.length); i++) launch();
  });
}`,
  },
  {
    id: 'fe_deepMerge',
    level: 'senior',
    title: 'deepMerge(target, source)',
    exportName: 'deepMerge',
    description:
      'Глубокое слияние двух объектов в новый: вложенные обычные объекты сливаются рекурсивно, массивы и остальные значения заменяются значением из source. Входные объекты не меняются. Защита от prototype pollution: ключи __proto__, constructor и prototype игнорируются.',
    starter: `export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  // TODO: Реализуйте deepMerge
  // Обычные объекты сливаются рекурсивно, всё остальное (в том числе массивы) заменяется
  // Не мутируйте target и source
  // Ключи __proto__, constructor и prototype пропускайте
  throw new Error('Not implemented');
}`,
    solution: `const FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(target)) {
    if (FORBIDDEN.has(key)) continue;
    result[key] = isPlainObject(target[key]) ? deepMerge(target[key], {}) : target[key];
  }
  for (const key of Object.keys(source)) {
    if (FORBIDDEN.has(key)) continue;
    const value = source[key];
    result[key] =
      isPlainObject(value) && isPlainObject(result[key]) ? deepMerge(result[key], value) : isPlainObject(value) ? deepMerge({}, value) : value;
  }
  return result;
}`,
  },
  {
    id: 'fe_createStore',
    level: 'senior',
    title: 'createStore(reducer, initialState)',
    exportName: 'createStore',
    description:
      'Мини-аналог Redux: getState, dispatch(action), subscribe(listener) → отписка. Подписчики уведомляются после изменения состояния; если редьюсер вернул ту же ссылку, уведомления нет. Отписка во время уведомления безопасна.',
    starter: `export function createStore<S, A>(reducer: (state: S, action: A) => S, initialState: S) {
  // TODO: Реализуйте createStore
  // getState() — текущее состояние
  // dispatch(action) — применить редьюсер, уведомить подписчиков, если состояние изменилось
  // subscribe(listener) — вернуть функцию отписки
  throw new Error('Not implemented');
}`,
    solution: `export function createStore<S, A>(reducer: (state: S, action: A) => S, initialState: S) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    dispatch(action: A) {
      const next = reducer(state, action);
      if (Object.is(next, state)) return; // состояние не изменилось — тишина
      state = next;
      for (const listener of [...listeners]) listener(); // копия: можно отписываться по ходу
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}`,
  },
]
