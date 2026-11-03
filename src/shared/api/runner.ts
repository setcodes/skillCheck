// Раннер JS/TS-задач (Frontend).
//
// ВАЖНО: код кандидата выполняется в главном потоке через `new Function`, а список
// DANGEROUS_PATTERNS — это подсказка, а не защита. Фаза 2 плана
// (docs/REVIEW_AND_ROADMAP.md) переносит выполнение в Web Worker с `terminate()` по таймауту.
// Раннеры замороженных профессий (Java, SQL, Python, YAML, Mermaid) лежат в /frozen/runners.

export type TestResult = { ok: boolean; message: string }

const MAX_EXECUTION_TIME = 5000

const DANGEROUS_PATTERNS = [
  /eval\s*\(/,
  /Function\s*\(/,
  /setTimeout\s*\(/,
  /setInterval\s*\(/,
  /import\s*\(/,
  /require\s*\(/,
  /process\./,
  /global\./,
  /window\./,
  /document\./,
  /localStorage/,
  /sessionStorage/,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /WebSocket/,
  /Worker/,
  /Blob/,
  /FileReader/,
]

function createAssert(report: (ok: boolean, msg: string) => void) {
  const strict = {
    equal(a: unknown, b: unknown, m?: string) {
      if (Object.is(a, b)) report(true, m || 'equal')
      else report(false, m || `expected ${a} === ${b}`)
    },
    deepEqual(a: unknown, b: unknown, m?: string) {
      if (JSON.stringify(a) === JSON.stringify(b)) report(true, m || 'deepEqual')
      else report(false, m || 'deep diff')
    },
    ok(v: unknown, m?: string) {
      if (v) report(true, m || 'ok')
      else report(false, m || 'ok(false)')
    },
  }
  return { strict }
}

function findFunctionNames(userCode: string): string[] {
  const exported = userCode.match(/export\s+function\s+(\w+)/g)
  if (exported) return exported.map((f) => f.replace(/export\s+function\s+/, ''))
  const plain = userCode.match(/function\s+(\w+)/g)
  return plain ? plain.map((f) => f.replace(/function\s+/, '')) : []
}

// Грубое вырезание TS-типов. Известно ломается на стрелочных типах — заменяется в Фазе 2.
function stripTypes(code: string): string {
  return code
    .replace(/export\s+/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\(\s*([^)]*?)\s*\)/g, (_m, params: string) => {
      const clean = params
        .split(',')
        .map((p) => p.trim().split(':')[0])
        .join(', ')
      return `(${clean})`
    })
    .replace(/\)\s*:\s*[a-zA-Z0-9_[\]<>|&\s,]+(?=\s*\{)/g, ')')
    .replace(/:\s*[a-zA-Z0-9_[\]<>|&\s,]+(?=\s*=)/g, '')
    .replace(/:\s*[a-zA-Z0-9_[\]<>|&\s,]+(?=\s*[;,])/g, '')
    .replace(/Record<[^>]*>/g, 'any')
    .replace(/Array<[^>]*>/g, 'any[]')
    .replace(/Promise<[^>]*>/g, 'Promise')
    .replace(/:\s*any/g, '')
    .replace(/:\s*unknown/g, '')
    .replace(/:\s*string/g, '')
    .replace(/:\s*number/g, '')
    .replace(/:\s*boolean/g, '')
    .replace(/:\s*object/g, '')
    .replace(/:\s*Function/g, '')
    .replace(/:\s*Error/g, '')
}

function prepareTests(tests: string): string {
  return tests
    .replace(/import\s+\{\s*strict\s+as\s+assert\s*\}\s+from\s+['"]assert['"];?/g, '')
    .replace(/import\s+\*\s+as\s+m\s+from\s+['"]MODULE['"];?/g, '')
    .replace(/const\s+\{\s*(\w+)\s*\}\s*=\s*m;?/g, 'const { $1 } = userModule;')
    .replace(/import\s+\{\s*(\w+)\s*\}\s+from\s+['"]MODULE['"];?/g, 'const { $1 } = userModule;')
    .replace(/;+$/, '')
    .replace(/assert\.equal/g, 'assert.strict.equal')
    .replace(/assert\.deepEqual/g, 'assert.strict.deepEqual')
    .replace(/assert\.ok/g, 'assert.strict.ok')
}

export async function runModule(userCode: string, tests: string): Promise<TestResult[]> {
  if (DANGEROUS_PATTERNS.some((p) => p.test(userCode))) {
    return [{ ok: false, message: 'Код содержит недопустимые конструкции для безопасности' }]
  }

  const functionNames = findFunctionNames(userCode)
  if (functionNames.length === 0) {
    return [{ ok: false, message: 'No functions found in user code' }]
  }

  let userModule: Record<string, unknown>
  try {
    userModule = new Function(`
      ${stripTypes(userCode)}
      return { ${functionNames.join(', ')} }
    `)()
  } catch (e) {
    return [{ ok: false, message: `Error creating user module: ${errorMessage(e)}` }]
  }

  const results: TestResult[] = []
  const assert = createAssert((ok, msg) => results.push({ ok, message: String(msg || '') }))

  try {
    const run = new Promise<void>((resolve, reject) => {
      try {
        new Function('assert', 'userModule', prepareTests(tests))(assert, userModule)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<void>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Execution timeout')), MAX_EXECUTION_TIME)
    })
    try {
      await Promise.race([run, timeout])
    } finally {
      clearTimeout(timer)
    }
  } catch (e) {
    const msg = errorMessage(e)
    results.push({
      ok: false,
      message:
        msg === 'Execution timeout'
          ? 'Превышено время выполнения (5 секунд)'
          : `Test execution error: ${msg}`,
    })
  }

  if (results.length === 0) results.push({ ok: false, message: 'No test assertions were executed' })
  return results
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e || 'Unknown error')
}
