import { describe, it, expect, beforeEach, vi } from 'vitest'

class MemoryStorage {
  private m = new Map<string, string>()
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null }
  setItem(k: string, v: string) { this.m.set(k, String(v)) }
  removeItem(k: string) { this.m.delete(k) }
  clear() { this.m.clear() }
}

const q = (id: string, extra: Record<string, unknown> = {}) => ({
  id, version: 1, title: `T ${id}`, prompt: `P ${id}`, level: 'junior', kind: 'screening', topic: 'js-core',
  tags: [], answer: { short: `A ${id}`, mustMention: [], commonMistakes: [], redFlags: [] },
  followUps: [], sources: [], reviewedAt: null, ...extra,
})

async function load() {
  vi.resetModules()
  return import('@/shared/bank')
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage())
})

describe('банк: встроенные данные и overlay', () => {
  it('без пользовательских данных отдаёт встроенный банк, ссылки устойчивы', async () => {
    const bank = await load()
    const a = bank.getTasks('frontend')
    expect(a.length).toBeGreaterThan(0)
    expect(bank.getTasks('frontend')).toBe(a)
    expect(bank.getQuestions('frontend')).toBe(bank.getQuestions('frontend'))
  })

  it('замороженная профессия отдаёт пустой банк', async () => {
    const bank = await load()
    expect(bank.getQuestions('devops')).toEqual([])
    expect(bank.getTasks('analyst')).toEqual([])
  })

  it('импорт добавляет новое и заменяет по id, остальной банк сохраняется', async () => {
    const bank = await load()
    const before = bank.getQuestions('frontend')
    const existing = before[0]
    const r = bank.importBank('frontend', [q('custom-1'), { ...existing, answer: { ...existing.answer, short: 'Новый ответ' } }])
    expect(r.questions).toEqual({ added: 1, updated: 1, rejected: 0 })
    const after = bank.getQuestions('frontend')
    expect(after).not.toBe(before)
    expect(after).toHaveLength(before.length + 1)
    expect(after.find((x) => x.id === existing.id)?.answer.short).toBe('Новый ответ')
  })

  it('принимает простой формат { id, level, category, question, answer }', async () => {
    const bank = await load()
    const r = bank.importBank('frontend', [
      { id: 's1', level: 'senior', category: 'JS', question: 'Что такое event loop?', answer: 'Очередь задач' },
    ])
    expect(r.questions.added).toBe(1)
    const s = bank.getQuestions('frontend').find((x) => x.id === 's1')!
    expect(s).toMatchObject({ level: 'senior', prompt: 'Что такое event loop?', kind: 'screening', topic: 'general' })
    expect(s.answer.short).toBe('Очередь задач')
  })

  it('невалидные записи отклоняются с сообщением', async () => {
    const bank = await load()
    const r = bank.importBank('frontend', [q('ok-1'), { id: 'bad', answer: '' }])
    expect(r.questions.added).toBe(1)
    expect(r.questions.rejected).toBe(1)
    expect(r.errors[0]).toMatch(/Вопрос #2/)
  })

  it('мусорный JSON ничего не меняет', async () => {
    const bank = await load()
    const before = bank.getQuestions('frontend')
    expect(bank.importBank('frontend', 42).errors).toHaveLength(1)
    expect(bank.getQuestions('frontend')).toBe(before)
  })

  it('сброс возвращает встроенный банк', async () => {
    const bank = await load()
    const base = bank.getQuestions('frontend').length
    bank.importBank('frontend', [q('custom-2')])
    bank.resetBank('frontend')
    expect(bank.getQuestions('frontend')).toHaveLength(base)
  })

  it('правки переживают «обновление приложения» (перезагрузку модулей)', async () => {
    let bank = await load()
    bank.importBank('frontend', [q('custom-3')])
    bank = await load()
    expect(bank.getQuestions('frontend').some((x) => x.id === 'custom-3')).toBe(true)
  })

  it('подписчики получают уведомление об изменении', async () => {
    const bank = await load()
    const fn = vi.fn()
    bank.subscribeBank(fn)
    bank.importBank('frontend', [q('custom-4')])
    expect(fn).toHaveBeenCalledOnce()
  })
})

describe('миграция старого формата bank:<prof>:*', () => {
  it('в overlay попадает только правка пользователя; старые копии встроенных не затеняют банк', async () => {
    const first = await load()
    const builtin = first.getQuestions('frontend')
    const legacy = (b: (typeof builtin)[number]) => ({
      id: b.aliases![0], title: b.title, category: 'JavaScript', difficulty: 2, bucket: 'screening',
      prompt: b.prompt, answer: b.answer.short,
    })
    const edited = { ...legacy(builtin[0]), answer: 'правка пользователя' }
    const custom = { id: 'legacy-custom', title: 'Свой', category: 'React', difficulty: 3, bucket: 'deep', prompt: 'P', answer: 'A' }
    localStorage.setItem(
      'bank:frontend:questions',
      JSON.stringify([edited, ...builtin.slice(1).map(legacy), custom])
    )
    const bank = await load()
    const merged = bank.getQuestions('frontend')
    expect(merged.find((x) => x.id === builtin[0].id)?.answer.short).toBe('правка пользователя')
    expect(merged.find((x) => x.id === 'legacy-custom')).toMatchObject({ level: 'senior', topic: 'react' })
    expect(localStorage.getItem('bank:frontend:questions')).toBeNull()
    const overrides = JSON.parse(localStorage.getItem('bank:v2:frontend')!)
    expect(Object.keys(overrides.questions).sort()).toEqual([builtin[0].id, 'legacy-custom'].sort())
  })

  it('overlay, записанный в прежней схеме, приводится к новой и переносится на новые id', async () => {
    const first = await load()
    const target = first.getQuestions('frontend')[3]
    localStorage.setItem(
      'bank:v2:frontend',
      JSON.stringify({
        v: 1,
        questions: {
          [target.aliases![0]]: { id: target.aliases![0], title: 'T', category: 'CSS', difficulty: 1, bucket: 'screening', prompt: 'P', answer: 'Старая правка' },
        },
        tasks: {},
      })
    )
    const bank = await load()
    expect(bank.getQuestions('frontend').find((x) => x.id === target.id)?.answer.short).toBe('Старая правка')
  })
})

describe('миграция сохранённых id', () => {
  it('черновики оценок, мост оценок и мок-сессия переезжают на новые id', async () => {
    const bank = await load()
    const q0 = bank.getQuestions('frontend')[0]
    const old = q0.aliases![0]
    localStorage.setItem('theory.drafts.v1.frontend', JSON.stringify({ [old]: { score: 4 } }))
    localStorage.setItem(
      'bridge.theoryScores.v1',
      JSON.stringify({ [`frontend:${old}`]: { prof: 'frontend', questionId: old, score: 4 } })
    )
    localStorage.setItem('mock.session.v1', JSON.stringify({ items: [{ type: 'theory', questionId: old }, { type: 'task', taskId: 't' }] }))
    bank.runMigrations('frontend')
    expect(JSON.parse(localStorage.getItem('theory.drafts.v1.frontend')!)).toEqual({ [q0.id]: { score: 4 } })
    expect(Object.keys(JSON.parse(localStorage.getItem('bridge.theoryScores.v1')!))).toEqual([`frontend:${q0.id}`])
    expect(JSON.parse(localStorage.getItem('mock.session.v1')!).items[0].questionId).toBe(q0.id)
    // повторный запуск ничего не ломает
    bank.runMigrations('frontend')
    expect(JSON.parse(localStorage.getItem('theory.drafts.v1.frontend')!)).toEqual({ [q0.id]: { score: 4 } })
  })

  it('canonicalQuestionId знает прежние id', async () => {
    const bank = await load()
    const q0 = bank.getQuestions('frontend')[0]
    expect(bank.canonicalQuestionId('frontend', q0.aliases![0])).toBe(q0.id)
    expect(bank.canonicalQuestionId('frontend', 'unknown')).toBe('unknown')
  })
})
