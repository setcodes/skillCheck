import { useSyncExternalStore } from 'react'
import type { Profession } from '@/entities/profession/model/types'
import { exportBank, getQuestions, getTasks, subscribeBank } from './repository'

// Ссылки стабильны, пока банк не менялся — их безопасно класть в зависимости эффектов.
export const useQuestions = (prof: Profession) =>
  useSyncExternalStore(subscribeBank, () => getQuestions(prof))

export const useTasks = (prof: Profession) =>
  useSyncExternalStore(subscribeBank, () => getTasks(prof))

/** Свои правки поверх встроенного банка — то, что уйдёт в файл экспорта. */
export const useOwnChanges = (prof: Profession) =>
  useSyncExternalStore(subscribeBank, () => exportBank(prof))
