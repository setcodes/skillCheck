import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Play, Pause, RotateCcw, Code as CodeIcon, Users, BookOpen, Import as ImportIcon, Clock, Sun, Moon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Toaster } from '@/shared/ui/toaster'
import { AppProvider, useApp } from './providers/AppProvider'
import { PROFESSIONS, PROFESSION_ICONS } from '@/entities/profession/model/constants'
import type { Profession } from '@/entities/profession/model/types'
import { cn } from '@/shared/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/ui/dropdown-menu'

// Импорты страниц
import SolvePage from '@/pages/solve/SolvePage'
import TheoryPage from '@/pages/theory/TheoryPage'
import InterviewPage from '@/pages/interview/InterviewPage'
import DataHubPage from '@/pages/data-hub/DataHubPage'

type Tab = 'solve' | 'interview' | 'theory' | 'data'

function AppContent() {
  const { role, prof, selectedProf, setSelectedProf, setRole, setProf } = useApp()
  const [tab, setTab] = useState<Tab>('solve')
  // Interview timer state (configurable, off by default)
  const [intMode, setIntMode] = useState<'up'|'down'>(() => (localStorage.getItem('interview.timer.mode') as any) || 'up')
  const [intLimitSec, setIntLimitSec] = useState<number>(() => {
    const n = Number(localStorage.getItem('interview.timer.limitSec') || '3600')
    return Number.isFinite(n) ? n : 3600
  })
  const [intValueSec, setIntValueSec] = useState<number>(() => {
    const n = Number(localStorage.getItem('interview.timer.valueSec') || (intMode==='down'? String(Number(localStorage.getItem('interview.timer.limitSec')||'3600')) : '0'))
    return Number.isFinite(n) ? n : (intMode==='down'? intLimitSec : 0)
  })
  const [intRunning, setIntRunning] = useState<boolean>(() => localStorage.getItem('interview.timer.running') === '1')

  const handleProfessionSelect = (profId: Profession) => {
    setSelectedProf(profId)
    setProf(profId)
  }

  const handleBackToProfessions = () => {
    setSelectedProf(null)
    // Stop and reset interview timer when exiting
    setIntRunning(false)
    setIntValueSec(intMode==='down' ? intLimitSec : 0)
  }
  // Persist interview timer config/state
  useEffect(()=>{ localStorage.setItem('interview.timer.mode', intMode) }, [intMode])
  useEffect(()=>{ localStorage.setItem('interview.timer.limitSec', String(intLimitSec)) }, [intLimitSec])
  useEffect(()=>{ localStorage.setItem('interview.timer.valueSec', String(intValueSec)) }, [intValueSec])
  useEffect(()=>{ localStorage.setItem('interview.timer.running', intRunning ? '1':'0') }, [intRunning])

  // Tick interview timer
  useEffect(() => {
    if (!selectedProf || !intRunning) return
    const id = setInterval(() => {
      setIntValueSec(v => {
        if (intMode === 'up') return v + 1
        // down
        const nv = v - 1
        if (nv <= 0) { setIntRunning(false); return 0 }
        return nv
      })
    }, 1000)
    return () => clearInterval(id)
  }, [selectedProf, intRunning, intMode])

  const formatSeconds = (total: number) => {
    total = Math.max(0, Math.floor(total))
    const h = Math.floor(total / 3600).toString().padStart(2, '0')
    const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0')
    const s = (total % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }
  const interviewDisplay = useMemo(() => formatSeconds(intValueSec), [intValueSec])

  // Theme (light/dark)
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    const saved = localStorage.getItem('theme') as 'light'|'dark'|null
    if (saved) return saved
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col print:h-auto print:overflow-visible">
      {/* Header */}
      <header className="border-b bg-card relative z-10 print:hidden">
            <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" width="64" height="64" alt="SkillCheck"/>
              <h1 className="text-2xl font-bold text-foreground">SkillCheck</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={()=> setTheme(t => t==='dark'?'light':'dark')}
                className="flex items-center gap-2"
                title={theme==='dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
              >
                {theme==='dark' ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
                <span className="hidden sm:inline">{theme==='dark' ? 'Светлая' : 'Тёмная'}</span>
              </Button>
              <Button 
                variant={role==='interviewer'?'default':'outline'} 
                size="sm"
                onClick={()=>setRole('interviewer')}
                className="flex items-center space-x-2"
              >
                <span>Интервьюер</span>
              </Button>
              <Button 
                variant={role==='candidate'?'default':'outline'} 
                size="sm"
                onClick={()=>setRole('candidate')}
                className="flex items-center space-x-2"
              >
                <span>Кандидат</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {!selectedProf ? (
        /* Professions Selection */
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Выберите профессию</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {PROFESSIONS.map(profInfo => {
                const IconComponent = PROFESSION_ICONS[profInfo.id]
                return (
                  <div 
                    key={profInfo.id} 
                    className={cn(
                      "relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg",
                      "border-border bg-card hover:border-primary/50"
                    )}
                    onClick={() => handleProfessionSelect(profInfo.id)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={cn("p-3 rounded-full bg-muted", profInfo.color)}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{profInfo.title}</h3>
                        <p className="text-sm text-muted-foreground">{profInfo.subtitle}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : (
        /* Work Area */
        <>
          {/* Toolbar: back + current profession + modes on one level */}
          <section className="py-4 bg-muted/30 border-b print:hidden">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToProfessions}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4"/>
                    <span>К профессиям</span>
                  </Button>
                  <div className="hidden md:flex items-center gap-2">
                    {(() => {
                      const currentProf = PROFESSIONS.find(p => p.id === selectedProf)
                      if (!currentProf) return null
                      const IconComponent = PROFESSION_ICONS[currentProf.id]
                      return (
                        <>
                          <div className={cn("p-2 rounded-full bg-muted", currentProf.color)}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <span className="text-base font-semibold">{currentProf.title}</span>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {selectedProf && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-mono">{interviewDisplay}</span>
                          <span className={cn("h-2 w-2 rounded-full", intRunning ? "bg-green-500" : "bg-muted-foreground/50")}></span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">Глобальный таймер интервью</div>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5">
                          <div className="text-xs mb-1">Режим</div>
                          <Select value={intMode} onValueChange={(m: 'up'|'down')=>{ setIntMode(m); setIntValueSec(m==='down'? intLimitSec : 0); setIntRunning(false) }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Режим" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="up">Прямой</SelectItem>
                              <SelectItem value="down">Обратный</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {intMode==='down' && (
                          <div className="px-2 py-1.5">
                            <div className="text-xs mb-1">Лимит (мин)</div>
                            <input 
                              className="w-full px-2 py-1 rounded border bg-card text-right font-mono"
                              type="number" min={1} step={1}
                              value={Math.floor(intLimitSec/60)}
                              onChange={e=>{
                                const mins = Math.max(1, Number(e.target.value)||0)
                                const sec = mins*60
                                setIntLimitSec(sec)
                                if(!intRunning) setIntValueSec(sec)
                              }}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                              {[5, 15, 30, 60].map(min => (
                                <Button key={min} variant="outline" size="sm" onClick={()=>{
                                  const sec = min*60
                                  setIntLimitSec(sec)
                                  if(!intRunning) setIntValueSec(sec)
                                }}>{min} мин</Button>
                              ))}
                            </div>
                          </div>
                        )}
                        <DropdownMenuSeparator />
                        <div className="px-2 py-2 flex items-center gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center gap-1"
                            onClick={()=> setIntRunning(r=>!r)}
                          >
                            {intRunning ? (<><Pause className="h-3 w-3" /> Пауза</>) : (<><Play className="h-3 w-3" /> Старт</>)}
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center gap-1"
                            onClick={()=> setIntValueSec(intMode==='down'? intLimitSec : 0)}
                          >
                            <RotateCcw className="h-3 w-3" /> Сброс
                          </Button>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button 
                    variant={tab==='solve'?'default':'outline'} 
                    onClick={()=>setTab('solve')}
                    className="flex items-center gap-2"
                  >
                    <CodeIcon className="h-4 w-4" />
                    <span>Решение задач</span>
                  </Button>
                  {role==='interviewer' && (
                    <Button 
                      variant={tab==='interview'?'default':'outline'} 
                      onClick={()=>setTab('interview')}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      <span>Режим интервью</span>
                    </Button>
                  )}
                  <Button 
                    variant={tab==='theory'?'default':'outline'} 
                    onClick={()=>setTab('theory')}
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Теория</span>
                  </Button>
                  {role==='interviewer' && (
                    <Button 
                      variant={tab==='data'?'default':'outline'} 
                      onClick={()=>setTab('data')}
                      className="flex items-center gap-2"
                    >
                      <ImportIcon className="h-4 w-4" />
                      <span>Импорт / Экспорт</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <main className="py-8 flex-1 overflow-hidden">
            <div className="container mx-auto px-4 h-full">
              {tab==='solve' && <SolvePage />}
              {tab==='interview' && role==='interviewer' && <InterviewPage />}
              {tab==='theory' && <TheoryPage />}
              {tab==='data' && role==='interviewer' && <DataHubPage />}
            </div>
          </main>
        </>
      )}
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
