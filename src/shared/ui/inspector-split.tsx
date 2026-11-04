import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable'

interface Props {
  /** ключ для запоминания ширины между перезагрузками, свой у каждой страницы */
  id: string
  main: ReactNode
  inspector: ReactNode
  /** стартовая доля инспектора, % */
  defaultSize?: number
  className?: string
  inspectorClassName?: string
}

/**
 * Окно и инспектор справа. На десктопе граница тянется мышью или стрелками с клавиатуры,
 * ширина запоминается; на узких экранах инспектор уходит под содержимое.
 */
export function InspectorSplit({
  id,
  main,
  inspector,
  defaultSize = 26,
  className,
  inspectorClassName,
}: Props) {
  const wide = useMediaQuery('(min-width: 1024px)')

  if (!wide) {
    return (
      <div className={cn('flex min-w-0 flex-1 flex-col', className)}>
        {main}
        <aside
          aria-label="Инспектор"
          className={cn('shrink-0 border-t bg-card', inspectorClassName)}
        >
          {inspector}
        </aside>
      </div>
    )
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId={`split:${id}`}
      className={cn('min-w-0 flex-1', className)}
    >
      <ResizablePanel id="main" order={1} minSize={40} className="flex min-w-0 flex-col print:!flex-[1_1_100%]">
        {main}
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Изменить ширину инспектора" className="print:hidden" />
      <ResizablePanel id="inspector" order={2} defaultSize={defaultSize} minSize={16} maxSize={50}>
        <aside
          aria-label="Инспектор"
          className={cn('h-full overflow-y-auto bg-card', inspectorClassName)}
        >
          {inspector}
        </aside>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
