import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Badge } from '@/shared/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { useApp } from '@/app/providers/AppProvider'
import { createSession, loadSession, saveSession, clearSession, mapTaskScore } from '@/shared/api/mock'
import { getQuestions, getTasks } from '@/shared/api/questions'
import type { MockSessionState, MockItem, MockTaskItem, MockTheoryItem } from '@/entities/mock/model/types'
import { Clock, Pause, Play, RotateCcw, CheckCircle, AlertTriangle, Printer, XCircle } from 'lucide-react'
import { useToast } from '@/shared/hooks/use-sonner'
import { CodeEditor } from '@/features/code-editor/ui'
import type { CodeEditorHandle } from '@/features/code-editor/ui/CodeEditor'
import { runModule } from '@/shared/api/runner'

export default function MockPage(){
  const { prof } = useApp()
  const [s, setS] = useState<MockSessionState | null>(()=> loadSession())
  const [theoryCount, setTheoryCount] = useState(12)
  const [taskCount, setTaskCount] = useState(8)
  const [durationMin, setDurationMin] = useState(90)
  const [allowPause, setAllowPause] = useState(true)
  const [level, setLevel] = useState<'junior'|'middle'|'senior'>('junior')
  const [weightTasks, setWeightTasks] = useState(0.6)
  const [candName, setCandName] = useState<string>(()=> localStorage.getItem('mock.candidateName') || '')
  const [candDept, setCandDept] = useState<string>(()=> localStorage.getItem('mock.candidateDept') || '')
  const [candPos, setCandPos] = useState<string>(()=> localStorage.getItem('mock.candidatePosition') || '')
  const [showExtra, setShowExtra] = useState<boolean>(()=> localStorage.getItem('mock.showExtraProps')==='1')

  useEffect(()=>{ try{ localStorage.setItem('mock.candidateName', candName) }catch{} }, [candName])
  useEffect(()=>{ try{ localStorage.setItem('mock.candidateDept', candDept) }catch{} }, [candDept])
  useEffect(()=>{ try{ localStorage.setItem('mock.candidatePosition', candPos) }catch{} }, [candPos])
  useEffect(()=>{ try{ localStorage.setItem('mock.showExtraProps', showExtra ? '1':'0') }catch{} }, [showExtra])
  const { toast } = useToast()
  const [reveal, setReveal] = useState<Record<string, boolean>>({})

  // Timer
  useEffect(()=>{ if(s) saveSession(s) }, [s])
  useEffect(()=>{
    if(!s?.running || s.finished) return
    const id = setInterval(()=>{
      setS(prev=>{
        if(!prev || prev.finished || !prev.running) return prev
        const rem = prev.remainingSec - 1
        if(rem <= 0){
          return { ...prev, remainingSec: 0, running: false, finished: true }
        }
        return { ...prev, remainingSec: rem }
      })
    }, 1000)
    return ()=> clearInterval(id)
  }, [s?.running, s?.finished, s?.id])

  // Toast notifications for half/10%/over (down only)
  const halfRef = useRef(false)
  const tenRef = useRef(false)
  const prevValRef = useRef<number>(s?.remainingSec||0)
  useEffect(()=>{
    if(!s || s.finished) return
    const limit = s.config.durationSec
    const remaining = s.remainingSec
    if(!s.running) { halfRef.current=false; tenRef.current=false }
    if(s.running && limit>0){
      const half = Math.floor(limit/2)
      const ten = Math.ceil(limit*0.10)
      if(!halfRef.current && remaining<=half){
        halfRef.current=true
        toast.info("Половина времени Mock‑сессии", fmt(remaining))
      }
      if(!tenRef.current && remaining<=ten){
        tenRef.current=true
        toast.warning("Меньше 10% времени", fmt(remaining))
      }
    }
    if(prevValRef.current>0 && remaining===0 && s.running===false){
      toast.error("Время истекло", "Сессия завершена")
      setS(prev=> prev ? { ...prev, finished: true, running: false } : prev)
    }
    prevValRef.current = remaining
  }, [s?.remainingSec, s?.running])

  const start = ()=> setS(createSession(prof, { theoryCount, taskCount, durationSec: durationMin*60, allowPause, level, weightTasks, candidateName: candName, candidateDept: candDept, candidatePosition: candPos }))
  const reset = ()=> { clearSession(); setS(null) }
  const fmt=(x:number)=>{
    x=Math.max(0, Math.floor(x)); const h=Math.floor(x/3600).toString().padStart(2,'0'); const m=Math.floor((x%3600)/60).toString().padStart(2,'0'); const s=(x%60).toString().padStart(2,'0'); return `${h}:${m}:${s}`
  }
  const cur: MockItem | undefined = s?.items[s?.currentIndex||0]
  const qMap = useMemo(()=>{
    if(!s) return {}
    const arr = getQuestions(s.config.profession as any)
    const m: Record<string, any> = {}
    arr.forEach(q=>{ m[q.id]=q })
    return m
  }, [s?.config.profession])
  const tMap = useMemo(()=>{
    if(!s) return {}
    const arr = getTasks(s.config.profession as any)
    const m: Record<string, any> = {}
    arr.forEach(t=>{ m[t.id]=t })
    return m
  }, [s?.config.profession])

  // Execute tests for task
  const editorRef = useRef<CodeEditorHandle | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const runTests=async()=>{
    if(!s || s.finished) return
    if(!cur || cur.type!=='task') return
    const item = cur as MockTaskItem
    if(!item.starter) return
    const code = (item.code ?? item.starter)
    const { TASKS_BY_PROF } = await import('@/shared/api/tasks')
    const tests = TASKS_BY_PROF[s.config.profession as keyof typeof TASKS_BY_PROF]?.find((t:any)=>t.id===item.taskId)?.tests
    if(!tests) return
    const tmpLogs: string[] = []
    const orig = { log: console.log, error: console.error, warn: console.warn, info: console.info }
    console.log = (...a:any[])=>{ tmpLogs.push(a.map(String).join(' ')); orig.log(...a) }
    console.error = (...a:any[])=>{ tmpLogs.push('[error] '+a.map(String).join(' ')); orig.error(...a) }
    console.warn = (...a:any[])=>{ tmpLogs.push('[warn] '+a.map(String).join(' ')); orig.warn(...a) }
    console.info = (...a:any[])=>{ tmpLogs.push('[info] '+a.map(String).join(' ')); orig.info(...a) }
    try{
      const res = await runModule(code, tests, { debug: false })
      const passed = res.filter(r=>r.ok).length
      const total = res.length
      const ratio = total? passed/total : 0
      const autoScore = mapTaskScore(passed,total)
      // persist into session
      setS(prev=>{
        if(!prev) return prev
        const items = prev.items.map(it=> it.id===item.id ? ({...it, testPassedRatio: ratio, autoScore, passedCount: passed, totalCount: total}) : it)
        const next = { ...prev, items }
        saveSession(next)
        return next
      })
      const allPassed = total>0 && passed===total
      if(allPassed){
        toast.success("Все тесты пройдены", `Пройдено ${passed}/${total}`)
      } else {
        const firstFail = res.find(r=>!r.ok)
        toast.error("Тесты не пройдены", `Пройдено ${passed}/${total}. ${firstFail?.message||''}`)
      }
    } finally {
      console.log = orig.log; console.error = orig.error; console.warn = orig.warn; console.info = orig.info
      setLogs(tmpLogs)
    }
  }

  const [finishOpen, setFinishOpen] = useState(false)
  const finish=()=> {
    setS(prev=> prev? ({...prev, finished: true, running: false}) : prev)
    setFinishOpen(false)
    toast.success("Сессия завершена", "Откройте отчёт справа или распечатайте")
  }
  const next=()=> setS(prev=> prev? ({...prev, currentIndex: Math.min(prev.items.length-1, prev.currentIndex+1)}) : prev)
  const prev=()=> setS(prev=> prev? ({...prev, currentIndex: Math.max(0, prev.currentIndex-1)}) : prev)

  if(!s){
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Мок‑интервью</CardTitle>
              <CardDescription>Сконфигурируйте сессию и начните тренировку</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm">Вопросы (теория):</label>
                <Input type="number" min={1} max={30} value={theoryCount} onChange={e=>setTheoryCount(Number(e.target.value)||0)} />
              </div>
              <div>
                <label className="text-sm">Задачи (практика):</label>
                <Input type="number" min={1} max={30} value={taskCount} onChange={e=>setTaskCount(Number(e.target.value)||0)} />
              </div>
              <div>
                <label className="text-sm">ФИО:</label>
                <Input required value={candName} onChange={e=>setCandName(e.target.value)} placeholder="Иванов Иван Иванович" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showExtra} onCheckedChange={setShowExtra} />
                <span className="text-sm">Указать отдел и должность</span>
              </div>
              {showExtra && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Отдел (опционально):</label>
                    <Input value={candDept} onChange={e=>setCandDept(e.target.value)} placeholder="Например, Аналитика" />
                  </div>
                  <div>
                    <label className="text-sm">Должность (опционально):</label>
                    <Input value={candPos} onChange={e=>setCandPos(e.target.value)} placeholder="Например, Middle BA" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm">Уровень задач:</label>
                <Select value={level} onValueChange={(v: 'junior'|'middle'|'senior')=> setLevel(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="middle">Middle</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Длительность (мин):</label>
                <Input type="number" min={10} max={240} value={durationMin} onChange={e=>setDurationMin(Number(e.target.value)||0)} />
              </div>
              <div>
                <label className="text-sm">Вес практики (0.0–1.0):</label>
                <Input type="number" step={0.1} min={0} max={1} value={weightTasks} onChange={e=>setWeightTasks(Number(e.target.value))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={allowPause} onCheckedChange={setAllowPause} />
                <span className="text-sm">Разрешить паузу</span>
              </div>
              <Button onClick={start} disabled={!candName.trim()} className="w-full justify-center inline-flex items-center gap-2">
                <Play className="h-4 w-4" />
                Начать
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Как это работает</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>В случайном порядке будет выбрано N теоретических вопросов и M задач. У вас будет ограниченное время, по истечении которого сессия завершится автоматически.</p>
              <p>По завершении вы увидите эталонные ответы, выставите самооценку по теории и получите итоговую рекомендацию по уровню.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Session or Review/Report
  const isReview = s.finished
  const progress = `${s.currentIndex+1}/${s.items.length}`
  const percent = Math.round(((s.items.filter(it=> it.type==='task' ? (it as MockTaskItem).autoScore!=null : (it as MockTheoryItem).answerDraft!=null).length)/s.items.length)*100)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
      <div className="lg:col-span-1 h-full min-h-0">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Мок‑интервью — прогресс</CardTitle>
                <CardDescription>
                  {progress} • {percent}% завершено
                </CardDescription>
              </div>
              <Popover open={finishOpen} onOpenChange={setFinishOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">Завершить</Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Завершить сессию?</div>
                    <div className="text-xs text-muted-foreground">Оставшееся время: <span className="font-mono">{fmt(s.remainingSec)}</span></div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={()=> setFinishOpen(false)}>Отмена</Button>
                      <Button size="sm" onClick={finish}>Завершить</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Timer dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{fmt(s.remainingSec)}</span>
                  <span className={`h-2 w-2 rounded-full ${s.running ? 'bg-green-500' : 'bg-muted-foreground/50'}`}></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">Таймер сессии</div>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center gap-1"
                    onClick={()=> s.config.allowPause && setS(prev=> prev? ({...prev, running: !prev.running}) : prev)}
                    disabled={!s.config.allowPause}
                    title={s.config.allowPause? '' : 'Пауза отключена'}
                  >
                    {s.running ? (<><Pause className="h-3 w-3" /> Пауза</>) : (<><Play className="h-3 w-3" /> Старт</>)}
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center gap-1"
                    onClick={()=> setS(prev=> prev? ({...prev, remainingSec: prev.config.durationSec, running: false}) : prev)}
                  >
                    <RotateCcw className="h-3 w-3" /> Сброс
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Items */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {s.items.map((it,idx)=>{
                const active = idx===s.currentIndex
                const done = it.type==='task' ? (it as MockTaskItem).autoScore!=null : (it as MockTheoryItem).answerDraft!=null
                let statusIcon: React.ReactNode = null
                if (isReview) {
                  if (it.type==='task') {
                    const t = it as MockTaskItem
                    if (t.autoScore!=null) {
                      statusIcon = (t.testPassedRatio===1)
                        ? <CheckCircle className="h-4 w-4 text-green-600"/>
                        : <XCircle className="h-4 w-4 text-red-600"/>
                    }
                  } else {
                    const th = it as MockTheoryItem
                    if (th.selfScore!=null) {
                      statusIcon = (th.selfScore>=3)
                        ? <CheckCircle className="h-4 w-4 text-green-600"/>
                        : <XCircle className="h-4 w-4 text-red-600"/>
                    }
                  }
                } else if (done) {
                  statusIcon = <CheckCircle className="h-4 w-4 text-green-600"/>
                }
                return (
                  <Button key={it.id} variant={active? 'secondary':'ghost'} className="w-full justify-between" onClick={isReview? undefined : ()=> setS(prev=> prev? ({...prev, currentIndex: idx}) : prev)} disabled={isReview}>
                    <span className="text-left truncate max-w-[70%]">{idx+1}. {it.title}</span>
                    <span className="flex items-center gap-2">
                      {it.type==='task' ? (
                        <Badge className="border-transparent bg-blue-600 text-white hover:bg-blue-600/90">Задача</Badge>
                      ) : (
                        <Badge variant="secondary">Теория</Badge>
                      )}
                      {statusIcon}
                    </span>
                  </Button>
                )
              })}
            </div>

            {/* Actions */}
            {!isReview && (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" onClick={prev} disabled={s.currentIndex===0}>Назад</Button>
                <Button variant="outline" onClick={next} disabled={s.currentIndex===s.items.length-1}>Далее</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main */}
      <div className="lg:col-span-2 h-full min-h-0">
        <Card className="h-full flex flex-col">
          <CardHeader>
            {isReview && (
              (()=>{
                const tasks = s.items.filter(it=> it.type==='task') as MockTaskItem[]
                const theory = s.items.filter(it=> it.type==='theory') as MockTheoryItem[]
                const tasksAvg = tasks.length ? (tasks.reduce((sum,i)=> sum + (i.autoScore||0),0) / tasks.length) : 0
                const theoryAvg = theory.length ? (theory.reduce((sum,i)=> sum + (i.selfScore||0),0) / theory.length) : 0
                const final0to5 = (tasksAvg * s.config.weightTasks) + (theoryAvg * (1 - s.config.weightTasks))
                const finalPct = Math.round((final0to5/5)*100)
                const level = finalPct>=85 ? 'Senior' : finalPct>=65 ? 'Middle' : 'Junior-'
                return (
                  <div className="mb-3 p-4 bg-muted rounded-lg flex items-center justify-between">
                    <div className="space-y-1">
                      {(s.config.candidateName || s.config.candidateDept || s.config.candidatePosition) && (
                        <div className="text-sm">
                          {s.config.candidateName && (<span className="font-medium">{s.config.candidateName}</span>)}
                          {(s.config.candidateDept || s.config.candidatePosition) && (
                            <span className="text-muted-foreground"> — {s.config.candidateDept}{s.config.candidateDept && s.config.candidatePosition ? ', ' : ''}{s.config.candidatePosition}</span>
                          )}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">Итоговый процент</div>
                      <div className="text-2xl font-semibold">{finalPct}%</div>
                      <div className="text-sm">Уровень: <span className="font-medium">{level}</span></div>
                      <div className="text-xs text-muted-foreground">Практика: {tasksAvg.toFixed(1)} / Теория: {theoryAvg.toFixed(1)} • Вес практики: {(s.config.weightTasks*100).toFixed(0)}%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={()=>{ clearSession(); setS(null) }}>
                        К конфигурации
                      </Button>
                      <Button variant="outline" className="inline-flex items-center gap-2" onClick={()=> window.print()}>
                        <Printer className="h-4 w-4" /> Печать / PDF
                      </Button>
                    </div>
                  </div>
                )
              })()
            )}
            {!isReview && (
              <>
                <CardTitle>{cur?.title}</CardTitle>
                <CardDescription>
                  {cur?.type==='theory' ? 'Теория' : 'Практика'}
                </CardDescription>
              </>
            )}
          </CardHeader>
          {!isReview ? (
            <CardContent className="flex-1 overflow-y-auto">
              {cur?.type==='theory' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{(cur as MockTheoryItem).prompt}</p>
                  <Textarea placeholder="Ваш ответ..." value={(cur as MockTheoryItem).answerDraft||''} onChange={e=> setS(prev=>{
                    if(!prev) return prev; const items=prev.items.map(it=> it.id===cur.id ? ({...it, answerDraft: e.target.value}) : it); const next={...prev, items}; saveSession(next); return next
                  })} />
                </div>
              )}
              {cur?.type==='task' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{(cur as MockTaskItem).description}</p>
                  <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">{(cur as MockTaskItem).starter}</pre>
                  <Button size="sm" variant="default" onClick={()=> editorRef.current?.enterFullscreen()}>Перейти к решению</Button>
                  <CodeEditor
                    className="hidden"
                    ref={editorRef}
                    value={(cur as MockTaskItem).code ?? (cur as MockTaskItem).starter}
                    onChange={(value)=> setS(prev=>{ if(!prev) return prev; const items=prev.items.map(it=> it.id===cur.id ? ({...it, code:value}) : it); const next={...prev, items}; saveSession(next); return next })}
                    language={tMap[(cur as MockTaskItem).taskId]?.language || 'javascript'}
                    height="0px"
                    onRun={runTests}
                    consoleOutput={logs}
                    onClearConsole={()=> setLogs([])}
                    timerLabel={fmt(s.remainingSec)}
                    timerStatus={s.running ? 'running' : 'paused'}
                  />
                </div>
              )}
            </CardContent>
          ) : (
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {/* Review mode: list all items (theory + tasks) */}
              {s.items.map((it)=> it.type==='theory' ? (
                <div key={it.id} className="p-3 border rounded">
                  <div className="font-medium mb-1">{it.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">{(it as MockTheoryItem).prompt}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Ваш ответ</div>
                      <pre className="p-2 bg-muted rounded text-xs whitespace-pre-wrap">{(it as MockTheoryItem).answerDraft||'-'}</pre>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Эталонный ответ</div>
                      <pre className={reveal[it.id] ?
                        "p-2 bg-muted rounded text-xs whitespace-pre-wrap" :
                        "p-2 bg-muted rounded text-xs whitespace-pre-wrap hidden print:block"
                      }>{qMap[(it as MockTheoryItem).questionId]?.answer || '-'}</pre>
                      {!reveal[it.id] && (
                        <Button className="print:hidden" variant="outline" size="sm" onClick={()=> setReveal(r=>({...r, [it.id]: true}))}>Показать ответ</Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm">Самооценка (0–5):</span>
                    <Input type="number" min={0} max={5} step={0.5} value={(it as MockTheoryItem).selfScore??''} onChange={e=> setS(prev=>{ if(!prev) return prev; const items=prev.items.map(x=> x.id===it.id ? ({...x, selfScore: Number(e.target.value)||0}) : x); const next={...prev, items}; saveSession(next); return next })} className="w-24" />
                  </div>
                </div>
              ) : (
                <div key={it.id} className="p-3 border rounded">
                  <div className="font-medium mb-1">{it.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">{(it as MockTaskItem).description}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Ваше решение</div>
                      <pre className="p-2 bg-muted rounded text-xs whitespace-pre-wrap overflow-x-auto">{(it as MockTaskItem).code || (it as MockTaskItem).starter}</pre>
                      <div className="text-xs mt-2">Результаты тестов: {typeof (it as MockTaskItem).passedCount==='number' ? `${(it as MockTaskItem).passedCount}/${(it as MockTaskItem).totalCount}` : '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Эталонное решение</div>
                      <pre className={reveal[it.id] ?
                        "p-2 bg-muted rounded text-xs whitespace-pre-wrap overflow-x-auto" :
                        "p-2 bg-muted rounded text-xs whitespace-pre-wrap overflow-x-auto hidden print:block"
                      }>{tMap[(it as MockTaskItem).taskId]?.solution || '-'}</pre>
                      {!reveal[it.id] && (
                        <Button className="print:hidden" variant="outline" size="sm" onClick={()=> setReveal(r=>({...r, [it.id]: true}))}>Показать ответ</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
