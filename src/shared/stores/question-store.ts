import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { TheoryQuestion } from '@/entities/question/model/types'
import type { Profession } from '@/entities/profession/model/types'

// Типы для источников вопросов
export interface QuestionSource {
  id: string
  type: 'json' | 'markdown' | 'local' | 'pr' | 'user'
  priority: number // 1 = высший приоритет
  data: TheoryQuestion[]
  metadata?: {
    file?: string
    lastModified?: number
    contributor?: string
    description?: string
  }
}

// Состояние store
interface QuestionState {
  // Источники вопросов по профессиям
  sources: Record<Profession, QuestionSource[]>
  
  // Кэш объединенных вопросов
  cache: Record<Profession, TheoryQuestion[]>
  
  // Флаги загрузки
  loading: Record<Profession, boolean>
  
  // Ошибки
  errors: Record<Profession, string | null>
}

// Действия
interface QuestionActions {
  // Добавить источник вопросов
  addSource: (profession: Profession, source: QuestionSource) => void
  
  // Удалить источник
  removeSource: (profession: Profession, sourceId: string) => void
  
  // Обновить источник
  updateSource: (profession: Profession, sourceId: string, updates: Partial<QuestionSource>) => void
  
  // Получить все вопросы для профессии
  getQuestions: (profession: Profession) => TheoryQuestion[]
  
  // Очистить кэш
  clearCache: (profession?: Profession) => void
  
  // Установить флаг загрузки
  setLoading: (profession: Profession, loading: boolean) => void
  
  // Установить ошибку
  setError: (profession: Profession, error: string | null) => void
  
  // Сбросить все источники для профессии
  resetSources: (profession: Profession) => void
  
  // Получить статистику
  getStats: (profession: Profession) => {
    totalQuestions: number
    sources: Array<{ type: string; count: number; priority: number }>
  }
}

// Объединенный тип
type QuestionStore = QuestionState & QuestionActions

// Функция для объединения вопросов из источников
function mergeQuestions(sources: QuestionSource[]): TheoryQuestion[] {
  const questionMap = new Map<string, TheoryQuestion>()
  
  // Сортируем источники по приоритету (1 = высший)
  const sortedSources = [...sources].sort((a, b) => a.priority - b.priority)
  
  // Объединяем вопросы из всех источников
  for (const source of sortedSources) {
    for (const question of source.data) {
      // Вопросы с более высоким приоритетом перезаписывают существующие
      questionMap.set(question.id, question)
    }
  }
  
  return Array.from(questionMap.values())
    .sort((a, b) => {
      const diff = (a.difficulty || 0) - (b.difficulty || 0)
      if (diff !== 0) return diff
      return String(a.title || '').localeCompare(String(b.title || ''))
    })
}

// Создаем store
export const useQuestionStore = create<QuestionStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Начальное состояние
        sources: {
          'frontend': [],
          'backend-java': [],
          'analyst': [],
          'devops': []
        },
        cache: {
          'frontend': [],
          'backend-java': [],
          'analyst': [],
          'devops': []
        },
        loading: {
          'frontend': false,
          'backend-java': false,
          'analyst': false,
          'devops': false
        },
        errors: {
          'frontend': null,
          'backend-java': null,
          'analyst': null,
          'devops': null
        },

        // Действия
        addSource: (profession, source) => {
          set((state) => {
            const currentSources = state.sources[profession] || []
            const existingIndex = currentSources.findIndex(s => s.id === source.id)
            
            let newSources: QuestionSource[]
            if (existingIndex >= 0) {
              // Обновляем существующий источник
              newSources = [...currentSources]
              newSources[existingIndex] = source
            } else {
              // Добавляем новый источник
              newSources = [...currentSources, source]
            }
            
            // Сортируем по приоритету
            newSources.sort((a, b) => a.priority - b.priority)
            
            // Обновляем кэш
            const mergedQuestions = mergeQuestions(newSources)
            
            return {
              sources: {
                ...state.sources,
                [profession]: newSources
              },
              cache: {
                ...state.cache,
                [profession]: mergedQuestions
              }
            }
          })
        },

        removeSource: (profession, sourceId) => {
          set((state) => {
            const currentSources = state.sources[profession] || []
            const newSources = currentSources.filter(s => s.id !== sourceId)
            const mergedQuestions = mergeQuestions(newSources)
            
            return {
              sources: {
                ...state.sources,
                [profession]: newSources
              },
              cache: {
                ...state.cache,
                [profession]: mergedQuestions
              }
            }
          })
        },

        updateSource: (profession, sourceId, updates) => {
          set((state) => {
            const currentSources = state.sources[profession] || []
            const newSources = currentSources.map(source => 
              source.id === sourceId 
                ? { ...source, ...updates }
                : source
            )
            const mergedQuestions = mergeQuestions(newSources)
            
            return {
              sources: {
                ...state.sources,
                [profession]: newSources
              },
              cache: {
                ...state.cache,
                [profession]: mergedQuestions
              }
            }
          })
        },

        getQuestions: (profession) => {
          const state = get()
          return state.cache[profession] || []
        },

        clearCache: (profession) => {
          set((state) => {
            if (profession) {
              return {
                cache: {
                  ...state.cache,
                  [profession]: []
                }
              }
            } else {
              return {
                cache: {
                  'frontend': [],
                  'backend-java': [],
                  'analyst': [],
                  'devops': []
                }
              }
            }
          })
        },

        setLoading: (profession, loading) => {
          set((state) => ({
            loading: {
              ...state.loading,
              [profession]: loading
            }
          }))
        },

        setError: (profession, error) => {
          set((state) => ({
            errors: {
              ...state.errors,
              [profession]: error
            }
          }))
        },

        resetSources: (profession) => {
          set((state) => ({
            sources: {
              ...state.sources,
              [profession]: []
            },
            cache: {
              ...state.cache,
              [profession]: []
            }
          }))
        },

        getStats: (profession) => {
          const state = get()
          const sources = state.sources[profession] || []
          const totalQuestions = state.cache[profession]?.length || 0
          
          return {
            totalQuestions,
            sources: sources.map(source => ({
              type: source.type,
              count: source.data.length,
              priority: source.priority
            }))
          }
        }
      }),
      {
        name: 'question-store',
        // Сохраняем только источники, кэш пересчитывается
        partialize: (state) => ({
          sources: state.sources
        })
      }
    ),
    {
      name: 'question-store'
    }
  )
)

// Селекторы для удобства
export const useQuestions = (profession: Profession) => 
  useQuestionStore(state => state.getQuestions(profession))

export const useQuestionSources = (profession: Profession) => 
  useQuestionStore(state => state.sources[profession] || [])

export const useQuestionLoading = (profession: Profession) => 
  useQuestionStore(state => state.loading[profession])

export const useQuestionError = (profession: Profession) => 
  useQuestionStore(state => state.errors[profession])

export const useQuestionStats = (profession: Profession) => 
  useQuestionStore(state => state.getStats(profession))
