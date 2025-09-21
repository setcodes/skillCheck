import type { TheoryQuestion } from '@/entities/question/model/types'

// Валидация вопроса
export function validateQuestion(question: any): question is TheoryQuestion {
  return (
    question &&
    typeof question.id === 'string' &&
    typeof question.title === 'string' &&
    typeof question.category === 'string' &&
    typeof question.prompt === 'string' &&
    typeof question.answer === 'string' &&
    typeof question.difficulty === 'number' &&
    ['screening', 'deep', 'architecture'].includes(question.bucket)
  )
}

// Нормализация вопроса из различных форматов
export function normalizeQuestion(raw: any): TheoryQuestion {
  const id = String(raw?.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2))
  const title = String(raw?.title ?? raw?.question ?? 'Без названия')
  const prompt = String(raw?.prompt ?? raw?.question ?? '')
  const answer = String(raw?.answer ?? '')
  const category = String(raw?.category ?? 'General')
  
  const difficulty = Number.isFinite(raw?.difficulty) 
    ? Number(raw.difficulty) 
    : (() => {
        const level = String(raw?.level || '').toLowerCase()
        if (level === 'junior') return 1
        if (level === 'middle' || level === 'mid') return 2
        if (level === 'senior') return 3
        return 2
      })()

  const bucket: 'screening' | 'deep' | 'architecture' = (() => {
    const b = String(raw?.bucket || '').toLowerCase()
    if (['screening', 'deep', 'architecture'].includes(b)) return b as any
    return 'screening'
  })()

  return { id, title, category, difficulty, bucket, prompt, answer }
}

// Нормализация массива вопросов
export function normalizeQuestions(rawQuestions: any[]): TheoryQuestion[] {
  return rawQuestions
    .map(normalizeQuestion)
    .filter(validateQuestion)
}

// Генерация ID для нового вопроса
export function generateQuestionId(profession: string, prefix?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const prof = profession.replace('-', '_')
  return `${prof}_${prefix || 'q'}_${timestamp}_${random}`
}

// Создание шаблона вопроса
export function createQuestionTemplate(
  profession: string, 
  overrides: Partial<TheoryQuestion> = {}
): TheoryQuestion {
  return {
    id: generateQuestionId(profession),
    title: 'Новый вопрос',
    category: 'General',
    difficulty: 1,
    bucket: 'screening',
    prompt: 'Введите текст вопроса здесь...',
    answer: 'Введите ответ здесь...',
    ...overrides
  }
}

// Валидация массива вопросов
export function validateQuestions(questions: any[]): {
  valid: TheoryQuestion[]
  invalid: Array<{ index: number; error: string; data: any }>
} {
  const valid: TheoryQuestion[] = []
  const invalid: Array<{ index: number; error: string; data: any }> = []

  questions.forEach((question, index) => {
    try {
      const normalized = normalizeQuestion(question)
      if (validateQuestion(normalized)) {
        valid.push(normalized)
      } else {
        invalid.push({
          index,
          error: 'Невалидная структура вопроса',
          data: question
        })
      }
    } catch (error) {
      invalid.push({
        index,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        data: question
      })
    }
  })

  return { valid, invalid }
}

// Экспорт вопросов в различные форматы
export function exportQuestions(
  questions: TheoryQuestion[], 
  format: 'json' | 'csv' | 'markdown' = 'json',
  profession?: string
): string {
  switch (format) {
    case 'json':
      return JSON.stringify({
        profession,
        questions,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }, null, 2)
    
    case 'csv':
      const headers = ['id', 'title', 'category', 'difficulty', 'bucket', 'prompt', 'answer']
      const csvRows = [
        headers.join(','),
        ...questions.map(q => 
          headers.map(header => {
            const value = q[header as keyof TheoryQuestion] || ''
            // Экранируем кавычки и запятые
            return `"${String(value).replace(/"/g, '""')}"`
          }).join(',')
        )
      ]
      return csvRows.join('\n')
    
    case 'markdown':
      return questions.map(q => 
        `## ${q.title}\n\n**Категория:** ${q.category}  \n**Уровень:** ${q.difficulty}  \n**Тип:** ${q.bucket}\n\n**Вопрос:**\n${q.prompt}\n\n**Ответ:**\n${q.answer}\n\n---\n`
      ).join('\n')
    
    default:
      throw new Error(`Неподдерживаемый формат: ${format}`)
  }
}

// Импорт вопросов из различных форматов
export function importQuestions(
  content: string, 
  format: 'json' | 'csv' | 'markdown' = 'json'
): TheoryQuestion[] {
  switch (format) {
    case 'json':
      const data = JSON.parse(content)
      const questions = Array.isArray(data) ? data : (data.questions || [])
      return normalizeQuestions(questions)
    
    case 'csv':
      const lines = content.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      const rows = lines.slice(1)
      
      return rows.map(row => {
        const values = row.split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'))
        const question: any = {}
        headers.forEach((header, index) => {
          question[header] = values[index] || ''
        })
        return normalizeQuestion(question)
      })
    
    case 'markdown':
      // Простой парсер для Markdown формата
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
        
        return normalizeQuestion({
          title,
          category,
          difficulty,
          bucket,
          prompt,
          answer
        })
      })
    
    default:
      throw new Error(`Неподдерживаемый формат: ${format}`)
  }
}

// Группировка вопросов по категориям
export function groupQuestionsByCategory(questions: TheoryQuestion[]): Record<string, TheoryQuestion[]> {
  return questions.reduce((groups, question) => {
    const category = question.category || 'General'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(question)
    return groups
  }, {} as Record<string, TheoryQuestion[]>)
}

// Группировка вопросов по уровню сложности
export function groupQuestionsByDifficulty(questions: TheoryQuestion[]): Record<number, TheoryQuestion[]> {
  return questions.reduce((groups, question) => {
    const difficulty = question.difficulty || 1
    if (!groups[difficulty]) {
      groups[difficulty] = []
    }
    groups[difficulty].push(question)
    return groups
  }, {} as Record<number, TheoryQuestion[]>)
}

// Поиск вопросов
export function searchQuestions(
  questions: TheoryQuestion[], 
  query: string
): TheoryQuestion[] {
  if (!query.trim()) return questions
  
  const searchTerm = query.toLowerCase()
  return questions.filter(question => 
    question.title.toLowerCase().includes(searchTerm) ||
    question.prompt.toLowerCase().includes(searchTerm) ||
    question.answer.toLowerCase().includes(searchTerm) ||
    question.category.toLowerCase().includes(searchTerm)
  )
}
