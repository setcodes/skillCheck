/// <reference lib="webworker" />
import { runInSandbox } from './core'
import { lockDownScope } from './harden'
import type { SandboxInput } from './types'

// Канал связи берём до того, как скоуп закрыт: пользовательский код его не получит.
const post = self.postMessage.bind(self) as (message: unknown) => void

lockDownScope(self as unknown as Record<string, unknown>)

self.onmessage = async (event: MessageEvent<SandboxInput & { token: string }>) => {
  const { token, ...input } = event.data
  const output = await runInSandbox(input)
  post({ token, ...output })
}
