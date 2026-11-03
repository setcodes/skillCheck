import type { ReactNode } from 'react'

interface Props {
  /** доступное имя региона */
  label: string
  title: ReactNode
  meta?: ReactNode
  children: ReactNode
}

/** Раздел инспектора справа от редактора: заголовок-строка и содержимое. */
export function InspectorSection({ label, title, meta, children }: Props) {
  return (
    <section aria-label={label} className="border-b px-4 py-4 font-mono text-[0.8rem]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-bold text-foreground">{title}</h3>
        {meta && <span className="text-xs tabular-nums text-muted-foreground">{meta}</span>}
      </div>
      {children}
    </section>
  )
}
