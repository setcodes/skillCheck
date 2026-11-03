// Единая точка доступа к localStorage: все чтения безопасны (приватный режим, битый JSON),
// запись сообщает об ошибке (переполнение квоты) возвратом false.

function backend(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = backend()?.getItem(key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    backend()?.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(`Не удалось сохранить "${key}"`, e)
    return false
  }
}

export function readString(key: string): string | null {
  try {
    return backend()?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writeString(key: string, value: string): boolean {
  try {
    backend()?.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeKey(key: string): void {
  try {
    backend()?.removeItem(key)
  } catch {
    // нечего удалять
  }
}

export const KEYS = {
  theme: 'theme',
  role: 'role',
  prof: 'prof',
  interviewTimer: 'interview.timer.v2',
  solutions: 'solutions.v4',
  mockSession: 'mock.session.v1',
  taskScoresBridge: 'bridge.taskScores.v1',
  theoryScoresBridge: 'bridge.theoryScores.v1',
  theoryDrafts: (prof: string) => `theory.drafts.v1.${prof}`,
  bankOverrides: (prof: string) => `bank:v2:${prof}`,
  legacyBankQuestions: (prof: string) => `bank:${prof}:questions`,
  legacyBankTasks: (prof: string) => `bank:${prof}:tasks`,
  legacyBackup: (prof: string) => `bank:legacy-backup:${prof}`,
  taskTimer: (prof: string, taskId: string) => `task.timer.v2.${prof}.${taskId}`,
} as const

/** Сброс всех оценок интервьюера и решений кандидата (банк вопросов не трогает). */
export function clearAllEvaluations(professions: readonly string[]): void {
  removeKey(KEYS.taskScoresBridge)
  removeKey(KEYS.theoryScoresBridge)
  removeKey(KEYS.solutions)
  for (const prof of professions) removeKey(KEYS.theoryDrafts(prof))
}
