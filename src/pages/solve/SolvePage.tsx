import React,{useEffect,useMemo,useState} from 'react'
import { Play, CheckCircle, XCircle, Star, Send } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { CodeEditor } from '@/features/code-editor/ui'
import { useToast } from '@/shared/hooks/use-toast'
import { cn } from '@/shared/lib/utils'
import { useApp } from '@/app/providers/AppProvider'
import { runModule } from '@/shared/api/runner'
import { getTasks } from '@/shared/api/questions'
import type { UITask } from '@/entities/task/model/types'
type Sol={code:string;lastResult?:{ok:boolean;message:string}[];score?:number;comment?:string}
const K='solutions.v4';const load=()=>{try{const r=localStorage.getItem(K);if(r)return JSON.parse(r)}catch{}return{}};const save=(x:any)=>{try{localStorage.setItem(K,JSON.stringify(x))}catch{}}
export default function Solve(){
  const {role,prof}=useApp(); const[t,setT]=useState<Record<string,Sol>>(load()); useEffect(()=>save(t),[t])
  const tasks=getTasks(prof); const levels=Array.from(new Set(tasks.map((x:UITask)=>x.level))) as UITask['level'][]
  const[level,setLevel]=useState<UITask['level']>(levels[0]||'junior'); useEffect(()=>{setLevel(levels[0]||'junior')},[prof])
  const list=tasks.filter((x:UITask)=>x.level===level); const[cur,setCur]=useState<string>(list[0]?.id||''); useEffect(()=>{const l=tasks.filter((x:UITask)=>x.level===level);setCur(l[0]?.id||'')},[level,tasks])
  const task=useMemo(()=>tasks.find((x:UITask)=>x.id===cur),[cur,tasks]); const code=(t[cur]?.code)??(task?.starter||'')
  const {toast}=useToast()
  
  // Определяем язык программирования в зависимости от профессии
  const getLanguage = () => {
    switch(prof) {
      case 'frontend': return 'javascript'
      case 'backend-java': return 'java'
      case 'analyst': return 'sql'
      case 'devops': return 'yaml'
      default: return 'javascript'
    }
  }
  
  const run=async()=>{
    if(!task)return; 
    
    // Проверяем, есть ли код для тестирования
    if (!code.trim()) {
      toast({
        title: "⚠️ Нет кода для тестирования",
        description: "Введите код решения перед запуском тестов",
        variant: "default"
      })
      return
    }
    
    // Показываем тост о начале тестирования
    toast({
      title: "Запуск тестов...",
      description: "Выполняются тесты для задачи",
    })
    
    try {
      const res=await runModule(code,task.tests); 
      setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code,lastResult:res}}))
      
      // Проверяем, есть ли результаты тестов
      if (!res || res.length === 0) {
        toast({
          title: "⚠️ Нет тестов",
          description: "Для этой задачи не найдено тестов",
          variant: "default"
        })
        return
      }
      
      // Анализируем результаты и показываем соответствующий тост
      const allPassed = res.every(r => r.ok)
      const passedCount = res.filter(r => r.ok).length
      const totalCount = res.length
      
      if (allPassed) {
        toast({
          title: "✅ Все тесты пройдены!",
          description: `Успешно выполнено ${totalCount} из ${totalCount} тестов`,
          variant: "default"
        })
      } else {
        // Получаем первую ошибку для показа в тосте
        const firstError = res.find(r => !r.ok)
        const errorMessage = firstError ? firstError.message : "Неизвестная ошибка"
        
        toast({
          title: "❌ Тесты не пройдены",
          description: `Пройдено ${passedCount} из ${totalCount} тестов. ${errorMessage}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      // Обрабатываем ошибки выполнения
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка"
      toast({
        title: "💥 Ошибка выполнения",
        description: `Не удалось запустить тесты: ${errorMessage}`,
        variant: "destructive"
      })
    }
  }
  const setScore=(s:number)=>task&&setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code,score:s}})); const setComment=(c:string)=>task&&setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code,comment:c}}))
  const push=()=>{
    if(!task)return; 
    const payload={prof,level,taskId:task.id,title:task.title,score:t[task.id]?.score??0,comment:t[task.id]?.comment||''}; 
    const bridge=JSON.parse(localStorage.getItem('bridge.taskScores.v1')||'{}'); 
    bridge[prof+':'+level+':'+task.id]=payload; 
    localStorage.setItem('bridge.taskScores.v1',JSON.stringify(bridge)); 
    toast({
      title: "📤 Оценка отправлена!",
      description: "Оценка сохранена и доступна в режиме интервью",
      variant: "default"
    })
  }
  const resetTask=()=>{
    if(!task)return; 
    setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code:task.starter,lastResult:undefined}})); 
    toast({
      title: "🔄 Задача сброшена",
      description: "Код возвращен к исходному состоянию",
      variant: "default"
    })
  }
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Tasks List */}
    <div className="lg:col-span-1">
      <div className="bg-card border rounded-lg p-6 h-fit">
        <h2 className="text-xl font-semibold mb-4">Задачи — {prof}</h2>
        
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
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {list.map(x=>(
            <Button 
              key={x.id} 
              variant={cur===x.id?'secondary':'ghost'} 
              className="w-full justify-start text-left h-auto p-3"
              onClick={()=>setCur(x.id)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{x.title}</span>
                <span className="text-xs text-muted-foreground capitalize">{x.level}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>

    {/* Task Details */}
    <div className="lg:col-span-2">
      <div className="bg-card border rounded-lg p-6">
        {task ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{task.title}</h2>
              <Badge variant={task.level === 'junior' ? 'default' : task.level === 'middle' ? 'secondary' : 'destructive'}>
                {task.level}
              </Badge>
            </div>
            
            <p className="text-muted-foreground mb-6">{task.description}</p>
            
            {/* Code Editor */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Код решения:</label>
                <Badge variant="outline" className="text-xs">
                  {getLanguage().toUpperCase()}
                </Badge>
              </div>
              <CodeEditor
                value={code}
                onChange={(value) => setT(a=>({...a,[task.id]:{...(a[task.id]||{}),code:value}}))}
                language={getLanguage()}
                height="400px"
                placeholder="Введите ваш код здесь..."
              />
            </div>
            
            {/* Reference Solution for Interviewer */}
            {role==='interviewer' && task.solution && (
              <div className="mb-6">
                <details className="border rounded-lg">
                  <summary className="cursor-pointer p-4 bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500"/>
                      <span className="font-medium">Эталонное решение</span>
                    </div>
                  </summary>
                  <div className="p-4 border-t">
                    <CodeEditor
                      value={task.solution}
                      onChange={() => {}} // Read-only
                      language={getLanguage()}
                      height="300px"
                      placeholder="Эталонное решение..."
                    />
                  </div>
                </details>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button onClick={run} className="flex items-center gap-2">
                <Play className="h-4 w-4"/>
                Запустить тесты
              </Button>
              
              <Button variant="outline" onClick={resetTask} className="flex items-center gap-2">
                <XCircle className="h-4 w-4"/>
                Сбросить задачу
              </Button>
              
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
            <div className="mb-6">
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
