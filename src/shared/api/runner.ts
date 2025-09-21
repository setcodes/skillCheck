export async function runModule(
  userCode: string,
  tests: string,
  opts?: { debug?: boolean }
): Promise<{ ok: boolean; message: string }[]> {
  const debug = !!opts?.debug
  try {
    // Создаем функцию assert
    const createAssert = (report: (ok: boolean, msg: string) => void) => {
      function eq(a: any, b: any) { return Object.is(a, b) }
      function deq(a: any, b: any) { return JSON.stringify(a) === JSON.stringify(b) }
      
      const strict = {
        equal(a: any, b: any, m?: string) {
          if (eq(a, b)) {
            report(true, m || 'equal')
          } else {
            report(false, m || `expected ${a} === ${b}`)
          }
        },
        deepEqual(a: any, b: any, m?: string) {
          if (deq(a, b)) {
            report(true, m || 'deepEqual')
          } else {
            report(false, m || 'deep diff')
          }
        },
        ok(v: any, m?: string) {
          if (v) {
            report(true, m || 'ok')
          } else {
            report(false, m || 'ok(false)')
          }
        }
      }
      return { strict }
    }

    // Создаем модуль из пользовательского кода
    const exportedFunctions = userCode.match(/export\s+function\s+(\w+)/g)?.map(f => f.replace('export function ', '')) || []
    
    // Если не найдены экспортируемые функции, попробуем найти обычные функции
    let functionNames: string[] = []
    if (exportedFunctions.length === 0) {
      const functionMatches = userCode.match(/function\s+(\w+)/g)
      if (functionMatches) {
        functionNames = functionMatches.map(f => f.replace('function ', ''))
      }
    } else {
      functionNames = exportedFunctions
    }
    
    if (functionNames.length === 0) {
      return [{ok: false, message: 'No functions found in user code'}]
    }
    
    // Убираем export и типы из кода для выполнения
    let cleanUserCode = userCode.replace(/export\s+/g, '')
    
    // Убираем TypeScript типы более точно
    cleanUserCode = cleanUserCode
      // Убираем дженерики: function name<T>() -> function name()
      .replace(/<[^>]*>/g, '')
      // Убираем типы параметров функций: (a: number, b: string) -> (a, b)
      .replace(/\(\s*([^)]*?)\s*\)/g, (match, params) => {
        const cleanParams = params.split(',').map((p: string) => p.trim().split(':')[0]).join(', ')
        return `(${cleanParams})`
      })
      // Убираем типы возвращаемых значений: function name(): string -> function name()
      .replace(/\)\s*:\s*[a-zA-Z0-9_\[\]<>|&\s,]+(?=\s*\{)/g, ')')
      // Убираем типы переменных: const x: number = -> const x =
      .replace(/:\s*[a-zA-Z0-9_\[\]<>|&\s,]+(?=\s*=)/g, '')
      // Убираем типы в объявлениях: let x: string -> let x
      .replace(/:\s*[a-zA-Z0-9_\[\]<>|&\s,]+(?=\s*[;,])/g, '')
      // Убираем сложные типы: Record<string, any> -> any
      .replace(/Record<[^>]*>/g, 'any')
      .replace(/Array<[^>]*>/g, 'any[]')
      .replace(/Promise<[^>]*>/g, 'Promise')
      // Убираем оставшиеся типы: : any -> (пусто)
      .replace(/:\s*any/g, '')
      .replace(/:\s*unknown/g, '')
      .replace(/:\s*string/g, '')
      .replace(/:\s*number/g, '')
      .replace(/:\s*boolean/g, '')
      .replace(/:\s*object/g, '')
      .replace(/:\s*Function/g, '')
      .replace(/:\s*Error/g, '')
    
    let userModule
    try {
      userModule = new Function(`
        ${cleanUserCode}
        return {
          ${functionNames.join(', ')}
        }
      `)()
    } catch (e: any) {
      console.error('Error creating user module:', e)
      return [{ok: false, message: `Error creating user module: ${e?.message || 'Unknown error'}`}]
    }

    // Подготавливаем тесты
    let testCode = tests
      .replace(/import\s+\{\s*strict\s+as\s+assert\s*\}\s+from\s+['"]assert['"];?/g, '')
      .replace(/import\s+\*\s+as\s+m\s+from\s+['"]MODULE['"];?/g, '')
      .replace(/const\s+\{\s*(\w+)\s*\}\s*=\s*m;?/g, 'const { $1 } = userModule;')
      .replace(/import\s+\{\s*(\w+)\s*\}\s+from\s+['"]MODULE['"];?/g, 'const { $1 } = userModule;')
    
    // Убираем лишние точки с запятой в конце
    testCode = testCode.replace(/;+$/, '')

    // Выполняем тесты
    const results: {ok: boolean, message: string}[] = []
    const assert = createAssert((ok, msg) => results.push({ok, message: String(msg || '')}))
    
    // Заменяем assert.equal на assert.strict.equal
    testCode = testCode.replace(/assert\.equal/g, 'assert.strict.equal')
    testCode = testCode.replace(/assert\.deepEqual/g, 'assert.strict.deepEqual')
    testCode = testCode.replace(/assert\.ok/g, 'assert.strict.ok')
    
    if (debug) {
      console.log('Original user code:', userCode)
      console.log('Clean user code:', cleanUserCode)
      console.log('Function names:', functionNames)
      console.log('Original test code:', tests)
      console.log('Processed test code:', testCode)
      console.log('User module:', userModule)
    }
    
    // Проверяем, что код стал валидным JavaScript
    try {
      new Function(cleanUserCode)
      if (debug) console.log('Clean code is valid JavaScript')
    } catch (e) {
      if (debug) {
        console.error('Clean code is still invalid:', e)
        console.log('Clean code:', cleanUserCode)
      }
    }
    
    // Проверяем, что все функции доступны
    for (const funcName of functionNames) {
      if (typeof userModule[funcName] !== 'function') {
        console.warn(`Function ${funcName} is not available in user module`)
      }
    }
    
    try {
      // Выполняем тест с доступом к модулю и assert
      new Function('assert', 'userModule', testCode)(assert, userModule)
    } catch (e: any) {
      if (debug) {
        console.error('Test execution error:', e)
        console.error('Error stack:', e?.stack)
      }
      results.push({ok: false, message: `Test execution error: ${e?.message || 'Unknown error'}`})
    }
    
    // Если нет результатов, значит тесты не выполнились
    if (results.length === 0) {
      results.push({ok: false, message: 'No test assertions were executed'})
    }

    return results
  } catch (error: any) {
    if (debug) console.error('Error in runModule:', error)
    return [{ok: false, message: error?.message || 'Unknown error'}]
  }
}

// --- SQL runner (in-browser) ---
export async function runSql(
  userSql: string,
  spec: { schema?: string[]; data?: string[]; expectedRows: any[]; check?: string; queryVar?: string }
): Promise<{ ok: boolean; message: string }[]> {
  const results: { ok: boolean; message: string }[] = []
  try {
    // dynamic import to avoid heavy initial bundle if not needed
    const alasqlMod: any = await import('alasql')
    const alasql = (alasqlMod as any).default || alasqlMod
    // reset database context by using a new database per run
    alasql('CREATE DATABASE IF NOT EXISTS tmpdb')
    alasql('USE tmpdb')
    try {
      for (const s of (spec.schema || [])) alasql(s)
      for (const d of (spec.data || [])) alasql(d)
      const query = spec.check
        ? String(spec.check).replace(new RegExp(String(spec.queryVar || 'SQL'), 'g'), `(${userSql})`)
        : userSql
      const rows = alasql(query) as any[]
      const normalized = Array.isArray(rows)
        ? rows.map((r) => (Array.isArray(r) ? r : Object.values(r)))
        : []
      const exp = spec.expectedRows || []
      const ok = JSON.stringify(normalized) === JSON.stringify(exp)
      results.push({ ok, message: ok ? 'SQL: все проверки пройдены' : `SQL: ожидалось ${JSON.stringify(exp)}, получено ${JSON.stringify(normalized)}` })
    } finally {
      try { alasql('DROP DATABASE tmpdb') } catch {}
    }
  } catch (e: any) {
    results.push({ ok: false, message: `SQL error: ${e?.message || e}` })
  }
  return results
}

// --- YAML runner (in-browser) ---
function getByPath(obj: any, path: string): any {
  if (!path) return undefined
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let cur = obj
  for (const p of parts) {
    if (p === '') continue
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p]
    else return undefined
  }
  return cur
}

export async function runYaml(
  userYaml: string,
  spec: { rules: { path: string; equals?: any; regex?: string; exists?: boolean; length?: number }[] }
): Promise<{ ok: boolean; message: string }[]> {
  const results: { ok: boolean; message: string }[] = []
  try {
    const mod: any = await import('js-yaml')
    const yaml = (mod as any).default || mod
    const doc = yaml.load(userYaml)
    for (const rule of spec.rules || []) {
      const val = getByPath(doc, rule.path)
      if (rule.exists !== undefined) {
        const ok = rule.exists ? typeof val !== 'undefined' : typeof val === 'undefined'
        results.push({ ok, message: `${rule.path} ${rule.exists ? 'должен существовать' : 'не должен существовать'}` })
        continue
      }
      if (typeof rule.length === 'number') {
        const ok = Array.isArray(val) && val.length === rule.length
        results.push({ ok, message: `${rule.path} длина == ${rule.length}` })
        continue
      }
      if (rule.regex) {
        const re = new RegExp(rule.regex)
        const ok = typeof val === 'string' && re.test(val)
        results.push({ ok, message: `${rule.path} =~ /${rule.regex}/` })
        continue
      }
      if (Object.prototype.hasOwnProperty.call(rule, 'equals')) {
        const ok = JSON.stringify(val) === JSON.stringify(rule.equals)
        results.push({ ok, message: `${rule.path} == ${JSON.stringify(rule.equals)}` })
        continue
      }
      results.push({ ok: false, message: `Неизвестное правило для ${rule.path}` })
    }
  } catch (e: any) {
    results.push({ ok: false, message: `YAML error: ${e?.message || e}` })
  }
  if (results.length === 0) results.push({ ok: false, message: 'Нет правил проверки' })
  return results
}
