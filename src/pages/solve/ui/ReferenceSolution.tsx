import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, Star } from 'lucide-react'
import { ToolButton } from '@/shared/ui/tool-button'
import { useToast } from '@/shared/hooks/use-sonner'
import { InspectorSection } from '@/shared/ui/inspector-section'

export function ReferenceSolution({ solution, onOpenInEditor }: { solution: string; onOpenInEditor?: () => void }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(solution)
      toast.success('Решение скопировано', 'Эталонное решение скопировано в буфер обмена')
    } catch {
      toast.error('Не удалось скопировать', 'Скопируйте решение из редактора вручную')
    }
  }

  return (
    <InspectorSection
      label="Эталонное решение"
      title={
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-sm hover:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {open ? <ChevronDown className="h-3.5 w-3.5" aria-hidden /> : <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
          <Star className="h-3.5 w-3.5 text-ansi-yellow" fill="currentColor" stroke="none" aria-hidden />
          Эталонное решение
        </button>
      }
      meta={
        <ToolButton variant="ghost" onClick={copy}>
          <Copy aria-hidden />
          Копировать
        </ToolButton>
      }
    >
      {open ? (
        <>
          <pre className="max-h-80 overflow-auto rounded-sm border bg-background p-3 text-xs leading-relaxed text-foreground">{solution}</pre>
          {onOpenInEditor && (
            <ToolButton variant="ghost" onClick={onOpenInEditor} className="mt-2">
              показать во вкладке редактора
            </ToolButton>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">Скрыто от кандидата. Разверните, чтобы свериться с решением.</p>
      )}
    </InspectorSection>
  )
}
