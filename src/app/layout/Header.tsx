import { CircleCheckBig, Moon, Sun, User, UserCog } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { useTheme } from '@/shared/hooks/use-theme'
import { useApp } from '../providers/AppProvider'

export function Header() {
  const { role, setRole } = useApp()
  const { theme, toggle } = useTheme()
  const label = theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'

  return (
    <header className="border-b bg-card relative z-10 print:hidden">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3" aria-label="SkillCheck — на главную">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <CircleCheckBig className="h-10 w-10" aria-hidden />
            </div>
            <span className="text-2xl font-bold text-foreground font-brand uppercase tracking-wide">SkillCheck</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={toggle} title={label} aria-label={label}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant={role === 'interviewer' ? 'default' : 'outline'}
              size="sm"
              aria-pressed={role === 'interviewer'}
              onClick={() => setRole('interviewer')}
              className="flex items-center space-x-2"
            >
              <UserCog className="h-4 w-4" aria-hidden />
              <span>Интервьюер</span>
            </Button>
            <Button
              variant={role === 'candidate' ? 'default' : 'outline'}
              size="sm"
              aria-pressed={role === 'candidate'}
              onClick={() => setRole('candidate')}
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" aria-hidden />
              <span>Кандидат</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
