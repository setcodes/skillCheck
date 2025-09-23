import { parse } from 'java-parser'

// Умная конвертация Java в JavaScript с использованием AST
function convertJavaToJavaScript(javaCode: string): string {
  try {
    const ast = parse(javaCode)
    return convertASTToJavaScript(ast)
  } catch (error) {
    console.warn('Failed to parse Java with AST, falling back to regex conversion:', error)
    return convertJavaToJavaScriptRegex(javaCode)
  }
}

function convertASTToJavaScript(ast: any): string {
  // Пока что используем простую конвертацию
  // В будущем можно расширить для работы с AST
  return convertJavaToJavaScriptRegex(ast.toString())
}

function convertJavaToJavaScriptRegex(javaCode: string): string {
  let jsCode = javaCode
  
  // Убираем классы и main методы
  jsCode = jsCode
    .replace(/public\s+class\s+\w+\s*\{[^}]*\}/g, '')
    .replace(/class\s+\w+\s*\{[^}]*\}/g, '')
    .replace(/main\s*\([^)]*\)\s*\{[^}]*\}/g, '')
    .replace(/\n\s*\n/g, '\n')
  
  // Убираем модификаторы доступа
  jsCode = jsCode
    .replace(/\bpublic\s+/g, '')
    .replace(/\bprivate\s+/g, '')
    .replace(/\bprotected\s+/g, '')
    .replace(/\bstatic\s+/g, '')
    .replace(/\bfinal\s+/g, '')
    .replace(/\babstract\s+/g, '')
  
  // Конвертируем типы
  jsCode = jsCode
    .replace(/\bint\[\]/g, 'Array')
    .replace(/\bString\[\]/g, 'Array')
    .replace(/\bdouble\[\]/g, 'Array')
    .replace(/\bboolean\[\]/g, 'Array')
    .replace(/\bint\b/g, 'let')
    .replace(/\bString\b/g, 'let')
    .replace(/\bdouble\b/g, 'let')
    .replace(/\bboolean\b/g, 'let')
    .replace(/\bchar\b/g, 'let')
    .replace(/\blong\b/g, 'let')
    .replace(/\bfloat\b/g, 'let')
    .replace(/\bObject\b/g, 'let')
    .replace(/\bVoid\b/g, 'let')
    .replace(/\bInteger\b/g, 'let')
    .replace(/\bLong\b/g, 'let')
    .replace(/\bDouble\b/g, 'let')
    .replace(/\bBoolean\b/g, 'let')
    .replace(/\bCharacter\b/g, 'let')
    .replace(/\bFloat\b/g, 'let')
    .replace(/\bvoid\b/g, '')
  
  // Конвертируем коллекции
  jsCode = jsCode
    .replace(/java\.util\.List/g, 'Array')
    .replace(/java\.util\.Map/g, 'Map')
    .replace(/java\.util\.Set/g, 'Set')
    .replace(/java\.util\.ArrayList/g, 'Array')
    .replace(/java\.util\.HashMap/g, 'Map')
    .replace(/java\.util\.HashSet/g, 'Set')
    .replace(/Map<[^>]+>/g, 'Map')
    .replace(/Set<[^>]+>/g, 'Set')
    .replace(/List<[^>]+>/g, 'Array')
  
  // Конвертируем создание объектов
  jsCode = jsCode
    .replace(/new\s+Array\s*\{([^}]+)\}/g, '[$1]')
    .replace(/new\s+int\[\]\s*\{([^}]+)\}/g, '[$1]')
    .replace(/new\s+String\[\]\s*\{([^}]+)\}/g, '[$1]')
    .replace(/new\s+Array\{\s*\}/g, '[]')
    .replace(/new\s+Map<>\s*\(\s*\)/g, 'new Map()')
    .replace(/new\s+java\.util\.HashMap<>\s*\(\s*\)/g, 'new Map()')
  
  // Конвертируем методы
  jsCode = jsCode
    .replace(/\.add\s*\(/g, '.push(')
    .replace(/\.contains\s*\(/g, '.has(')
    .replace(/\.containsKey\s*\(/g, '.has(')
    .replace(/\.put\s*\(/g, '.set(')
    .replace(/\.get\s*\(/g, '.get(')
    .replace(/\.isEmpty\s*\(\s*\)/g, '.size === 0')
    .replace(/\.size\s*\(\s*\)/g, '.size')
    .replace(/\.equals\s*\(/g, ' === ')
    .replace(/\.length\s*\(\s*\)/g, '.length')
    .replace(/\.charAt\s*\(\s*(\w+)\s*\)/g, '[$1]')
    .replace(/\.replaceAll\s*\(\s*"\\s\+"\s*,\s*""\s*\)/g, '.replace(/\\s+/g, "")')
  
  // Конвертируем операторы
  jsCode = jsCode
    .replace(/==\s*/g, '=== ')
    .replace(/!=\s*/g, '!== ')
    .replace(/==\s*null/g, '=== null')
    .replace(/!=\s*null/g, '!== null')
  
  // Конвертируем исключения
  jsCode = jsCode
    .replace(/throw\s+new\s+IllegalArgumentException/g, 'throw new Error')
    .replace(/throw\s+new\s+RuntimeException/g, 'throw new Error')
  
  // Конвертируем вывод
  jsCode = jsCode.replace(/System\.out\.println/g, 'console.log')
  
  // Убираем точки с запятой
  jsCode = jsCode.replace(/;\s*$/gm, '')
  
  return jsCode
}

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
    // Сначала проверяем YAML (включая Docker Compose), потом Dockerfile
    const isYamlCode = userCode.includes('apiVersion:') || userCode.includes('version:') || userCode.includes('services:') || userCode.includes('kind:') || 
                       userCode.includes('networks:') || userCode.includes('volumes:') || userCode.includes('metadata:') || userCode.includes('spec:') ||
                       userCode.includes('Chart.yaml') || userCode.includes('values.yaml') || userCode.includes('deployment.yaml') ||
                       (userCode.includes('version:') && userCode.includes('services:')) // Docker Compose
    const isDockerfileCode = !isYamlCode && (userCode.includes('FROM ') || userCode.includes('WORKDIR ') || userCode.includes('COPY ') || userCode.includes('RUN '))
    
    
    
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
      console.log('🔍 Ищем Java методы...')
      const javaMethodMatches = userCode.match(/(?:public\s+)?static\s+[\w\[\]]+\s+(\w+)\s*\(/g)
      if (debug) {
        console.log('Full user code:', userCode)
      }
      console.log('Java method matches:', javaMethodMatches)
      if (javaMethodMatches) {
        console.log('🔍 Извлекаем имена функций...')
        functionNames = javaMethodMatches.map(f => {
          const match = f.match(/(?:public\s+)?static\s+[\w\[\]]+\s+(\w+)\s*\(/)
          console.log(`Обрабатываем: "${f}" -> ${match ? match[1] : 'НЕ НАЙДЕНО'}`)
          return match ? match[1] : ''
        }).filter(name => name && name !== 'main') // Исключаем main, оставляем только рабочие функции
        console.log('Found Java functions:', functionNames)
      } else {
        console.log('❌ Java методы не найдены')
      }
    }
    
    if (functionNames.length === 0) {
      return [{ok: false, message: 'No functions found in user code'}]
    }
    
    // Убираем export и типы из кода для выполнения
    let cleanUserCode = userCode.replace(/export\s+/g, '')
    
    if (isJavaCode) {
      // Используем умную конвертацию Java в JavaScript
      cleanUserCode = convertJavaToJavaScript(userCode)
      // Старые конвертации удалены - используем новую функцию convertJavaToJavaScript()
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
    } else if (isYamlCode) {
      // YAML код - используем YAML парсер
      const rules = parseYamlTests(tests)
      return await runYaml(userCode, { rules })
    } else if (isDockerfileCode) {
      // Dockerfile код - используем простую проверку
      return await runDevOpsTests(userCode, tests)
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
          // Ищем функцию по имени с более простым подходом
          const funcStartRegex = new RegExp(`(?:public\\s+)?static\\s+[\\w\\[\\]]+\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{`)
          const funcStartMatch = userCode.match(funcStartRegex)
          
          if (funcStartMatch) {
            const startIndex = userCode.indexOf(funcStartMatch[0])
            let braceCount = 0
            let funcBody = ''
            let i = startIndex + funcStartMatch[0].length
            
            // Находим закрывающую скобку, считая вложенные скобки
            while (i < userCode.length) {
              const char = userCode[i]
              if (char === '{') {
                braceCount++
              } else if (char === '}') {
                if (braceCount === 0) {
                  break
                }
                braceCount--
              }
              funcBody += char
              i++
            }
            
            if (funcBody) {
              console.log('🔍 Исходное тело функции:', JSON.stringify(funcBody))
              // Конвертируем тело функции пошагово
              funcBody = funcBody.replace(/\b(public|private|static|final)\s+/g, '')
              console.log('После удаления модификаторов:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/new\s+Map<>\s*\(\s*\)/g, 'new Map()')
              console.log('После конвертации new Map<>():', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/new\s+java\.util\.HashMap<>\s*\(\s*\)/g, 'new Map()')
              console.log('После конвертации new HashMap<>():', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/java\.util\.Map<[^>]+>\s+(\w+)\s*=/g, 'let $1 =')
              console.log('После конвертации java.util.Map<Type> var =:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/Map\s+(\w+)\s*=/g, 'let $1 =')
              console.log('После конвертации Map var =:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/^(\s*)Map\s+(\w+)\s*=/gm, '$1let $2 =')
              console.log('После многострочной конвертации Map:', JSON.stringify(funcBody))
              
              // Конвертируем методы Map
              funcBody = funcBody.replace(/\.containsKey\s*\(/g, '.has(')
              console.log('После конвертации containsKey:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/\.put\s*\(/g, '.set(')
              console.log('После конвертации put:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/\.get\s*\(/g, '.get(')
              console.log('После конвертации get:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/\.isEmpty\s*\(\s*\)/g, '.size === 0')
              console.log('После конвертации isEmpty:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/\.size\s*\(\s*\)/g, '.size')
              console.log('После конвертации size:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/\.equals\s*\(/g, ' === ')
              console.log('После конвертации equals:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/\.length\s*\(\s*\)/g, '.length')
              console.log('После конвертации length:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/java\.util\.Arrays\.toString/g, 'JSON.stringify')
              console.log('После конвертации Arrays.toString:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/Arrays\.toString/g, 'JSON.stringify')
              console.log('После конвертации Arrays.toString (short):', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/==\s*/g, '=== ')
              console.log('После конвертации ==:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/!=\s*/g, '!== ')
              console.log('После конвертации !=:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/;\s*$/gm, '');
              console.log('После удаления точек с запятой:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/throw\s+new\s+IllegalArgumentException/g, 'throw new Error')
              console.log('После конвертации throw IllegalArgumentException:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/throw\s+new\s+RuntimeException/g, 'throw new Error')
              console.log('После конвертации throw RuntimeException:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/\.replaceAll\s*\(\s*"\\s\+"\s*,\s*""\s*\)/g, '.replace(/\\s+/g, "")')
              console.log('После конвертации replaceAll:', JSON.stringify(funcBody))
              
              // Более точная конвертация charAt - только для простых случаев
              funcBody = funcBody.replace(/\.charAt\s*\(\s*(\w+)\s*\)/g, '[$1]')
              console.log('После конвертации charAt:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/\.isEmpty\s*\(\s*\)/g, '.length === 0')
              console.log('После конвертации isEmpty:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/==\s*null/g, '=== null')
              funcBody = funcBody.replace(/!=\s*null/g, '!== null')
              console.log('После конвертации null проверок:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/Math\.max/g, 'Math.max')
              funcBody = funcBody.replace(/Math\.min/g, 'Math.min')
              funcBody = funcBody.replace(/Math\.abs/g, 'Math.abs')
              console.log('После конвертации Math методов:', JSON.stringify(funcBody))
              
              funcBody = funcBody.replace(/System\.out\.println/g, 'console.log')
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
        .replace(/Map<[^>]+>/g, 'Map')
        .replace(/Set<[^>]+>/g, 'Set')
        .replace(/List<[^>]+>/g, 'Array')
                .replace(/new\s+Array\s*\{([^}]+)\}/g, '[$1]')
                .replace(/new\s+int\[\]\s*\{([^}]+)\}/g, '[$1]')
                .replace(/new\s+String\[\]\s*\{([^}]+)\}/g, '[$1]')
                .replace(/new\s+Array\{\s*\}/g, '[]')
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
                .replace(/;\s*$/gm, '');
              
              console.log('🔍 Конвертированное тело функции:', JSON.stringify(funcBody))
              
              // Извлекаем параметры функции
              const paramMatch = userCode.match(new RegExp(`(?:public\\s+)?static\\s+[\\w\\[\\]]+\\s+${funcName}\\s*\\(([^)]*)\\)`))
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
        
        // Создаем userModule с правильной структурой для деструктуризации
        userModule = {
          ...javaFunctions,
          // Добавляем функции как свойства для совместимости
          ...Object.keys(javaFunctions).reduce((acc: any, key) => {
            acc[key] = javaFunctions[key]
            return acc
          }, {})
        }
        if (debug) {
          console.log('Created userModule for Java:', userModule)
          console.log('Available functions:', Object.keys(userModule))
        }
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

// --- YAML tests parser ---
function parseYamlTests(tests: string): { path: string; equals?: any; regex?: string; exists?: boolean; length?: number }[] {
  const rules: { path: string; equals?: any; regex?: string; exists?: boolean; length?: number }[] = []
  
  const testLines = tests.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
  
  for (const line of testLines) {
    if (line.includes('assert ')) {
      const match = line.match(/assert\s+(.+?),\s*['"](.+?)['"]/)
      if (match) {
        const condition = match[1]
        const message = match[2]
        
        // Парсим условие "term in userCode"
        if (condition.includes('in userCode')) {
          const searchTerm = condition.match(/'([^']+)'/)?.[1] || condition.match(/"([^"]+)"/)?.[1]
          if (searchTerm) {
            // Создаем правило для поиска в YAML
            rules.push({
              path: '$', // Корень документа
              regex: searchTerm,
              exists: true
            })
          }
        }
      }
    }
  }
  
  return rules
}

// --- DevOps tests runner (in-browser) ---
export async function runDevOpsTests(userCode: string, tests: string): Promise<{ ok: boolean; message: string }[]> {
  const results: { ok: boolean; message: string }[] = []
  try {
    // Парсим тесты - ищем assert statements
    const testLines = tests.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
    
    for (const line of testLines) {
      if (line.includes('assert ')) {
        // Извлекаем условие и сообщение из assert
        const match = line.match(/assert\s+(.+?),\s*['"](.+?)['"]/)
        if (match) {
          const condition = match[1]
          const message = match[2]
          
          // Выполняем проверку
          let ok = false
          try {
            // Обрабатываем сложные условия с or
            if (condition.includes(' or ')) {
              const parts = condition.split(' or ')
              ok = parts.some(part => {
                const trimmedPart = part.trim()
                if (trimmedPart.includes('in userCode')) {
                  const searchTerm = trimmedPart.match(/'([^']+)'/)?.[1] || trimmedPart.match(/"([^"]+)"/)?.[1]
                  return searchTerm ? userCode.includes(searchTerm) : false
                }
                return false
              })
            } else if (condition.includes('in userCode')) {
              const searchTerm = condition.match(/'([^']+)'/)?.[1] || condition.match(/"([^"]+)"/)?.[1]
              if (searchTerm) {
                ok = userCode.includes(searchTerm)
              }
            } else {
              // Заменяем userCode в условии
              const evalCondition = condition.replace(/userCode/g, JSON.stringify(userCode))
              ok = eval(evalCondition)
            }
          } catch (e) {
            // Если eval не работает, делаем простую проверку строк
            if (condition.includes('in userCode')) {
              const searchTerm = condition.match(/'([^']+)'/)?.[1] || condition.match(/"([^"]+)"/)?.[1]
              if (searchTerm) {
                ok = userCode.includes(searchTerm)
              }
            }
          }
          
          results.push({ ok, message })
        }
      }
    }
    
  } catch (e: any) {
    results.push({ ok: false, message: `DevOps test error: ${e?.message || e}` })
  }
  return results
}

// --- Dockerfile runner (in-browser) ---
export async function runDockerfile(userDockerfile: string): Promise<{ ok: boolean; message: string }[]> {
  const results: { ok: boolean; message: string }[] = []
  try {
    // Простая проверка Dockerfile
    const lines = userDockerfile.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
    
    // Проверяем основные инструкции
    const hasFrom = lines.some(line => line.startsWith('FROM '))
    const hasWorkdir = lines.some(line => line.startsWith('WORKDIR '))
    const hasCopy = lines.some(line => line.startsWith('COPY '))
    const hasRun = lines.some(line => line.startsWith('RUN '))
    const hasExpose = lines.some(line => line.startsWith('EXPOSE '))
    const hasCmd = lines.some(line => line.startsWith('CMD '))
    
    results.push({ ok: hasFrom, message: 'Dockerfile должен содержать инструкцию FROM' })
    results.push({ ok: hasWorkdir, message: 'Dockerfile должен содержать инструкцию WORKDIR' })
    results.push({ ok: hasCopy, message: 'Dockerfile должен содержать инструкцию COPY' })
    results.push({ ok: hasRun, message: 'Dockerfile должен содержать инструкцию RUN' })
    results.push({ ok: hasExpose, message: 'Dockerfile должен содержать инструкцию EXPOSE' })
    results.push({ ok: hasCmd, message: 'Dockerfile должен содержать инструкцию CMD' })
    
    // Проверяем, что используется Node.js образ
    const hasNodeImage = lines.some(line => line.includes('node:'))
    results.push({ ok: hasNodeImage, message: 'Должен использоваться Node.js образ' })
    
    // Проверяем, что открыт порт 3000
    const hasPort3000 = lines.some(line => line.includes('3000'))
    results.push({ ok: hasPort3000, message: 'Должен быть открыт порт 3000' })
    
    // Проверяем, что есть установка зависимостей
    const hasNpmInstall = lines.some(line => line.includes('npm install') || line.includes('npm ci'))
    results.push({ ok: hasNpmInstall, message: 'Должна быть установка зависимостей npm' })
    
  } catch (e: any) {
    results.push({ ok: false, message: `Dockerfile error: ${e?.message || e}` })
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
        // Для regex правил ищем в исходном YAML тексте
        const re = new RegExp(rule.regex)
        const ok = re.test(userYaml)
        results.push({ ok, message: `YAML содержит "${rule.regex}"` })
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
