import { ChevronDown, Copy, Star } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { CodeEditor } from '@/features/code-editor/ui'
import { useToast } from '@/shared/hooks/use-sonner'

export function ReferenceSolution({ solution, language }: { solution: string; language: string }) {
  const { toast } = useToast()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(solution)
      toast.success('Решение скопировано', 'Эталонное решение скопировано в буфер обмена')
    } catch {
      toast.error('Не удалось скопировать', 'Скопируйте решение из редактора вручную')
    }
  }

  return (
    <div className="mt-6">
      <Collapsible>
        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-4 bg-muted/50">
            <CollapsibleTrigger className="group cursor-pointer flex items-center gap-2 hover:bg-muted/70 transition-colors rounded px-2 py-1">
              <Star className="h-4 w-4 text-yellow-500" fill="currentColor" stroke="none" aria-hidden />
              <span className="font-medium">Эталонное решение</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden />
            </CollapsibleTrigger>
            <Button variant="ghost" size="sm" onClick={copy} className="h-8 px-2 text-muted-foreground hover:text-foreground">
              <Copy className="h-3 w-3 mr-1" aria-hidden />
              Копировать
            </Button>
          </div>
          <CollapsibleContent>
            <div className="p-4 border-t">
              <CodeEditor value={solution} onChange={() => {}} language={language} height="300px" placeholder="Эталонное решение..." />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}
