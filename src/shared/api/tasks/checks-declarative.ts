import type { CallCheck, Check, JsExpr } from '@/entities/task/model/checks'

/**
 * Декларативные проверки чистых функций: вызов, аргументы, ожидаемое значение.
 * Видимые проверки задают контракт для кандидата, hidden: true — граничные случаи и производительность.
 */

const js = (expr: string): JsExpr => ({ $js: expr })

type Extra = Partial<Pick<CallCheck, 'unchanged' | 'maxMs' | 'then' | 'hidden'>>

const eq = (title: string, args: unknown[] | JsExpr, equals: unknown, extra: Extra = {}): Check => ({
  type: 'call',
  title,
  args,
  expect: { equals },
  ...extra,
})

const ok = (title: string, args: unknown[] | JsExpr, satisfies: string, extra: Extra = {}): Check => ({
  type: 'call',
  title,
  args,
  expect: { satisfies },
  ...extra,
})

const hidden = (c: Check): Check => ({ ...c, hidden: true })

const products = [
  { id: 1, title: 'Ноутбук', category: 'техника', price: 90000 },
  { id: 2, title: 'Куртка', category: 'одежда', price: 12000 },
  { id: 3, title: 'Монитор', category: 'техника', price: 25000 },
  { id: 4, title: 'Шарф', category: 'одежда', price: 2000 },
]

const flatCategories = [
  { id: 3, parentId: 1, name: 'Ноутбуки' },
  { id: 1, parentId: null, name: 'Электроника' },
  { id: 4, parentId: 2, name: 'Куртки' },
  { id: 2, parentId: null, name: 'Одежда' },
  { id: 5, parentId: 3, name: 'Игровые' },
]

const chainDepth = '(r) => { let d = 0; let n = r[0]; while (n) { d++; n = n.children[0]; } return r.length === 1 && d === 10000; }'

export const DECLARATIVE_CHECKS: Record<string, Check[]> = {
  fe_classNames: [
    eq('строки, массивы и объекты вместе', ['a', ['b', { c: true, b: false }], { a: true }, 'c'], 'a b c'),
    hidden(eq('без аргументов — пустая строка', [], '')),
    hidden(eq('ложные значения пропускаются', js('[null, undefined, false, 0, ""]'), '')),
    hidden(eq('числа допустимы', ['a', 5, 'b'], 'a 5 b')),
    hidden(eq('вложенные массивы и дубли', [['a', ['b', ['c']]], 'b', 'd'], 'a b c d')),
    hidden(eq('из объекта берутся ключи с истинным значением', [{ a: 1, b: 0, c: 'x', d: null }], 'a c')),
  ],

  fe_isPalindrome: [
    eq('палиндром с пробелами и разным регистром', ['А роза упала на лапу Азора'], true),
    eq('не палиндром', ['hello'], false),
    hidden(eq('пустая строка — палиндром', [''], true)),
    hidden(eq('регистр не важен', ['Level'], true)),
    hidden(eq('пробелы игнорируются', ['a b a'], true)),
    hidden(eq('не строка — false', [12321], false)),
    hidden(eq('«ab» — не палиндром', ['ab'], false)),
  ],

  fe_uniqueBy: [
    eq('уникальные по полю', [[{ id: 1 }, { id: 1 }, { id: 2 }], 'id'], [{ id: 1 }, { id: 2 }]),
    hidden(eq('ключ-функция; остаётся первый элемент группы', [[1, 2, 3, 4, 5, 6], js('x => x % 3')], [1, 2, 3])),
    hidden(eq('пустой массив', [[], 'id'], [])),
    hidden(eq('остаётся первый встреченный объект', [[{ id: 1, v: 'first' }, { id: 1, v: 'second' }], 'id'], [{ id: 1, v: 'first' }])),
    hidden(eq('undefined и null — разные ключи', js('[[{ k: undefined }, { k: undefined }, { k: null }], "k"]'), js('[{ k: undefined }, { k: null }]'))),
  ],

  fe_chunk: [
    eq('делит массив на куски, последний короче', [[1, 2, 3, 4, 5], 2], [[1, 2], [3, 4], [5]]),
    hidden(eq('размер больше длины', [[1, 2, 3], 5], [[1, 2, 3]])),
    hidden(eq('размер 1', [[1, 2, 3], 1], [[1], [2], [3]])),
    hidden(eq('пустой массив', [[], 3], [])),
    hidden(eq('нулевой размер не зацикливается', [[1, 2], 0], [])),
    hidden(eq('исходный массив не меняется', [[1, 2, 3, 4], 2], [[1, 2], [3, 4]], { unchanged: true })),
  ],

  fe_sumBy: [
    eq('сумма по полю', [[{ a: 2 }, { a: 3 }], 'a'], 5),
    hidden(eq('функция-итератор', [[{ a: 1 }, { a: 2 }], js('x => x.a * 10')], 30)),
    hidden(eq('пустой массив — 0', [[], 'a'], 0)),
    hidden(eq('отрицательные числа', [[{ a: -2 }, { a: 5 }], 'a'], 3)),
  ],

  fe_safeGet: [
    eq('значение по вложенному пути', [{ a: { b: { c: 1 } } }, 'a.b.c'], 1),
    eq('нет пути — значение по умолчанию', [{ a: { b: { c: 1 } } }, 'a.b.d', 'default'], 'default'),
    hidden(eq('значение 0 не заменяется значением по умолчанию', [{ a: { b: 0 } }, 'a.b', 9], 0)),
    hidden(eq('пустая строка сохраняется', [{ a: '' }, 'a', 'x'], '')),
    hidden(eq('false сохраняется', [{ a: false }, 'a', true], false)),
    hidden(eq('null вместо объекта', [null, 'a.b', 'def'], 'def')),
    hidden(eq('индекс массива в пути', [{ a: [{ b: 5 }] }, 'a.0.b'], 5)),
    hidden(eq('путь через не-объект', [{ a: 1 }, 'a.b.c', 'def'], 'def')),
  ],

  fe_formatBytes: [
    eq('1536 байт — 1.5 KB', [1536], '1.5 KB'),
    hidden(eq('ноль', [0], '0 Bytes')),
    hidden(eq('один байт', [1], '1 Bytes')),
    hidden(eq('граница перед KB', [1023], '1023 Bytes')),
    hidden(eq('ровно килобайт', [1024], '1 KB')),
    hidden(eq('ровно мегабайт', [1048576], '1 MB')),
    hidden(eq('округление до двух знаков', [1234567], '1.18 MB')),
    hidden(eq('гигабайты без хвостовых нулей', [2684354560], '2.5 GB')),
  ],

  fe_flatten: [
    eq('depth = 1', [[1, [2, [3]]], 1], [1, 2, [3]]),
    eq('depth = 2', [[1, [2, [3]]], 2], [1, 2, 3]),
    eq('по умолчанию — до конца', [[1, [2, [3, [4]]]]], [1, 2, 3, 4]),
    eq('depth = 0 ничего не разворачивает', [[1, [2]], 0], [1, [2]]),
    hidden(eq('пустой массив', [[]], [])),
    hidden(eq('пустые вложенные массивы исчезают', [[[], [[]], 1]], [1])),
    hidden(eq('depth = 2 на глубокой вложенности', [[[1, 2], [3, [4, [5]]]], 2], [1, 2, 3, 4, [5]])),
    hidden(eq('исходный массив не меняется', [[1, [2]]], [1, 2], { unchanged: true })),
    hidden(eq('плоский массив не меняется', [[1, 2, 3]], [1, 2, 3])),
  ],

  fe_diffShallow: [
    eq('added, removed и changed', [{ a: 1, b: 2 }, { b: 3, c: 4 }], { added: ['c'], removed: ['a'], changed: ['b'] }),
    hidden(eq('все три категории вместе', [{ a: 1, b: 2, c: 3 }, { a: 1, b: 20, d: 4 }], { added: ['d'], removed: ['c'], changed: ['b'] })),
    hidden(eq('пустые объекты', [{}, {}], { added: [], removed: [], changed: [] })),
    hidden(eq('та же ссылка — не изменено', js('(() => { const o = { x: 1 }; return [{ k: o }, { k: o }]; })()'), { added: [], removed: [], changed: [] })),
    hidden(eq('сравнение поверхностное: разные ссылки — изменено', [{ k: { x: 1 } }, { k: { x: 1 } }], { added: [], removed: [], changed: ['k'] })),
    hidden(eq('ключ со значением undefined считается ключом', js('[{ a: undefined }, {}]'), { added: [], removed: ['a'], changed: [] })),
  ],

  fe_deepEqual: [
    eq('вложенные объекты и массивы равны', [{ x: [1, { y: 2 }] }, { x: [1, { y: 2 }] }], true),
    hidden(eq('порядок ключей не важен', [{ a: 1, b: 2 }, { b: 2, a: 1 }], true)),
    hidden(eq('разное число ключей', js('[{ a: 1 }, { a: 1, b: undefined }]'), false)),
    hidden(eq('длина массивов', [[1, 2], [1, 2, 3]], false)),
    hidden(eq('массив и объект различаются', [[1], { 0: 1 }], false)),
    hidden(eq('null и undefined', js('[null, undefined]'), false)),
    hidden(eq('даты по значению', js('[new Date(5), new Date(5)]'), true)),
    hidden(eq('разные даты', js('[new Date(5), new Date(6)]'), false)),
    hidden(eq('глубокое различие', [{ a: { b: [1, { c: 2 }] } }, { a: { b: [1, { c: 3 }] } }], false)),
    hidden(eq('разные типы', [1, '1'], false)),
  ],

  fe_parseQuery: [
    eq('повторяющиеся ключи собираются в массив', ['?a=1&b=2&a=3'], { a: ['1', '3'], b: '2' }),
    hidden(eq('пустая строка', [''], {})),
    hidden(eq('только знак вопроса', ['?'], {})),
    hidden(eq('без ведущего ?', ['a=1&b=2'], { a: '1', b: '2' })),
    hidden(eq('три значения подряд', ['?a=1&a=2&a=3'], { a: ['1', '2', '3'] })),
    hidden(eq('ключ без значения и пустое значение', ['?flag&x='], { flag: '', x: '' })),
    hidden(eq('декодирование %XX и +', ['?q=hello%20world&n=a+b'], { q: 'hello world', n: 'a b' })),
    hidden(eq('UTF-8', ['?name=%D0%90%D0%BD%D0%BD%D0%B0'], { name: 'Анна' })),
    hidden(eq('сломанная %-последовательность не бросает ошибку', ['?a=%'], { a: '%' })),
    hidden(eq('знак = внутри значения сохраняется', ['?a=b=c'], { a: 'b=c' })),
    hidden(eq('служебные имена — обычные ключи', ['?constructor=1&toString=2'], { constructor: '1', toString: '2' })),
  ],

  fe_groupBy: [
    eq('группировка по полю: состав и порядок внутри групп', [products, 'category'], {
      техника: [products[0], products[2]],
      одежда: [products[1], products[3]],
    }),
    ok('названия групп — в порядке появления', [products, 'category'], '(r) => Object.keys(r).join() === "техника,одежда"'),
    eq('группировка по функции', [products, js('p => (p.price > 10000 ? "дорого" : "дёшево")')], {
      дорого: [products[0], products[1], products[2]],
      дёшево: [products[3]],
    }),
    eq('пустой массив — пустой объект', [[], 'x'], {}),
    ok('служебные имена — обычные ключи', [[{ k: 'constructor' }, { k: 'toString' }, { k: 'constructor' }], 'k'],
      '(r) => Object.keys(r).join() === "constructor,toString" && Array.isArray(r.constructor) && r.constructor.length === 2'),
    eq('исходный массив не меняется', [[{ k: 'a' }], 'k'], { a: [{ k: 'a' }] }, { unchanged: true }),
    hidden(eq('числовые ключи приводятся к строке', [['a', 'bb', 'cc'], 'length'], { 1: ['a'], 2: ['bb', 'cc'] })),
    hidden(eq('порядок внутри групп сохраняется', [[5, 3, 4, 8], js('n => (n % 2 === 0 ? "even" : "odd")')], { odd: [5, 3], even: [4, 8] })),
  ],

  fe_wordFrequency: [
    eq('базовый подсчёт', ['a b a c b a'], [['a', 3], ['b', 2], ['c', 1]]),
    eq('регистр и знаки препинания', ['Привет, мир! привет.'], [['привет', 2], ['мир', 1]]),
    eq('при равенстве — по алфавиту', ['b a'], [['a', 1], ['b', 1]]),
    eq('пустая строка', [''], []),
    eq('только разделители', ['  ...  '], []),
    eq('цифры входят в слова', ['x1 X1 x2'], [['x1', 2], ['x2', 1]]),
    eq('служебные слова не ломают счётчик', ['constructor constructor'], [['constructor', 2]]),
    hidden(eq('регистр не важен', ['Hello hello HELLO world'], [['hello', 3], ['world', 1]])),
    hidden(eq('кириллица и ё', ['ёж Ёж'], [['ёж', 2]])),
    hidden(eq('дефис и подчёркивание — разделители', ['a-b a_b'], [['a', 2], ['b', 2]])),
  ],

  fe_flattenObject: [
    eq('вложенность', [{ a: { b: 1, c: { d: 2 } }, e: 3 }], { 'a.b': 1, 'a.c.d': 2, e: 3 }),
    eq('массив остаётся значением', [{ list: [1, { x: 1 }] }], { list: [1, { x: 1 }] }),
    eq('null, undefined и 0 — значения', js('[{ a: null, b: undefined, c: 0 }]'), js('{ a: null, b: undefined, c: 0 }')),
    eq('пустой объект', [{}], {}),
    eq('исходный объект не меняется', [{ a: { b: 1 } }], { 'a.b': 1 }, { unchanged: true }),
    hidden(eq('глубокая вложенность', [{ a: { b: { c: { d: 1 } } } }], { 'a.b.c.d': 1 })),
    hidden(eq('несколько веток', [{ x: { y: 1 }, z: { w: 2 } }], { 'x.y': 1, 'z.w': 2 })),
  ],

  fe_buildTree: [
    eq('два корня, три уровня, потомок раньше родителя', [flatCategories], [
      { id: 1, parentId: null, name: 'Электроника', children: [
        { id: 3, parentId: 1, name: 'Ноутбуки', children: [{ id: 5, parentId: 3, name: 'Игровые', children: [] }] },
      ] },
      { id: 2, parentId: null, name: 'Одежда', children: [{ id: 4, parentId: 2, name: 'Куртки', children: [] }] },
    ]),
    eq('пустой список', [[]], []),
    eq('сирота отбрасывается', [[{ id: 1, parentId: 99, name: 'X' }]], []),
    ok('порядок детей сохраняется', [[
      { id: 1, parentId: null, name: 'root' },
      { id: 2, parentId: 1, name: 'второй' },
      { id: 3, parentId: 1, name: 'третий' },
    ]], '(r) => r[0].children.map((c) => c.id).join() === "2,3"'),
    eq('входные объекты не мутируются', [[{ id: 1, parentId: null, name: 'A' }]], [{ id: 1, parentId: null, name: 'A', children: [] }], { unchanged: true }),
    ok('на 30 000 элементов работает быстро (линейно)',
      js('[Array.from({ length: 30000 }, (_, i) => ({ id: i + 1, parentId: i === 0 ? null : Math.floor((i + 1) / 2), name: "n" }))]'),
      '(r) => r.length === 1', { maxMs: 1000 }),
    hidden(eq('несколько корней сохраняют порядок', [[{ id: 2, parentId: null, name: 'b' }, { id: 1, parentId: null, name: 'a' }]], [
      { id: 2, parentId: null, name: 'b', children: [] },
      { id: 1, parentId: null, name: 'a', children: [] },
    ])),
    hidden(ok('длинная цепочка в обратном порядке: глубина сохранена без рекурсии по стеку',
      js('[Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, parentId: i === 0 ? null : i, name: "n" })).reverse()]'), chainDepth)),
  ],

  fe_buildPostsView: [
    eq('имя автора и число комментариев, порядок как у постов', [
      [{ id: 10, userId: 2, title: 'Второй автор' }, { id: 11, userId: 1, title: 'Первый автор' }, { id: 12, userId: 1, title: 'Без комментариев' }],
      [{ id: 1, postId: 10 }, { id: 2, postId: 10 }, { id: 3, postId: 11 }],
      [{ id: 1, name: 'Анна' }, { id: 2, name: 'Борис' }],
    ], [
      { id: 10, title: 'Второй автор', userName: 'Борис', commentsCount: 2 },
      { id: 11, title: 'Первый автор', userName: 'Анна', commentsCount: 1 },
      { id: 12, title: 'Без комментариев', userName: 'Анна', commentsCount: 0 },
    ]),
    eq('нет постов', [[], [{ id: 1, postId: 10 }], [{ id: 1, name: 'Анна' }]], []),
    ok('на 30 000 записей — быстро (без вложенных циклов)',
      js('(() => { const N = 30000; return [Array.from({ length: N }, (_, i) => ({ id: i, userId: N - 1 - i, title: "t" })), Array.from({ length: N }, (_, i) => ({ id: i, postId: i % 100 })), Array.from({ length: N }, (_, i) => ({ id: i, name: "u" + i }))]; })()'),
      '(r) => r[0].userName === "u29999" && r.length === 30000', { maxMs: 1000 }),
    hidden(ok('результат — новые объекты только с нужными полями',
      [[{ id: 1, userId: 1, title: 'T' }], [], [{ id: 1, name: 'A' }]],
      '(r, a) => r[0] !== a[0][0] && Object.keys(r[0]).sort().join() === "commentsCount,id,title,userName"')),
    hidden(eq('без комментариев — 0', [[{ id: 1, userId: 1, title: 'T' }], [], [{ id: 1, name: 'A' }]],
      [{ id: 1, title: 'T', userName: 'A', commentsCount: 0 }])),
  ],

  fe_compose: [
    eq('compose(f, g)(3) = f(g(3))', [js('x => x + 1'), js('x => x * 2')], 7, { then: [3] }),
    hidden(eq('без функций — тождественная', [], 7, { then: [7] })),
    hidden(eq('справа налево; самая правая принимает несколько аргументов', [js('x => x + 1'), js('x => x * 2'), js('(a, b) => a + b')], 7, { then: [1, 2] })),
    hidden(eq('одна функция', [js('x => x * 2')], 8, { then: [4] })),
    hidden(eq('порядок важен: сначала inc, потом dbl', [js('x => x * 2'), js('x => x + 1')], 4, { then: [1] })),
  ],
}
