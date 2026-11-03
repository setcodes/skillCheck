import type { TaskMeta } from './meta-types'
import { t } from './meta-types'

/** Подсказки, рубрики, типичные ошибки и скрытые тесты для задач из расширения банка. */
export const META_EXTRA: Record<string, TaskMeta> = {
  fe_groupBy: {
    hints: [
      'Результат — словарь «ключ группы → массив элементов». Какая структура удобна для накопления групп по ходу обхода?',
      'Map: ключ → массив. Для каждого элемента вычислите ключ (поле или функция), создайте группу при первой встрече, добавьте элемент. Служебные имена вроде constructor не должны ломать результат.',
      'Для каждого item: key = String(getKey(item)); достаньте группу из Map (или создайте пустую), добавьте элемент. В конце Object.fromEntries(groups).',
    ],
    rubric: [
      { criterion: 'Группирует по полю и по функции', weight: 30 },
      { criterion: 'Сохраняет порядок групп и элементов внутри групп', weight: 25 },
      { criterion: 'Безопасно для ключей constructor, toString, __proto__', weight: 25 },
      { criterion: 'Не мутирует вход, линейная сложность', weight: 20 },
    ],
    commonMistakes: [
      'Накопление в обычном объекте `{}` ломается на ключе constructor',
      'Проверка `if (!result[key])` перепутает служебные имена с существующими группами',
      'Мутируют исходный массив',
    ],
    hiddenTests: t('groupBy', `
const byLength = groupBy(['a', 'bb', 'cc'], 'length' as never);
assert.deepEqual(byLength, { 1: ['a'], 2: ['bb', 'cc'] }, 'числовые ключи приводятся к строке');
assert.deepEqual(groupBy([5, 3, 4, 8], (n: number) => (n % 2 === 0 ? 'even' : 'odd')), { odd: [5, 3], even: [4, 8] }, 'порядок внутри групп сохраняется');`),
  },

  fe_once: {
    hints: [
      'Нужно помнить, вызывалась ли функция, и сохранить её результат. Где хранить это состояние?',
      'В замыкании: флаг called и значение result. Флаг отдельно от результата — результат может быть 0, пустой строкой или undefined.',
      'Возвращаемая функция: если флаг не поднят — поднять, вызвать fn.apply(this, args) и запомнить результат; в любом случае вернуть запомненное значение.',
    ],
    rubric: [
      { criterion: 'fn вызывается только один раз', weight: 35 },
      { criterion: 'Повторные вызовы возвращают результат первого', weight: 25 },
      { criterion: 'Проверка по флагу, а не по значению результата', weight: 25 },
      { criterion: 'Сохраняет this и аргументы первого вызова', weight: 15 },
    ],
    commonMistakes: [
      'Проверка `if (!result)` вызывает fn снова, если результат 0 или пустая строка',
      'Теряют this',
      'Повторно выполняют fn после ошибки в первом вызове',
    ],
    hiddenTests: t('once', `
const o = once(() => ({ made: true }));
assert.ok(o() === o(), 'возвращается один и тот же результат (та же ссылка)');
const withArgs = once((a: number, b: number) => a + b);
assert.equal(withArgs(1, 2), 3, 'первый вызов использует свои аргументы');
assert.equal(withArgs(10, 20), 3, 'аргументы повторных вызовов игнорируются');`),
  },

  fe_wordFrequency: {
    hints: [
      'Сначала разделите текст на слова, затем посчитайте, сколько раз встречается каждое. Какая структура подходит для счётчика?',
      'Приведите текст к нижнему регистру, достаньте слова регулярным выражением по буквам и цифрам любого языка (флаг u и классы \\p{L}, \\p{N}). Считайте в Map. Сортировка — по убыванию счёта, затем по алфавиту.',
      'text.toLowerCase().match(/[\\p{L}\\p{N}]+/gu) ?? []; счётчик: counts.set(w, (counts.get(w) ?? 0) + 1); результат [...counts].sort(...) с компаратором «счёт убыванию, затем localeCompare».',
    ],
    rubric: [
      { criterion: 'Корректно выделяет слова (регистр, пунктуация, цифры, кириллица)', weight: 30 },
      { criterion: 'Считает частоты', weight: 25 },
      { criterion: 'Двухуровневая сортировка: счёт по убыванию, затем алфавит', weight: 25 },
      { criterion: 'Безопасный счётчик (Map), граничные входы', weight: 20 },
    ],
    commonMistakes: [
      'Счётчик в обычном объекте ломается на слове constructor',
      'Разбиение по пробелам оставляет знаки препинания в словах',
      'Сортировка только по счёту — порядок при равенстве нестабилен',
    ],
    hiddenTests: t('wordFrequency', `
assert.deepEqual(wordFrequency('Hello hello HELLO world'), [['hello', 3], ['world', 1]], 'регистр не важен');
assert.deepEqual(wordFrequency('ёж Ёж'), [['ёж', 2]], 'кириллица и ё');
assert.deepEqual(wordFrequency('a-b a_b'), [['a', 2], ['b', 2]], 'дефис и подчёркивание — разделители');`),
  },

  fe_flattenObject: {
    hints: [
      'Вложенность произвольной глубины — подумайте о рекурсии. Что делать с ключами на каждом уровне?',
      'Рекурсивная функция с префиксом пути. Обычный объект разворачивается, а массив, null и примитивы — конечные значения.',
      'Для каждой пары [k, v]: path = prefix ? prefix + "." + k : k. Если v — объект (не null и не массив) — слить результат рекурсии, иначе записать result[path] = v.',
    ],
    rubric: [
      { criterion: 'Разворачивает вложенные объекты в ключи через точку', weight: 35 },
      { criterion: 'Массивы, null и undefined остаются значениями', weight: 25 },
      { criterion: 'Работает на любой глубине', weight: 20 },
      { criterion: 'Не мутирует вход', weight: 20 },
    ],
    commonMistakes: [
      'typeof null === "object" — null принимают за объект и рекурсия падает',
      'Массивы разворачивают как объекты',
      'Лишняя точка в начале пути на верхнем уровне',
    ],
    hiddenTests: t('flattenObject', `
assert.deepEqual(flattenObject({ a: { b: { c: { d: 1 } } } }), { 'a.b.c.d': 1 }, 'глубокая вложенность');
assert.deepEqual(flattenObject({ x: { y: 1 }, z: { w: 2 } }), { 'x.y': 1, 'z.w': 2 }, 'несколько веток');`),
  },

  fe_promiseAll: {
    hints: [
      'Итоговый промис должен завершиться, когда завершатся все. Как понять, что завершился последний?',
      'Счётчик выполненных и массив результатов, куда пишем по индексу (порядок входа). Первый отказ сразу отклоняет итоговый промис. Не забудьте пустой массив.',
      'new Promise: пустой вход — сразу resolve([]). Иначе для каждого элемента Promise.resolve(item).then(значение → result[i] = значение, увеличить счётчик, при равенстве длине resolve(result); ошибка → reject).',
    ],
    rubric: [
      { criterion: 'Результаты в порядке входа, независимо от порядка завершения', weight: 30 },
      { criterion: 'Первая ошибка отклоняет результат', weight: 25 },
      { criterion: 'Запускает всё параллельно, принимает значения без промисов', weight: 25 },
      { criterion: 'Пустой массив не зависает', weight: 20 },
    ],
    commonMistakes: [
      'push вместо записи по индексу нарушает порядок',
      'Пустой массив — промис никогда не завершается',
      'Последовательное ожидание (await в цикле) вместо параллельного',
    ],
    hiddenTests: t('promiseAll', `
const delay = (ms: number, value?: any) => new Promise((r) => setTimeout(() => r(value), ms));
assert.deepEqual(await promiseAll([Promise.resolve(1), 2, delay(5, 3)]), [1, 2, 3], 'смесь промисов и значений');
assert.deepEqual(await promiseAll([delay(20, 'a'), delay(1, 'b'), delay(10, 'c')]), ['a', 'b', 'c'], 'порядок входа при разных задержках');`),
  },

  fe_myBind: {
    hints: [
      'bind возвращает новую функцию, которая позже вызывает исходную с нужным this. Какие методы вызова функции позволяют задать this?',
      'call/apply задают контекст в момент вызова. Внутри возвращаемой функции вызовите fn.apply(context, [...bound, ...callArgs]) — предзаданные аргументы идут первыми.',
      'Верните функцию (...callArgs) => fn.apply(context, [...bound, ...callArgs]). Контекст зашит в замыкании, поэтому call/apply снаружи его не перебьют.',
    ],
    rubric: [
      { criterion: 'Вызывает функцию с прибитым контекстом', weight: 35 },
      { criterion: 'Предзаданные аргументы идут перед аргументами вызова', weight: 30 },
      { criterion: 'Контекст нельзя перебить через call/apply', weight: 20 },
      { criterion: 'Возвращает результат функции', weight: 15 },
    ],
    commonMistakes: [
      'Забывают вернуть результат вызова',
      'Теряют предзаданные аргументы',
      'Используют fn.bind — задача про реализацию',
    ],
    hiddenTests: t('myBind', `
function sum(this: any, a: number, b: number, c: number) { return this.base + a + b + c; }
const bound = myBind(sum, { base: 100 }, 1);
assert.equal(bound(2, 3), 106, 'предзаданный и переданные аргументы');
assert.equal(bound(10, 20), 131, 'функцию можно вызывать повторно');
assert.equal(typeof myBind(() => 1, null)(), 'number', 'возвращается результат вызова');`),
  },

  fe_buildTree: {
    hints: [
      'Плоский список со ссылками на родителей. Чтобы не искать родителя перебором, нужна быстрая таблица «id → узел».',
      'Два прохода: сначала создайте узел-копию для каждого элемента и положите в Map по id; затем свяжите: корни (parentId === null) в результат, остальные — в children найденного родителя.',
      'byId = Map(id → { ...item, children: [] }). Второй проход: node = byId.get(item.id); если parentId === null — roots.push(node), иначе byId.get(item.parentId)?.children.push(node).',
    ],
    rubric: [
      { criterion: 'Строит корректное дерево любой глубины', weight: 30 },
      { criterion: 'Линейная сложность (Map вместо поиска в массиве)', weight: 25 },
      { criterion: 'Не зависит от порядка элементов во входе', weight: 20 },
      { criterion: 'Не мутирует вход; отбрасывает сирот; сохраняет порядок детей', weight: 25 },
    ],
    commonMistakes: [
      'Ищут родителя через find — O(n²)',
      'Один проход: родитель ещё не создан, когда встречается ребёнок',
      'Мутируют входные объекты, добавляя им children',
    ],
    hiddenTests: t('buildTree', `
const N = 10000;
const chain = Array.from({ length: N }, (_, i) => ({ id: i + 1, parentId: i === 0 ? null : i, name: 'n' })).reverse();
const tree = buildTree(chain);
assert.equal(tree.length, 1, 'длинная цепочка в обратном порядке даёт один корень');
let depth = 0;
let node: any = tree[0];
while (node) { depth++; node = node.children[0]; }
assert.equal(depth, N, 'глубина цепочки сохранена (без рекурсии по стеку)');`),
  },

  fe_buildPostsView: {
    hints: [
      'Наивный путь — для каждого поста искать автора и считать комментарии перебором. Сколько это операций на больших данных?',
      'Предвычислите две таблицы за один проход: Map «id пользователя → имя» и Map «id поста → число комментариев». Затем за один проход по постам собирайте результат.',
      'users → userNames.set(id, name); comments → counts.set(postId, (counts.get(postId) ?? 0) + 1); posts.map(...) берёт имя и счёт из таблиц, для постов без комментариев подставляет 0.',
    ],
    rubric: [
      { criterion: 'Верный результат: имя автора и число комментариев', weight: 30 },
      { criterion: 'Сложность O(u + c + p), без вложенных циклов', weight: 35 },
      { criterion: 'Порядок как у постов; посты без комментариев получают 0', weight: 20 },
      { criterion: 'Не мутирует входные данные', weight: 15 },
    ],
    commonMistakes: [
      'find и filter внутри map — O(p × u + p × c)',
      'Посты без комментариев получают undefined вместо 0',
      'Результат собирается в другом порядке',
    ],
    hiddenTests: t('buildPostsView', `
const users = [{ id: 1, name: 'A' }];
const posts = [{ id: 1, userId: 1, title: 'T' }];
const result = buildPostsView(posts, [], users);
assert.ok(result[0] !== (posts[0] as any), 'результат — новые объекты');
assert.deepEqual(Object.keys(result[0]).sort(), ['commentsCount', 'id', 'title', 'userName'], 'только нужные поля');
assert.equal(result[0].commentsCount, 0, 'без комментариев — 0');`),
  },

  fe_retry: {
    hints: [
      'Нужно повторять асинхронный вызов, пока он не удастся или не кончатся попытки. Какой цикл и какую конструкцию для ошибок использовать?',
      'Цикл по попыткам с try/catch внутри: успех — сразу return, ошибку запомнить. После цикла бросить последнюю ошибку. Неверное число попыток — RangeError.',
      'attempts < 1 → throw new RangeError. Затем for по номеру попытки: try { return await fn(i) } catch (e) { last = e }. После цикла — throw last.',
    ],
    rubric: [
      { criterion: 'Возвращает результат первой успешной попытки и не продолжает', weight: 30 },
      { criterion: 'Бросает ошибку последней попытки после исчерпания', weight: 25 },
      { criterion: 'Передаёт номер попытки, проверяет attempts', weight: 25 },
      { criterion: 'Обрабатывает синхронные ошибки и ложные результаты', weight: 20 },
    ],
    commonMistakes: [
      'Бросают первую ошибку вместо последней',
      'Не выходят после успеха — лишние вызовы',
      'Не ловят синхронное исключение внутри fn',
    ],
    hiddenTests: t('retry', `
let sync = 0;
let msg = '';
try { await retry(() => { sync++; throw new Error('sync'); }, 2); } catch (e: any) { msg = e.message; }
assert.equal(msg, 'sync', 'синхронное исключение тоже считается неудачной попыткой');
assert.equal(sync, 2, 'обе попытки использованы');
assert.equal(await retry(async () => 0, 3), 0, 'ложный результат 0 возвращается как успех');`),
  },

  fe_eventEmitter: {
    hints: [
      'Нужна таблица «имя события → список подписчиков». Что должны делать on, off, once и emit?',
      'Map: событие → Set обработчиков. on возвращает функцию отписки. once оборачивает обработчик, который сам отписывается перед вызовом. emit обходит копию набора — подписчики могут отписываться во время вызова.',
      'emit: обойти копию [...handlers.get(event) ?? []] и вызвать каждого с аргументами. once: создайте обёртку, которая сначала вызывает off для себя, затем исходный handler; подпишите обёртку через on.',
    ],
    rubric: [
      { criterion: 'on, off, emit работают, порядок подписчиков сохраняется', weight: 30 },
      { criterion: 'on возвращает функцию отписки', weight: 20 },
      { criterion: 'once срабатывает ровно один раз', weight: 25 },
      { criterion: 'Безопасная отписка во время emit', weight: 25 },
    ],
    commonMistakes: [
      'Итерация по живому набору при отписке в процессе — пропускается следующий подписчик',
      'once не снимается при ошибке в обработчике',
      'emit без подписчиков бросает ошибку',
    ],
    hiddenTests: t('createEmitter', `
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
assert.equal(fired, 0, 'once можно отписать до срабатывания');`),
  },

  fe_promisePool: {
    hints: [
      'Нужно держать запущенными не больше limit задач. Как «освободившийся слот» превращать в запуск следующей?',
      'Запустите limit «воркеров»; каждый после завершения задачи берёт следующую по общему индексу. Результат пишите по индексу задачи. При ошибке остановите выдачу новых задач.',
      'launch() берёт next++, запускает tasks[i]() и в then записывает результат, считает завершённые и либо резолвит итог, либо вызывает launch() снова; в обработчике ошибки поднимите флаг failed и reject. Стартуйте min(limit, tasks.length) воркеров.',
    ],
    rubric: [
      { criterion: 'Одновременно не больше limit задач', weight: 30 },
      { criterion: 'Лимит используется полностью (освободившийся слот занимается сразу)', weight: 20 },
      { criterion: 'Результаты в порядке входа', weight: 25 },
      { criterion: 'Первая ошибка отклоняет результат и останавливает запуск новых', weight: 25 },
    ],
    commonMistakes: [
      'Promise.all без ограничения — лимит нарушается',
      'Пакеты по limit штук с ожиданием всего пакета — слоты простаивают',
      'После ошибки продолжают запускать новые задачи',
    ],
    hiddenTests: t('promisePool', `
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let running = 0;
let peak = 0;
const order: number[] = [];
const tasks = [0, 1, 2, 3].map((i) => async () => { order.push(i); running++; peak = Math.max(peak, running); await sleep(5); running--; return i; });
assert.deepEqual(await promisePool(tasks, 1), [0, 1, 2, 3], 'limit 1: результаты по порядку');
assert.equal(peak, 1, 'limit 1: ровно одна задача одновременно');
assert.deepEqual(order, [0, 1, 2, 3], 'limit 1: задачи стартуют по очереди');`),
  },

  fe_deepMerge: {
    hints: [
      'Слить нужно рекурсивно только обычные объекты. Что делать с массивами, null и другими значениями? И какие ключи опасны?',
      'Результат — новый объект. Для каждого ключа: если оба значения — обычные объекты, сливаем рекурсивно; иначе берём значение из source. Ключи __proto__, constructor и prototype пропускайте.',
      'isPlainObject: значение не null, typeof "object" и прототип равен Object.prototype. Заведите Set запрещённых ключей. Не мутируйте вход — вложенные объекты тоже копируйте, а не отдавайте по ссылке.',
    ],
    rubric: [
      { criterion: 'Рекурсивно сливает вложенные обычные объекты', weight: 25 },
      { criterion: 'Массивы и не-объекты заменяются, null из source заменяет объект', weight: 20 },
      { criterion: 'Не мутирует target и source', weight: 25 },
      { criterion: 'Защита от prototype pollution (__proto__, constructor, prototype)', weight: 30 },
    ],
    commonMistakes: [
      'Рекурсия по ключу __proto__ загрязняет прототип всех объектов',
      'Мутируют target — в результат утекают общие ссылки на вложенные объекты',
      'Сливают массивы поэлементно вместо замены',
    ],
    hiddenTests: t('deepMerge', `
assert.deepEqual(deepMerge({ a: { b: { c: 1, d: 2 } } }, { a: { b: { c: 10 }, e: 3 } }), { a: { b: { c: 10, d: 2 }, e: 3 } }, 'слияние на трёх уровнях');
assert.deepEqual(deepMerge({}, { x: { y: 1 } }), { x: { y: 1 } }, 'слияние в пустой объект');
const date = new Date(1);
assert.ok(deepMerge({ d: 1 }, { d: date }).d instanceof Date, 'не-обычные объекты (Date) заменяют значение');`),
  },

  fe_createStore: {
    hints: [
      'Хранилище держит текущее состояние и список подписчиков. Когда подписчиков нужно уведомлять, а когда — нет?',
      'dispatch вызывает редьюсер. Если вернулась та же ссылка (Object.is) — ничего не изменилось, молчим. Иначе обновляем состояние и вызываем подписчиков уже с новым состоянием.',
      'subscribe добавляет функцию в Set и возвращает функцию, удаляющую её. Уведомляйте по копии набора, чтобы отписка во время уведомления не пропускала подписчиков.',
    ],
    rubric: [
      { criterion: 'getState и dispatch через редьюсер', weight: 25 },
      { criterion: 'Уведомляет подписчиков только при изменении состояния', weight: 25 },
      { criterion: 'subscribe возвращает функцию отписки', weight: 25 },
      { criterion: 'Безопасная отписка во время уведомления; подписчик видит новое состояние', weight: 25 },
    ],
    commonMistakes: [
      'Уведомляют подписчиков на каждый dispatch, даже без изменений',
      'Итерируют живой набор — отписка в процессе пропускает подписчиков',
      'Вызывают подписчиков до обновления состояния',
    ],
    hiddenTests: t('createStore', `
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
assert.deepEqual(calls, ['a', 'b', 'a', 'b'], 'повторная отписка безопасна, отписавшийся не вызывается');`),
  },
}
