import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/app/providers/AppProvider'
import { useCases } from '@/shared/bank'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import type { CaseKind } from '@/entities/case/model/types'
import { CaseDetail } from './ui/CaseDetail'

const KINDS: { id: CaseKind | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'review', label: 'Ревью кода' },
  { id: 'live', label: 'Live coding' },
]

export default function CasesPage() {
  const { prof, role } = useApp()
  const cases = useCases(prof)
  const navigate = useNavigate()
  const { caseId } = useParams()
  const [kind, setKind] = useState<CaseKind | 'all'>('all')

  const list = useMemo(() => cases.filter((c) => kind === 'all' || c.kind === kind), [cases, kind])
  const current = cases.find((c) => c.id === caseId)

  if (cases.length === 0) {
    return <p className="text-muted-foreground text-center py-12">Для этой профессии пока нет кейсов</p>
  }
  if (!current) return <Navigate to={`/cases/${cases[0].id}`} replace />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
      <div className="lg:col-span-1 h-full min-h-0">
        <div className="bg-card border rounded-lg p-6 h-full flex flex-col min-h-0">
          <h2 className="text-xl font-semibold mb-4">Кейсы — {prof}</h2>
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Тип кейса">
            {KINDS.map((k) => (
              <Button key={k.id} size="sm" variant={kind === k.id ? 'default' : 'outline'} aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>
                {k.label}
              </Button>
            ))}
          </div>
          <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
            {list.map((c) => (
              <Button
                key={c.id}
                variant={current.id === c.id ? 'secondary' : 'ghost'}
                aria-current={current.id === c.id ? 'true' : undefined}
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => navigate(`/cases/${c.id}`)}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium whitespace-normal">{c.title}</span>
                  <span className="flex gap-2">
                    <Badge variant="outline" className="text-[10px]">{c.kind === 'review' ? 'ревью' : 'live'}</Badge>
                    <span className="text-xs text-muted-foreground capitalize">{c.level}</span>
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 h-full min-h-0">
        <div className="bg-card border rounded-lg h-full overflow-y-auto p-6">
          <CaseDetail item={current} role={role} />
        </div>
      </div>
    </div>
  )
}
