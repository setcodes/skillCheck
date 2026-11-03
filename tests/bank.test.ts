import { describe, it, expect, beforeEach, vi } from 'vitest'

class MemoryStorage {
  private m = new Map<string, string>()
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null }
  setItem(k: string, v: string) { this.m.set(k, String(v)) }
  removeItem(k: string) { this.m.delete(k) }
  clear() { this.m.clear() }
}

const q = (id: string, extra: Record<string, unknown> = {}) => ({
  id, title: `T ${id}`, category: 'JS', difficulty: 1, bucket: 'screening',
  prompt: `P ${id}`, answer: `A ${id}`, ...extra,
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
    const r = bank.importBank('frontend', [q('custom-1'), { ...existing, answer: 'Новый ответ' }])
    expect(r.questions).toEqual({ added: 1, updated: 1, rejected: 0 })
    const after = bank.getQuestions('frontend')
    expect(after).not.toBe(before)
    expect(after).toHaveLength(before.length + 1)
    expect(after.find((x) => x.id === existing.id)?.answer).toBe('Новый ответ')
  })

  it('принимает простой формат { id, level, category, question, answer }', async () => {
    const bank = await load()
    const r = bank.importBank('frontend', [
      { id: 's1', level: 'senior', category: 'JS', question: 'Что такое event loop?', answer: 'Очередь задач' },
    ])
    expect(r.questions.added).toBe(1)
    const s = bank.getQuestions('frontend').find((x) => x.id === 's1')!
    expect(s).toMatchObject({ difficulty: 3, prompt: 'Что такое event loop?', bucket: 'screening' })
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
  it('в overlay попадает только отличающееся от встроенного; встроенные обновления не затеняются', async () => {
    const first = await load()
    const builtin = first.getQuestions('frontend')
    const stale = { ...builtin[0], answer: 'устаревший ответ из старой копии' }
    const custom = q('legacy-custom')
    localStorage.setItem('bank:frontend:questions', JSON.stringify([...builtin.slice(1), stale, custom]))
    const bank = await load()
    const merged = bank.getQuestions('frontend')
    expect(merged.some((x) => x.id === 'legacy-custom')).toBe(true)
    expect(localStorage.getItem('bank:frontend:questions')).toBeNull()
    const overrides = JSON.parse(localStorage.getItem('bank:v2:frontend')!)
    // только «устаревшая копия» и кастомный; 99 неизменённых встроенных в overlay не попали
    expect(Object.keys(overrides.questions).sort()).toEqual([builtin[0].id, 'legacy-custom'].sort())
  })
})
