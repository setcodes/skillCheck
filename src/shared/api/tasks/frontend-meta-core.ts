import type { TaskMeta } from './meta-types'
import { t } from './meta-types'

/** Подсказки, рубрики, типичные ошибки и скрытые тесты для исходных задач Frontend. */
export const META_CORE: Record<string, TaskMeta> = {
  fe_classNames: {
    hints: [
      'Какие типы значений могут прийти в аргументах? Для каждого нужна своя ветка: строка, число, массив, объект, ложные значения.',
      'Массивы разворачивайте рекурсивно — вызовом той же функции. Из объекта берите только ключи с истинным значением. Для уникальности держите Set уже добавленных классов.',
      'Обходите аргументы по порядку: ложные пропустите; строку или число добавьте, если её нет в Set; массив — рекурсивно classNames(...arr) и разбейте результат по пробелу; объект — Object.entries с проверкой значения. В конце join(" ").',
    ],
    rubric: [
      { criterion: 'Обрабатывает строки, числа, массивы и объекты', weight: 30 },
      { criterion: 'Вложенные массивы (рекурсия)', weight: 25 },
      { criterion: 'Уникальность с сохранением порядка появления', weight: 25 },
      { criterion: 'Пропускает ложные значения', weight: 20 },
    ],
    commonMistakes: [
      'Забывают рекурсию для вложенных массивов',
      'Дедупликация через сортировку или объект ломает порядок появления',
      'Включают ключи объекта с ложным значением',
    ],
    hiddenTests: t('classNames', `
assert.equal(classNames(), '', 'без аргументов — пустая строка');
assert.equal(classNames(null, undefined, false, 0, ''), '', 'ложные значения пропускаются');
assert.equal(classNames('a', 5, 'b'), 'a 5 b', 'числа допустимы');
assert.equal(classNames(['a', ['b', ['c']]], 'b', 'd'), 'a b c d', 'вложенные массивы и дубли');
assert.equal(classNames({ a: 1, b: 0, c: 'x', d: null }), 'a c', 'из объекта берутся ключи с истинным значением');`),
  },

  fe_isPalindrome: {
    hints: [
      'Сначала решите, что считать «одинаковой» строкой: регистр и пробелы не важны. Приведите строку к нормальному виду.',
      'Нормализуйте: уберите пробелы и приведите к нижнему регистру. Затем сравните строку с её перевёрнутой версией.',
      'typeof str !== "string" → false. Далее s = str.replace(/\\s/g, "").toLowerCase(); return s === [...s].reverse().join("").',
    ],
    rubric: [
      { criterion: 'Игнорирует регистр и пробелы', weight: 35 },
      { criterion: 'Корректно сравнивает строку с обратной', weight: 30 },
      { criterion: 'Обрабатывает не-строки и пустую строку', weight: 20 },
      { criterion: 'Чистый и читаемый код без лишних проходов', weight: 15 },
    ],
    commonMistakes: [
      'Не нормализуют регистр или пробелы',
      'Забывают про вход, не являющийся строкой',
      'Сравнивают только половину строки с ошибкой на нечётной длине',
    ],
    hiddenTests: t('isPalindrome', `
assert.equal(isPalindrome(''), true, 'пустая строка — палиндром');
assert.equal(isPalindrome('Level'), true, 'регистр не важен');
assert.equal(isPalindrome('a b a'), true, 'пробелы игнорируются');
assert.equal(isPalindrome(12321 as any), false, 'не строка — false');
assert.equal(isPalindrome('ab'), false, 'не палиндром');`),
  },

  fe_uniqueBy: {
    hints: [
      'Нужно запоминать, какие значения ключа уже встречались. Какая структура данных проверяет «был ли такой» за O(1)?',
      'Set уже встреченных ключей. Ключ вычисляется либо как item[key], либо вызовом функции — выберите способ до цикла.',
      'Идите по массиву: k = typeof key === "function" ? key(item) : item[key]; если k нет в Set — добавьте в Set и в результат. Остаётся первый элемент группы.',
    ],
    rubric: [
      { criterion: 'Уникальность по полю и по функции', weight: 35 },
      { criterion: 'Сохраняется первый элемент и исходный порядок', weight: 30 },
      { criterion: 'Линейная сложность (Set вместо вложенных циклов)', weight: 25 },
      { criterion: 'Не мутирует входной массив', weight: 10 },
    ],
    commonMistakes: [
      'includes/indexOf по результату — O(n²)',
      'Остаётся последний элемент вместо первого',
      'Не поддерживают ключ-функцию',
    ],
    hiddenTests: t('uniqueBy', `
assert.deepEqual(uniqueBy([1, 2, 3, 4, 5, 6], (x: number) => x % 3), [1, 2, 3], 'ключ-функция; остаётся первый элемент группы');
assert.deepEqual(uniqueBy([], 'id' as never), [], 'пустой массив');
const first = { id: 1, v: 'first' };
const second = { id: 1, v: 'second' };
assert.ok(uniqueBy([first, second], 'id')[0] === first, 'остаётся первый встреченный объект');
assert.equal(uniqueBy([{ k: undefined }, { k: undefined }, { k: null }], 'k').length, 2, 'undefined и null — разные ключи');`),
  },

  fe_chunk: {
    hints: [
      'Подумайте о шаге цикла: если идти по массиву с шагом size, что нужно взять на каждом шаге?',
      'Цикл for (let i = 0; i < arr.length; i += size) и slice(i, i + size). Последний кусок может оказаться короче.',
      'Защитите вход: size <= 0 вернёт [] (иначе цикл не двинется с места). В цикле push(arr.slice(i, i + size)).',
    ],
    rubric: [
      { criterion: 'Корректно режет на куски, последний может быть короче', weight: 35 },
      { criterion: 'Граничные случаи: пустой массив, size больше длины', weight: 25 },
      { criterion: 'Защита от size <= 0 (нет бесконечного цикла)', weight: 25 },
      { criterion: 'Не мутирует исходный массив (slice, а не splice)', weight: 15 },
    ],
    commonMistakes: [
      'splice вместо slice — исходный массив опустошается',
      'Бесконечный цикл при size = 0',
      'Теряют последний неполный кусок',
    ],
    hiddenTests: t('chunk', `
assert.deepEqual(chunk([1, 2, 3], 5), [[1, 2, 3]], 'размер больше длины');
assert.deepEqual(chunk([1, 2, 3], 1), [[1], [2], [3]], 'размер 1');
assert.deepEqual(chunk([], 3), [], 'пустой массив');
assert.deepEqual(chunk([1, 2], 0), [], 'нулевой размер не зацикливается');
const src = [1, 2, 3, 4];
chunk(src, 2);
assert.deepEqual(src, [1, 2, 3, 4], 'исходный массив не меняется');`),
  },

  fe_sumBy: {
    hints: [
      'Свёртка массива в одно число. Какой метод массива для этого создан?',
      'reduce с начальным значением 0. Значение для слагаемого берётся либо из поля, либо из результата функции.',
      'arr.reduce((sum, item) => sum + (typeof it === "function" ? it(item) : item[it]), 0). Не забудьте начальное значение — иначе пустой массив упадёт.',
    ],
    rubric: [
      { criterion: 'Суммирует по полю и по функции', weight: 40 },
      { criterion: 'Пустой массив даёт 0 (начальное значение reduce)', weight: 30 },
      { criterion: 'Аккуратная обработка значений, не являющихся числами', weight: 15 },
      { criterion: 'Лаконичный код без внешнего состояния', weight: 15 },
    ],
    commonMistakes: [
      'reduce без начального значения — ошибка на пустом массиве',
      'Конкатенация строк вместо сложения чисел',
      'Не поддерживают функцию-итератор',
    ],
    hiddenTests: t('sumBy', `
assert.equal(sumBy([{ a: 1 }, { a: 2 }], (x: any) => x.a * 10), 30, 'функция-итератор');
assert.equal(sumBy([], 'a' as never), 0, 'пустой массив — 0');
assert.equal(sumBy([{ a: -2 }, { a: 5 }], 'a' as never), 3, 'отрицательные числа');`),
  },

  fe_throttle: {
    hints: [
      'Нужно помнить, когда функция выполнялась в последний раз. Что делать с вызовами, которые пришли слишком рано?',
      'Первый вызов — сразу. Слишком ранний вызов не теряем: откладываем его таймером на оставшееся время, и каждый новый ранний вызов заменяет предыдущий отложенный (trailing).',
      'lastCall = 0, timeoutId = null. now - lastCall >= delay → вызвать сразу и записать lastCall. Иначе clearTimeout(timeoutId) и setTimeout(..., delay - (now - lastCall)) с последними аргументами.',
    ],
    rubric: [
      { criterion: 'Первый вызов выполняется сразу (leading)', weight: 25 },
      { criterion: 'Частые вызовы не выполняются чаще раза в delay', weight: 25 },
      { criterion: 'Последний вызов не теряется (trailing с последними аргументами)', weight: 30 },
      { criterion: 'Сохраняет this и аргументы', weight: 20 },
    ],
    commonMistakes: [
      'Путают throttle и debounce: теряют первый вызов или выполняют только последний',
      'Теряют последний вызов в серии',
      'Не очищают предыдущий таймер — вызовов становится больше',
    ],
    hiddenTests: t('throttle', `
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const calls: number[] = [];
const th = throttle((x: number) => { calls.push(x); }, 40);
th(1); th(2); th(3);
assert.deepEqual(calls, [1], 'первый вызов выполняется сразу');
await sleep(120);
assert.deepEqual(calls, [1, 3], 'позже выполняется последний отложенный вызов с его аргументами');
th(4);
assert.deepEqual(calls, [1, 3, 4], 'после паузы следующий вызов снова выполняется сразу');`),
  },

  fe_safeGet: {
    hints: [
      'Путь "a.b.c" — это цепочка ключей. Как пройти по ней, не падая на отсутствующем звене?',
      'Разбейте путь по точке и пройдите по объекту шаг за шагом. Если очередного ключа нет — вернуть значение по умолчанию.',
      'path.split(".").reduce((cur, key) => cur != null && cur[key] !== undefined ? cur[key] : defaultValue, obj). Не проверяйте на «ложность»: 0, "" и false — настоящие значения.',
    ],
    rubric: [
      { criterion: 'Проходит по вложенному пути и возвращает значение', weight: 30 },
      { criterion: 'Возвращает defaultValue, если путь оборван', weight: 25 },
      { criterion: 'Не путает 0, "" и false с отсутствием значения', weight: 30 },
      { criterion: 'Не падает на null/undefined в середине пути', weight: 15 },
    ],
    commonMistakes: [
      'Проверка через `|| defaultValue` ломает значения 0, "" и false',
      'Падение на null/undefined посреди пути',
      'try/catch вместо проверки каждого звена',
    ],
    hiddenTests: t('safeGet', `
assert.equal(safeGet({ a: { b: 0 } }, 'a.b', 9), 0, 'значение 0 не заменяется значением по умолчанию');
assert.equal(safeGet({ a: '' }, 'a', 'x'), '', 'пустая строка сохраняется');
assert.equal(safeGet({ a: false }, 'a', true), false, 'false сохраняется');
assert.equal(safeGet(null, 'a.b', 'def'), 'def', 'null вместо объекта');
assert.equal(safeGet({ a: [{ b: 5 }] }, 'a.0.b'), 5, 'индекс массива в пути');
assert.equal(safeGet({ a: 1 }, 'a.b.c', 'def'), 'def', 'путь через не-объект');`),
  },

  fe_promiseAllSettled: {
    hints: [
      'Нужно, чтобы отказ одного промиса не обрывал остальные. Как превратить любой исход в «успешное» значение?',
      'Оберните каждый промис: на успех возвращайте { status: "fulfilled", value }, на отказ — { status: "rejected", reason }. Потом дождитесь всех.',
      'Promise.all(promises.map(p => p.then(value => ({ status: "fulfilled", value }), reason => ({ status: "rejected", reason })))).',
    ],
    rubric: [
      { criterion: 'Ждёт все промисы независимо от отказов', weight: 35 },
      { criterion: 'Правильный формат результата (status, value, reason)', weight: 30 },
      { criterion: 'Порядок результатов совпадает с порядком входа', weight: 20 },
      { criterion: 'Пустой массив и значения без промисов', weight: 15 },
    ],
    commonMistakes: [
      'Использование Promise.all напрямую — первый отказ обрывает всё',
      'Забывают оборачивать отказ, получают необработанное отклонение',
      'Теряют порядок, записывая результаты по мере завершения',
    ],
    hiddenTests: t('promiseAllSettled', `
const r = await promiseAllSettled([Promise.reject(new Error('x')), Promise.resolve(2)]);
assert.deepEqual(r.map((x: any) => x.status), ['rejected', 'fulfilled'], 'порядок как на входе');
assert.equal((r[0] as any).reason.message, 'x', 'причина отказа в reason');
assert.equal((r[1] as any).value, 2, 'значение в value');
assert.deepEqual(await promiseAllSettled([]), [], 'пустой массив');
const all = await promiseAllSettled([Promise.reject(1), Promise.reject(2)]);
assert.equal(all.every((x: any) => x.status === 'rejected'), true, 'все отклонены — результат всё равно приходит');`),
  },

  fe_debounce: {
    hints: [
      'Debounce откладывает вызов, пока «тишина» не продлится delay миллисекунд. Что должно происходить при каждом новом вызове?',
      'Хранить id таймера. Каждый вызов сбрасывает прежний таймер и ставит новый. Аргументы и this нужно сохранить до срабатывания.',
      'function(...args) { clearTimeout(id); id = setTimeout(() => fn.apply(this, args), delay); } и метод cancel, очищающий таймер. Не используйте стрелочную функцию для внешней обёртки — потеряете this.',
    ],
    rubric: [
      { criterion: 'Вызов откладывается и сбрасывается новыми вызовами', weight: 30 },
      { criterion: 'Выполняется один раз с последними аргументами', weight: 25 },
      { criterion: 'Сохраняет this вызывающего', weight: 20 },
      { criterion: 'Метод cancel и повторное использование после него', weight: 25 },
    ],
    commonMistakes: [
      'Стрелочная обёртка теряет this',
      'Не очищают предыдущий таймер — вызовов столько же, сколько нажатий',
      'cancel не обнуляет состояние',
    ],
    hiddenTests: t('debounce', `
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
assert.equal(calls.length, 2, 'после cancel debounce снова работает');`),
  },

  fe_useState: {
    hints: [
      'У функции должно быть состояние, которое живёт между вызовами. Где в JavaScript хранят такие данные «внутри» функции?',
      'Замыкание: переменная state внутри createState. getState читает её, setState записывает — но если ему передали функцию, сначала вызывает её с текущим значением.',
      'let state = initial; get = () => state; set = (v) => { state = typeof v === "function" ? v(state) : v; }; return [get, set].',
    ],
    rubric: [
      { criterion: 'Состояние живёт в замыкании', weight: 30 },
      { criterion: 'getState всегда возвращает актуальное значение', weight: 25 },
      { criterion: 'Функциональное обновление использует предыдущее значение', weight: 30 },
      { criterion: 'Независимость нескольких созданных состояний', weight: 15 },
    ],
    commonMistakes: [
      'Возвращают само значение вместо геттера — оно устаревает (так и в React: снимок значения)',
      'Общая переменная на уровне модуля — состояния перемешиваются',
      'Не поддерживают функциональное обновление',
    ],
    hiddenTests: t('createState', `
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
assert.equal(g3(), 0, 'значение 0 записывается корректно');`),
  },

  fe_useEffect: {
    hints: [
      'Нужно помнить две вещи между вызовами: прошлые зависимости и функцию очистки, которую вернул прошлый эффект.',
      'Сравнивайте новые deps с прошлыми поэлементно через Object.is. Нет deps — эффект запускается всегда; первый вызов — тоже всегда. Перед повторным запуском вызовите прошлый cleanup.',
      'changed = !started || !deps || deps.length !== last.length || deps.some((d, i) => !Object.is(d, last[i])). Если changed: cleanup?.(); const r = fn(); cleanup = typeof r === "function" ? r : undefined. unmount вызывает cleanup и обнуляет его.',
    ],
    rubric: [
      { criterion: 'Эффект запускается при первом вызове и при изменении deps', weight: 30 },
      { criterion: 'Cleanup вызывается перед повторным запуском и при unmount', weight: 30 },
      { criterion: 'Три режима deps: нет, пустой массив, список', weight: 25 },
      { criterion: 'Сравнение через Object.is (NaN) и повторный unmount безопасен', weight: 15 },
    ],
    commonMistakes: [
      'Cleanup вызывается после нового эффекта, а не перед ним',
      'Сравнение зависимостей через === ломает NaN',
      'Пустой массив зависимостей обрабатывают так же, как отсутствие deps',
    ],
    hiddenTests: t('createEffects', `
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
assert.deepEqual(seen, [1], 'зависимости сравниваются через Object.is');`),
  },

  fe_useMemo: {
    hints: [
      'Нужно запомнить прошлые зависимости и прошлый результат. Где они будут жить?',
      'В замыкании createMemo. При каждом вызове сравните новые deps с прошлыми: если ни один элемент не изменился — вернуть прошлый результат без вызова fn.',
      'changed = !last || last.length !== deps.length || deps.some((d, i) => !Object.is(d, last[i])). Если changed — value = fn(); last = deps.',
    ],
    rubric: [
      { criterion: 'Мемоизирует результат при неизменных зависимостях', weight: 35 },
      { criterion: 'Пересчитывает при изменении любого элемента', weight: 30 },
      { criterion: 'Сравнение через Object.is и учёт длины списка', weight: 20 },
      { criterion: 'Каждый createMemo() изолирован', weight: 15 },
    ],
    commonMistakes: [
      'Сравнивают массив зависимостей по ссылке — пересчёт на каждый вызов',
      'Забывают сравнить длину списка',
      'Сравнивают объекты по содержимому, хотя React сравнивает по ссылке',
    ],
    hiddenTests: t('createMemo', `
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
assert.equal(c4, 1, 'объект сравнивается по ссылке, а не по содержимому');`),
  },

  fe_deepClone: {
    hints: [
      'Копия должна быть независимой на любой глубине. Какие типы значений требуют особого обращения?',
      'Примитивы и null возвращайте как есть. Массивы — map с рекурсией. Объекты — обход собственных ключей с рекурсией. Date и RegExp создаются заново.',
      'if (x === null || typeof x !== "object") return x; Date → new Date(x.getTime()); RegExp → new RegExp(x.source, x.flags); Array → x.map(deepClone); иначе новый объект и рекурсия по Object.keys.',
    ],
    rubric: [
      { criterion: 'Рекурсивно копирует объекты и массивы', weight: 35 },
      { criterion: 'Корректно обрабатывает Date и RegExp', weight: 25 },
      { criterion: 'Примитивы и null возвращаются без ошибок', weight: 20 },
      { criterion: 'Копия независима: изменение не затрагивает оригинал', weight: 20 },
    ],
    commonMistakes: [
      'JSON.parse(JSON.stringify(x)) теряет Date, undefined и функции',
      'Поверхностная копия через спред',
      'Date копируют как обычный объект — теряется тип',
    ],
    hiddenTests: t('deepClone', `
const date = new Date(2020, 1, 1);
const src = { d: date, list: [{ n: 1 }], re: /ab+/gi, nul: null };
const copy: any = deepClone(src);
assert.ok(copy.d !== date && copy.d.getTime() === date.getTime(), 'Date копируется как новый объект');
copy.list[0].n = 99;
assert.equal(src.list[0].n, 1, 'объекты внутри массивов независимы');
assert.ok(copy.re !== src.re && copy.re.source === 'ab+' && copy.re.flags === 'gi', 'RegExp копируется с флагами');
assert.equal(copy.nul, null, 'null сохраняется');
assert.equal(deepClone(5), 5, 'примитив возвращается как есть');
assert.ok(Array.isArray(deepClone([1, [2]])), 'массив остаётся массивом');`),
  },

  fe_curry: {
    hints: [
      'Функция «ждёт», пока ей не передадут достаточно аргументов. Откуда узнать, сколько их нужно?',
      'fn.length — число объявленных параметров. Накапливайте аргументы между вызовами: пока их меньше fn.length, возвращайте новую функцию.',
      'function curried(...args) { return args.length >= fn.length ? fn.apply(this, args) : (...more) => curried.apply(this, [...args, ...more]); }',
    ],
    rubric: [
      { criterion: 'Поддерживает вызов по одному аргументу', weight: 30 },
      { criterion: 'Поддерживает несколько аргументов за раз', weight: 25 },
      { criterion: 'Определяет арность через fn.length', weight: 25 },
      { criterion: 'Частичное применение можно переиспользовать', weight: 20 },
    ],
    commonMistakes: [
      'Рассчитывают только на вызов по одному аргументу',
      'Изменяют накопленный список аргументов — частичное применение ломается при повторном использовании',
      'Теряют this',
    ],
    hiddenTests: t('curry', `
const add = (a: number, b: number, c: number) => a + b + c;
const cur: any = curry(add);
assert.equal(cur(1, 2)(3), 6, 'несколько аргументов за раз: (1, 2)(3)');
assert.equal(cur(1)(2, 3), 6, 'и (1)(2, 3)');
assert.equal(cur(1, 2, 3), 6, 'все аргументы сразу');
const part = cur(1);
assert.equal(part(2)(3), 6, 'частичное применение');
assert.equal(part(10)(20), 31, 'частичное применение можно переиспользовать');
assert.equal((curry(() => 5) as any)(), 5, 'функция без аргументов вызывается сразу');`),
  },

  fe_parseQuery: {
    hints: [
      'Строка запроса — это пары ключ=значение через &. Подумайте, какие необычные случаи бывают: повтор ключа, ключ без значения, кодирование.',
      'Разбейте по "&", каждую пару — по первому "=". Повторяющийся ключ превращает значение в массив. Значения нужно декодировать (%XX, "+" — пробел), но сломанная последовательность не должна бросать ошибку.',
      'Собирайте в Map, а не в объект: ключи constructor и __proto__ ломают обычный объект. В конце Object.fromEntries(map). decodeURIComponent оберните в try/catch.',
    ],
    rubric: [
      { criterion: 'Разбор пар и повторяющихся ключей в массив', weight: 30 },
      { criterion: 'Декодирование (%XX, +) и защита от ошибок декодирования', weight: 30 },
      { criterion: 'Граничные случаи: пусто, ключ без значения, без "?"', weight: 20 },
      { criterion: 'Безопасность: ключи constructor и __proto__', weight: 20 },
    ],
    commonMistakes: [
      'Забывают декодировать значения',
      'Разбивают по "=" целиком — значение со знаком "=" обрезается',
      'Накопление в обычном объекте ломается на ключе constructor',
    ],
    hiddenTests: t('parseQueryString', `
assert.deepEqual(parseQueryString(''), {}, 'пустая строка');
assert.deepEqual(parseQueryString('?'), {}, 'только знак вопроса');
assert.deepEqual(parseQueryString('a=1&b=2'), { a: '1', b: '2' }, 'без ведущего ?');
assert.deepEqual(parseQueryString('?a=1&a=2&a=3'), { a: ['1', '2', '3'] }, 'три значения подряд');
assert.deepEqual(parseQueryString('?flag&x='), { flag: '', x: '' }, 'ключ без значения и пустое значение');
assert.deepEqual(parseQueryString('?q=hello%20world&n=a+b'), { q: 'hello world', n: 'a b' }, 'декодирование %XX и +');
assert.deepEqual(parseQueryString('?name=%D0%90%D0%BD%D0%BD%D0%B0'), { name: 'Анна' }, 'UTF-8');
assert.deepEqual(parseQueryString('?a=%'), { a: '%' }, 'сломанная %-последовательность не бросает ошибку');
assert.deepEqual(parseQueryString('?a=b=c'), { a: 'b=c' }, 'знак = внутри значения сохраняется');
const tricky: any = parseQueryString('?constructor=1&toString=2');
assert.deepEqual(Object.keys(tricky), ['constructor', 'toString'], 'служебные имена — обычные ключи');
assert.equal(tricky.constructor, '1', 'значение constructor читается как строка');`),
  },

  fe_eventDelegate: {
    hints: [
      'Один обработчик на контейнер получает все события потомков. Как понять, что событие пришло от нужного элемента?',
      'event.target — источник. Метод closest(selector) поднимается от него вверх и находит подходящего предка (или сам элемент).',
      'const match = event.target?.closest(selector); if (match) handler.call(match, event). Верните функцию, которая снимает обработчик с root.',
    ],
    rubric: [
      { criterion: 'Один обработчик на root, срабатывает для подходящих потомков', weight: 30 },
      { criterion: 'Использует closest для поиска цели, в том числе вложенной', weight: 30 },
      { criterion: 'this — найденный элемент, аргумент — исходное событие', weight: 20 },
      { criterion: 'Возвращает функцию отписки', weight: 20 },
    ],
    commonMistakes: [
      'Сравнивают event.target.matches(selector) — не работает для вложенных элементов внутри цели',
      'Вешают обработчик на каждый элемент — смысл делегирования теряется',
      'Не возвращают способ отписаться — утечка обработчиков',
    ],
    hiddenTests: t('delegate', `
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
assert.equal(seen.length, 1, 'пустая цель не ломает обработчик');`),
  },

  fe_fetchJSON: {
    hints: [
      'fetch не отклоняется на ответ 404/500. Что ещё нужно проверить и обработать в «безопасной» обёртке?',
      'Проверяйте response.ok и бросайте ошибку со статусом. Отмену запроса (AbortError) отличайте от остальных ошибок. Заголовок Content-Type по умолчанию — JSON, но пользовательские заголовки приоритетнее.',
      'try { const r = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", ...opts.headers } }); if (!r.ok) throw new Error(...); return r.json(); } catch (e) { if (e.name === "AbortError") throw new Error("Request was aborted"); throw e; }',
    ],
    rubric: [
      { criterion: 'Проверяет response.ok и бросает ошибку со статусом', weight: 30 },
      { criterion: 'Возвращает разобранный JSON', weight: 20 },
      { criterion: 'Объединяет заголовки: значение по умолчанию + пользовательские', weight: 25 },
      { criterion: 'Отличает отмену (AbortError) от остальных ошибок', weight: 25 },
    ],
    commonMistakes: [
      'Не проверяют response.ok — страница ошибки разбирается как JSON',
      'Затирают пользовательские заголовки своими',
      'Показывают пользователю AbortError как ошибку',
    ],
    hiddenTests: t('fetchJSON', `
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
(global as any).fetch = orig;`),
  },

  fe_LRU: {
    hints: [
      'LRU вытесняет элемент, к которому дольше всего не обращались. Нужна структура, которая помнит порядок использования.',
      'Map в JavaScript хранит порядок вставки. Самый свежий элемент — в конце, самый старый — первый. При обращении перемещайте ключ в конец.',
      'get: если ключ есть — удалить и вставить заново (станет последним), вернуть значение. set: если ключ есть — удалить; иначе при переполнении удалить первый ключ (map.keys().next().value); затем вставить.',
    ],
    rubric: [
      { criterion: 'get и set работают за O(1)', weight: 20 },
      { criterion: 'Вытесняет наименее недавно использованный элемент', weight: 30 },
      { criterion: 'get обновляет «свежесть» элемента', weight: 25 },
      { criterion: 'Обновление существующего ключа не вытесняет лишнего', weight: 25 },
    ],
    commonMistakes: [
      'get не обновляет порядок — вытесняется не тот элемент',
      'Обновление существующего ключа ведёт к вытеснению соседа',
      'Проверка `if (value)` ломает значения 0 и пустую строку',
    ],
    hiddenTests: t('LRUCache', `
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
assert.equal(f.get('k'), 0, 'ложные значения хранятся');`),
  },

  fe_deepEqual: {
    hints: [
      'Сравнение по ссылке недостаточно. Перечислите, какие виды значений нужно сравнивать по-разному.',
      'Сначала быстрые случаи: строгое равенство, null/undefined, разные типы. Затем даты, массивы и обычные объекты — рекурсивно.',
      'a === b → true; если не оба объекта — false; Date — сравнить getTime; массивы — длина и поэлементно; объекты — одинаковое множество ключей и deepEqual по каждому. Массив и объект — разные.',
    ],
    rubric: [
      { criterion: 'Рекурсивное сравнение объектов и массивов', weight: 30 },
      { criterion: 'Различает массив и объект, null и undefined, типы', weight: 25 },
      { criterion: 'Сравнивает множества ключей (порядок не важен, лишний ключ — различие)', weight: 25 },
      { criterion: 'Корректно обрабатывает Date', weight: 20 },
    ],
    commonMistakes: [
      'JSON.stringify для сравнения зависит от порядка ключей и теряет undefined',
      'Не проверяют число ключей — объект с лишним ключом считается равным',
      'Считают равными массив и объект с индексами в качестве ключей',
    ],
    hiddenTests: t('deepEqual', `
assert.equal(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true, 'порядок ключей не важен');
assert.equal(deepEqual({ a: 1 }, { a: 1, b: undefined }), false, 'разное число ключей');
assert.equal(deepEqual([1, 2], [1, 2, 3]), false, 'длина массивов');
assert.equal(deepEqual([1], { 0: 1 }), false, 'массив и объект различаются');
assert.equal(deepEqual(null, undefined), false, 'null и undefined');
assert.equal(deepEqual(new Date(5), new Date(5)), true, 'даты по значению');
assert.equal(deepEqual(new Date(5), new Date(6)), false, 'разные даты');
assert.equal(deepEqual({ a: { b: [1, { c: 2 }] } }, { a: { b: [1, { c: 3 }] } }), false, 'глубокое различие');
assert.equal(deepEqual(1, '1' as any), false, 'разные типы');`),
  },

  fe_formatBytes: {
    hints: [
      'Размер растёт степенями 1024: байты, KB, MB, GB. Как определить, в какой единице показывать число?',
      'Номер единицы — это целая часть логарифма по основанию 1024. Затем делите число на 1024 в этой степени и округляйте.',
      'i = Math.floor(Math.log(n) / Math.log(1024)); значение = n / 1024 ** i; округление до 2 знаков без хвостовых нулей: parseFloat(value.toFixed(2)). Отдельно обработайте 0.',
    ],
    rubric: [
      { criterion: 'Верно выбирает единицу измерения на границах (1023, 1024, 1048576)', weight: 35 },
      { criterion: 'Округляет до двух знаков без хвостовых нулей', weight: 30 },
      { criterion: 'Обрабатывает ноль', weight: 20 },
      { criterion: 'Не дублирует код для каждой единицы (массив единиц)', weight: 15 },
    ],
    commonMistakes: [
      'Делят на 1000 вместо 1024',
      'Ломается на 0 (логарифм нуля)',
      'toFixed без parseFloat оставляет хвостовые нули ("1.50 KB")',
    ],
    hiddenTests: t('formatBytes', `
assert.equal(formatBytes(0), '0 Bytes', 'ноль');
assert.equal(formatBytes(1), '1 Bytes', 'один байт');
assert.equal(formatBytes(1023), '1023 Bytes', 'граница перед KB');
assert.equal(formatBytes(1024), '1 KB', 'ровно килобайт');
assert.equal(formatBytes(1048576), '1 MB', 'ровно мегабайт');
assert.equal(formatBytes(1234567), '1.18 MB', 'округление до двух знаков');
assert.equal(formatBytes(1024 ** 3 * 2.5), '2.5 GB', 'гигабайты без хвостовых нулей');`),
  },

  fe_memoize: {
    hints: [
      'Результат нужно сохранять по ключу, построенному из аргументов. Из чего этот ключ сделать?',
      'Map: ключ → результат. По умолчанию ключ — JSON.stringify(args); пользователь может передать свою keyFn. Проверяйте наличие через has, а не по значению — результат может быть undefined.',
      'return function (...args) { const key = keyFn ? keyFn(...args) : JSON.stringify(args); if (cache.has(key)) return cache.get(key); const r = fn.apply(this, args); cache.set(key, r); return r; }',
    ],
    rubric: [
      { criterion: 'Кэширует результат по аргументам', weight: 30 },
      { criterion: 'Разные наборы аргументов не смешиваются', weight: 25 },
      { criterion: 'Кэширует и undefined/falsy результаты (has вместо проверки значения)', weight: 25 },
      { criterion: 'Поддерживает пользовательскую keyFn и сохраняет this', weight: 20 },
    ],
    commonMistakes: [
      'Проверка `if (cache[key])` не кэширует ложные результаты',
      'Ключ только из первого аргумента смешивает вызовы',
      'Теряют this вызова',
    ],
    hiddenTests: t('memoize', `
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
assert.equal(ctx.f(1), 11, 'this сохраняется');`),
  },

  fe_flatten: {
    hints: [
      'Массивы бывают вложены на разную глубину. Как обработать вложенность произвольной глубины, но остановиться на заданной?',
      'Рекурсия с уменьшающейся глубиной: элемент-массив разворачивается вызовом flatten(item, depth - 1), пока depth > 0.',
      'for (const item of arr) { if (Array.isArray(item) && depth > 0) result.push(...flatten(item, depth - 1)); else result.push(item); }. depth = 0 — вернуть элементы как есть.',
    ],
    rubric: [
      { criterion: 'Разворачивает вложенность до заданной глубины', weight: 35 },
      { criterion: 'По умолчанию разворачивает полностью', weight: 20 },
      { criterion: 'Граничные случаи: depth = 0, пустые и уже плоские массивы', weight: 25 },
      { criterion: 'Не мутирует исходный массив', weight: 20 },
    ],
    commonMistakes: [
      'Игнорируют параметр depth',
      'Используют arr.flat(depth) — задача про реализацию',
      'Мутируют исходный массив',
    ],
    hiddenTests: t('flatten', `
assert.deepEqual(flatten([]), [], 'пустой массив');
assert.deepEqual(flatten([[], [[]], 1]), [1], 'пустые вложенные массивы исчезают');
assert.deepEqual(flatten([[1, 2], [3, [4, [5]]]], 2), [1, 2, 3, 4, [5]], 'depth = 2');
const src = [1, [2]];
flatten(src);
assert.deepEqual(src, [1, [2]], 'исходный массив не меняется');
assert.deepEqual(flatten([1, 2, 3]), [1, 2, 3], 'плоский массив не меняется');`),
  },

  fe_diffShallow: {
    hints: [
      'Нужно сравнить множества ключей двух объектов и значения общих ключей. Какие три категории различий бывают?',
      'added — ключи, которых не было в a. removed — которых нет в b. changed — общие ключи с разными значениями (поверхностно, по ===).',
      'keysA = Object.keys(a), keysB = Object.keys(b). added = keysB без keysA; removed = keysA без keysB; changed = общие ключи, где a[k] !== b[k]. Используйте Set для быстрого поиска.',
    ],
    rubric: [
      { criterion: 'Определяет added и removed по ключам', weight: 30 },
      { criterion: 'Определяет changed только среди общих ключей', weight: 30 },
      { criterion: 'Сравнение поверхностное (по ссылке для вложенных)', weight: 20 },
      { criterion: 'Ключ со значением undefined считается ключом', weight: 20 },
    ],
    commonMistakes: [
      'Сравнивают значения через `a[k] === undefined` — путают отсутствие ключа и значение undefined',
      'Учитывают changed для added/removed ключей',
      'Пытаются сравнивать вложенные объекты глубоко — задача про shallow',
    ],
    hiddenTests: t('diffShallow', `
const r = diffShallow({ a: 1, b: 2, c: 3 }, { a: 1, b: 20, d: 4 });
assert.deepEqual(r, { added: ['d'], removed: ['c'], changed: ['b'] }, 'added, removed и changed');
assert.deepEqual(diffShallow({}, {}), { added: [], removed: [], changed: [] }, 'пустые объекты');
const o = { x: 1 };
assert.deepEqual(diffShallow({ k: o }, { k: o }).changed, [], 'та же ссылка — не изменено');
assert.deepEqual(diffShallow({ k: { x: 1 } }, { k: { x: 1 } }).changed, ['k'], 'сравнение поверхностное: разные ссылки — изменено');
assert.deepEqual(diffShallow({ a: undefined }, {}), { added: [], removed: ['a'], changed: [] }, 'ключ со значением undefined считается ключом');`),
  },

  fe_compose: {
    hints: [
      'compose(f, g)(x) = f(g(x)): функции применяются справа налево. Как свернуть список функций в одну?',
      'reduce по списку: на каждом шаге объединяйте накопленную функцию a со следующей b как (...args) => a(b(...args)). Первая (самая правая) функция может принимать несколько аргументов.',
      'Особые случаи: без функций — тождественная x => x. Иначе fns.reduce((a, b) => (...args) => a(b(...args))).',
    ],
    rubric: [
      { criterion: 'Применяет функции справа налево', weight: 35 },
      { criterion: 'Самая правая функция принимает несколько аргументов', weight: 25 },
      { criterion: 'Без функций возвращает тождественную функцию', weight: 20 },
      { criterion: 'Одна функция и произвольная длина цепочки', weight: 20 },
    ],
    commonMistakes: [
      'Применяют слева направо (это pipe, а не compose)',
      'Теряют аргументы — передают только первый',
      'Падают на пустом списке функций',
    ],
    hiddenTests: t('compose', `
assert.equal((compose() as any)(7), 7, 'без функций — тождественная');
const add = (a: number, b: number) => a + b;
const dbl = (x: number) => x * 2;
const inc = (x: number) => x + 1;
assert.equal((compose(inc, dbl, add) as any)(1, 2), 7, 'справа налево; самая правая принимает несколько аргументов');
assert.equal((compose(dbl) as any)(4), 8, 'одна функция');
assert.equal((compose(dbl, inc) as any)(1), 4, 'порядок важен: сначала inc, потом dbl');`),
  },

  fe_virtualScroll: {
    hints: [
      'Из всего списка рисуется только окно, видимое пользователю. Какие числа определяют границы окна?',
      'Начало окна — scrollTop / itemHeight, округлённое вниз. Конец — (scrollTop + height) / itemHeight, округлённое вверх (частично видимая строка тоже нужна). Прокрутку ограничьте диапазоном.',
      'max = max(0, total - height); scrollTop = clamp(top, 0, max). start = floor(scrollTop / itemHeight); end = min(items.length, ceil((scrollTop + height) / itemHeight)). Смещение — start * itemHeight.',
    ],
    rubric: [
      { criterion: 'Верно считает диапазон видимых элементов', weight: 30 },
      { criterion: 'Частично видимая строка входит в диапазон (ceil)', weight: 25 },
      { criterion: 'Ограничивает прокрутку, обрабатывает пустой и короткий список', weight: 25 },
      { criterion: 'Смещение и общая высота для позиционирования', weight: 20 },
    ],
    commonMistakes: [
      'Округляют конец вниз — нижняя строка «мигает»',
      'Не ограничивают scrollTop — индексы выходят за массив',
      'Копируют весь массив на каждый кадр вместо slice окна',
    ],
    hiddenTests: t('VirtualScroll', `
const vs = new VirtualScroll({ items: Array.from({ length: 100 }, (_, i) => i), height: 50, itemHeight: 20 });
vs.setScrollTop(10);
assert.deepEqual(vs.getRange(), { start: 0, end: 3 }, 'частично видимая строка входит в диапазон');
vs.setScrollTop(-100);
assert.equal(vs.getRange().start, 0, 'отрицательная прокрутка ограничивается нулём');
vs.setScrollTop(1e9);
assert.deepEqual(vs.getRange(), { start: 97, end: 100 }, 'прокрутка ограничивается концом списка');
assert.deepEqual(new VirtualScroll({ items: [], height: 100, itemHeight: 10 }).getVisibleItems(), [], 'пустой список');
const few = new VirtualScroll({ items: [1, 2], height: 1000, itemHeight: 10 });
assert.deepEqual(few.getVisibleItems(), [1, 2], 'элементов меньше, чем помещается');`),
  },
}
