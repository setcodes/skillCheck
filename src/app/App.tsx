import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Toaster } from '@/shared/ui/toaster'
import { AppProvider, useApp } from './providers/AppProvider'
import { PROFESSIONS, PROFESSION_ICONS } from '@/entities/profession/model/constants'
import type { Profession } from '@/entities/profession/model/types'
import { cn } from '@/shared/lib/utils'

// Импорты страниц
import SolvePage from '@/pages/solve/SolvePage'
import TheoryPage from '@/pages/theory/TheoryPage'
import InterviewPage from '@/pages/interview/InterviewPage'
import DataHubPage from '@/pages/data-hub/DataHubPage'

type Tab = 'solve' | 'interview' | 'theory' | 'data'

function AppContent() {
  const { role, prof, selectedProf, setSelectedProf, setRole, setProf } = useApp()
  const [tab, setTab] = useState<Tab>('solve')

  const handleProfessionSelect = (profId: Profession) => {
    setSelectedProf(profId)
    setProf(profId)
  }

  const handleBackToProfessions = () => {
    setSelectedProf(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" width="64" height="64" alt="SkillCheck"/>
              <h1 className="text-2xl font-bold text-foreground">SkillCheck</h1>
            </div>
            <div className="flex items-center space-x-2">
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
          {/* Back Button and Current Profession */}
          <section className="py-4 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleBackToProfessions}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4"/>
                  <span>Вернуться к выбору профессий</span>
                </Button>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const currentProf = PROFESSIONS.find(p => p.id === selectedProf)
                    if (!currentProf) return null
                    const IconComponent = PROFESSION_ICONS[currentProf.id]
                    return (
                      <>
                        <div className={cn("p-2 rounded-full bg-muted", currentProf.color)}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-semibold">{currentProf.title}</span>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="py-6 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  variant={tab==='solve'?'default':'outline'} 
                  onClick={()=>setTab('solve')}
                  className="flex items-center space-x-2"
                >
                  <span>Решение задач</span>
                </Button>
                {role==='interviewer' && (
                  <Button 
                    variant={tab==='interview'?'default':'outline'} 
                    onClick={()=>setTab('interview')}
                    className="flex items-center space-x-2"
                  >
                    <span>Режим интервью</span>
                  </Button>
                )}
                <Button 
                  variant={tab==='theory'?'default':'outline'} 
                  onClick={()=>setTab('theory')}
                  className="flex items-center space-x-2"
                >
                  <span>Теория</span>
                </Button>
                {role==='interviewer' && (
                  <Button 
                    variant={tab==='data'?'default':'outline'} 
                    onClick={()=>setTab('data')}
                    className="flex items-center space-x-2"
                  >
                    <span>Импорт / Экспорт</span>
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* Content */}
          <main className="py-8">
            <div className="container mx-auto px-4">
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
