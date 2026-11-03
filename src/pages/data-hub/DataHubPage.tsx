import React from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { useToast } from '@/shared/hooks/use-sonner'
import { exportBank, importBank, resetBank, getQuestions, MAX_IMPORT_BYTES } from '@/shared/bank'
import { useApp } from '@/app/providers/AppProvider'

export default function DataHub() {
  const { prof } = useApp()
  const { toast } = useToast()

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(exportBank(prof), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bank-${prof}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Экспортировано', `Данные ${prof} экспортированы в файл.`)
  }

  const importJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // чтобы можно было выбрать тот же файл повторно
    if (!file) return
    if (file.size > MAX_IMPORT_BYTES) {
      toast.error('Файл слишком большой', `Максимум ${MAX_IMPORT_BYTES / 1024 / 1024} МБ`)
      return
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(await file.text())
    } catch {
      toast.error('Ошибка', 'Неверный формат JSON файла.')
      return
    }
    const report = importBank(prof, parsed)
    const q = report.questions
    const t = report.tasks
    const imported = q.added + q.updated + t.added + t.updated
    const rejected = q.rejected + t.rejected
    if (imported === 0) {
      toast.error('Ничего не импортировано', report.errors[0] ?? 'Нет подходящих записей')
      return
    }
    toast.success(
      'Импортировано',
      `Вопросы: +${q.added}, обновлено ${q.updated}. Задачи: +${t.added}, обновлено ${t.updated}.` +
        (rejected ? ` Отклонено: ${rejected} (${report.errors[0]})` : '')
    )
  }

  const resetToDefaults = () => {
    if (!window.confirm('Сбросить импортированные вопросы и задачи к встроенной базе?')) return
    resetBank(prof)
    toast.info('Сброшено', `Банк ${prof} сброшен к встроенному (вопросов: ${getQuestions(prof).length})`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Импорт / Экспорт — {prof}</CardTitle>
          <CardDescription>Управление данными вопросов и задач для профессии {prof}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button onClick={exportJSON}>Экспортировать</Button>
            <Button variant="outline" asChild>
              <label>
                <input type="file" accept="application/json" onChange={importJSON} className="hidden" />
                Импортировать
              </label>
            </Button>
            <Button variant="destructive" onClick={resetToDefaults}>
              Сбросить к базе
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Форматы импорта:</strong> {'{ questions, tasks? }'} или массив вопросов вида{' '}
              {'[{ id, level, category, question, answer }]'}. Записи с тем же <code>id</code>{' '}
              заменяют встроенные, остальные добавляются; невалидные отклоняются. Данные хранятся в
              браузере и не теряются при обновлении встроенной базы.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
