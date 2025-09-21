import React,{useMemo,useState} from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useToast } from '@/shared/hooks/use-sonner'
import { useApp } from '@/app/providers/AppProvider'
import { Save, Printer, Trash2, Info, CheckCircle } from 'lucide-react'
type Row={prof:string;level:string;taskId:string;title:string;score:number;comment:string}
type TheoryRow={prof:string;questionId:string;title:string;category:string;difficulty:number;score:number;comment:string}
export default function Interview(){
  const {prof}=useApp()
  const[name,setName]=useState(localStorage.getItem("cand.name")||"")
  const[pos,setPos]=useState(localStorage.getItem("cand.pos")||"")
  const[note,setNote]=useState(localStorage.getItem("cand.note")||"")
  const today = new Date(); const iso = new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10)
  const[date,setDate]=useState(localStorage.getItem("cand.date")||iso)
  const[timeSpent,setTimeSpent]=useState(localStorage.getItem("cand.timeSpent")||"")
  const[interviewers,setInterviewers]=useState<string[]>(()=>{ try { const v=localStorage.getItem("cand.interviewers"); if(!v) return []; const p=JSON.parse(v); return Array.isArray(p)? p.filter(x=>typeof x==='string'): [] } catch { return [] } })
  const[newInterviewer,setNewInterviewer]=useState("")
  const bridge=JSON.parse(localStorage.getItem("bridge.taskScores.v1")||"{}") as Record<string,Row>
  const rows=useMemo(()=>Object.values(bridge).filter(r=>r.prof===prof),[prof,bridge])
  const tBridge=JSON.parse(localStorage.getItem("bridge.theoryScores.v1")||"{}") as Record<string,TheoryRow>
  const tRows=useMemo(()=>Object.values(tBridge).filter(r=>r.prof===prof),[prof,tBridge])
  const final=rows.length? (rows.reduce((s,r)=>s+(r.score||0),0)/(rows.length*5))*100:0
  const level=final>=85?"Senior":final>=65?"Middle":"Junior-"
  const {toast}=useToast()
  const persist=()=>{
    localStorage.setItem("cand.name",name);
    localStorage.setItem("cand.pos",pos);
    localStorage.setItem("cand.note",note);
    localStorage.setItem("cand.date",date);
    localStorage.setItem("cand.timeSpent",timeSpent);
    localStorage.setItem("cand.interviewers",JSON.stringify(interviewers));
    toast.success("Сохранено", "Данные кандидата сохранены.")
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-1 gap-6">
      {/* Instructions */}
      <div className="lg:col-span-1 print:hidden">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Режим интервью — {prof}
            </CardTitle>
            <CardDescription>
              Ставь оценки в «Решение задач», затем вернись сюда — они появятся ниже.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:flex-nowrap gap-3">
              <Button variant="outline" onClick={persist} className="inline-flex items-center gap-2 w-full md:w-auto">
                <Save className="h-4 w-4" />
                Сохранить
              </Button>
              <Button variant="outline" onClick={()=>window.print()} className="inline-flex items-center gap-2 w-full md:w-auto">
                <Printer className="h-4 w-4" />
                Печать / PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={()=>{localStorage.removeItem("bridge.taskScores.v1"); localStorage.removeItem("bridge.theoryScores.v1"); location.reload()}}
                className="inline-flex items-center gap-2 w-full md:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Сброс оценок
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report */}
      <div className="lg:col-span-2 print:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Отчёт</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible">
            {/* Meta: Date, Time, Interviewers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Дата интервью:</label>
                <Input type="date" value={date} onChange={e=>setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Затраченное время (чч:мм):</label>
                <Input placeholder="Например, 01:30" value={timeSpent} onChange={e=>setTimeSpent(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Интервьюеры:</label>
                <div className="flex gap-2">
                  <Input placeholder="Имя" value={newInterviewer} onChange={e=>setNewInterviewer(e.target.value)} />
                  <Button type="button" onClick={()=>{ const v=newInterviewer.trim(); if(!v) return; setInterviewers(a=>Array.from(new Set([...a, v]))); setNewInterviewer("") }}>Добавить</Button>
                </div>
                {interviewers.length>0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interviewers.map((p,i)=>(
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded border text-sm">
                        {p}
                        <button className="text-muted-foreground hover:text-foreground" onClick={()=> setInterviewers(arr=>arr.filter((_,idx)=>idx!==i))}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Candidate Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Кандидат:</label>
                <Input 
                  value={name} 
                  onChange={e=>setName(e.target.value)}
                  placeholder="Имя кандидата"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Позиция:</label>
                <Input 
                  value={pos} 
                  onChange={e=>setPos(e.target.value)}
                  placeholder="Позиция"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Общая обратная связь:</label>
              <Textarea 
                value={note} 
                onChange={e=>setNote(e.target.value)}
                placeholder="Общие комментарии по кандидату..."
                className="min-h-[100px]"
              />
            </div>

            {/* Results Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Финальный процент:</span>
                  <span className="ml-2 font-semibold">{final.toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Уровень:</span>
                  <Badge 
                    variant={level==='Senior' ? 'default' : level==='Middle' ? 'secondary' : 'destructive'}
                    className="ml-2"
                  >
                    {level}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tasks Table */}
            {rows.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Оценки по задачам</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Профессия</th>
                        <th className="text-left p-2">Уровень</th>
                        <th className="text-left p-2">Задача</th>
                        <th className="text-left p-2">Оценка</th>
                        <th className="text-left p-2">Комментарий</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r,i)=>(
                        <tr key={i} className="border-b">
                          <td className="p-2">{r.prof}</td>
                          <td className="p-2">
                            <Badge variant="outline">{r.level}</Badge>
                          </td>
                          <td className="p-2">{r.title}</td>
                          <td className="p-2">
                            <Badge variant={r.score>=4 ? 'default' : r.score>=3 ? 'secondary' : 'destructive'}>
                              {r.score}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">{r.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Theory Table */}
            {tRows.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Оценки по теории</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Профессия</th>
                        <th className="text-left p-2">Категория</th>
                        <th className="text-left p-2">Вопрос</th>
                        <th className="text-left p-2">Оценка</th>
                        <th className="text-left p-2">Комментарий</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tRows.map((r,i)=>(
                        <tr key={i} className="border-b">
                          <td className="p-2">{r.prof}</td>
                          <td className="p-2">
                            <Badge variant="outline">{r.category}</Badge>
                          </td>
                          <td className="p-2">{r.title}</td>
                          <td className="p-2">
                            <Badge variant={r.score>=4 ? 'default' : r.score>=3 ? 'secondary' : 'destructive'}>
                              {r.score}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">{r.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions moved to left panel */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
