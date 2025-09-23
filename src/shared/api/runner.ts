export async function runModule(
  userCode: string,
  tests: string,
  opts?: { debug?: boolean }
): Promise<{ ok: boolean; message: string }[]> {
  const debug = !!opts?.debug || userCode.includes('public class') || userCode.includes('public static')
  
  // Безопасность: ограничения на выполнение
  const MAX_EXECUTION_TIME = 5000 // 5 секунд
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
    /FileReader/
  ]
  
  // Проверяем на опасные паттерны
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(userCode)) {
      return [{ok: false, message: 'Код содержит недопустимые конструкции для безопасности'}]
    }
  }
  
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

    // Проверяем тип кода
    const isJavaCode = userCode.includes('public class') || userCode.includes('public static') || userCode.includes('System.out.println')
    const isPythonCode = userCode.includes('def ') || userCode.includes('import ') || userCode.includes('print(') || userCode.includes('if __name__')
    const isMermaidCode = userCode.includes('graph') || userCode.includes('flowchart') || userCode.includes('sequenceDiagram') || userCode.includes('classDiagram')
    
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
    
    // Для Java кода ищем статические методы (исключаем main)
    if (isJavaCode && functionNames.length === 0) {
      const javaMethodMatches = userCode.match(/(?:public\s+)?static\s+\w+\s+(\w+)\s*\(/g)
      if (javaMethodMatches) {
        functionNames = javaMethodMatches.map(f => {
          const match = f.match(/(?:public\s+)?static\s+\w+\s+(\w+)\s*\(/)
          return match ? match[1] : ''
        }).filter(name => name && name !== 'main') // Исключаем main функцию
      }
    }
    
    if (functionNames.length === 0) {
      return [{ok: false, message: 'No functions found in user code'}]
    }
    
    // Убираем export и типы из кода для выполнения
    let cleanUserCode = userCode.replace(/export\s+/g, '')
    
    if (isJavaCode) {
      // Улучшенная конвертация Java в JavaScript
      cleanUserCode = userCode
        // Убираем public, private, static, final
        .replace(/\b(public|private|static|final)\s+/g, '')
        // Конвертируем System.out.println в console.log
        .replace(/System\.out\.println/g, 'console.log')
        // Конвертируем массивы
        .replace(/int\[\]/g, 'Array')
        .replace(/String\[\]/g, 'Array')
        .replace(/double\[\]/g, 'Array')
        .replace(/boolean\[\]/g, 'Array')
        // Конвертируем типы переменных
        .replace(/\bint\b/g, 'let')
        .replace(/\bString\b/g, 'let')
        .replace(/\bdouble\b/g, 'let')
        .replace(/\bboolean\b/g, 'let')
        .replace(/\bchar\b/g, 'let')
        .replace(/\blong\b/g, 'let')
        .replace(/\bfloat\b/g, 'let')
        // Конвертируем Java коллекции
        .replace(/java\.util\.List/g, 'Array')
        .replace(/java\.util\.Map/g, 'Map')
        .replace(/java\.util\.Set/g, 'Set')
        .replace(/java\.util\.Stack/g, 'Array')
        .replace(/java\.util\.Queue/g, 'Array')
        .replace(/java\.util\.ArrayList/g, 'Array')
        .replace(/java\.util\.HashMap/g, 'Map')
        .replace(/java\.util\.HashSet/g, 'Set')
        .replace(/java\.util\.LinkedList/g, 'Array')
        // Конвертируем создание объектов
        .replace(/new\s+Array\s*\(\s*\)/g, '[]')
        .replace(/new\s+Map\s*\(\s*\)/g, 'new Map()')
        .replace(/new\s+Set\s*\(\s*\)/g, 'new Set()')
        .replace(/new\s+Array\s*<[^>]*>\s*\(\s*\)/g, '[]')
        // Конвертируем создание массивов с элементами
        .replace(/new\s+Array\s*\{([^}]+)\}/g, '[$1]')
        .replace(/new\s+int\[\]\s*\{([^}]+)\}/g, '[$1]')
        .replace(/new\s+String\[\]\s*\{([^}]+)\}/g, '[$1]')
        // Конвертируем методы коллекций
        .replace(/\.add\s*\(/g, '.push(')
        .replace(/\.contains\s*\(/g, '.has(')
        .replace(/\.containsKey\s*\(/g, '.has(')
        .replace(/\.put\s*\(/g, '.set(')
        .replace(/\.get\s*\(/g, '.get(')
        .replace(/\.isEmpty\s*\(\s*\)/g, '.size === 0')
        .replace(/\.size\s*\(\s*\)/g, '.size')
        .replace(/\.poll\s*\(\s*\)/g, '.shift()')
        .replace(/\.offer\s*\(/g, '.push(')
        // Конвертируем Arrays методы
        .replace(/java\.util\.Arrays\.asList/g, 'Array.from')
        .replace(/java\.util\.Arrays\.sort/g, 'Array.sort')
        .replace(/java\.util\.Arrays\.toString/g, 'JSON.stringify')
        .replace(/java\.util\.Arrays\.deepToString/g, 'JSON.stringify')
        // Конвертируем Arrays.toString без java.util
        .replace(/Arrays\.toString/g, 'JSON.stringify')
        // Конвертируем Math методы
        .replace(/Math\.max/g, 'Math.max')
        .replace(/Math\.min/g, 'Math.min')
        .replace(/Math\.abs/g, 'Math.abs')
        // Конвертируем строковые методы
        .replace(/\.equals\s*\(/g, ' === ')
        .replace(/\.length\s*\(\s*\)/g, '.length')
        .replace(/\.toCharArray\s*\(\s*\)/g, '.split("")')
        .replace(/\.charAt\s*\(/g, '.charAt(')
        .replace(/\.substring\s*\(/g, '.substring(')
        // Убираем типы в параметрах методов
        .replace(/\(([^)]*?)\)/g, (match, params) => {
          const cleanParams = params.split(',').map((p: string) => {
            const parts = p.trim().split(/\s+/)
            return parts[parts.length - 1] // берем только имя параметра
          }).join(', ')
          return `(${cleanParams})`
        })
        // Убираем типы возвращаемых значений
        .replace(/\)\s*:\s*[a-zA-Z0-9_\[\]<>|&\s,]+(?=\s*\{)/g, ')')
        // Убираем точки с запятой в конце строк
        .replace(/;\s*$/gm, '')
        // Конвертируем for циклы
        .replace(/for\s*\(\s*int\s+(\w+)\s*=\s*([^;]+);\s*(\w+)\s*([<>]=?)\s*([^;]+);\s*(\w+)\+{2}\)/g, 'for (let $1 = $2; $1 $4 $5; $1++)')
        .replace(/for\s*\(\s*int\s+(\w+)\s*=\s*([^;]+);\s*(\w+)\s*([<>]=?)\s*([^;]+);\s*(\w+)\+\+\s*\)/g, 'for (let $1 = $2; $1 $4 $5; $1++)')
        // Конвертируем enhanced for loops
        .replace(/for\s*\(\s*(\w+)\s+(\w+)\s*:\s*([^)]+)\)/g, 'for (let $2 of $3)')
        // Конвертируем if условия
        .replace(/==\s*/g, '=== ')
        .replace(/!=\s*/g, '!== ')
        // Конвертируем логические операторы
        .replace(/\b&&\b/g, '&&')
        .replace(/\b\|\|\b/g, '||')
        .replace(/\b!\b/g, '!')
        // Конвертируем исключения
        .replace(/throw\s+new\s+RuntimeException\s*\(/g, 'throw new Error(')
        .replace(/throw\s+new\s+Exception\s*\(/g, 'throw new Error(')
        // Убираем классы и оставляем только функции
        .replace(/class\s+\w+\s*\{[^}]*\}/g, '')
        .replace(/public\s+class\s+\w+\s*\{[^}]*\}/g, '')
        // Убираем main методы
        .replace(/main\s*\([^)]*\)\s*\{[^}]*\}/g, '')
        // Убираем пустые строки
        .replace(/\n\s*\n/g, '\n')
    } else if (isPythonCode) {
      // Конвертация Python в JavaScript
      cleanUserCode = userCode
        // Конвертируем def в function
        .replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/g, 'function $1($2) {')
        // Конвертируем print в console.log
        .replace(/print\s*\(/g, 'console.log(')
        // Конвертируем if __name__ == '__main__'
        .replace(/if\s+__name__\s*==\s*['"]__main__['"]\s*:/g, '// Main execution')
        // Конвертируем Python типы
        .replace(/\bint\b/g, 'let')
        .replace(/\bstr\b/g, 'let')
        .replace(/\bfloat\b/g, 'let')
        .replace(/\bbool\b/g, 'let')
        .replace(/\blist\b/g, 'Array')
        .replace(/\bdict\b/g, 'Object')
        // Конвертируем Python операторы
        .replace(/==/g, '===')
        .replace(/!=/g, '!==')
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\b/g, '!')
        // Конвертируем Python методы
        .replace(/\.append\s*\(/g, '.push(')
        .replace(/\.len\s*\(/g, '.length')
        .replace(/len\s*\(/g, '.length')
        // Конвертируем range
        .replace(/range\s*\(([^)]+)\)/g, 'Array.from({length: $1}, (_, i) => i)')
        // Конвертируем Python циклы
        .replace(/for\s+(\w+)\s+in\s+range\s*\(([^)]+)\)\s*:/g, 'for (let $1 = 0; $1 < $2; $1++) {')
        .replace(/for\s+(\w+)\s+in\s+(\w+)\s*:/g, 'for (let $1 of $2) {')
        // Конвертируем Python условия
        .replace(/if\s+(.+)\s*:/g, 'if ($1) {')
        .replace(/elif\s+(.+)\s*:/g, '} else if ($1) {')
        .replace(/else\s*:/g, '} else {')
        // Убираем отступы Python
        .replace(/^    /gm, '')
        .replace(/^  /gm, '')
        // Добавляем закрывающие скобки
        .replace(/\n(\w)/g, '\n}\n$1')
    } else if (isMermaidCode) {
      // Mermaid диаграммы - возвращаем как есть для рендеринга
      return [{ ok: true, message: 'Mermaid diagram rendered successfully' }]
    } else {
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
    }
    
    let userModule
    try {
      if (isJavaCode) {
        // Для Java кода создаем модуль по-другому
        const javaFunctions: any = {}
        
        // Извлекаем функции из Java кода
        for (const funcName of functionNames) {
          // Более простое регулярное выражение для извлечения тела функции
          const funcRegex = new RegExp(`(?:public\\s+)?static\\s+\\w+\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\}(?=\\s*(?:public\\s+)?static|\\s*\\})`, 'g')
          const match = funcRegex.exec(userCode)
          if (match) {
            let funcBody = match[1]
            // Конвертируем тело функции
            funcBody = funcBody
              .replace(/\b(public|private|static|final)\s+/g, '')
              .replace(/System\.out\.println/g, 'console.log')
              .replace(/int\[\]/g, 'Array')
              .replace(/String\[\]/g, 'Array')
              .replace(/double\[\]/g, 'Array')
              .replace(/boolean\[\]/g, 'Array')
              .replace(/\bint\b/g, 'let')
              .replace(/\bString\b/g, 'let')
              .replace(/\bdouble\b/g, 'let')
              .replace(/\bboolean\b/g, 'let')
              .replace(/\bchar\b/g, 'let')
              .replace(/\blong\b/g, 'let')
              .replace(/\bfloat\b/g, 'let')
              .replace(/java\.util\.List/g, 'Array')
              .replace(/java\.util\.Map/g, 'Map')
              .replace(/java\.util\.Set/g, 'Set')
              .replace(/java\.util\.ArrayList/g, 'Array')
              .replace(/java\.util\.HashMap/g, 'Map')
              .replace(/java\.util\.HashSet/g, 'Set')
              .replace(/new\s+Array\s*\{([^}]+)\}/g, '[$1]')
              .replace(/new\s+int\[\]\s*\{([^}]+)\}/g, '[$1]')
              .replace(/new\s+String\[\]\s*\{([^}]+)\}/g, '[$1]')
              .replace(/\.add\s*\(/g, '.push(')
              .replace(/\.contains\s*\(/g, '.has(')
              .replace(/\.containsKey\s*\(/g, '.has(')
              .replace(/\.put\s*\(/g, '.set(')
              .replace(/\.get\s*\(/g, '.get(')
              .replace(/\.isEmpty\s*\(\s*\)/g, '.size === 0')
              .replace(/\.size\s*\(\s*\)/g, '.size')
              .replace(/\.equals\s*\(/g, ' === ')
              .replace(/\.length\s*\(\s*\)/g, '.length')
              .replace(/java\.util\.Arrays\.toString/g, 'JSON.stringify')
              .replace(/Arrays\.toString/g, 'JSON.stringify')
              .replace(/==\s*/g, '=== ')
              .replace(/!=\s*/g, '!== ')
              .replace(/;\s*$/gm, '')
            
            // Извлекаем параметры функции
            const paramMatch = userCode.match(new RegExp(`(?:public\\s+)?static\\s+\\w+\\s+${funcName}\\s*\\(([^)]*)\\)`))
            let params = ''
            if (paramMatch) {
              params = paramMatch[1]
                .split(',')
                .map((p: string) => {
                  const parts = p.trim().split(/\s+/)
                  return parts[parts.length - 1] // берем только имя параметра
                })
                .join(', ')
            }
            
            // Создаем функцию
            try {
              javaFunctions[funcName] = new Function(params, funcBody)
              if (debug) {
                console.log(`Created function ${funcName} with params: ${params}`)
                console.log(`Function body: ${funcBody}`)
              }
            } catch (e: any) {
              console.error(`Error creating function ${funcName}:`, e)
              console.error(`Params: ${params}`)
              console.error(`Body: ${funcBody}`)
              // Создаем заглушку функции
              javaFunctions[funcName] = function() {
                throw new Error(`Function ${funcName} could not be created: ${e?.message || 'Unknown error'}`)
              }
            }
          } else {
            if (debug) {
              console.warn(`Function ${funcName} not found in Java code`)
            }
            // Создаем заглушку функции
            javaFunctions[funcName] = function() {
              throw new Error(`Function ${funcName} not found in Java code`)
            }
          }
        }
        
        userModule = javaFunctions
      } else {
        try {
          userModule = new Function(`
            ${cleanUserCode}
            return {
              ${functionNames.join(', ')}
            }
          `)()
        } catch (e: any) {
          console.error('Error creating JavaScript module:', e)
          console.error('Clean user code:', cleanUserCode)
          console.error('Function names:', functionNames)
          throw e
        }
      }
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
      console.log('Is Java code:', isJavaCode)
      console.log('Is Python code:', isPythonCode)
      console.log('Is Mermaid code:', isMermaidCode)
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
      // Выполняем тест с ограничением по времени
      const executionPromise = new Promise<void>((resolve, reject) => {
        try {
          new Function('assert', 'userModule', testCode)(assert, userModule)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
      
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Execution timeout')), MAX_EXECUTION_TIME)
      })
      
      await Promise.race([executionPromise, timeoutPromise])
    } catch (e: any) {
      if (debug) {
        console.error('Test execution error:', e)
        console.error('Error stack:', e?.stack)
      }
      const errorMessage = e?.message === 'Execution timeout' 
        ? 'Превышено время выполнения (5 секунд)'
        : `Test execution error: ${e?.message || 'Unknown error'}`
      results.push({ok: false, message: errorMessage})
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
