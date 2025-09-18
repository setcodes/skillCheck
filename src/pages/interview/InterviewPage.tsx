import React,{useMemo,useState} from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useToast } from '@/shared/hooks/use-toast'
import { useApp } from '@/app/providers/AppProvider'
type Row={prof:string;level:string;taskId:string;title:string;score:number;comment:string}
export default function Interview(){
  const {prof}=useApp()
  const[name,setName]=useState(localStorage.getItem("cand.name")||"")
  const[pos,setPos]=useState(localStorage.getItem("cand.pos")||"")
  const[note,setNote]=useState(localStorage.getItem("cand.note")||"")
  const bridge=JSON.parse(localStorage.getItem("bridge.taskScores.v1")||"{}") as Record<string,Row>
  const rows=useMemo(()=>Object.values(bridge).filter(r=>r.prof===prof),[prof,bridge])
  const final=rows.length? (rows.reduce((s,r)=>s+(r.score||0),0)/(rows.length*5))*100:0
  const level=final>=85?"Senior":final>=65?"Middle":"Junior-"
  const {toast}=useToast()
  const persist=()=>{localStorage.setItem("cand.name",name);localStorage.setItem("cand.pos",pos);localStorage.setItem("cand.note",note);toast({title: "Сохранено", description: "Данные кандидата сохранены."})}
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Instructions */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Режим интервью — {prof}</CardTitle>
            <CardDescription>
              Ставь оценки в «Решение задач», затем вернись сюда — они появятся ниже.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Report */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Отчёт</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={persist}>
                Сохранить
              </Button>
              <Button variant="outline" onClick={()=>window.print()}>
                Печать / PDF
              </Button>
              <Button 
                variant="destructive" 
                onClick={()=>{localStorage.removeItem("bridge.taskScores.v1");location.reload()}}
              >
                Сброс оценок
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
