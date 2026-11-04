// Отрезает у скоупа воркера всё, чем код кандидата мог бы выйти наружу.
// Воркер и так не видит DOM, localStorage и cookie; здесь убираем сеть и каналы связи.

const BLOCKED = [
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'importScripts',
  'indexedDB',
  'caches',
  'BroadcastChannel',
  'SharedWorker',
  'Worker',
  'navigator',
  'close',
  'postMessage',
]

export function lockDownScope(scope: Record<string, unknown>): void {
  for (const name of BLOCKED) {
    try {
      Object.defineProperty(scope, name, {
        value: undefined,
        writable: true,
        configurable: true,
      })
    } catch {
      // свойство нельзя переопределить — пропускаем, воркер всё равно изолирован
    }
  }
}

export const BLOCKED_GLOBALS = BLOCKED
