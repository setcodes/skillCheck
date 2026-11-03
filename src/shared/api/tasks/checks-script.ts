import type { Check } from '@/entities/task/model/checks'

/**
 * Сценарные проверки (type: 'script') для задач с состоянием, таймерами, классами и моками:
 * их нельзя записать как «вызов → результат». Код выполняется в песочнице, как и раньше.
 */
export const SCRIPT_CHECKS: Record<string, Check[]> = {
  fe_throttle: [
    { type: 'script', code: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { throttle } = m; 
let n = 0; 
const f = () => n++; 
const t = throttle(f, 10); 
t(); 
t(); 
assert.equal(n, 1, 'throttle должен выполнить функцию только один раз при быстрых вызовах');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { throttle } = m;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const calls: number[] = [];
const th = throttle((x: number) => { calls.push(x); }, 40);
th(1); th(2); th(3);
assert.deepEqual(calls, [1], 'первый вызов выполняется сразу');
await sleep(120);
assert.deepEqual(calls, [1, 3], 'позже выполняется последний отложенный вызов с его аргументами');
th(4);
assert.deepEqual(calls, [1, 3, 4], 'после паузы следующий вызов снова выполняется сразу');
` },
  ],

  fe_promiseAllSettled: [
    { type: 'script', code: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { promiseAllSettled } = m; 
const results = await promiseAllSettled([Promise.resolve(1), Promise.reject('error')]); 
assert.equal(results.length, 2); 
assert.equal(results[0].status, 'fulfilled');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { promiseAllSettled } = m;
const r = await promiseAllSettled([Promise.reject(new Error('x')), Promise.resolve(2)]);
assert.deepEqual(r.map((x: any) => x.status), ['rejected', 'fulfilled'], 'порядок как на входе');
assert.equal((r[0] as any).reason.message, 'x', 'причина отказа в reason');
assert.equal((r[1] as any).value, 2, 'значение в value');
assert.deepEqual(await promiseAllSettled([]), [], 'пустой массив');
const all = await promiseAllSettled([Promise.reject(1), Promise.reject(2)]);
assert.equal(all.every((x: any) => x.status === 'rejected'), true, 'все отклонены — результат всё равно приходит');
` },
  ],

  fe_debounce: [
    { type: 'script', code: `import { strict as assert } from 'assert'; 
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
assert.equal(typeof d.cancel, 'function', 'cancel должен быть функцией');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { debounce } = m;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const calls: any[] = [];
const d: any = debounce(function (this: any, x: number) { calls.push([this && this.tag, x]); }, 30);
const ctx = { tag: 'ctx', d };
ctx.d(1); ctx.d(2); ctx.d(3);
assert.equal(calls.length, 0, 'до паузы вызова нет');
await sleep(90);
assert.deepEqual(calls, [['ctx', 3]], 'один вызов с последними аргументами и исходным this');
d(4); d.cancel();
await sleep(90);
assert.equal(calls.length, 1, 'после cancel вызова нет');
d(5);
await sleep(90);
assert.equal(calls.length, 2, 'после cancel debounce снова работает');
` },
  ],

  fe_useState: [
    { type: 'script', code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createState } = m;
const [get, set] = createState(0);
assert.equal(get(), 0, 'начальное значение');
set(5);
assert.equal(get(), 5, 'set(5) заменяет значение');
set(prev => prev + 1);
assert.equal(get(), 6, 'функциональное обновление использует предыдущее значение');
const [getObj] = createState({ a: 1 });
assert.deepEqual(getObj(), { a: 1 }, 'работает с объектами');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createState } = m;
const [get, set] = createState(1);
set((p: number) => p + 1);
set((p: number) => p * 10);
assert.equal(get(), 20, 'функциональные обновления применяются последовательно');
const [g2, s2] = createState('a');
assert.equal(g2(), 'a', 'начальное значение второго состояния');
s2('b');
assert.equal(g2(), 'b', 'второе состояние обновляется');
assert.equal(get(), 20, 'состояния независимы');
const [g3, s3] = createState<number>(5);
s3(0);
assert.equal(g3(), 0, 'значение 0 записывается корректно');
` },
  ],

  fe_useEffect: [
    { type: 'script', code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createEffects } = m;
const { effect, unmount } = createEffects();
const log: string[] = [];
effect(() => { log.push('run'); return () => { log.push('cleanup'); }; }, [1]);
assert.deepEqual(log, ['run'], 'эффект выполняется при первом вызове');
effect(() => { log.push('run'); return () => { log.push('cleanup'); }; }, [1]);
assert.deepEqual(log, ['run'], 'зависимости не изменились — эффект не перезапускается');
effect(() => { log.push('run2'); return () => { log.push('cleanup2'); }; }, [2]);
assert.deepEqual(log, ['run', 'cleanup', 'run2'], 'при изменении зависимостей: cleanup предыдущего, затем новый эффект');
unmount();
assert.deepEqual(log, ['run', 'cleanup', 'run2', 'cleanup2'], 'unmount вызывает последний cleanup');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createEffects } = m;
const e2 = createEffects();
let n = 0;
e2.effect(() => { n++; });
e2.effect(() => { n++; });
assert.equal(n, 2, 'без deps эффект выполняется на каждый вызов');
const e3 = createEffects();
let runs = 0;
let cleanups = 0;
e3.effect(() => { runs++; return () => { cleanups++; }; }, []);
e3.effect(() => { runs++; return () => { cleanups++; }; }, []);
assert.equal(runs, 1, 'пустой массив deps — один запуск');
assert.equal(cleanups, 0, 'cleanup до unmount не вызывается');
e3.unmount();
assert.equal(cleanups, 1, 'unmount вызывает cleanup');
e3.unmount();
assert.equal(cleanups, 1, 'повторный unmount не вызывает cleanup второй раз');
const e4 = createEffects();
const seen: number[] = [];
e4.effect(() => { seen.push(1); }, [NaN]);
e4.effect(() => { seen.push(2); }, [NaN]);
assert.deepEqual(seen, [1], 'зависимости сравниваются через Object.is');
` },
  ],

  fe_useMemo: [
    { type: 'script', code: `import { strict as assert } from 'assert';
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
assert.equal(calls, 2, 'после пересчёта снова кэшируется');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createMemo } = m;
const memo = createMemo();
let calls = 0;
memo(() => { calls++; return 1; }, []);
memo(() => { calls++; return 2; }, []);
assert.equal(calls, 1, 'пустой массив зависимостей — вычисление один раз');
const m2 = createMemo();
let c2 = 0;
m2(() => { c2++; return 1; }, [NaN]);
m2(() => { c2++; return 1; }, [NaN]);
assert.equal(c2, 1, 'NaN равен NaN по Object.is');
const m3 = createMemo();
let c3 = 0;
m3(() => { c3++; return 1; }, [1]);
m3(() => { c3++; return 1; }, [1, 2]);
assert.equal(c3, 2, 'изменение длины списка зависимостей — пересчёт');
const o = { v: 1 };
const m4 = createMemo();
let c4 = 0;
m4(() => { c4++; return 1; }, [o]);
o.v = 2;
m4(() => { c4++; return 1; }, [o]);
assert.equal(c4, 1, 'объект сравнивается по ссылке, а не по содержимому');
` },
  ],

  fe_deepClone: [
    { type: 'script', code: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { deepClone } = m; 
const a = {u: {v: 1}, arr: [1, 2]}; 
const b = deepClone(a); 
(b as any).u.v = 2; 
assert.equal(a.u.v, 1);
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { deepClone } = m;
const date = new Date(2020, 1, 1);
const src = { d: date, list: [{ n: 1 }], re: /ab+/gi, nul: null };
const copy: any = deepClone(src);
assert.ok(copy.d !== date && copy.d.getTime() === date.getTime(), 'Date копируется как новый объект');
copy.list[0].n = 99;
assert.equal(src.list[0].n, 1, 'объекты внутри массивов независимы');
assert.ok(copy.re !== src.re && copy.re.source === 'ab+' && copy.re.flags === 'gi', 'RegExp копируется с флагами');
assert.equal(copy.nul, null, 'null сохраняется');
assert.equal(deepClone(5), 5, 'примитив возвращается как есть');
assert.ok(Array.isArray(deepClone([1, [2]])), 'массив остаётся массивом');
` },
  ],

  fe_curry: [
    { type: 'script', code: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { curry } = m; 
const add = (a: any, b: any, c: any) => a + b + c; 
const cur: any = curry(add); 
assert.equal(cur(1)(2)(3), 6);
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { curry } = m;
const add = (a: number, b: number, c: number) => a + b + c;
const cur: any = curry(add);
assert.equal(cur(1, 2)(3), 6, 'несколько аргументов за раз: (1, 2)(3)');
assert.equal(cur(1)(2, 3), 6, 'и (1)(2, 3)');
assert.equal(cur(1, 2, 3), 6, 'все аргументы сразу');
const part = cur(1);
assert.equal(part(2)(3), 6, 'частичное применение');
assert.equal(part(10)(20), 31, 'частичное применение можно переиспользовать');
assert.equal((curry(() => 5) as any)(), 5, 'функция без аргументов вызывается сразу');
` },
  ],

  fe_eventDelegate: [
    { type: 'script', code: `import { strict as assert } from 'assert';
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
assert.equal(listeners.click, undefined, 'отписка снимает обработчик');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { delegate } = m;
const listeners: Record<string, (e: any) => void> = {};
const root: any = {
  addEventListener: (type: string, h: (e: any) => void) => { listeners[type] = h; },
  removeEventListener: (type: string, h: (e: any) => void) => { if (listeners[type] === h) delete listeners[type]; },
};
const item: any = { closest: (s: string) => (s === '.item' ? item : null) };
const nested: any = { closest: (s: string) => (s === '.item' ? item : null) };
const seen: any[] = [];
delegate(root, '.item', 'click', function (this: any, ev: any) { seen.push([this === item, ev.target === nested]); });
listeners.click({ target: nested });
assert.deepEqual(seen, [[true, true]], 'this — найденный элемент (closest), ev.target — реальный источник');
let other = 0;
delegate(root, '.x', 'keydown', () => { other++; });
assert.equal(typeof listeners.keydown, 'function', 'разные типы событий получают свои обработчики');
listeners.keydown({ target: item });
assert.equal(other, 0, 'неподходящий селектор — обработчик не вызывается');
listeners.click({ target: null });
assert.equal(seen.length, 1, 'пустая цель не ломает обработчик');
` },
  ],

  fe_fetchJSON: [
    { type: 'script', code: `const orig = (global as any).fetch; 
(global as any).fetch = async (_u: any) => new Response(JSON.stringify({ok: true}), {status: 200}); 
import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { fetchJSON } = m; 
const r = await fetchJSON('/ok'); 
assert.equal(r.ok, true); 
(global as any).fetch = orig;
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { fetchJSON } = m;
const orig = (global as any).fetch;
const calls: any[] = [];
(global as any).fetch = async (url: string, opts: any) => { calls.push([url, opts]); return new Response(JSON.stringify({ n: 1 }), { status: 200 }); };
const data = await fetchJSON('/a', { method: 'POST', headers: { 'X-Test': '1' } });
assert.deepEqual(data, { n: 1 }, 'возвращает разобранный JSON');
assert.equal(calls[0][1].method, 'POST', 'опции пробрасываются в fetch');
assert.equal(calls[0][1].headers['X-Test'], '1', 'пользовательские заголовки сохраняются');
assert.equal(calls[0][1].headers['Content-Type'], 'application/json', 'Content-Type по умолчанию — JSON');
(global as any).fetch = async () => new Response('nope', { status: 500 });
let msg = '';
try { await fetchJSON('/x'); } catch (e: any) { msg = e.message; }
assert.ok(msg.includes('500'), 'ответ не-2xx — ошибка со статусом');
(global as any).fetch = async () => { const e: any = new Error('x'); e.name = 'AbortError'; throw e; };
msg = '';
try { await fetchJSON('/y'); } catch (e: any) { msg = e.message; }
assert.equal(msg, 'Request was aborted', 'отмена отличается от обычной ошибки');
(global as any).fetch = orig;
` },
  ],

  fe_LRU: [
    { type: 'script', code: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { LRUCache } = m; 
const c = new LRUCache(2); 
c.set('a', 1); 
c.set('b', 2); 
assert.equal(c.get('a'), 1, 'get("a") должен вернуть 1');
c.set('c', 3); // должен вытеснить 'b'
assert.equal(c.get('b'), undefined, 'get("b") должен вернуть undefined после eviction');
assert.equal(c.get('c'), 3, 'get("c") должен вернуть 3');
assert.equal(c.get('a'), 1, 'get("a") должен все еще вернуть 1');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { LRUCache } = m;
const c = new LRUCache<string, number>(2);
c.set('a', 1); c.set('b', 2); c.set('a', 10); c.set('c', 3);
assert.equal(c.get('b'), undefined, 'обновление ключа делает его самым свежим: вытесняется b');
assert.equal(c.get('a'), 10, 'значение обновлено');
const one = new LRUCache<string, number>(1);
one.set('x', 1); one.set('y', 2);
assert.equal(one.get('x'), undefined, 'ёмкость 1: первый элемент вытеснен');
assert.equal(one.get('y'), 2, 'ёмкость 1: второй на месте');
const g = new LRUCache<string, number>(2);
g.set('a', 1); g.set('b', 2); g.get('a'); g.set('c', 3);
assert.equal(g.get('b'), undefined, 'get делает ключ свежим');
assert.equal(g.get('a'), 1, 'свежий ключ остался');
assert.equal(g.get('zzz'), undefined, 'отсутствующий ключ');
const f = new LRUCache<string, any>(1);
f.set('k', 0);
assert.equal(f.get('k'), 0, 'ложные значения хранятся');
` },
  ],

  fe_memoize: [
    { type: 'script', code: `import { strict as assert } from 'assert'; 
import * as m from 'MODULE'; 
const { memoize } = m; 
let n = 0; 
const f = (x: number) => {n++; return x * x}; 
const mfn: any = memoize(f); 
mfn(2); 
mfn(2); 
assert.equal(n, 1);
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { memoize } = m;
let calls = 0;
const add = (a: number, b: number) => { calls++; return a + b; };
const m1: any = memoize(add);
assert.equal(m1(1, 2), 3, 'результат верный');
assert.equal(m1(1, 2), 3, 'повторный вызов');
assert.equal(m1(2, 1), 3, 'другой порядок аргументов');
assert.equal(calls, 2, 'наборы аргументов (1,2) и (2,1) — разные записи кэша');
let u = 0;
const undef: any = memoize(() => { u++; return undefined; });
undef(); undef();
assert.equal(u, 1, 'результат undefined тоже кэшируется');
let k = 0;
const byId: any = memoize((o: { id: number }) => { k++; return o.id; }, (o: any) => String(o.id));
byId({ id: 1 }); byId({ id: 1 });
assert.equal(k, 1, 'пользовательская функция ключа');
const ctx = { base: 10, f: memoize(function (this: any, x: number) { return this.base + x; }) };
assert.equal(ctx.f(1), 11, 'this сохраняется');
` },
  ],

  fe_virtualScroll: [
    { type: 'script', code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { VirtualScroll } = m;
const items = Array.from({ length: 1000 }, (_, i) => i);
const vs = new VirtualScroll({ items, height: 400, itemHeight: 20 });
assert.deepEqual(vs.getRange(), { start: 0, end: 20 }, 'в начале видны первые height / itemHeight элементов');
assert.equal(vs.getTotalHeight(), 20000, 'общая высота списка');
vs.setScrollTop(100);
assert.deepEqual(vs.getRange(), { start: 5, end: 25 }, 'после прокрутки на 100 px');
assert.deepEqual(vs.getVisibleItems().slice(0, 2), [5, 6], 'видимые элементы');
assert.equal(vs.getOffsetTop(), 100, 'смещение первого видимого элемента');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { VirtualScroll } = m;
const vs = new VirtualScroll({ items: Array.from({ length: 100 }, (_, i) => i), height: 50, itemHeight: 20 });
vs.setScrollTop(10);
assert.deepEqual(vs.getRange(), { start: 0, end: 3 }, 'частично видимая строка входит в диапазон');
vs.setScrollTop(-100);
assert.equal(vs.getRange().start, 0, 'отрицательная прокрутка ограничивается нулём');
vs.setScrollTop(1e9);
assert.deepEqual(vs.getRange(), { start: 97, end: 100 }, 'прокрутка ограничивается концом списка');
assert.deepEqual(new VirtualScroll({ items: [], height: 100, itemHeight: 10 }).getVisibleItems(), [], 'пустой список');
const few = new VirtualScroll({ items: [1, 2], height: 1000, itemHeight: 10 });
assert.deepEqual(few.getVisibleItems(), [1, 2], 'элементов меньше, чем помещается');
` },
  ],

  fe_once: [
    { type: 'script', code: `import { strict as assert } from 'assert';
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
assert.equal(first, 'boom', 'ошибка первого вызова пробрасывается');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { once } = m;
const o = once(() => ({ made: true }));
assert.ok(o() === o(), 'возвращается один и тот же результат (та же ссылка)');
const withArgs = once((a: number, b: number) => a + b);
assert.equal(withArgs(1, 2), 3, 'первый вызов использует свои аргументы');
assert.equal(withArgs(10, 20), 3, 'аргументы повторных вызовов игнорируются');
` },
  ],

  fe_promiseAll: [
    { type: 'script', code: `import { strict as assert } from 'assert';
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
assert.equal(message, 'boom', 'первая ошибка отклоняет результат');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { promiseAll } = m;
const delay = (ms: number, value?: any) => new Promise((r) => setTimeout(() => r(value), ms));
assert.deepEqual(await promiseAll([Promise.resolve(1), 2, delay(5, 3)]), [1, 2, 3], 'смесь промисов и значений');
assert.deepEqual(await promiseAll([delay(20, 'a'), delay(1, 'b'), delay(10, 'c')]), ['a', 'b', 'c'], 'порядок входа при разных задержках');
` },
  ],

  fe_myBind: [
    { type: 'script', code: `import { strict as assert } from 'assert';
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
assert.equal(typeof bound, 'function', 'возвращается функция');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { myBind } = m;
function sum(this: any, a: number, b: number, c: number) { return this.base + a + b + c; }
const bound = myBind(sum, { base: 100 }, 1);
assert.equal(bound(2, 3), 106, 'предзаданный и переданные аргументы');
assert.equal(bound(10, 20), 131, 'функцию можно вызывать повторно');
assert.equal(typeof myBind(() => 1, null)(), 'number', 'возвращается результат вызова');
` },
  ],

  fe_retry: [
    { type: 'script', code: `import { strict as assert } from 'assert';
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
assert.equal(rangeError, 'RangeError', 'attempts < 1 — RangeError');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { retry } = m;
let sync = 0;
let msg = '';
try { await retry(() => { sync++; throw new Error('sync'); }, 2); } catch (e: any) { msg = e.message; }
assert.equal(msg, 'sync', 'синхронное исключение тоже считается неудачной попыткой');
assert.equal(sync, 2, 'обе попытки использованы');
assert.equal(await retry(async () => 0, 3), 0, 'ложный результат 0 возвращается как успех');
` },
  ],

  fe_eventEmitter: [
    { type: 'script', code: `import { strict as assert } from 'assert';
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
assert.equal(createEmitter().emit('nobody'), undefined, 'emit без подписчиков не падает');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createEmitter } = m;
const em = createEmitter();
const got: any[] = [];
em.on('e', (...args: any[]) => got.push(args));
em.emit('e', 1, 'two', { three: 3 });
assert.deepEqual(got, [[1, 'two', { three: 3 }]], 'emit передаёт все аргументы');
const em2 = createEmitter();
let hits = 0;
em2.on('a', () => hits++);
em2.emit('b');
assert.equal(hits, 0, 'события изолированы друг от друга');
const em3 = createEmitter();
let fired = 0;
const off = em3.once('e', () => fired++);
off();
em3.emit('e');
assert.equal(fired, 0, 'once можно отписать до срабатывания');
` },
  ],

  fe_promisePool: [
    { type: 'script', code: `import { strict as assert } from 'assert';
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
assert.equal(started, 2, 'после ошибки новые задачи не запускаются');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { promisePool } = m;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let running = 0;
let peak = 0;
const order: number[] = [];
const tasks = [0, 1, 2, 3].map((i) => async () => { order.push(i); running++; peak = Math.max(peak, running); await sleep(5); running--; return i; });
assert.deepEqual(await promisePool(tasks, 1), [0, 1, 2, 3], 'limit 1: результаты по порядку');
assert.equal(peak, 1, 'limit 1: ровно одна задача одновременно');
assert.deepEqual(order, [0, 1, 2, 3], 'limit 1: задачи стартуют по очереди');
` },
  ],

  fe_deepMerge: [
    { type: 'script', code: `import { strict as assert } from 'assert';
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
assert.equal(({} as any).polluted2, undefined, 'prototype pollution невозможен через constructor.prototype');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { deepMerge } = m;
assert.deepEqual(deepMerge({ a: { b: { c: 1, d: 2 } } }, { a: { b: { c: 10 }, e: 3 } }), { a: { b: { c: 10, d: 2 }, e: 3 } }, 'слияние на трёх уровнях');
assert.deepEqual(deepMerge({}, { x: { y: 1 } }), { x: { y: 1 } }, 'слияние в пустой объект');
const date = new Date(1);
assert.ok(deepMerge({ d: 1 }, { d: date }).d instanceof Date, 'не-обычные объекты (Date) заменяют значение');
` },
  ],

  fe_createStore: [
    { type: 'script', code: `import { strict as assert } from 'assert';
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
assert.equal(seen, 1, 'в подписчике доступно уже новое состояние');
` },
    { type: 'script', hidden: true, code: `import { strict as assert } from 'assert';
import * as m from 'MODULE';
const { createStore } = m;
const reducer = (s: { n: number }, a: { type: string }) => (a.type === 'inc' ? { n: s.n + 1 } : s);
const store = createStore(reducer, { n: 0 });
const before = store.getState();
store.dispatch({ type: 'noop' });
assert.ok(store.getState() === before, 'без изменений ссылка на состояние та же');
const calls: string[] = [];
store.subscribe(() => calls.push('a'));
store.subscribe(() => calls.push('b'));
store.dispatch({ type: 'inc' });
assert.deepEqual(calls, ['a', 'b'], 'подписчики уведомляются в порядке подписки');
const off = store.subscribe(() => calls.push('c'));
off(); off();
store.dispatch({ type: 'inc' });
assert.deepEqual(calls, ['a', 'b', 'a', 'b'], 'повторная отписка безопасна, отписавшийся не вызывается');
` },
  ],

}
