import type { UITask } from '@/entities/task/model/types'

/* =============== FRONTEND TASKS: расширение банка (из материалов подготовки) =============== */
export const FE_EXTRA: UITask[] = [
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
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { groupBy } = m;
const products = [
  { id: 1, title: 'Ноутбук', category: 'техника', price: 90000 },
  { id: 2, title: 'Куртка', category: 'одежда', price: 12000 },
  { id: 3, title: 'Монитор', category: 'техника', price: 25000 },
  { id: 4, title: 'Шарф', category: 'одежда', price: 2000 },
];
const byCat = groupBy(products, 'category');
assert.deepEqual(Object.keys(byCat), ['техника', 'одежда'], 'названия групп в порядке появления');
assert.deepEqual(byCat['техника'].map((p: any) => p.id), [1, 3], 'порядок внутри группы сохраняется');
const byPrice = groupBy(products, (p: any) => (p.price > 10000 ? 'дорого' : 'дёшево'));
assert.deepEqual(byPrice['дорого'].map((p: any) => p.id), [1, 2, 3], 'группировка по функции');
assert.deepEqual(groupBy([], 'x'), {}, 'пустой массив — пустой объект');
const tricky = groupBy([{ k: 'constructor' }, { k: 'toString' }, { k: 'constructor' }], 'k');
assert.deepEqual(Object.keys(tricky), ['constructor', 'toString'], 'служебные имена — обычные ключи');
assert.equal(tricky['constructor'].length, 2, 'в constructor лежит массив из двух элементов');
const input = [{ k: 'a' }];
groupBy(input, 'k');
assert.equal(input.length, 1, 'исходный массив не меняется');`,
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
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { once } = m;
let calls = 0;
const init = once((x: number) => { calls++; return x * 2; });
assert.equal(init(5), 10, 'первый вызов возвращает результат');
assert.equal(init(100), 10, 'повторный вызов возвращает прежний результат');
assert.equal(calls, 1, 'исходная функция вызвана один раз');
const obj = { n: 7, get: once(function (this: any) { return this.n; }) };
assert.equal(obj.get(), 7, 'this берётся из первого вызова');
const falsy = once(() => { calls++; return 0; });
falsy(); falsy();
assert.equal(calls, 2, 'результат 0 тоже кэшируется (проверка не по значению)');
const throwing = once(() => { throw new Error('boom'); });
let first = ''; try { throwing(); } catch (e: any) { first = e.message; }
assert.equal(first, 'boom', 'ошибка первого вызова пробрасывается');`,
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
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { wordFrequency } = m;
assert.deepEqual(wordFrequency('a b a c b a'), [['a', 3], ['b', 2], ['c', 1]], 'базовый подсчёт');
assert.deepEqual(wordFrequency('Привет, мир! привет.'), [['привет', 2], ['мир', 1]], 'регистр и знаки препинания');
assert.deepEqual(wordFrequency('b a'), [['a', 1], ['b', 1]], 'при равенстве — по алфавиту');
assert.deepEqual(wordFrequency(''), [], 'пустая строка');
assert.deepEqual(wordFrequency('  ...  '), [], 'только разделители');
assert.deepEqual(wordFrequency('x1 X1 x2'), [['x1', 2], ['x2', 1]], 'цифры входят в слова');
assert.deepEqual(wordFrequency('constructor constructor'), [['constructor', 2]], 'служебные слова не ломают счётчик');`,
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
      'Превратить вложенный объект в плоский с ключами через точку: { a: { b: 1 } } → { "a.b": 1 }. Массивы и не-объекты остаются значениями.',
    starter: `export function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  // TODO: Реализуйте flattenObject
  // Вложенные обычные объекты разворачиваются: ключи склеиваются через точку
  // Массивы, null и примитивы — конечные значения
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { flattenObject } = m;
assert.deepEqual(flattenObject({ a: { b: 1, c: { d: 2 } }, e: 3 }), { 'a.b': 1, 'a.c.d': 2, e: 3 }, 'вложенность');
assert.deepEqual(flattenObject({ list: [1, { x: 1 }] }), { list: [1, { x: 1 }] }, 'массив остаётся значением');
assert.deepEqual(flattenObject({ a: null, b: undefined, c: 0 }), { a: null, b: undefined, c: 0 }, 'null, undefined и 0 — значения');
assert.deepEqual(flattenObject({}), {}, 'пустой объект');
const input = { a: { b: 1 } };
flattenObject(input);
assert.deepEqual(input, { a: { b: 1 } }, 'исходный объект не меняется');`,
    solution: `export function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? prefix + '.' + key : key;
    const isPlainObject = value !== null && typeof value === 'object' && !Array.isArray(value);
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
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { promiseAll } = m;
const delay = (ms: number, value?: any) => new Promise((r) => setTimeout(() => r(value), ms));
const fail = (ms: number, msg: string) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));
assert.deepEqual(await promiseAll([delay(30, 'slow'), delay(5, 'fast')]), ['slow', 'fast'], 'порядок как на входе');
assert.deepEqual(await promiseAll([]), [], 'пустой массив');
assert.deepEqual(await promiseAll([1, 'two', true]), [1, 'two', true], 'значения без промисов');
const started = Date.now();
await promiseAll([delay(150), delay(150), delay(150)]);
assert.ok(Date.now() - started < 350, 'выполняется параллельно, а не по очереди (3 × 150 мс идут одновременно)');
let message = 'не отклонился';
try { await promiseAll([delay(100, 'x'), fail(5, 'boom')]); } catch (e: any) { message = e.message; }
assert.equal(message, 'boom', 'первая ошибка отклоняет результат');`,
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
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { myBind } = m;
function greet(this: any, greeting: string, punctuation: string) {
  return greeting + ', ' + this.name + punctuation;
}
const user = { name: 'Анна' };
const bound = myBind(greet, user, 'Привет');
assert.equal(bound('!'), 'Привет, Анна!', 'предзаданные аргументы идут первыми');
const other = { name: 'Кто-то' };
assert.equal(bound.call(other, '?'), 'Привет, Анна?', 'контекст нельзя перебить через call');
assert.equal(myBind(greet, user)('Здравствуй', '.'), 'Здравствуй, Анна.', 'без предзаданных аргументов');
assert.equal(typeof bound, 'function', 'возвращается функция');`,
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
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { buildTree } = m;
const flat = [
  { id: 3, parentId: 1, name: 'Ноутбуки' },
  { id: 1, parentId: null, name: 'Электроника' },
  { id: 4, parentId: 2, name: 'Куртки' },
  { id: 2, parentId: null, name: 'Одежда' },
  { id: 5, parentId: 3, name: 'Игровые' },
];
assert.deepEqual(buildTree(flat), [
  { id: 1, parentId: null, name: 'Электроника', children: [
    { id: 3, parentId: 1, name: 'Ноутбуки', children: [{ id: 5, parentId: 3, name: 'Игровые', children: [] }] },
  ] },
  { id: 2, parentId: null, name: 'Одежда', children: [{ id: 4, parentId: 2, name: 'Куртки', children: [] }] },
], 'два корня, три уровня, потомок раньше родителя');
assert.deepEqual(buildTree([]), [], 'пустой список');
assert.deepEqual(buildTree([{ id: 1, parentId: 99, name: 'X' }]), [], 'сирота отбрасывается');
const ordered = buildTree([
  { id: 1, parentId: null, name: 'root' },
  { id: 2, parentId: 1, name: 'второй' },
  { id: 3, parentId: 1, name: 'третий' },
]);
assert.deepEqual(ordered[0].children.map((c: any) => c.id), [2, 3], 'порядок детей сохраняется');
const input = [{ id: 1, parentId: null, name: 'A' }];
buildTree(input);
assert.equal((input[0] as any).children, undefined, 'входные объекты не мутируются');
const big = Array.from({ length: 30000 }, (_, i) => ({ id: i + 1, parentId: i === 0 ? null : Math.floor(i / 2) + 0 || null, name: 'n' }));
const started = Date.now();
buildTree(big);
assert.ok(Date.now() - started < 1000, 'на 30 000 элементов работает быстро (линейно)');`,
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
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { buildPostsView } = m;
const users = [{ id: 1, name: 'Анна' }, { id: 2, name: 'Борис' }];
const posts = [
  { id: 10, userId: 2, title: 'Второй автор' },
  { id: 11, userId: 1, title: 'Первый автор' },
  { id: 12, userId: 1, title: 'Без комментариев' },
];
const comments = [{ id: 1, postId: 10 }, { id: 2, postId: 10 }, { id: 3, postId: 11 }];
assert.deepEqual(buildPostsView(posts, comments, users), [
  { id: 10, title: 'Второй автор', userName: 'Борис', commentsCount: 2 },
  { id: 11, title: 'Первый автор', userName: 'Анна', commentsCount: 1 },
  { id: 12, title: 'Без комментариев', userName: 'Анна', commentsCount: 0 },
], 'имя автора и число комментариев, порядок как у постов');
assert.deepEqual(buildPostsView([], comments, users), [], 'нет постов');
const N = 30000;
const bigUsers = Array.from({ length: N }, (_, i) => ({ id: i, name: 'u' + i }));
const bigPosts = Array.from({ length: N }, (_, i) => ({ id: i, userId: N - 1 - i, title: 't' }));
const bigComments = Array.from({ length: N }, (_, i) => ({ id: i, postId: i % 100 }));
const started = Date.now();
const result = buildPostsView(bigPosts, bigComments, bigUsers);
assert.ok(Date.now() - started < 1000, 'на 30 000 записей — быстро (без вложенных циклов)');
assert.equal(result[0].userName, 'u' + (N - 1), 'большой набор собран верно');`,
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
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { retry } = m;
let calls = 0;
const flaky = async (attempt: number) => { calls++; if (attempt < 2) throw new Error('fail ' + attempt); return 'ok'; };
assert.equal(await retry(flaky, 5), 'ok', 'возвращает результат первой удачной попытки');
assert.equal(calls, 3, 'после успеха новых попыток нет');
let seen: number[] = [];
let message = '';
try { await retry(async (a: number) => { seen.push(a); throw new Error('e' + a); }, 3); } catch (e: any) { message = e.message; }
assert.deepEqual(seen, [0, 1, 2], 'номера попыток идут с нуля');
assert.equal(message, 'e2', 'отклоняется ошибкой последней попытки');
let first = 0;
assert.equal(await retry(async () => { first++; return 1; }, 3), 1, 'успех с первого раза');
assert.equal(first, 1, 'одна попытка');
let rangeError = '';
try { await retry(async () => 1, 0); } catch (e: any) { rangeError = e.name; }
assert.equal(rangeError, 'RangeError', 'attempts < 1 — RangeError');`,
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
      'Простой эмиттер событий: on (возвращает функцию отписки), off, once, emit. Отписка во время emit не должна пропускать других подписчиков.',
    starter: `export function createEmitter() {
  // TODO: Реализуйте createEmitter
  // on(event, handler) — подписка, возвращает функцию отписки
  // off(event, handler) — отписка
  // once(event, handler) — сработать один раз
  // emit(event, ...args) — вызвать подписчиков в порядке подписки
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createEmitter } = m;
const em = createEmitter();
const log: string[] = [];
const offA = em.on('x', (v: string) => log.push('a' + v));
em.on('x', (v: string) => log.push('b' + v));
em.emit('x', 1);
assert.deepEqual(log, ['a1', 'b1'], 'подписчики вызываются в порядке подписки');
offA();
em.emit('x', 2);
assert.deepEqual(log, ['a1', 'b1', 'b2'], 'функция отписки работает');
const em2 = createEmitter();
let n = 0;
em2.once('e', () => n++);
em2.emit('e'); em2.emit('e');
assert.equal(n, 1, 'once срабатывает один раз');
const em3 = createEmitter();
const order: string[] = [];
const first = () => { order.push('first'); em3.off('e', first); };
em3.on('e', first);
em3.on('e', () => order.push('second'));
em3.emit('e');
assert.deepEqual(order, ['first', 'second'], 'отписка во время emit не пропускает следующего');
em3.emit('e');
assert.deepEqual(order, ['first', 'second', 'second'], 'после отписки первый не вызывается');
assert.equal(createEmitter().emit('nobody'), undefined, 'emit без подписчиков не падает');`,
    solution: `export function createEmitter() {
  const handlers = new Map<string, Set<(...args: any[]) => void>>();

  function off(event: string, handler: (...args: any[]) => void) {
    handlers.get(event)?.delete(handler);
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
      'Выполнить асинхронные задачи с ограничением параллелизма: одновременно не больше limit. Результаты — в порядке входа. При первой ошибке новые задачи не запускаются, итоговый промис отклоняется.',
    starter: `export function promisePool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  // TODO: Реализуйте promisePool
  // Одновременно выполняется не больше limit задач
  // Результаты — в порядке входа (а не в порядке завершения)
  // Первая ошибка отклоняет результат и останавливает запуск новых задач
  throw new Error('Not implemented');
}`,
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { promisePool } = m;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let running = 0, peak = 0;
const make = (i: number, ms: number) => async () => { running++; peak = Math.max(peak, running); await sleep(ms); running--; return i; };
const result = await promisePool([make(0, 30), make(1, 5), make(2, 10), make(3, 5), make(4, 1)], 2);
assert.deepEqual(result, [0, 1, 2, 3, 4], 'результаты в порядке входа');
assert.equal(peak, 2, 'одновременно не больше limit задач (и лимит используется полностью)');
assert.deepEqual(await promisePool([], 3), [], 'пустой список');
assert.deepEqual(await promisePool([async () => 1, async () => 2], 10), [1, 2], 'limit больше числа задач');
let started = 0;
const failing = [
  async () => { started++; await sleep(5); throw new Error('boom'); },
  async () => { started++; await sleep(50); return 1; },
  async () => { started++; return 2; },
  async () => { started++; return 3; },
];
let message = 'не отклонился';
try { await promisePool(failing, 2); } catch (e: any) { message = e.message; }
assert.equal(message, 'boom', 'ошибка отклоняет итоговый промис');
await sleep(80);
assert.equal(started, 2, 'после ошибки новые задачи не запускаются');`,
    solution: `export function promisePool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  return new Promise((resolve, reject) => {
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
      tasks[index]().then(
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
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { deepMerge } = m;
assert.deepEqual(deepMerge({ a: 1, b: { c: 2, d: 3 } }, { b: { c: 20 }, e: 5 }), { a: 1, b: { c: 20, d: 3 }, e: 5 }, 'рекурсивное слияние');
assert.deepEqual(deepMerge({ list: [1, 2] }, { list: [3] }), { list: [3] }, 'массивы заменяются');
assert.deepEqual(deepMerge({ a: { b: 1 } }, { a: null }), { a: null }, 'null из source заменяет объект');
const target = { a: { b: 1 } };
const source = { a: { c: 2 } };
const merged = deepMerge(target, source);
assert.deepEqual(target, { a: { b: 1 } }, 'target не меняется');
assert.deepEqual(source, { a: { c: 2 } }, 'source не меняется');
assert.ok(merged.a !== target.a && merged.a !== source.a, 'вложенный объект результата — новый');
const viaProto = deepMerge({}, JSON.parse('{"__proto__": {"polluted": true}}'));
assert.equal(({} as any).polluted, undefined, 'глобальный Object.prototype не загрязняется');
assert.equal(viaProto.polluted, undefined, 'результат не наследует свойства из __proto__ источника');
assert.ok(Object.getPrototypeOf(viaProto) === Object.prototype, 'прототип результата не подменяется');
deepMerge({}, JSON.parse('{"constructor": {"prototype": {"polluted2": true}}}'));
assert.equal(({} as any).polluted2, undefined, 'prototype pollution невозможен через constructor.prototype');`,
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
    tests: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createStore } = m;
const reducer = (state: { n: number }, action: { type: string }) => {
  if (action.type === 'inc') return { n: state.n + 1 };
  return state;
};
const store = createStore(reducer, { n: 0 });
assert.deepEqual(store.getState(), { n: 0 }, 'начальное состояние');
let notified = 0;
const unsubscribe = store.subscribe(() => notified++);
store.dispatch({ type: 'inc' });
assert.deepEqual(store.getState(), { n: 1 }, 'dispatch меняет состояние');
assert.equal(notified, 1, 'подписчик уведомлён');
store.dispatch({ type: 'unknown' });
assert.equal(notified, 1, 'без изменения состояния уведомления нет');
unsubscribe();
store.dispatch({ type: 'inc' });
assert.equal(notified, 1, 'после отписки уведомлений нет');
const s2 = createStore(reducer, { n: 0 });
const calls: string[] = [];
const off1 = s2.subscribe(() => { calls.push('one'); off1(); });
s2.subscribe(() => calls.push('two'));
s2.dispatch({ type: 'inc' });
assert.deepEqual(calls, ['one', 'two'], 'отписка во время уведомления не пропускает следующего');
s2.dispatch({ type: 'inc' });
assert.deepEqual(calls, ['one', 'two', 'two'], 'отписавшийся больше не вызывается');
const s3 = createStore(reducer, { n: 0 });
let seen = -1;
s3.subscribe(() => { seen = s3.getState().n; });
s3.dispatch({ type: 'inc' });
assert.equal(seen, 1, 'в подписчике доступно уже новое состояние');`,
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
