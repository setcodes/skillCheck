import { useCallback } from 'react'
import { useQuestionStore } from '@/shared/stores/question-store'
import { normalizeQuestions, validateQuestions, exportQuestions } from '@/shared/utils/question-utils'
import type { TheoryQuestion } from '@/entities/question/model/types'
import type { Profession } from '@/entities/profession/model/types'

export function useLocalQuestions(profession: Profession) {
  const { addSource, removeSource, setLoading, setError } = useQuestionStore()

  // Загрузка вопросов из файлов
  const loadQuestionsFromFiles = useCallback(async (files: File[]) => {
    setLoading(profession, true)
    setError(profession, null)

    try {
      const allQuestions: TheoryQuestion[] = []
      const errors: string[] = []

      for (const file of files) {
        try {
          const content = await file.text()
          let questions: TheoryQuestion[] = []

          // Определяем формат по расширению файла
          if (file.name.endsWith('.json')) {
            const data = JSON.parse(content)
            questions = normalizeQuestions(Array.isArray(data) ? data : (data.questions || []))
          } else if (file.name.endsWith('.csv')) {
            questions = normalizeQuestions(parseCSV(content))
          } else if (file.name.endsWith('.md')) {
            questions = normalizeQuestions(parseMarkdown(content))
          } else {
            errors.push(`Неподдерживаемый формат файла: ${file.name}`)
            continue
          }

          // Валидируем вопросы
          const { valid, invalid } = validateQuestions(questions)
          allQuestions.push(...valid)

          if (invalid.length > 0) {
            errors.push(`В файле ${file.name} найдено ${invalid.length} невалидных вопросов`)
          }
        } catch (error) {
          errors.push(`Ошибка обработки файла ${file.name}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
        }
      }

      if (allQuestions.length > 0) {
        // Добавляем как локальный источник
        addSource(profession, {
          id: `local_${Date.now()}`,
          type: 'local',
          priority: 2, // Выше базовых JSON, но ниже пользовательских изменений
          data: allQuestions,
          metadata: {
            file: files.map(f => f.name).join(', '),
            lastModified: Date.now(),
            description: `Загружено из ${files.length} файлов`
          }
        })
      }

      if (errors.length > 0) {
        setError(profession, errors.join('; '))
      }
    } catch (error) {
      setError(profession, error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setLoading(profession, false)
    }
  }, [profession, addSource, setLoading, setError])

  // Загрузка вопросов из папки (File System Access API)
  const loadQuestionsFromDirectory = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) {
      setError(profession, 'File System Access API не поддерживается в этом браузере')
      return
    }

    setLoading(profession, true)
    setError(profession, null)

    try {
      const directoryHandle = await (window as any).showDirectoryPicker()
      const questions: TheoryQuestion[] = []
      const errors: string[] = []

      await processDirectory(directoryHandle, questions, errors)

      if (questions.length > 0) {
        addSource(profession, {
          id: `local_dir_${Date.now()}`,
          type: 'local',
          priority: 2,
          data: questions,
          metadata: {
            file: directoryHandle.name,
            lastModified: Date.now(),
            description: `Загружено из папки ${directoryHandle.name}`
          }
        })
      }

      if (errors.length > 0) {
        setError(profession, errors.join('; '))
      }
    } catch (error) {
      if ((error as any)?.name !== 'AbortError') {
        setError(profession, error instanceof Error ? error.message : 'Неизвестная ошибка')
      }
    } finally {
      setLoading(profession, false)
    }
  }, [profession, addSource, setLoading, setError])

  // Экспорт вопросов
  const exportQuestionsToFile = useCallback((
    questions: TheoryQuestion[], 
    format: 'json' | 'csv' | 'markdown' = 'json',
    filename?: string
  ) => {
    try {
      const content = exportQuestions(questions, format, profession)
      const blob = new Blob([content], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || `questions-${profession}-${Date.now()}.${format}`
      a.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      setError(profession, error instanceof Error ? error.message : 'Ошибка экспорта')
    }
  }, [profession, setError])

  // Удаление локальных источников
  const clearLocalSources = useCallback(() => {
    const sources = useQuestionStore.getState().sources[profession] || []
    const localSources = sources.filter(source => source.type === 'local')
    
    localSources.forEach(source => {
      removeSource(profession, source.id)
    })
  }, [profession, removeSource])

  return {
    loadQuestionsFromFiles,
    loadQuestionsFromDirectory,
    exportQuestionsToFile,
    clearLocalSources
  }
}

// Вспомогательные функции для парсинга

function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
  const rows = lines.slice(1)
  
  return rows.map(row => {
    const values = row.split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'))
    const question: any = {}
    headers.forEach((header, index) => {
      question[header] = values[index] || ''
    })
    return question
  })
}

function parseMarkdown(content: string): any[] {
  const sections = content.split('## ').filter(section => section.trim())
  
  return sections.map(section => {
    const lines = section.split('\n').filter(line => line.trim())
    const title = lines[0] || 'Без названия'
    
    let category = 'General'
    let difficulty = 1
    let bucket: 'screening' | 'deep' | 'architecture' = 'screening'
    let prompt = ''
    let answer = ''
    
    let currentSection = ''
    for (const line of lines.slice(1)) {
      if (line.startsWith('**Категория:**')) {
        category = line.replace('**Категория:**', '').trim()
      } else if (line.startsWith('**Уровень:**')) {
        difficulty = parseInt(line.replace('**Уровень:**', '').trim()) || 1
      } else if (line.startsWith('**Тип:**')) {
        const bucketValue = line.replace('**Тип:**', '').trim()
        if (['screening', 'deep', 'architecture'].includes(bucketValue)) {
          bucket = bucketValue as any
        }
      } else if (line.startsWith('**Вопрос:**')) {
        currentSection = 'prompt'
      } else if (line.startsWith('**Ответ:**')) {
        currentSection = 'answer'
      } else if (line.trim() && currentSection) {
        if (currentSection === 'prompt') {
          prompt += (prompt ? '\n' : '') + line
        } else if (currentSection === 'answer') {
          answer += (answer ? '\n' : '') + line
        }
      }
    }
    
    return {
      title,
      category,
      difficulty,
      bucket,
      prompt,
      answer
    }
  })
}

async function processDirectory(
  directoryHandle: any, 
  questions: TheoryQuestion[], 
  errors: string[],
  path = ''
): Promise<void> {
  for await (const [name, handle] of directoryHandle.entries()) {
    const currentPath = path ? `${path}/${name}` : name

    if (handle.kind === 'file') {
      if (name.endsWith('.json') || name.endsWith('.csv') || name.endsWith('.md')) {
        try {
          const file = await handle.getFile()
          const content = await file.text()
          let fileQuestions: TheoryQuestion[] = []

          if (name.endsWith('.json')) {
            const data = JSON.parse(content)
            fileQuestions = normalizeQuestions(Array.isArray(data) ? data : (data.questions || []))
          } else if (name.endsWith('.csv')) {
            fileQuestions = normalizeQuestions(parseCSV(content))
          } else if (name.endsWith('.md')) {
            fileQuestions = normalizeQuestions(parseMarkdown(content))
          }

          questions.push(...fileQuestions)
        } catch (error) {
          errors.push(`Ошибка обработки файла ${currentPath}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
        }
      }
    } else if (handle.kind === 'directory') {
      await processDirectory(handle, questions, errors, currentPath)
    }
  }
}
