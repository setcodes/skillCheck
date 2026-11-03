import type { Question } from './types'

/** Текст ответа для простых мест вывода (мок-интервью, экспорт): полный, если есть, иначе короткий. */
export const answerText = (q: Pick<Question, 'answer'>) => q.answer.full ?? q.answer.short
