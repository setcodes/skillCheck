import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { FileText, PanelLeft } from 'lucide-react'
import { useApp } from '@/app/providers/AppProvider'
import { useCases } from '@/shared/bank'
import { Explorer, type ExplorerGroup } from '@/shared/ui/explorer'
import type { CaseKind } from '@/entities/case/model/types'
import { CaseDetail } from './ui/CaseDetail'
import { CaseInspector } from './ui/CaseInspector'

const KINDS: { id: CaseKind; name: string; hint: string }[] = [
  { id: 'review', name: 'review', hint: 'Ревью кода' },
  { id: 'live', name: 'live', hint: 'Live coding' },
]

export default function CasesPage() {
  const { prof, role } = useApp()
  const cases = useCases(prof)
  const navigate = useNavigate()
  const { caseId } = useParams()
  const [query, setQuery] = useState('')
  const [explorerOpen, setExplorerOpen] = useState(false)

  const groups: ExplorerGroup[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    return KINDS.map((k) => ({
      id: k.id,
      name: k.name,
      hint: k.hint,
      items: cases
        .filter((c) => c.kind === k.id && (!q || c.title.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))))
        .map((c) => ({ id: c.id, title: c.title })),
    })).filter((g) => g.items.length > 0)
  }, [cases, query])

  const current = cases.find((c) => c.id === caseId)

  if (cases.length === 0) return <p className="py-12 text-center font-mono text-sm text-muted-foreground">Для этой профессии пока нет кейсов</p>
  if (!current) return <Navigate to={`/cases/${cases[0].id}`} replace />

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      {explorerOpen && (
        <button
          type="button"
          aria-label="Закрыть список кейсов"
          onClick={() => setExplorerOpen(false)}
          className="fixed inset-0 z-20 bg-background/60 backdrop-blur-[2px] xl:hidden"
        />
      )}
      <Explorer
        title="кейсы"
        label="Список кейсов"
        counter={<span className="tabular-nums">{cases.length}</span>}
        groups={groups}
        currentId={current.id}
        onSelect={(id) => {
          navigate(`/cases/${id}`)
          setExplorerOpen(false)
        }}
        query={query}
        onQuery={setQuery}
        className={explorerOpen ? 'fixed bottom-7 left-14 top-10 z-30 flex shadow-2xl' : 'hidden xl:flex'}
        onClose={explorerOpen ? () => setExplorerOpen(false) : undefined}
      />

      <div className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
        <div className="flex h-9 shrink-0 items-stretch border-b bg-card font-mono">
          <button
            type="button"
            onClick={() => setExplorerOpen((o) => !o)}
            aria-label="Список кейсов"
            className="flex items-center border-r px-2.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring xl:hidden"
          >
            <PanelLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="flex min-w-0 items-center gap-2 border-r bg-background px-3 text-xs text-foreground shadow-[inset_0_2px_0_hsl(var(--primary))]">
            <FileText className="h-3.5 w-3.5 shrink-0 text-ansi-magenta" aria-hidden />
            <span className="truncate">{current.id}.md</span>
          </span>
        </div>
        <div className="flex-1 bg-background lg:min-h-0 lg:overflow-y-auto">
          <CaseDetail item={current} role={role} />
        </div>
      </div>

      <aside aria-label="Инспектор" className="shrink-0 border-t bg-card font-mono lg:w-96 lg:overflow-y-auto lg:border-l lg:border-t-0 2xl:w-[28rem]">
        <CaseInspector item={current} role={role} />
      </aside>
    </div>
  )
}
