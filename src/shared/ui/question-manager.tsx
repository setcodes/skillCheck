import React, { useState, useRef } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useToast } from '@/shared/hooks/use-toast'
import { localQuestionManager } from '@/shared/api/local-question-manager'
import { questionStore } from '@/shared/api/question-store'
import { useApp } from '@/app/providers/AppProvider'
import { Upload, FolderOpen, Download, Trash2, Plus, FileText } from 'lucide-react'

interface QuestionManagerProps {
  className?: string
}

export function QuestionManager({ className }: QuestionManagerProps) {
  const { prof } = useApp()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sourceStats, setSourceStats] = useState<Array<{ type: string; count: number; priority: number }>>([])

  // Обновить статистику источников
  const updateStats = () => {
    setSourceStats(questionStore.getSourceStats(prof))
  }

  // Загрузить JSON файлы
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setIsLoading(true)
    try {
      await localQuestionManager.loadAdditionalQuestions(prof, files)
      updateStats()
      toast({
        title: 'Файлы загружены',
        description: `Загружено ${files.length} файлов для ${prof}`
      })
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить файлы',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Загрузить из папки
  const handleFolderUpload = async () => {
    setIsLoading(true)
    try {
      await localQuestionManager.loadQuestionsFromDirectory(prof)
      updateStats()
      toast({
        title: 'Папка загружена',
        description: `Вопросы из папки загружены для ${prof}`
      })
    } catch (error) {
      toast({
        title: 'Ошибка загрузки папки',
        description: 'Не удалось загрузить папку',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Создать шаблон
  const createTemplate = () => {
    const templates = localQuestionManager.generateQuestionTemplate(prof, 5)
    localQuestionManager.exportQuestions(prof, templates, `template-${prof}.json`)
    toast({
      title: 'Шаблон создан',
      description: 'Скачан файл-шаблон для создания вопросов'
    })
  }

  // Экспортировать все вопросы
  const exportAllQuestions = () => {
    const questions = questionStore.getQuestions(prof)
    localQuestionManager.exportQuestions(prof, questions, `all-questions-${prof}.json`)
    toast({
      title: 'Вопросы экспортированы',
      description: `Экспортировано ${questions.length} вопросов`
    })
  }

  // Очистить локальные источники
  const clearLocalSources = () => {
    localQuestionManager.clearLocalSources(prof)
    updateStats()
    toast({
      title: 'Локальные источники очищены',
      description: 'Удалены все локально загруженные вопросы'
    })
  }

  // Инициализация статистики
  React.useEffect(() => {
    updateStats()
  }, [prof])

  if (!(import.meta as any)?.env?.DEV) {
    return null // Скрываем в продакшене
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Управление вопросами (DEV)
        </CardTitle>
        <CardDescription>
          Загрузка дополнительных вопросов для разработки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Статистика источников */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Источники данных:</h4>
          <div className="flex flex-wrap gap-2">
            {sourceStats.map((stat, index) => (
              <Badge key={index} variant="outline">
                {stat.type}: {stat.count} (приоритет: {stat.priority})
              </Badge>
            ))}
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Загрузить JSON
          </Button>

          <Button
            variant="outline"
            onClick={handleFolderUpload}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Загрузить папку
          </Button>

          <Button
            variant="outline"
            onClick={createTemplate}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Создать шаблон
          </Button>

          <Button
            variant="outline"
            onClick={exportAllQuestions}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Экспортировать все
          </Button>
        </div>

        {/* Очистка */}
        <div className="pt-2 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={clearLocalSources}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Очистить локальные источники
          </Button>
        </div>

        {/* Скрытый input для загрузки файлов */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Информация */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <p><strong>Форматы JSON:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Массив вопросов: <code>[{"{id, title, category, difficulty, bucket, prompt, answer}"}]</code></li>
            <li>Объект с questions: <code>{"{questions: [...]}"}</code></li>
            <li>Простой формат: <code>[{"{id, level, category, question, answer}"}]</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
