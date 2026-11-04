// Одноразовые миграции сохранённых данных пользователя.
import type { Profession } from '@/entities/profession/model/types'
import { KEYS, readJSON, writeJSON } from '@/shared/storage/storage'
import { aliasMap, getQuestions } from './repository'

const MIGRATIONS_KEY = 'skillcheck.migrations'

interface Applied {
  questionIds?: number
}

type Rec = Record<string, unknown>

/** Переносит ключи оценок, черновики и мок-сессию со старых id вопросов на новые. */
export function remapQuestionIds(prof: Profession, aliases: Map<string, string>): void {
  if (aliases.size === 0) return
  const map = (id: string) => aliases.get(id) ?? id

  const draftsKey = KEYS.theoryDrafts(prof)
  const drafts = readJSON<Rec | null>(draftsKey, null)
  if (drafts) {
    writeJSON(draftsKey, Object.fromEntries(Object.entries(drafts).map(([k, v]) => [map(k), v])))
  }

  const bridge = readJSON<Record<string, Rec> | null>(KEYS.theoryScoresBridge, null)
  if (bridge) {
    const next: Record<string, Rec> = {}
    for (const [key, row] of Object.entries(bridge)) {
      if (row.prof !== prof || typeof row.questionId !== 'string') {
        next[key] = row
        continue
      }
      const id = map(row.questionId)
      next[`${prof}:${id}`] = { ...row, questionId: id }
    }
    writeJSON(KEYS.theoryScoresBridge, next)
  }

  const session = readJSON<{ items?: Rec[] } | null>(KEYS.mockSession, null)
  if (session?.items) {
    for (const it of session.items) {
      if (it.type === 'theory' && typeof it.questionId === 'string') it.questionId = map(it.questionId)
    }
    writeJSON(KEYS.mockSession, session)
  }
}

export function runMigrations(prof: Profession = 'frontend'): void {
  const applied = readJSON<Applied>(MIGRATIONS_KEY, {})
  if (applied.questionIds === 1) return
  remapQuestionIds(prof, aliasMap(getQuestions(prof)))
  writeJSON(MIGRATIONS_KEY, { ...applied, questionIds: 1 })
}
