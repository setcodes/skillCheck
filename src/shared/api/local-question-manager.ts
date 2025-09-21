import type { TheoryQuestion } from '@/entities/question/model/types'
import type { Profession } from '@/entities/profession/model/types'
import { questionStore, normalizeQuestion, validateQuestion } from './question-store'

// Локальный менеджер для разработки
export class LocalQuestionManager {
  private fileWatchers: Map<string, FileSystemFileHandle> = new Map()
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = (import.meta as any)?.env?.DEV || false
  }

  // Загрузить дополнительные JSON файлы
  async loadAdditionalQuestions(profession: Profession, files: File[]): Promise<void> {
    if (!this.isDevelopment) {
      console.warn('LocalQuestionManager работает только в режиме разработки')
      return
    }

    for (const file of files) {
      try {
        const content = await file.text()
        const data = JSON.parse(content)
        
        // Поддерживаем разные форматы
        const questions = Array.isArray(data) ? data : (data.questions || [])
        const normalizedQuestions = questions
          .map(normalizeQuestion)
          .filter(validateQuestion)

        if (normalizedQuestions.length > 0) {
          questionStore.addSource(profession, {
            type: 'local',
            priority: 2, // Выше базовых JSON, но ниже LocalStorage
            data: normalizedQuestions,
            metadata: {
              file: file.name,
              lastModified: file.lastModified
            }
          })

          console.log(`Загружено ${normalizedQuestions.length} вопросов из ${file.name}`)
        }
      } catch (error) {
        console.error(`Ошибка загрузки файла ${file.name}:`, error)
      }
    }
  }

  // Загрузить вопросы из папки (File System Access API)
  async loadQuestionsFromDirectory(profession: Profession): Promise<void> {
    if (!this.isDevelopment) {
      console.warn('LocalQuestionManager работает только в режиме разработки')
      return
    }

    try {
      // Проверяем поддержку File System Access API
      if (!('showDirectoryPicker' in window)) {
        console.warn('File System Access API не поддерживается в этом браузере')
        return
      }

      const directoryHandle = await (window as any).showDirectoryPicker()
      const questions: TheoryQuestion[] = []

      // Рекурсивно обходим папку
      await this.processDirectory(directoryHandle, questions)

      if (questions.length > 0) {
        questionStore.addSource(profession, {
          type: 'local',
          priority: 2,
          data: questions,
          metadata: {
            file: directoryHandle.name,
            lastModified: Date.now()
          }
        })

        console.log(`Загружено ${questions.length} вопросов из папки ${directoryHandle.name}`)
      }
    } catch (error) {
      if ((error as any)?.name !== 'AbortError') {
        console.error('Ошибка загрузки папки:', error)
      }
    }
  }

  private async processDirectory(
    directoryHandle: any, 
    questions: TheoryQuestion[], 
    path = ''
  ): Promise<void> {
    for await (const [name, handle] of directoryHandle.entries()) {
      const currentPath = path ? `${path}/${name}` : name

      if (handle.kind === 'file' && name.endsWith('.json')) {
        try {
          const file = await handle.getFile()
          const content = await file.text()
          const data = JSON.parse(content)
          
          const fileQuestions = Array.isArray(data) ? data : (data.questions || [])
          const normalizedQuestions = fileQuestions
            .map(normalizeQuestion)
            .filter(validateQuestion)

          questions.push(...normalizedQuestions)
        } catch (error) {
          console.error(`Ошибка обработки файла ${currentPath}:`, error)
        }
      } else if (handle.kind === 'directory') {
        await this.processDirectory(handle, questions, currentPath)
      }
    }
  }

  // Создать шаблон для новых вопросов
  generateQuestionTemplate(profession: Profession, count: number = 1): TheoryQuestion[] {
    const templates: TheoryQuestion[] = []
    
    for (let i = 0; i < count; i++) {
      templates.push({
        id: `${profession}_template_${Date.now()}_${i}`,
        title: `Новый вопрос ${i + 1}`,
        category: 'General',
        difficulty: 1,
        bucket: 'screening',
        prompt: 'Введите текст вопроса здесь...',
        answer: 'Введите ответ здесь...'
      })
    }

    return templates
  }

  // Экспортировать вопросы в файл
  exportQuestions(profession: Profession, questions: TheoryQuestion[], filename?: string): void {
    const data = {
      profession,
      questions,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `questions-${profession}-${Date.now()}.json`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  // Очистить локальные источники
  clearLocalSources(profession: Profession): void {
    const sources = questionStore['sources'].get(profession) || []
    const filteredSources = sources.filter(source => source.type !== 'local')
    questionStore['sources'].set(profession, filteredSources)
    questionStore.clearCache(profession)
  }
}

// Глобальный экземпляр
export const localQuestionManager = new LocalQuestionManager()
