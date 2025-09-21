import React from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { useToast } from '@/shared/hooks/use-toast'
import { getQuestions, putQuestions, getTasks, putTasks } from '@/shared/api/questions'
import { useApp } from '@/app/providers/AppProvider'
export default function DataHub(){
  const { prof } = useApp()
  const {toast} = useToast()
  const lsKeyQuestions = (p:string)=> `bank:${p}:questions`
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

      // Поддерживаем несколько форматов ввода:
      // 1) { questions: TheoryQuestion[], tasks?: UITask[] }
      // 2) TheoryQuestion[]
      // 3) Простой массив вопросов в формате [{id, level, category, question, answer}]

      const maybeArray = Array.isArray(p) ? p : (Array.isArray(p?.questions) ? p.questions : null)
      const maybeTasks = Array.isArray(p?.tasks) ? p.tasks : null

      if (maybeArray) {
        const normalized = normalizeQuestions(maybeArray)
        if (normalized.length) putQuestions(prof, normalized)
      }
      if (maybeTasks) {
        // сохраняем задачи как есть (ожидается формат UITask[]) 
        putTasks(prof, maybeTasks)
      }
      toast({title: "Импортировано", description: "Данные импортированы. Открой «Теорию»/«Решение задач»."})
    } catch { 
      toast({title: "Ошибка", description: "Неверный формат JSON файла.", variant: "destructive"})
    } }
    r.readAsText(f)
  }

  const resetToDefaults = () => {
    try { localStorage.removeItem(lsKeyQuestions(prof)); } catch {}
    // force re-seed by calling getQuestions
    const seeded = getQuestions(prof)
    toast({ title: 'Сброшено', description: `Вопросы ${prof} сброшены к базе (${seeded.length})` })
  }
  
  function normalizeQuestions(input: any[]): any[] {
    // Если элементы уже похожи на TheoryQuestion — возвращаем как есть
    const looksLikeTheory = (q: any) => q && typeof q.id==='string' && typeof q.title==='string' && typeof q.prompt==='string' && typeof q.answer==='string'
    if (input.every(looksLikeTheory)) return input

    // Иначе пробуем преобразовать из простого формата:
    // { id, level, category, question, answer }
    const levelToDifficulty = (lvl: any): number => {
      const v = String(lvl||'').toLowerCase()
      if (v==='junior') return 1
      if (v==='middle' || v==='mid') return 2
      if (v==='senior') return 3
      return 2
    }

    return input.map((raw: any) => {
      if (looksLikeTheory(raw)) return raw
      const id = String(raw?.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2))
      const questionText = String(raw?.question ?? raw?.prompt ?? raw?.title ?? '')
      const title = String(raw?.title ?? questionText)
      const prompt = String(raw?.prompt ?? questionText)
      const answer = String(raw?.answer ?? '')
      const category = String(raw?.category ?? 'General')
      const difficulty = Number.isFinite(raw?.difficulty) ? Number(raw.difficulty) : levelToDifficulty(raw?.level)
      const bucket: 'screening'|'deep'|'architecture' = ((): any => {
        const b = String(raw?.bucket||'').toLowerCase()
        if (b==='screening' || b==='deep' || b==='architecture') return b
        return 'screening'
      })()

      return { id, title, category, difficulty, bucket, prompt, answer }
    })
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
            <Button variant="destructive" onClick={resetToDefaults}>
              Сбросить к базе
            </Button>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Форматы импорта:</strong> {"{ questions: TheoryQ[], tasks?: UITask[] }"} или массив вопросов вида [{"{ id, level, category, question, answer }"}]. Данные хранятся в localStorage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
