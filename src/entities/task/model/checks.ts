/** Выражение JavaScript, вычисляемое в песочнице: функции, Date, большие входы, undefined, NaN. */
export type JsExpr = { $js: string }

/** Значение в проверке: JSON-данные, в любом месте которых может стоять JsExpr. */
export type CheckValue = unknown

export type Expectation =
  /** результат глубоко равен значению */
  | { equals: CheckValue }
  /** результат промиса глубоко равен значению */
  | { resolves: CheckValue }
  /** вызов бросает ошибку: true — любую, строка — с таким именем или частью сообщения */
  | { throws: string | true }
  /** промис отклоняется (то же правило для строки) */
  | { rejects: string | true }
  /** предикат на JS: (result, args) => boolean */
  | { satisfies: string }

/** Вызов экспортируемой функции с аргументами и проверка результата. */
export interface CallCheck {
  type: 'call'
  title: string
  /** имя экспорта; по умолчанию — exportName задачи */
  fn?: string
  args: CheckValue[] | JsExpr
  /** если функция возвращает функцию — вызвать результат с этими аргументами */
  then?: CheckValue[] | JsExpr
  expect: Expectation
  /** входные данные не должны измениться */
  unchanged?: boolean
  /** вызов не должен занимать дольше (мс) */
  maxMs?: number
  /** скрытая проверка: кандидат видит только «Скрытая проверка N» */
  hidden?: boolean
}

/** Произвольный сценарий с assert — для состояния, таймеров, классов и моков. */
export interface ScriptCheck {
  type: 'script'
  title?: string
  code: string
  hidden?: boolean
}

export type Check = CallCheck | ScriptCheck
