import { CheckCircle, EyeOff, XCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { TestResult } from '@/shared/api/runner'
import type { UserRole } from '@/entities/user/model/types'

function Row({ ok, text, hidden }: { ok: boolean; text: string; hidden?: boolean }) {
  return (
    <li
      className={cn(
        'flex items-center gap-2 p-2 rounded',
        ok
          ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'
          : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
      )}
    >
      {ok ? <CheckCircle className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
      <span className="sr-only">{ok ? 'Пройден:' : 'Провален:'}</span>
      <span className="text-sm">{text}</span>
      {hidden && <EyeOff className="h-3 w-3 ml-auto opacity-60" aria-label="скрытая проверка" />}
    </li>
  )
}

export function ResultsPanel({ results, tests, role }: { results: TestResult[]; tests: string; role: UserRole }) {
  const interviewer = role === 'interviewer'
  const visible = results.filter((r) => !r.hidden)
  const hidden = results.filter((r) => r.hidden)
  const hiddenPassed = hidden.filter((r) => r.ok).length

  return (
    <>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Результаты тестов</h3>
        <ul className="space-y-2" aria-live="polite">
          {visible.map((r, i) => (
            <Row key={i} ok={r.ok} text={r.message} />
          ))}
        </ul>

        {hidden.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">
              Скрытые проверки: {hiddenPassed} из {hidden.length}
            </h4>
            <ul className="space-y-2">
              {hidden.map((r, i) => (
                <Row key={i} ok={r.ok} hidden text={interviewer ? r.message : `Скрытая проверка ${i + 1}`} />
              ))}
            </ul>
            {!interviewer && hiddenPassed < hidden.length && (
              <p className="text-xs text-muted-foreground mt-2">
                Скрытые проверки — граничные случаи и производительность. Подумайте о пустых входах, повторных вызовах, мутации данных и больших объёмах.
              </p>
            )}
          </div>
        )}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          Показать тесты
        </summary>
        <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">{tests}</pre>
      </details>
    </>
  )
}
