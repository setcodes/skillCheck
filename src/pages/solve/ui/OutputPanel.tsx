import { useEffect, useRef, useState } from 'react'
import { Eraser } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ToolButton } from '@/shared/ui/tool-button'
import type { TestResult } from '@/shared/api/runner'
import type { UserRole } from '@/entities/user/model/types'

type Tab = 'results' | 'console' | 'spec'

interface Props {
  results: TestResult[]
  logs: string[]
  spec: string
  role: UserRole
  running: boolean
  command: string
  onClearResults: () => void
  onClearLogs: () => void
}

function Row({ ok, text, muted }: { ok: boolean; text: string; muted?: boolean }) {
  return (
    <li className="flex gap-2">
      <span className={cn('shrink-0', ok ? 'text-ok' : 'text-ansi-red')} aria-hidden>
        {ok ? '✓' : '✗'}
      </span>
      <span className="sr-only">{ok ? 'Пройден:' : 'Провален:'}</span>
      <span className={cn('min-w-0 whitespace-pre-wrap break-words', muted ? 'text-muted-foreground' : ok ? 'text-foreground' : 'text-ansi-red')}>
        {text}
      </span>
    </li>
  )
}

/** Нижняя панель окна задачи: вывод проверок, консоль и спецификация — как терминал под редактором. */
export function OutputPanel({ results, logs, spec, role, running, command, onClearResults, onClearLogs }: Props) {
  const [tab, setTab] = useState<Tab>('results')
  const interviewer = role === 'interviewer'
  const visible = results.filter((r) => !r.hidden)
  const hidden = results.filter((r) => r.hidden)
  const hiddenPassed = hidden.filter((r) => r.ok).length
  const passed = results.filter((r) => r.ok).length
  const bodyRef = useRef<HTMLDivElement>(null)

  // после запуска — показываем результаты
  useEffect(() => {
    if (running) setTab('results')
  }, [running])

  useEffect(() => {
    if (tab === 'console' && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [logs, tab])

  const tabs: { id: Tab; label: string; badge?: string }[] = [
    { id: 'results', label: 'Результаты тестов', badge: results.length ? `${passed}/${results.length}` : undefined },
    { id: 'console', label: 'Консоль', badge: logs.length ? String(logs.length) : undefined },
    { id: 'spec', label: 'Как проверяется' },
  ]

  return (
    <section aria-label="Вывод" className="flex min-h-0 flex-col border-t bg-card font-mono text-[0.8rem]">
      <div className="flex h-9 shrink-0 items-stretch justify-between border-b pr-2">
        <div role="tablist" aria-label="Вывод" className="flex min-w-0 items-stretch overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`out-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`out-panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap border-r px-3 text-xs transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                tab === t.id ? 'bg-background text-foreground shadow-[inset_0_-2px_0_hsl(var(--primary))]' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
              {t.badge && <span className="rounded-sm bg-muted px-1 tabular-nums text-muted-foreground">{t.badge}</span>}
            </button>
          ))}
        </div>
        {tab === 'results' && results.length > 0 && (
          <ToolButton variant="ghost" onClick={onClearResults} className="self-center">
            <Eraser aria-hidden />
            очистить
          </ToolButton>
        )}
        {tab === 'console' && logs.length > 0 && (
          <ToolButton variant="ghost" onClick={onClearLogs} className="self-center">
            <Eraser aria-hidden />
            очистить
          </ToolButton>
        )}
      </div>

      <div
        ref={bodyRef}
        role="tabpanel"
        id={`out-panel-${tab}`}
        aria-labelledby={`out-tab-${tab}`}
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto bg-background/50 p-4 leading-relaxed"
      >
        <p className="text-muted-foreground">
          <span className="text-primary-text" aria-hidden>$ </span>
          {tab === 'spec' ? `${command} --describe` : tab === 'console' ? `${command} --logs` : command}
        </p>

        {tab === 'results' &&
          (running ? (
            <p className="mt-2 text-muted-foreground">выполняю в песочнице…</p>
          ) : results.length === 0 ? (
            <p className="mt-2 text-muted-foreground">Проверки ещё не запускались — «Запустить» или ⌘/Ctrl+Enter в редакторе.</p>
          ) : (
            <div className="mt-2 space-y-3">
              <ul className="space-y-0.5">
                {visible.map((r, i) => (
                  <Row key={i} ok={r.ok} text={r.message} />
                ))}
              </ul>
              {hidden.length > 0 && (
                <div>
                  <h4 className="text-muted-foreground">
                    Скрытые проверки: {hiddenPassed} из {hidden.length}
                  </h4>
                  <ul className="mt-1 space-y-0.5">
                    {hidden.map((r, i) => (
                      <Row key={i} ok={r.ok} muted={!interviewer} text={interviewer ? r.message : `Скрытая проверка ${i + 1}`} />
                    ))}
                  </ul>
                  {!interviewer && hiddenPassed < hidden.length && (
                    <p className="mt-2 max-w-[70ch] text-xs text-muted-foreground">
                      Скрытые проверки — граничные случаи и производительность. Подумайте о пустых входах, повторных вызовах, мутации данных и больших объёмах.
                    </p>
                  )}
                </div>
              )}
              <p className="border-t pt-2">
                <span className="text-ok">{passed} пройдено</span>
                <span className="text-muted-foreground"> · </span>
                <span className={passed < results.length ? 'text-ansi-red' : 'text-muted-foreground'}>{results.length - passed} провалено</span>
              </p>
            </div>
          ))}

        {tab === 'console' &&
          (logs.length === 0 ? (
            <p className="mt-2 text-muted-foreground">консоль пуста — здесь появится вывод console.log из решения</p>
          ) : (
            <div className="mt-2 space-y-0.5">
              {logs.map((line, i) => (
                <p key={i} className="whitespace-pre-wrap break-words text-foreground">
                  {line}
                </p>
              ))}
            </div>
          ))}

        {tab === 'spec' && <pre className="mt-2 whitespace-pre-wrap break-words text-foreground">{spec}</pre>}
      </div>
    </section>
  )
}
