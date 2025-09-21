export type UITask = {
  id: string;
  level: 'junior'|'middle'|'senior';
  title: string;
  exportName: string;
  description: string;
  starter: string;
  tests: string;
  language?: 'javascript'|'typescript'|'java'|'sql'|'yaml';
  testsSql?: {
    schema?: string[];
    data?: string[];
    expectedRows: any[];
    check?: string;
    queryVar?: string;
  };
  testsYaml?: {
    rules: { path: string; equals?: any; regex?: string; exists?: boolean; length?: number }[]
  };
  solution?: string; // Эталонное решение для интервьюера
};

/* =============== FRONTEND: 20 задач =============== */
const FE: UITask[] = [
  // --- JUNIOR (6) ---
  { id:'fe_classNames', level:'junior', title:'classNames(...inputs)', exportName:'classNames',
    description:'Собрать классы из строк/массивов/объектов, уникально, в порядке появления.',
    starter:"export function classNames(...inputs:any[]):string{ /* TODO */ throw new Error('Not implemented') }",
    tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { classNames }=m; assert.equal(classNames('a',['b',{c:true,b:false}],{a:true},'c'),'a b c');",
    solution:`export function classNames(...inputs:any[]):string{
  const result: string[] = []
  const seen = new Set<string>()
  
  for (const input of inputs) {
    if (!input) continue
    
    if (typeof input === 'string' || typeof input === 'number') {
      const str = String(input)
      if (!seen.has(str)) {
        seen.add(str)
        result.push(str)
      }
    } else if (Array.isArray(input)) {
      const inner = classNames(...input)
      if (inner) {
        const classes = inner.split(' ')
        for (const cls of classes) {
          if (cls && !seen.has(cls)) {
            seen.add(cls)
            result.push(cls)
          }
        }
      }
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value && !seen.has(key)) {
          seen.add(key)
          result.push(key)
        }
      }
    }
  }
  
  return result.join(' ')
}`
  },
  { id:'fe_isPalindrome', level:'junior', title:'isPalindrome(str)', exportName:'isPalindrome',
    description:'Палиндром по графемам, игнорируя регистр и пробелы.',
    starter:"export function isPalindrome(str:unknown):boolean{ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {isPalindrome}=m; assert.equal(isPalindrome('А роза упала на лапу Азора'), true); assert.equal(isPalindrome('hello'), false);",
    solution:`export function isPalindrome(str:unknown):boolean{
  if (typeof str !== 'string') return false
  
  // Нормализуем строку: убираем пробелы и приводим к нижнему регистру
  const normalized = str.replace(/\\s/g, '').toLowerCase()
  
  // Сравниваем с обратной строкой
  return normalized === normalized.split('').reverse().join('')
}`
  },
  { id:'fe_uniqueBy', level:'junior', title:'uniqueBy(arr, key)', exportName:'uniqueBy',
    description:'Уникальные по ключу (строка или коллбек).',
    starter:"export function uniqueBy<T>(arr:T[], key: keyof T | ((x:T)=>any)):T[]{ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {uniqueBy}=m; const a=[{id:1},{id:1},{id:2}]; assert.deepEqual(uniqueBy(a,'id'),[{id:1},{id:2}]);",
    solution:`export function uniqueBy<T>(arr:T[], key: keyof T | ((x:T)=>any)):T[]{
  const seen = new Set()
  const result: T[] = []
  
  for (const item of arr) {
    const keyValue = typeof key === 'function' ? key(item) : item[key]
    
    if (!seen.has(keyValue)) {
      seen.add(keyValue)
      result.push(item)
    }
  }
  
  return result
}`
  },
  { id:'fe_chunk', level:'junior', title:'chunk(arr,size)', exportName:'chunk',
    description:'Разбить массив на чанки.',
    starter:"export function chunk<T>(arr:T[], size:number):T[][]{ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {chunk}=m; assert.deepEqual(chunk([1,2,3,4,5],2), [[1,2],[3,4],[5]]);",
    solution:`export function chunk<T>(arr:T[], size:number):T[][]{
  if (size <= 0) return []
  
  const result: T[][] = []
  
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  
  return result
}`
  },
  { id:'fe_sumBy', level:'junior', title:'sumBy(arr,iteratee)', exportName:'sumBy',
    description:'Сумма по свойству или функции.',
    starter:"export function sumBy<T>(arr:T[], it: keyof T | ((x:T)=>number)):number{ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {sumBy}=m; assert.equal(sumBy([{a:2},{a:3}],'a'),5);",
    solution:`export function sumBy<T>(arr:T[], it: keyof T | ((x:T)=>number)):number{
  return arr.reduce((sum, item) => {
    const value = typeof it === 'function' ? it(item) : item[it]
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)
}`
  },
  { id:'fe_throttle', level:'junior', title:'throttle(fn,delay)', exportName:'throttle',
    description:'Не чаще чем раз в delay мс (trailing=true).',
    starter:"export function throttle<T extends(...a:any[])=>any>(fn:T, delay=200){ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {throttle}=m; let n=0; const f=()=>n++; const t=throttle(f,10); t(); t(); setTimeout(()=>{t(); assert.ok(n>=2)},15);",
    solution:`export function throttle<T extends(...a:any[])=>any>(fn:T, delay=200){
  let lastCall = 0
  let timeoutId: NodeJS.Timeout | null = null
  
  return function(this: any, ...args: any[]) {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      return fn.apply(this, args)
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        fn.apply(this, args)
      }, delay - (now - lastCall))
    }
  } as T
}`
  },

  // --- MIDDLE (7) ---
  { id:'fe_debounce', level:'middle', title:'debounce(fn,delay)', exportName:'debounce',
    description:'Задержка последнего вызова, сохранить this/args; cancel().',
    starter:"export function debounce<T extends(...a:any[])=>any>(fn:T, delay=200){ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {debounce}=m; let n=0; const d=debounce(()=>n++,20); d(); d(); setTimeout(()=>{ assert.equal(n,1) },30);"
  },
  { id:'fe_once', level:'middle', title:'once(fn)', exportName:'once',
    description:'Выполнить один раз, вернуть одинаковый результат далее.',
    starter:"export function once<T extends(...a:any[])=>any>(fn:T){ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {once}=m; let n=0; const o=once(()=>++n); o(); o(); assert.equal(n,1);"
  },
  { id:'fe_deepClone', level:'middle', title:'deepClone(obj)', exportName:'deepClone',
    description:'Глубокое копирование (без функций/циклов).',
    starter:"export function deepClone<T>(x:T):T{ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {deepClone}=m; const a={u:{v:1}, arr:[1,2]}; const b=deepClone(a); (b as any).u.v=2; assert.equal(a.u.v,1);"
  },
  { id:'fe_curry', level:'middle', title:'curry(fn)', exportName:'curry',
    description:'Каррирование функции произвольной арности.',
    starter:"export function curry(fn:Function){ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {curry}=m; const add=(a:any,b:any,c:any)=>a+b+c; const cur:any=curry(add); assert.equal(cur(1)(2)(3),6);"
  },
  { id:'fe_parseQuery', level:'middle', title:'parseQueryString(qs)', exportName:'parseQueryString',
    description:'Разобрать ?a=1&b=2&a=3 → {a:[1,3],b:\"2\"}.',
    starter:"export function parseQueryString(qs:string){ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {parseQueryString}=m; assert.deepEqual(parseQueryString('?a=1&b=2&a=3'), {a:['1','3'], b:'2'});"
  },
  { id:'fe_eventDelegate', level:'middle', title:'delegate(root,selector,type,handler)', exportName:'delegate',
    description:'Событие на root + .closest(selector).',
    starter:"export function delegate(root:Element, selector:string, type:string, handler:(this:Element,ev:Event)=>void){ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {delegate}=m; const root=document.createElement('div'); root.innerHTML='<ul><li class=\"x\">A</li></ul>'; document.body.appendChild(root); let ok=false; const off=delegate(root,'li.x','click',function(){ ok = (this as any).classList.contains('x') }); root.querySelector('li')!.dispatchEvent(new MouseEvent('click',{bubbles:true})); off(); assert.equal(ok,true);"
  },
  { id:'fe_fetchJSON', level:'middle', title:'fetchJSON(url,{signal})', exportName:'fetchJSON',
    description:'Безопасный fetch: ok/json/ошибки/отмена.',
    starter:"export async function fetchJSON(url:string, opts:RequestInit={}){ /* TODO */ throw new Error('Not implemented') }",
    tests:"const orig=(global as any).fetch; (global as any).fetch=async (_u:any)=> new Response(JSON.stringify({ok:true}),{status:200}); import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {fetchJSON}=m; const r=await fetchJSON('/ok'); assert.equal(r.ok,true); (global as any).fetch=orig;"
  },

  // --- SENIOR (7) ---
  { id:'fe_LRU', level:'senior', title:'LRUCache<K,V>', exportName:'LRUCache',
    description:'Кэш с вытеснением LRU.',
    starter:"export class LRUCache<K,V>{ /* TODO */ }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {LRUCache}=m; const c:any=new LRUCache(2); c.set?.('a',1); c.set?.('b',2); c.get?.('a'); c.set?.('c',3); assert.ok(true);"
  },
  { id:'fe_deepEqual', level:'senior', title:'deepEqual(a,b)', exportName:'deepEqual',
    description:'Глубокое сравнение без циклов.',
    starter:"export function deepEqual(a:any,b:any):boolean{ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {deepEqual}=m; assert.equal(deepEqual({x:[1,{y:2}]},{x:[1,{y:2}]}), true);"
  },
  { id:'fe_formatBytes', level:'senior', title:'formatBytes(n)', exportName:'formatBytes',
    description:'Форматировать байты: 1536 → \"1.5 KB\".',
    starter:"export function formatBytes(n:number):string{ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {formatBytes}=m; assert.equal(formatBytes(1536),'1.5 KB');"
  },
  { id:'fe_memoize', level:'senior', title:'memoize(fn,keyFn?)', exportName:'memoize',
    description:'Кэшировать результаты по ключу.',
    starter:"export function memoize<T extends(...a:any[])=>any>(fn:T,keyFn?:(...a:any[])=>string){ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {memoize}=m; let n=0; const f=(x:number)=>{n++; return x*x}; const mfn:any=memoize(f); mfn(2); mfn(2); assert.equal(n,1);"
  },
  { id:'fe_flatten', level:'senior', title:'flatten(arr,depth=Infinity)', exportName:'flatten',
    description:'Флэттенинг массива до глубины.',
    starter:"export function flatten(arr:any[], depth=Infinity):any[]{ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {flatten}=m; assert.deepEqual(flatten([1,[2,[3]]],2), [1,2,[3]]);"
  },
  { id:'fe_diffShallow', level:'senior', title:'diffShallow(a,b)', exportName:'diffShallow',
    description:'Разница ключей (added/removed/changed).',
    starter:"export function diffShallow(a:any,b:any){ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {diffShallow}=m; const d=diffShallow({a:1,b:2},{b:3,c:4}); assert.equal(d.added[0],'c'); assert.equal(d.removed[0],'a');"
  },
  { id:'fe_compose', level:'senior', title:'compose(...fns)', exportName:'compose',
    description:'Композиция функций справа налево.',
    starter:"export function compose(...fns:Function[]){ /* TODO */ throw new Error('Not implemented') }",
    tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {compose}=m; const f=(x:number)=>x+1, g=(x:number)=>x*2; assert.equal((compose(f,g) as any)(3), f(g(3)));"
  },
];

/* =============== BACKEND-JAVA: 20 задач =============== */
const BE: UITask[] = [
  // JUNIOR (6)
  {id:"be_twoSum",level:"junior",title:"twoSum(nums,target)",exportName:"twoSum",description:"Индексы двух чисел с суммой target (O(n) через Map).",starter:"export function twoSum(nums:number[], target:number):[number,number]{ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { twoSum } = m; assert.deepEqual(twoSum([2,7,11,15],9),[0,1]); assert.deepEqual(twoSum([3,2,4],6),[1,2]);",solution:`export function twoSum(nums:number[], target:number):[number,number]{
  const map = new Map<number, number>()
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    
    if (map.has(complement)) {
      return [map.get(complement)!, i]
    }
    
    map.set(nums[i], i)
  }
  
  throw new Error('No solution found')
}`},
  {id:"be_isPalindromeNum",level:"junior",title:"isPalindromeNum(x)",exportName:"isPalindromeNum",description:"Число-палиндром без преобразования в строку.",starter:"export function isPalindromeNum(x:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { isPalindromeNum } = m; assert.equal(isPalindromeNum(121),true); assert.equal(isPalindromeNum(-121),false); assert.equal(isPalindromeNum(10),false);",solution:`export function isPalindromeNum(x:number){
  if (x < 0) return false
  if (x < 10) return true
  
  let original = x
  let reversed = 0
  
  while (x > 0) {
    reversed = reversed * 10 + x % 10
    x = Math.floor(x / 10)
  }
  
  return original === reversed
}`},
  {id:"be_validParentheses",level:"junior",title:"validParentheses(s)",exportName:"validParentheses",description:"Проверка скобочной последовательности (){}[].",starter:"export function validParentheses(s:string){ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { validParentheses } = m; assert.equal(validParentheses('()[]{}'),true); assert.equal(validParentheses('(]'),false);"},
  {id:"be_mergeIntervals",level:"junior",title:"mergeIntervals(intervals)",exportName:"mergeIntervals",description:"Слить пересекающиеся интервалы.",starter:"export function mergeIntervals(a:[number,number][]):[number,number][]{ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { mergeIntervals } = m; assert.deepEqual(mergeIntervals([[1,3],[2,6],[8,10],[15,18]]), [[1,6],[8,10],[15,18]]);"},
  {id:"be_binarySearch",level:"junior",title:"binarySearch(arr,x)",exportName:"binarySearch",description:"Индекс x в отсортированном массиве или -1.",starter:"export function binarySearch(arr:number[], x:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { binarySearch } = m; assert.equal(binarySearch([1,3,5,7],5),2); assert.equal(binarySearch([1,3,5,7],4),-1);"},
  {id:"be_anagramsGroup",level:"junior",title:"groupAnagrams(list)",exportName:"groupAnagrams",description:"Сгруппировать анаграммы.",starter:"export function groupAnagrams(list:string[]):string[][]{ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { groupAnagrams } = m; const out = groupAnagrams(['eat','tea','tan','ate','nat','bat']).map(g=>g.sort()).sort((a,b)=>a[0].localeCompare(b[0])); assert.deepEqual(out, [['ate','eat','tea'],['bat'],['nat','tan']]);"},

  // MIDDLE (7)
  {id:"be_bfsShortestPath",level:"middle",title:"bfsShortestPath(graph, s, t)",exportName:"bfsShortestPath",description:"Кратчайший путь в невзвешенном графе.",starter:"export function bfsShortestPath(g:Record<string,string[]>, s:string, t:string):string[]{ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { bfsShortestPath } = m; const g={A:['B','C'],B:['D'],C:['D'],D:[]}; assert.deepEqual(bfsShortestPath(g,'A','D'), ['A','B','D']);"},
  {id:"be_topoSort",level:"middle",title:"topoSort(graph)",exportName:"topoSort",description:"Топологическая сортировка DAG.",starter:"export function topoSort(g:Record<string,string[]>):string[]{ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { topoSort } = m; const g={A:['C'],B:['C'],C:['D'],D:[]}; const res=topoSort(g); const ok = res.indexOf('A')<res.indexOf('C') && res.indexOf('B')<res.indexOf('C'); assert.ok(ok);"},
  {id:"be_LRU",level:"middle",title:"LRUCache<K,V>",exportName:"LRUCache",description:"Кэш с вытеснением LRU (Map + порядок).",starter:"export class LRUCache<K,V>{ /* TODO */ }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { LRUCache } = m; const l:any=new LRUCache(2 as any); l.set?.('a',1); l.set?.('b',2); l.get?.('a'); l.set?.('c',3); assert.ok(true);"},
  {id:"be_LFU",level:"middle",title:"LFUCache<K,V>",exportName:"LFUCache",description:"Кэш LFU: вытесняем наим.часто использ.",starter:"export class LFUCache<K,V>{ /* TODO */ }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { LFUCache } = m; const l:any=new LFUCache(2 as any); assert.ok(typeof l==='object');"},
  {id:"be_tokenBucket",level:"middle",title:"createTokenBucket(rate,cap)",exportName:"createTokenBucket",description:"Токен-бакет: allow() true/false при лимите r/s.",starter:"export function createTokenBucket(rate:number, capacity:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { createTokenBucket } = m; const b:any = createTokenBucket(10, 10); assert.equal(typeof b.allow === 'function', true);"},
  {id:"be_retryBackoff",level:"middle",title:"retry(fn, attempts, backoff)",exportName:"retry",description:"Повтор вызова с экспоненциальной задержкой.",starter:"export async function retry<T>(fn:()=>Promise<T>, attempts=3, backoff=(i:number)=>i*10):Promise<T>{ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { retry } = m; let n=0; const fn=async()=>{ if(++n<2) throw new Error('x'); return 42 }; const v=await retry(fn,3,()=>1); assert.equal(v,42);"},
  {id:"be_parseHttpDate",level:"middle",title:"parseHttpDate(dateStr)",exportName:"parseHttpDate",description:"RFC1123 → epoch ms.",starter:"export function parseHttpDate(s:string){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {parseHttpDate}=m; const ms=parseHttpDate('Sun, 06 Nov 1994 08:49:37 GMT'); assert.equal(typeof ms,'number');"},

  // SENIOR (7)
  {id:"be_asyncPool",level:"senior",title:"asyncPool(limit,tasks)",exportName:"asyncPool",description:"Ограничение конкуренции; сохранить порядок.",starter:"export async function asyncPool<T>(limit:number, tasks:Array<()=>Promise<T>>):Promise<T[]>{ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { asyncPool } = m; const mk=(i:number)=>async()=>i; const out=await asyncPool(2,[mk(1),mk(2),mk(3),mk(4)]); assert.equal(out.join(','),'1,2,3,4');"},
  {id:"be_circuitBreaker",level:"senior",title:"circuitBreaker(fn, opts)",exportName:"circuitBreaker",description:"Открытый/полуоткрытый/закрытый; таймауты.",starter:"export function circuitBreaker<T>(fn:()=>Promise<T>, opts:{failureThreshold:number, resetTimeout:number}){ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { circuitBreaker } = m; const br=circuitBreaker(async()=>42,{failureThreshold:2,resetTimeout:5}); assert.ok(typeof br.call==='function');"},
  {id:"be_scheduler",level:"senior",title:"createScheduler(n)",exportName:"createScheduler",description:"Планировщик задач с ограничением потоков.",starter:"export function createScheduler(n:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { createScheduler } = m; const sch:any=createScheduler(2); assert.ok(sch && typeof sch.add==='function');"},
  {id:"be_jsonPatch",level:"senior",title:"applyJsonPatch(obj, ops)",exportName:"applyJsonPatch",description:"Поддержать replace/add/remove по пути.",starter:"export function applyJsonPatch(obj:any, ops:{op:'replace'|'add'|'remove', path:string, value?:any}[]){ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { applyJsonPatch } = m; const o:any={a:{b:1}}; applyJsonPatch(o,[{op:'replace',path:'/a/b',value:2}]); assert.equal(o.a.b,2);"},
  {id:"be_mergeK",level:"senior",title:"mergeKSortedArrays(arrs)",exportName:"mergeKSortedArrays",description:"Слить k отсортированных массивов (heap).",starter:"export function mergeKSortedArrays(arrs:number[][]):number[]{ /* TODO */ throw new Error('Not implemented') }",tests:"import { strict as assert } from 'assert'; import * as m from 'MODULE'; const { mergeKSortedArrays } = m; assert.deepEqual(mergeKSortedArrays([[1,4],[1,3,4],[2,6]]), [1,1,2,3,4,4,6]);"},
  {id:"be_dijkstra",level:"senior",title:"dijkstra(graph,src)",exportName:"dijkstra",description:"Кратчайшие пути (взвеш.) от src.",starter:"export function dijkstra(g:Record<string,Record<string,number>>, src:string){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {dijkstra}=m; const g={A:{B:1,C:4},B:{C:2},C:{}}; const d=dijkstra(g,'A'); assert.equal(d.C,3);"},
  {id:"be_consistentHash",level:"senior",title:"ConsistentHashRing",exportName:"ConsistentHashRing",description:"Кольцо консистентного хеширования (get(node) по ключу).",starter:"export class ConsistentHashRing{ /* TODO */ }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {ConsistentHashRing}=m; const r:any=new ConsistentHashRing(['n1','n2']); assert.ok(r);"},
];

/* =============== ANALYST: 20 задач =============== */
const BA: UITask[] = [
  // JUNIOR (6)
  {id:'ba_groupBy',level:'junior',title:'groupBy(list,key)',exportName:'groupBy',description:'Группировка по ключу/коллбеку.',starter:"export function groupBy<T>(arr:T[], key:keyof T|((x:T)=>any)){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {groupBy}=m; const g=groupBy([{a:1},{a:1},{a:2}],'a'); assert.deepEqual(Object.keys(g).sort(),['1','2']);"},
  {id:'ba_topN',level:'junior',title:'topN(items,n,by)',exportName:'topN',description:'Топ-N по полю/функции.',starter:"export function topN<T>(arr:T[], n:number, by:keyof T|((x:T)=>number)){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {topN}=m; const r=topN([{x:5},{x:2},{x:7}],2,'x'); assert.deepEqual(r.map(x=>x.x),[7,5]);"},
  {id:'ba_leftJoin',level:'junior',title:'leftJoin(a,b,onA,onB)',exportName:'leftJoin',description:'Левое соединение по ключам.',starter:"export function leftJoin<T,U>(a:T[], b:U[], onA:(x:T)=>any, onB:(y:U)=>any){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {leftJoin}=m; const r=leftJoin([{id:1}], [{id:1,val:2}], x=>x.id, y=>y.id); assert.equal(r[0][1].val,2);"},
  {id:'ba_median',level:'junior',title:'median(nums)',exportName:'median',description:'Медиана массива чисел.',starter:"export function median(a:number[]):number{ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {median}=m; assert.equal(median([1,3,2]),2);"},
  {id:'ba_quantile',level:'junior',title:'quantile(nums,q)',exportName:'quantile',description:'Квантиль q∈[0,1].',starter:"export function quantile(a:number[], q:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {quantile}=m; assert.equal(quantile([1,2,3,4],0.5),2.5);"},
  {id:'ba_movingAvg',level:'junior',title:'movingAverage(nums,window)',exportName:'movingAverage',description:'Скользящее среднее.',starter:"export function movingAverage(a:number[], w:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {movingAverage}=m; assert.deepEqual(movingAverage([1,2,3,4],2),[1.5,2.5,3.5]);"},

  // MIDDLE (7)
  {id:'ba_timeBucket',level:'middle',title:'timeBucket(events,ms)',exportName:'timeBucket',description:'Агрегация по временным корзинам.',starter:"export function timeBucket(ev:{t:number,val:number}[], ms:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {timeBucket}=m; const r=timeBucket([{t:0,val:1},{t:900,val:2},{t:1100,val:3}],1000); assert.equal(r['0'],3); assert.equal(r['1000'],3);"},
  {id:'ba_dedup',level:'middle',title:'dedupByKeyLatest(items,key,tsKey)',exportName:'dedupByKeyLatest',description:'Дедуп по ключу, берём последний по времени.',starter:"export function dedupByKeyLatest<T>(arr:T[], key:(x:T)=>any, ts:(x:T)=>number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {dedupByKeyLatest}=m; const r=dedupByKeyLatest([{id:1,t:1},{id:1,t:2}],x=>x.id,x=>x.t); assert.equal(r.length,1); assert.equal(r[0].t,2);"},
  {id:'ba_pivot',level:'middle',title:'pivot(rows,rowKey,colKey,agg)',exportName:'pivot',description:'Построить сводную таблицу.',starter:"export function pivot<T>(rows:T[], rowKey:(x:T)=>any, colKey:(x:T)=>any, agg:(acc:any,x:T)=>any){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {pivot}=m; const p=pivot([{r:'A',c:'X',v:1},{r:'A',c:'Y',v:2}],x=>x.r,x=>x.c,(a:any,x:any)=> (a||0)+x.v); assert.equal(p['A']['Y'],2);"},
  {id:'ba_funnel',level:'middle',title:'funnel(steps,events)',exportName:'funnel',description:'Конверсия по шагам.',starter:"export function funnel(steps:string[], events:{user:string,step:string}[]){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {funnel}=m; const r=funnel(['s1','s2'],[{user:'u',step:'s1'},{user:'u',step:'s2'}]); assert.equal(r[1],1);"},
  {id:'ba_cohort',level:'middle',title:'cohortRetention(signups,events)',exportName:'cohortRetention',description:'Ретеншен по месяцам.',starter:"export function cohortRetention(signups:{user:string,month:string}[], events:{user:string,month:string}[]){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {cohortRetention}=m; const r=cohortRetention([{user:'u',month:'2024-01'}],[{user:'u',month:'2024-02'}]); assert.ok(r['2024-01']);"},
  {id:'ba_abtest',level:'middle',title:'abUplift(aConv,aTotal,bConv,bTotal)',exportName:'abUplift',description:'Аплифт и доверительный интервал (приближенно).',starter:"export function abUplift(aC:number,aT:number,bC:number,bT:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {abUplift}=m; const r=abUplift(50,1000,70,1000); assert.ok('uplift' in r);"},
  {id:'ba_zscore',level:'middle',title:'zScore(series)',exportName:'zScore',description:'Z-score аномалий для ряда.',starter:"export function zScore(a:number[]){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {zScore}=m; const z=zScore([1,2,3]); assert.equal(z.length,3);"},
  {id:'ba_retentionRolling',level:'middle',title:'rollingRetention(events)',exportName:'rollingRetention',description:'Процент активных за N дней (упр.).',starter:"export function rollingRetention(ev:{user:string,day:number}[]){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {rollingRetention}=m; assert.ok(typeof rollingRetention([])==='object');"},

  // SENIOR (7)
  {id:'ba_csvParse',level:'senior',title:'csvParse(text)',exportName:'csvParse',description:'CSV без кавычек/эскейпа (упрощённо).',starter:"export function csvParse(text:string){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {csvParse}=m; const r=csvParse('a,b\\n1,2'); assert.equal(r[1][1],'2');"},
  {id:'ba_jsonSchemaReq',level:'senior',title:'validateRequired(obj,fields)',exportName:'validateRequired',description:'Проверить обязательные поля.',starter:"export function validateRequired(obj:any, fields:string[]):string[]{ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {validateRequired}=m; const r=validateRequired({a:1},['a','b']); assert.deepEqual(r,['b']);"},
  {id:'ba_kpi_arpu',level:'senior',title:'calcARPU(revenue,users)',exportName:'calcARPU',description:'ARPU = revenue/users.',starter:"export function calcARPU(rev:number, users:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {calcARPU}=m; assert.equal(calcARPU(200,100),2);"},
  {id:'ba_sla_breach',level:'senior',title:'slaBreachRate(items,deadlineMs)',exportName:'slaBreachRate',description:'Доля нарушений сроков.',starter:"export function slaBreachRate(items:{start:number,end:number}[], deadline:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {slaBreachRate}=m; const r=slaBreachRate([{start:0,end:5},{start:0,end:15}],10); assert.equal(r,0.5);"},
  {id:'ba_coalesce',level:'senior',title:'coalesceByKey(a,b,key)',exportName:'coalesceByKey',description:'Слияние записей b→a без потери данных.',starter:"export function coalesceByKey<T>(a:T[], b:T[], key:(x:T)=>any){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {coalesceByKey}=m; const r=coalesceByKey([{id:1,a:1}],[{id:1,b:2}],x=>x.id); assert.equal((r[0] as any).b,2);"},
  {id:'ba_cronNext',level:'senior',title:'cronNext(expr, fromTs)',exportName:'cronNext',description:'Простой cron только минутный шаг: \"*/5 *\".',starter:"export function cronNext(expr:string, from:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {cronNext}=m; const t=Date.UTC(2024,0,1,0,0,0); const n=cronNext('*/5 *',t); assert.equal(new Date(n).getUTCMinutes()%5,0);"},
  {id:'ba_retentionTable',level:'senior',title:'retentionTable(cohorts,events)',exportName:'retentionTable',description:'Таблица ретеншена (кохорт × месяцы).',starter:"export function retentionTable(coh:{user:string,month:string}[], ev:{user:string,month:string}[]){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {retentionTable}=m; const r=retentionTable([{user:'u',month:'2024-01'}],[{user:'u',month:'2024-01'},{user:'u',month:'2024-02'}]); assert.ok(r['2024-01']);"},
];

/* =============== DEVOPS: 20 задач =============== */
const DEVOPS: UITask[] = [
  // JUNIOR (6)
  {id:'dv_semverCmp',level:'junior',title:'semverCompare(a,b)',exportName:'semverCompare',description:'Сравнить x.y.z (без пререлизов).',starter:"export function semverCompare(a:string,b:string){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {semverCompare}=m; assert.equal(semverCompare('1.2.0','1.10.0')<0,true);"},
  {id:'dv_parseEnv',level:'junior',title:'parseEnv(text)',exportName:'parseEnv',description:'.env (KEY=VAL, без кавычек).',starter:"export function parseEnv(text:string){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {parseEnv}=m; const r=parseEnv('A=1\\nB=foo'); assert.equal(r.B,'foo');"},
  {id:'dv_interpolateEnv',level:'junior',title:'interpolate(str,obj)',exportName:'interpolate',description:'Подстановка ${KEY} из env.',starter:"export function interpolate(tpl:string, env:Record<string,string>){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {interpolate}=m; assert.equal(interpolate('hi ${A}',{A:'X'}),'hi X');"},
  {id:'dv_parseCPU',level:'junior',title:'parseCPU(cpu)',exportName:'parseCPU',description:'\"500m\"→0.5; \"2\"→2.',starter:"export function parseCPU(s:string):number{ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {parseCPU}=m; assert.equal(parseCPU('250m'),0.25);"},
  {id:'dv_parseMem',level:'junior',title:'parseMem(mem)',exportName:'parseMem',description:'\"512Mi\"→ bytes; \"1Gi\"→ bytes.',starter:"export function parseMem(s:string):number{ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {parseMem}=m; assert.equal(parseMem('512Mi'), 512*1024*1024);"},
  {id:'dv_validateName',level:'junior',title:'isValidK8sName(name)',exportName:'isValidK8sName',description:'DNS-1123 под K8s.',starter:"export function isValidK8sName(n:string):boolean{ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {isValidK8sName}=m; assert.equal(isValidK8sName('my-app-1'),true); assert.equal(isValidK8sName('A'),false);"},

  // MIDDLE (7)
  {id:'dv_cidrContains',level:'middle',title:'cidrContains(cidr,ip)',exportName:'cidrContains',description:'IPv4: IP в CIDR.',starter:"export function cidrContains(cidr:string, ip:string):boolean{ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {cidrContains}=m; assert.equal(cidrContains('10.0.0.0/8','10.1.2.3'),true);"},
  {id:'dv_splitSubnet',level:'middle',title:'splitSubnet(cidr,newPrefix)',exportName:'splitSubnet',description:'Разделить /24 на /26 (упрощ.).',starter:"export function splitSubnet(cidr:string, newPrefix:number):string[]{ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {splitSubnet}=m; const ss=splitSubnet('192.168.1.0/24',26); assert.ok(ss.length>=4);"},
  {id:'dv_backoffJitter',level:'middle',title:'backoffJitter(attempt)',exportName:'backoffJitter',description:'Экспоненциальный бэкофф с джиттером.',starter:"export function backoffJitter(i:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {backoffJitter}=m; const d=backoffJitter(3); assert.equal(typeof d,'number');"},
  {id:'dv_slidingWindow',level:'middle',title:'slidingWindowRate(limit,window)',exportName:'createSlidingWindow',description:'Скользящее окно rate limit.',starter:"export function createSlidingWindow(limit:number, windowMs:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {createSlidingWindow}=m; const rl:any=createSlidingWindow(2,1000); assert.equal(rl.allow(),true); assert.equal(rl.allow(),true); assert.equal(rl.allow(),false);"},
  {id:'dv_parseDockerRef',level:'middle',title:'parseDockerRef(ref)',exportName:'parseDockerRef',description:'repo[:tag][@sha256:...] → части.',starter:"export function parseDockerRef(ref:string){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {parseDockerRef}=m; const r=parseDockerRef('nginx:1.25@sha256:abc'); assert.equal(r.name,'nginx'); assert.equal(r.tag,'1.25');"},
  {id:'dv_canaryWeights',level:'middle',title:'canaryWeights(total,percent)',exportName:'canaryWeights',description:'Веса трафика для канареечного релиза.',starter:"export function canaryWeights(total:number, percent:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {canaryWeights}=m; const w=canaryWeights(100,10); assert.equal(w.canary,10); assert.equal(w.stable,90);"},
  {id:'dv_blueGreen',level:'middle',title:'blueGreenSwitch(active)',exportName:'blueGreenSwitch',description:'Переключение трафика blue/green.',starter:"export function blueGreenSwitch(active:'blue'|'green'){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {blueGreenSwitch}=m; const r=blueGreenSwitch('blue'); assert.equal(r.active,'blue');"},

  // SENIOR (7)
  {id:'dv_mergeYamlFlat',level:'senior',title:'mergeYamlFlat(a,b)',exportName:'mergeYamlFlat',description:'Слияние 1-уровневых YAML-объектов.',starter:"export function mergeYamlFlat(a:Record<string,any>, b:Record<string,any>){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {mergeYamlFlat}=m; const r=mergeYamlFlat({a:1},{b:2}); assert.equal(r.b,2);"},
  {id:'dv_healthPick',level:'senior',title:'pickHealthy(instances,thr)',exportName:'pickHealthy',description:'Отбор инстансов по health>=thr.',starter:"export function pickHealthy(list:{id:string,health:number}[], thr:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {pickHealthy}=m; const r=pickHealthy([{id:'a',health:0.9},{id:'b',health:0.5}],0.8); assert.equal(r[0].id,'a');"},
  {id:'dv_tlsExp',level:'senior',title:'tlsDaysLeft(notAfterISO)',exportName:'tlsDaysLeft',description:'Оставшиеся дни до истечения (ISO).',starter:"export function tlsDaysLeft(iso:string){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {tlsDaysLeft}=m; const d=tlsDaysLeft('2030-01-01T00:00:00Z'); assert.ok(d>0);"},
  {id:'dv_cronNext',level:'senior',title:'cronNext(expr,from)',exportName:'cronNext',description:'Упрощённый cron (*/10 * * * *).',starter:"export function cronNext(expr:string, from:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {cronNext}=m; const t=Date.UTC(2024,0,1,0,0,0); const n=cronNext('*/10 * * * *',t+60_000); assert.equal(new Date(n).getUTCMinutes()%10,0);"},
  {id:'dv_histogram',level:'senior',title:'latencyHistogram(samples,buckets)',exportName:'latencyHistogram',description:'Построить гистограмму латентности.',starter:"export function latencyHistogram(a:number[], buckets:number[]){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {latencyHistogram}=m; const h=latencyHistogram([5,12,35],[10,20,50]); assert.equal(h[10],1);"},
  {id:'dv_rollSum',level:'senior',title:'rollingSum(nums,window)',exportName:'rollingSum',description:'Скользящая сумма.',starter:"export function rollingSum(a:number[], w:number){ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {rollingSum}=m; assert.deepEqual(rollingSum([1,2,3,4],3),[6,9]);"},
  {id:'dv_rateCalc',level:'senior',title:'errorRate(logs)',exportName:'errorRate',description:'Доля ERROR в логах.',starter:"export function errorRate(lines:string[]):number{ /* TODO */ throw new Error('Not implemented') }",tests:"import {strict as assert} from 'assert'; import * as m from 'MODULE'; const {errorRate}=m; assert.equal(errorRate(['INFO','ERROR','WARN','ERROR']),0.5);"},
];

export const TASKS_BY_PROF = {
  "frontend": FE,
  "backend-java": BE,
  "analyst": BA,
  "devops": DEVOPS
} as const;

// Add sample SQL and YAML tasks to banks (non-breaking: push into copies if needed)
// Simple SQL task appended to BA (analyst)
BA.push({
  id:'ba_sql_top_customers', level:'junior', title:'TOP customers (SQL)', exportName:'SQL_TOP',
  description:'Напишите запрос, который вернёт клиента и сумму заказов, по убыванию суммы.',
  language:'sql',
  starter:'-- SELECT customer, SUM(amount) AS total ...',
  tests:'',
  // @ts-ignore
  testsSql:{
    schema:["CREATE TABLE orders(id INT, customer TEXT, amount INT)"],
    data:["INSERT INTO orders VALUES (1,'A',100),(2,'B',200),(3,'A',150)",],
    queryVar:'SQL',
    check:"SELECT customer, SUM(amount) AS total FROM orders GROUP BY customer ORDER BY total DESC",
    expectedRows:[["A",250],["B",200]]
  },
  solution: '-- SELECT customer, SUM(amount) AS total FROM orders GROUP BY customer ORDER BY total DESC'
})

// Simple YAML task appended to DEVOPS
DEVOPS.push({
  id:'dv_yaml_deploy', level:'junior', title:'K8s Deployment (YAML)', exportName:'K8S_DEPLOY',
  description:'Заполните манифест Deployment с нужными полями.',
  language:'yaml',
  starter:`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: app
          image: nginx:1.25
`,
  tests:'',
  // @ts-ignore
  testsYaml:{
    rules:[
      { path:'kind', equals:'Deployment' },
      { path:'spec.template.spec.containers[0].image', regex:'^nginx:' },
      { path:'metadata.labels.app', equals:'web' }
    ]
  }
})
