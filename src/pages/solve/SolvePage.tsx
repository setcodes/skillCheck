import React,{useEffect,useMemo,useRef,useState} from 'react'
import { CheckCircle, XCircle, Star, Send, Timer, FileText, Play, Pause, RotateCcw, ChevronDown, Clock, AlertTriangle, Trash2, Copy } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { CodeEditor } from '@/features/code-editor/ui'
import type { CodeEditorHandle } from '@/features/code-editor/ui/CodeEditor'
import { useToast } from '@/shared/hooks/use-sonner'
import { cn } from '@/shared/lib/utils'
import { useApp } from '@/app/providers/AppProvider'
import { runModule } from '@/shared/api/runner'
import { getTasks } from '@/shared/api/questions'
import type { UITask } from '@/entities/task/model/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
type Sol={code:string;lastResult?:{ok:boolean;message:string}[];score?:number;comment?:string}
const K='solutions.v4';const load=()=>{try{const r=localStorage.getItem(K);if(r)return JSON.parse(r)}catch{}return{}};const save=(x:any)=>{try{localStorage.setItem(K,JSON.stringify(x))}catch{}}
export default function Solve(){
  const {role,prof}=useApp(); const[t,setT]=useState<Record<string,Sol>>(load()); useEffect(()=>save(t),[t])
  const tasks=getTasks(prof); const levels=Array.from(new Set(tasks.map((x:UITask)=>x.level))) as UITask['level'][]
  const[level,setLevel]=useState<UITask['level']>(levels[0]||'junior'); useEffect(()=>{setLevel(levels[0]||'junior')},[prof])
  const list=tasks.filter((x:UITask)=>x.level===level); const[cur,setCur]=useState<string>(list[0]?.id||''); useEffect(()=>{const l=tasks.filter((x:UITask)=>x.level===level);setCur(l[0]?.id||'')},[level,tasks])
  const task=useMemo(()=>tasks.find((x:UITask)=>x.id===cur),[cur,tasks]); const code=(t[cur]?.code)??(task?.starter||'')
  const {toast}=useToast()
  const editorRef = useRef<CodeEditorHandle | null>(null)
  // Per-task timer (configurable, off by default)
  const [taskTimerMode, setTaskTimerMode] = useState<'up'|'down'>('up')
  const [taskTimerLimitSec, setTaskTimerLimitSec] = useState<number>(900)
  const [taskTimerValueSec, setTaskTimerValueSec] = useState<number>(0)
  const [taskTimerRunning, setTaskTimerRunning] = useState<boolean>(false)

  // Load/save per-task timer settings from localStorage
  useEffect(()=>{
    if(!task?.id) return
    const key = (s:string)=> `task.timer.${prof}.${task.id}.${s}`
    const m = (localStorage.getItem(key('mode')) as 'up'|'down') || 'up'
    const limit = Number(localStorage.getItem(key('limitSec'))||'900')
    const running = localStorage.getItem(key('running'))==='1'
    const val = Number(localStorage.getItem(key('valueSec'))|| (m==='down'? String(limit) : '0'))
    setTaskTimerMode(m)
    setTaskTimerLimitSec(Number.isFinite(limit)?limit:900)
    setTaskTimerValueSec(Number.isFinite(val)?val:(m==='down'?limit:0))
    setTaskTimerRunning(running && false) // по умолчанию не включен
  }, [task?.id, prof])

  useEffect(()=>{
    if(!task?.id) return
    const key = (s:string)=> `task.timer.${prof}.${task.id}.${s}`
    localStorage.setItem(key('mode'), taskTimerMode)
    localStorage.setItem(key('limitSec'), String(taskTimerLimitSec))
    localStorage.setItem(key('valueSec'), String(taskTimerValueSec))
    localStorage.setItem(key('running'), taskTimerRunning ? '1':'0')
  }, [task?.id, prof, taskTimerMode, taskTimerLimitSec, taskTimerValueSec, taskTimerRunning])

  useEffect(()=>{
    if(!task?.id || !taskTimerRunning) return
    const id = setInterval(()=>{
      setTaskTimerValueSec(v=>{
        if(taskTimerMode==='up') return v+1
        const nv = v-1
        if(nv<=0){ setTaskTimerRunning(false); return 0 }
        return nv
      })
    },1000)
    return ()=> clearInterval(id)
  }, [task?.id, taskTimerRunning, taskTimerMode])

  const formatSeconds = (total: number) => {
    total = Math.max(0, Math.floor(total))
    const h = Math.floor(total / 3600).toString().padStart(2, '0')
    const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0')
    const s = (total % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }
  
  const formatLanguageLabel = (language?: string) => (language === 'typescript' ? 'TypeScript' : 'JavaScript')

  // Явное поле language у задачи; иначе TS, если в стартовом коде есть типы
  const taskLanguage = useMemo(() => {
    if (task?.language) return task.language
    return /:\s*(string|number|boolean|any|unknown)\b|\binterface\s/.test(task?.starter ?? '') ? 'typescript' : 'javascript'
  }, [task?.id, task?.language, task?.starter])

  const [logs, setLogs] = useState<string[]>([])
  // Toast notifications for per-task timer (down mode)
  const halfNotifiedRef = useRef(false)
  const tenNotifiedRef = useRef(false)
  const prevTaskValRef = useRef<number>(taskTimerValueSec)
  useEffect(()=>{
    // Reset notification flags on mode/limit change or when timer is stopped
    halfNotifiedRef.current = false
    tenNotifiedRef.current = false
  }, [taskTimerMode, taskTimerLimitSec])
  useEffect(()=>{
    if(!taskTimerRunning){ halfNotifiedRef.current=false; tenNotifiedRef.current=false }
  }, [taskTimerRunning])
  useEffect(()=>{
    if(taskTimerMode!=='down') { prevTaskValRef.current = taskTimerValueSec; return }
    const remaining = taskTimerValueSec
    const limit = taskTimerLimitSec
    if(limit>0 && taskTimerRunning){
      const half = Math.floor(limit/2)
      const ten = Math.ceil(limit*0.10)
      if(!halfNotifiedRef.current && remaining<=half){
        halfNotifiedRef.current = true
        toast.info("Половина времени по задаче", `Осталось ~ ${formatSeconds(remaining)}`)
      }
      if(!tenNotifiedRef.current && remaining<=ten){
        tenNotifiedRef.current = true
        toast.warning("Меньше 10% времени по задаче", `Осталось ~ ${formatSeconds(remaining)}`)
      }
    }
    if(prevTaskValRef.current>0 && taskTimerValueSec===0 && taskTimerMode==='down'){
      toast.error("Время по задаче истекло", task ? `Задача: ${task.title}` : undefined)
    }
    prevTaskValRef.current = taskTimerValueSec
  }, [taskTimerMode, taskTimerRunning, taskTimerLimitSec, taskTimerValueSec, task?.title])
  const run=async()=>{
    if(!task)return; 
    
    // Проверяем, есть ли код для тестирования
    if (!code.trim()) {
      toast.warning("Нет кода для тестирования", "Введите код решения перед запуском тестов")
      return
    }
    
    // Показываем тост о начале тестирования
    toast.info("Запуск тестов...", "Выполняются тесты для задачи")
    
    // перехватываем вывод консоли во время запуска
    const tmpLogs: string[] = []
    const orig = { log: console.log, error: console.error, warn: console.warn, info: console.info }
    const push = (type: string, args: any[]) => {
      try { tmpLogs.push(`[${type}] ` + args.map((a:any)=> typeof a==='string'?a:JSON.stringify(a)).join(' ')) } catch { /* noop */ }
    }
    console.log = (...a:any[]) => { push('log', a); orig.log(...a) }
    console.error = (...a:any[]) => { push('error', a); orig.error(...a) }
    console.warn = (...a:any[]) => { push('warn', a); orig.warn(...a) }
    console.info = (...a:any[]) => { push('info', a); orig.info(...a) }

    try {
      const res = await runModule(code, task.tests)
      setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code,lastResult:res}}))
      
      // Проверяем, есть ли результаты тестов
      if (!res || res.length === 0) {
        toast.warning("Нет тестов", "Для этой задачи не найдено тестов")
        return
      }
      
      // Анализируем результаты и показываем соответствующий тост
      const allPassed = res.every(r => r.ok)
      const passedCount = res.filter(r => r.ok).length
      const totalCount = res.length
      
      if (allPassed) {
        toast.success("Все тесты пройдены!", `Успешно выполнено ${totalCount} из ${totalCount} тестов`)
      } else {
        // Получаем первую ошибку для показа в тосте
        const firstError = res.find(r => !r.ok)
        let errorMessage = firstError ? firstError.message : "Неизвестная ошибка"
        
        // Улучшенные сообщения об ошибках
        if (errorMessage.includes('Execution timeout')) {
          errorMessage = "⏱️ Превышено время выполнения (5 секунд)"
        } else if (errorMessage.includes('недопустимые конструкции')) {
          errorMessage = "🚫 Код содержит недопустимые конструкции"
        } else if (errorMessage.includes('No functions found')) {
          errorMessage = "🔍 Не найдены функции для выполнения"
        } else if (errorMessage.includes('Test execution error')) {
          errorMessage = "💥 Ошибка выполнения тестов"
        }
        
        toast.error("Тесты не пройдены", `Пройдено ${passedCount} из ${totalCount} тестов. ${errorMessage}`)
      }
    } catch (error) {
      // Обрабатываем ошибки выполнения
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка"
      toast.error("Ошибка выполнения", `Не удалось запустить тесты: ${errorMessage}`)
    } finally {
      console.log = orig.log; console.error = orig.error; console.warn = orig.warn; console.info = orig.info
      setLogs(tmpLogs)
    }
  }
  const setScore=(s:number)=>task&&setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code,score:s}})); const setComment=(c:string)=>task&&setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code,comment:c}}))
  const push=()=>{
    if(!task)return; 
    const payload={prof,level,taskId:task.id,title:task.title,score:t[task.id]?.score??0,comment:t[task.id]?.comment||''}; 
    const bridge=JSON.parse(localStorage.getItem('bridge.taskScores.v1')||'{}'); 
    bridge[prof+':'+level+':'+task.id]=payload; 
    localStorage.setItem('bridge.taskScores.v1',JSON.stringify(bridge)); 
    toast.success("Оценка отправлена!", "Оценка сохранена и доступна в режиме интервью")
  }
  const resetTask=()=>{
    if(!task)return; 
    setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code:task.starter,lastResult:undefined}})); 
    setLogs([])
    toast.info("Задача сброшена", "Код возвращен к исходному состоянию")
  }
  const resetTests=()=>{
    if(!task) return;
    setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code,lastResult:undefined}}))
    setLogs([])
    toast.info('Результаты очищены', 'Очищены результаты тестов и консоль')
  }

  const copySolution=async()=>{
    if(!task?.solution) return;
    try {
      await navigator.clipboard.writeText(task.solution)
      toast.success('Решение скопировано', 'Эталонное решение скопировано в буфер обмена')
    } catch (e) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = task.solution
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Решение скопировано', 'Эталонное решение скопировано в буфер обмена')
    }
  }
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
    {/* Tasks List */}
    <div className="lg:col-span-1 h-full min-h-0">
      <div className="bg-card border rounded-lg p-6 h-full flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Задачи — {prof}</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={()=>{
              // Очищаем все данные об оценках
              localStorage.removeItem("bridge.taskScores.v1"); // Оценки задач
              localStorage.removeItem("bridge.theoryScores.v1"); // Оценки теории
              localStorage.removeItem("solutions.v4"); // Решения задач
              
              // Очищаем черновики теории для всех профессий
              const professions = ['frontend', 'backend-java', 'analyst', 'devops'];
              professions.forEach(prof => {
                localStorage.removeItem(`theory.drafts.v1.${prof}`);
              });
              
              // Показываем уведомление
              toast.success("Все оценки сброшены", "Очищены оценки задач, теории и решения");
              
              // Перезагружаем страницу
              setTimeout(() => location.reload(), 1000);
            }}
            className="inline-flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Сброс оценок
          </Button>
        </div>
        
        {/* Level Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {levels.map(l=>(
            <Button 
              key={l} 
              variant={level===l?'default':'outline'} 
              size="sm"
              onClick={()=>setLevel(l)}
              className="capitalize"
            >
              {l}
            </Button>
          ))}
        </div>
        
        {/* Tasks List */}
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
          {list.map(x=>(
            <Button 
              key={x.id} 
              variant={cur===x.id?'secondary':'ghost'} 
              className="w-full justify-start text-left h-auto p-3"
              onClick={()=>setCur(x.id)}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{x.title}</span>
                  <Badge variant="outline" className="text-[10px] tracking-wide">
                    {formatLanguageLabel((x as any).language)}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{x.level}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>

    {/* Task Details */}
    <div className="lg:col-span-2 h-full min-h-0">
      <div className="bg-card border rounded-lg h-full flex flex-col">
        {task ? (
          <>
            <div className="p-6 border-b flex flex-col gap-3">
              {/* Block 1: Timers + Tags */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-mono">{formatSeconds(taskTimerValueSec)}</span>
                        <span className={cn("h-2 w-2 rounded-full", taskTimerRunning ? "bg-green-500" : "bg-muted-foreground/50")}></span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">Таймер задачи</div>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <div className="text-xs mb-1">Режим</div>
                        <Select value={taskTimerMode} onValueChange={(m: 'up'|'down')=>{
                          setTaskTimerMode(m)
                          setTaskTimerRunning(false)
                          setTaskTimerValueSec(m==='down'? taskTimerLimitSec : 0)
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Режим" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="up">Прямой</SelectItem>
                            <SelectItem value="down">Обратный</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {taskTimerMode==='down' && (
                        <div className="px-2 py-1.5">
                          <div className="text-xs mb-1">Лимит (мин)</div>
                          <input 
                            className="w-full px-2 py-1 rounded border bg-card text-right font-mono"
                            type="number" min={1} step={1}
                            value={Math.floor(taskTimerLimitSec/60)}
                            onChange={e=>{
                              const mins = Math.max(1, Number(e.target.value)||0)
                              const sec = mins*60
                              setTaskTimerLimitSec(sec)
                              if(!taskTimerRunning) setTaskTimerValueSec(sec)
                            }}
                          />
                          <div className="flex flex-wrap gap-2 mt-2">
                            {[5, 15, 30, 60].map(min => (
                              <Button key={min} variant="outline" size="sm" onClick={()=>{
                                const sec = min*60
                                setTaskTimerLimitSec(sec)
                                if(!taskTimerRunning) setTaskTimerValueSec(sec)
                              }}>{min} мин</Button>
                            ))}
                          </div>
                        </div>
                      )}
                      <DropdownMenuSeparator />
                      <div className="px-2 py-2 flex items-center gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-1"
                          onClick={()=> setTaskTimerRunning(r=>!r)}
                        >
                          {taskTimerRunning ? (<><Pause className="h-3 w-3" /> Пауза</>) : (<><Play className="h-3 w-3" /> Старт</>)}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-1"
                          onClick={()=> setTaskTimerValueSec(taskTimerMode==='down'? taskTimerLimitSec : 0)}
                        >
                          <RotateCcw className="h-3 w-3" /> Сброс
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-col gap-5 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={task.level === 'junior' ? 'default' : task.level === 'middle' ? 'secondary' : 'destructive'} className="capitalize">
                      {task.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatLanguageLabel(taskLanguage)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Язык задания: {formatLanguageLabel(taskLanguage)}
                  </span>
                </div>
              </div>
              {/* Block 2: Title + Description with icon */}
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {task.title}
                </h2>
                <p className="text-muted-foreground mt-1">{task.description}</p>
              </div>
            </div>
            
            {/* Scrollable content area */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* Стартовый шаблон кода */}
              <div className="mb-4">
                <Collapsible>
                  <CollapsibleTrigger className="group cursor-pointer flex items-center gap-2 hover:bg-muted/70 transition-colors rounded px-2 py-1">
                    <label className="text-sm font-medium">Стартовый шаблон кода</label>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                      {task.starter}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              {/* Скрытый редактор кода для полноэкранного режима */}
              <div className="hidden">
                <CodeEditor
                  ref={editorRef}
                  value={code}
                  onChange={(value) => setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code:value}}))}
                  language={taskLanguage}
                  height="300px"
                  placeholder="Введите ваш код здесь..."
                  onFullscreenChange={()=>{ /* no-op */ }}
                  onRun={run}
                  onResetTask={resetTask}
                  onResetTests={resetTests}
                  consoleOutput={logs}
                  onClearConsole={()=> setLogs([])}
                  timerLabel={formatSeconds(taskTimerValueSec)}
                  timerStatus={taskTimerRunning ? 'running' : 'paused'}
                />
              </div>

              {/* Кнопка для перехода к решению */}
              <div className="flex justify-center mb-6">
                <Button 
                  size="lg" 
                  variant="default" 
                  onClick={()=>editorRef.current?.enterFullscreen()}
                  className="px-8 py-3"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Перейти к решению
                </Button>
              </div>


              {/* Reference Solution for Interviewer */}
              {role==='interviewer' && task.solution && (
                <div className="mt-6">
                  <Collapsible>
                    <div className="border rounded-lg">
                      <div className="flex items-center justify-between p-4 bg-muted/50">
                        <CollapsibleTrigger className="group cursor-pointer flex items-center gap-2 hover:bg-muted/70 transition-colors rounded px-2 py-1">
                          <Star className="h-4 w-4 text-yellow-500" fill="currentColor" stroke="none"/>
                          <span className="font-medium">Эталонное решение</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copySolution}
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Копировать
                        </Button>
                      </div>
                      <CollapsibleContent>
                        <div className="p-4 border-t">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Эталонное решение для копирования</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={copySolution}
                              className="h-8 px-3"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Копировать решение
                            </Button>
                          </div>
                          <CodeEditor
                            value={task.solution}
                            onChange={() => {}} // Read-only
                            language={taskLanguage}
                            height="300px"
                            placeholder="Эталонное решение..."
                          />
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </div>
              )}
            
            {/* Actions (без запуска тестов в обычном режиме) */}
            <div className="flex flex-wrap gap-3 mt-6">
              {role==='interviewer' && (
                <>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4"/>
                    <label className="text-sm">Оценка (0–5):</label>
            <Input
              type="number"
              min={0}
              max={5}
              step={0.5}
              value={t[task.id]?.score??''}
              onChange={e=>setScore(Number(e.target.value))}
              className="w-20"
            />
                  </div>
                  <Button variant="outline" onClick={push} className="flex items-center gap-2">
                    <Send className="h-4 w-4"/>
                    Отправить оценку
                  </Button>
                </>
              )}
            </div>
            
            {/* Interviewer Comments */}
            {role==='interviewer' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Комментарий по решению:</label>
            <Textarea
              placeholder="Введите комментарий..."
              value={t[task.id]?.comment||''}
              onChange={e=>setComment(e.target.value)}
              className="w-full min-h-[80px]"
            />
              </div>
            )}
            
            {/* Test Results */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Результаты тестов</h3>
              <div className="space-y-2">
                {(t[task.id]?.lastResult||[]).map((r,i)=>(
                  <div key={i} className={cn(
                    "flex items-center gap-2 p-2 rounded",
                    r.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  )}>
                    {r.ok ? <CheckCircle className="h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
                    <span className="text-sm">{r.message}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tests Details */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Показать тесты
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                {task.tests}
              </pre>
            </details>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Выберите задачу из списка</p>
          </div>
        )}
      </div>
    </div>
  </div>
}
