import { BookOpen, Clock, Code as CodeIcon, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import { PROFESSIONS, PROFESSION_ICONS, isProfessionEnabled } from '@/entities/profession/model/constants'
import type { Profession } from '@/entities/profession/model/types'
import { useApp } from '@/app/providers/AppProvider'

const FEATURES = [
  { icon: CodeIcon, title: 'Практические задачи', text: 'Решайте задачи с автопроверкой и получайте мгновенную обратную связь', tone: 'blue' },
  { icon: BookOpen, title: 'Теоретическая база', text: 'Обширная коллекция вопросов с эталонными ответами по каждой профессии', tone: 'green' },
  { icon: Clock, title: 'Мок-интервью', text: 'Симуляция реального собеседования с таймером и итоговой оценкой', tone: 'purple' },
  { icon: Users, title: 'Режим интервьюера', text: 'Проводите интервью, выставляйте оценки и создавайте детальные отчёты', tone: 'orange' },
] as const

const TONES = {
  blue: ['from-blue-50/60 to-blue-100/60 dark:from-blue-950/20 dark:to-blue-900/20', 'bg-blue-500/10', 'text-blue-600 dark:text-blue-400'],
  green: ['from-green-50/60 to-green-100/60 dark:from-green-950/20 dark:to-green-900/20', 'bg-green-500/10', 'text-green-600 dark:text-green-400'],
  purple: ['from-purple-50/60 to-purple-100/60 dark:from-purple-950/20 dark:to-purple-900/20', 'bg-purple-500/10', 'text-purple-600 dark:text-purple-400'],
  orange: ['from-orange-50/60 to-orange-100/60 dark:from-orange-950/20 dark:to-orange-900/20', 'bg-orange-500/10', 'text-orange-600 dark:text-orange-400'],
} as const

export default function HomePage() {
  const { setProf } = useApp()
  const navigate = useNavigate()

  const open = (id: Profession) => {
    if (!isProfessionEnabled(id)) return
    setProf(id)
    navigate('/solve')
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Выберите профессию</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PROFESSIONS.map((info) => {
            const Icon = PROFESSION_ICONS[info.id]
            const soon = info.status === 'soon'
            return (
              <button
                type="button"
                key={info.id}
                disabled={soon}
                onClick={() => open(info.id)}
                className={cn(
                  'relative p-6 rounded-lg border-2 text-left transition-all duration-200',
                  'border-border bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  soon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:border-primary/50'
                )}
              >
                {soon && (
                  <span className="absolute top-3 right-3 text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Скоро</span>
                )}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={cn('p-3 rounded-full bg-muted', info.color)}>
                    <Icon className="h-8 w-8" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{info.title}</h2>
                    <p className="text-sm text-muted-foreground">{soon ? 'В разработке' : info.subtitle}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="max-w-6xl mx-auto mt-16">
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-center mb-12">
            SkillCheck объединяет теорию, практику и оценку в едином инструменте для эффективной подготовки к собеседованиям
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {FEATURES.map(({ icon: Icon, title, text, tone }) => (
              <Card key={title} className={cn('group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br', TONES[tone][0])}>
                <CardContent className="p-6 text-center">
                  <div className={cn('w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300', TONES[tone][1])}>
                    <Icon className={cn('h-8 w-8', TONES[tone][2])} aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
