import React from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { useToast } from '@/shared/hooks/use-toast'
import { getQuestions, putQuestions, getTasks, putTasks } from '@/shared/api/questions'
import { useApp } from '@/app/providers/AppProvider'
export default function DataHub(){
  const { prof } = useApp()
  const {toast} = useToast()
  const exportJSON = () => {
    const data = { questions: getQuestions(prof), tasks: getTasks(prof) }
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'})
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `bank-${prof}.json`; a.click(); URL.revokeObjectURL(url)
    toast({title: "Экспортировано", description: `Данные ${prof} экспортированы в файл.`})
  }
  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return
    const r = new FileReader()
    r.onload = () => { try{
      const p = JSON.parse(String(r.result))
      if(p.questions) putQuestions(prof, p.questions)
      if(p.tasks) putTasks(prof, p.tasks)
      toast({title: "Импортировано", description: "Данные импортированы. Открой «Теорию»/«Решение задач»."})
    } catch { 
      toast({title: "Ошибка", description: "Неверный формат JSON файла.", variant: "destructive"})
    } }
    r.readAsText(f)
  }
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Импорт / Экспорт — {prof}</CardTitle>
          <CardDescription>
            Управление данными вопросов и задач для профессии {prof}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={exportJSON}>
              Экспортировать
            </Button>
            <Button variant="outline" asChild>
              <label>
                <input 
                  type="file" 
                  accept="application/json" 
                  onChange={importJSON} 
                  className="hidden"
                />
                Импортировать
              </label>
            </Button>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Формат:</strong> {"{ questions: TheoryQ[], tasks: UITask[] }"} (хранится в localStorage)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
