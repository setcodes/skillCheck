import { Suspense } from 'react'
import { ArrowLeft, BookOpen, Clock, Code as CodeIcon, Import as ImportIcon, Users } from 'lucide-react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { TimerMenu } from '@/shared/ui/timer-menu'
import { cn } from '@/shared/lib/utils'
import { PROFESSIONS, PROFESSION_ICONS, isProfessionEnabled } from '@/entities/profession/model/constants'
import { useToast } from '@/shared/hooks/use-sonner'
import { useTimer } from '@/shared/hooks/use-timer'
import { formatSeconds } from '@/shared/lib/timer'
import { KEYS } from '@/shared/storage/storage'
import { useApp } from '../providers/AppProvider'

const INTERVIEWER_ONLY = ['/interview', '/data']

export function WorkspaceLayout() {
  const { role, prof } = useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { toast } = useToast()

  // Глобальный таймер интервью (по умолчанию выключен, переживает перезагрузку)
  const timer = useTimer({
    storageKey: KEYS.interviewTimer,
    defaults: { mode: 'up', limitSec: 3600 },
    onEvent: (event, remaining) => {
      if (event === 'half') toast.info('Половина времени прошла', `Осталось ~ ${formatSeconds(remaining)}`)
      if (event === 'tenPercent') toast.warning('Меньше 10% времени', `Осталось ~ ${formatSeconds(remaining)}`)
      if (event === 'expired') toast.error('Время истекло', 'Глобальный таймер остановлен')
    },
  })

  if (!isProfessionEnabled(prof)) return <Navigate to="/" replace />
  if (role === 'candidate' && INTERVIEWER_ONLY.some((p) => pathname.startsWith(p))) {
    return <Navigate to="/solve" replace />
  }

  const current = PROFESSIONS.find((p) => p.id === prof)
  const Icon = current ? PROFESSION_ICONS[current.id] : null

  const tabs = [
    { to: '/solve', label: 'Решение задач', icon: CodeIcon, show: true },
    { to: '/mock', label: 'Мок‑интервью', icon: Clock, show: true },
    { to: '/interview', label: 'Режим интервью', icon: Users, show: role === 'interviewer' },
    { to: '/theory', label: 'Теория', icon: BookOpen, show: true },
    { to: '/data', label: 'Импорт / Экспорт', icon: ImportIcon, show: role === 'interviewer' },
  ].filter((t) => t.show)

  return (
    <>
      <section className="py-4 bg-muted/30 border-b print:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  timer.reset()
                  navigate('/')
                }}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span>К профессиям</span>
              </Button>
              {current && Icon && (
                <div className="hidden md:flex items-center gap-2">
                  <div className={cn('p-2 rounded-full bg-muted', current.color)}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <span className="text-base font-semibold">{current.title}</span>
                </div>
              )}
            </div>
            <nav aria-label="Разделы" className="flex flex-wrap items-center justify-end gap-2">
              <TimerMenu timer={timer} title="Глобальный таймер интервью" />
              {tabs.map(({ to, label, icon: TabIcon }) => (
                <NavLink key={to} to={to}>
                  {({ isActive }) => (
                    <Button
                      asChild
                      variant={isActive ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                    >
                      <span aria-current={isActive ? 'page' : undefined}>
                        <TabIcon className="h-4 w-4" aria-hidden />
                        <span>{label}</span>
                      </span>
                    </Button>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <main className="py-8 flex-1 overflow-hidden">
        <div className="container mx-auto px-4 h-full min-h-0">
          <Suspense fallback={<p className="text-center text-muted-foreground py-12">Загрузка…</p>}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </>
  )
}
