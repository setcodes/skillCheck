import { CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { TestResult } from '@/shared/api/runner'

export function ResultsPanel({ results, tests }: { results: TestResult[]; tests: string }) {
  return (
    <>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Результаты тестов</h3>
        <ul className="space-y-2" aria-live="polite">
          {results.map((r, i) => (
            <li
              key={i}
              className={cn(
                'flex items-center gap-2 p-2 rounded',
                r.ok
                  ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                  : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
              )}
            >
              {r.ok ? <CheckCircle className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
              <span className="sr-only">{r.ok ? 'Пройден:' : 'Провален:'}</span>
              <span className="text-sm">{r.message}</span>
            </li>
          ))}
        </ul>
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
