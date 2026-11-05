import { cn } from '@/shared/lib/utils'

const REPO_URL = 'https://github.com/setcodes/skillCheck'

const builtAt = new Date(__APP_BUILT_AT__).toLocaleString('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** Версия сборки для футера: «v1.0.0 · 87e12a0», коммит ведёт на GitHub, дата сборки — в подсказке. */
export function AppVersion({ className }: { className?: string }) {
  const title = `Версия ${__APP_VERSION__}${__APP_COMMIT__ ? `, коммит ${__APP_COMMIT__}` : ''}, сборка ${builtAt}`
  return (
    <span className={cn('items-center gap-1.5 tabular-nums', className)} title={title}>
      <span>v{__APP_VERSION__}</span>
      {__APP_COMMIT__ && (
        // на узких экранах хеш прячем: версии и подписи достаточно
        <span className="contents max-sm:hidden">
          <span aria-hidden>·</span>
          <a
            href={`${REPO_URL}/commit/${__APP_COMMIT__}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Коммит ${__APP_COMMIT__} на GitHub`}
            className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {__APP_COMMIT__}
          </a>
        </span>
      )}
    </span>
  )
}
