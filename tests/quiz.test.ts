import { describe, it, expect } from 'vitest'
import vm from 'node:vm'
import raw from '@/shared/quiz/frontend.json'
import { QuizSchema } from '@/shared/bank/quiz-schema'
import { getQuiz } from '@/shared/bank/quiz'

const items = getQuiz('frontend')

async function execute(code: string): Promise<string[]> {
  const out: string[] = []
  const ctx = vm.createContext({
    console: { log: (...a: unknown[]) => out.push(a.map(String).join(' ')) },
    setTimeout,
    queueMicrotask,
  })
  vm.runInContext(code, ctx)
  await new Promise((r) => setTimeout(r, 60)) // дать отработать таймерам
  return out
}

describe('задачи на предсказание вывода', () => {
  it('все проходят схему, id уникальны', () => {
    expect(() => QuizSchema.array().parse(raw)).not.toThrow()
    expect(new Set(items.map((q) => q.id)).size).toBe(items.length)
    expect(items.length).toBeGreaterThanOrEqual(12)
  })

  it('правильный вариант — настоящий вывод кода (проверка запуском)', async () => {
    for (const q of items) {
      const actual = await execute(q.code)
      expect(actual, q.id).toEqual(q.output)
      expect(q.options[q.correct], q.id).toBe(actual.join('\n'))
    }
  })

  it('неверные варианты действительно отличаются от настоящего вывода', () => {
    for (const q of items) {
      const wrong = q.options.filter((_, i) => i !== q.correct)
      expect(wrong.length, q.id).toBeGreaterThanOrEqual(2)
      for (const w of wrong) expect(w, q.id).not.toBe(q.output.join('\n'))
    }
  })

  it('правильный ответ не всегда на одной позиции', () => {
    expect(new Set(items.map((q) => q.correct)).size).toBeGreaterThan(1)
  })

  it('у каждой есть разбор и список «что проверяют»', () => {
    for (const q of items) {
      expect(q.explanation.length, q.id).toBeGreaterThan(80)
      expect(q.pitfalls.length, q.id).toBeGreaterThan(0)
    }
  })
})
