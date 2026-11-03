import { useSyncExternalStore } from 'react'
import type { Profession } from '@/entities/profession/model/types'
import type { QuizItem } from '@/entities/quiz/model/types'
import FRONTEND_QUIZ from '@/shared/quiz/frontend.json'
import { QuizSchema } from './quiz-schema'

const BUILTIN: Partial<Record<Profession, QuizItem[]>> = {
  frontend: QuizSchema.array().parse(FRONTEND_QUIZ),
}
const EMPTY: QuizItem[] = []

export const getQuiz = (prof: Profession): QuizItem[] => BUILTIN[prof] ?? EMPTY

export const useQuiz = (prof: Profession) =>
  useSyncExternalStore(
    () => () => {},
    () => getQuiz(prof)
  )
