import { lazy } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/shared/ui/sonner'
import { AppVersion } from '@/shared/ui/app-version'
import { AppProvider } from './providers/AppProvider'
import { InterviewTimerProvider } from './providers/InterviewTimerProvider'
import { ConsoleProvider } from './providers/ConsoleProvider'
import { ConsolePanel } from './layout/ConsolePanel'
import { Header } from './layout/Header'
import { WorkspaceLayout } from './layout/WorkspaceLayout'
import HomePage from '@/pages/home/HomePage'

const SolvePage = lazy(() => import('@/pages/solve/SolvePage'))
const TheoryPage = lazy(() => import('@/pages/theory/TheoryPage'))
const CasesPage = lazy(() => import('@/pages/cases/CasesPage'))
const QuizPage = lazy(() => import('@/pages/quiz/QuizPage'))
const MockPage = lazy(() => import('@/pages/mock/MockPage'))
const InterviewPage = lazy(() => import('@/pages/interview/InterviewPage'))
const DataHubPage = lazy(() => import('@/pages/data-hub/DataHubPage'))

/** Шапка и футер — только у главной; внутренние страницы живут в своей оболочке (рейл и строка состояния). */
function SiteLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <footer className="border-t bg-card font-mono text-xs print:hidden">
        <div className="container mx-auto flex h-8 items-stretch justify-between gap-3 px-4 text-muted-foreground">
          <span className="flex items-center bg-primary px-2 font-medium text-primary-foreground">skillcheck</span>
          <div className="flex min-w-0 items-center gap-3">
            <p className="truncate">&copy; {new Date().getFullYear()} SkillCheck.<span className="max-sm:hidden">&nbsp;Все права защищены.</span></p>
            <AppVersion className="flex shrink-0 border-l pl-3" />
          </div>
        </div>
      </footer>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <InterviewTimerProvider>
        <ConsoleProvider>
          <div className="h-screen bg-background flex flex-col justify-between print:h-auto print:overflow-visible">
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<HomePage />} />
              </Route>
              <Route element={<WorkspaceLayout />}>
                <Route path="/solve/:taskId?" element={<SolvePage />} />
                <Route path="/theory/:questionId?" element={<TheoryPage />} />
                <Route path="/cases/:caseId?" element={<CasesPage />} />
                <Route path="/quiz/:quizId?" element={<QuizPage />} />
                <Route path="/mock" element={<MockPage />} />
                <Route path="/interview" element={<InterviewPage />} />
                <Route path="/data" element={<DataHubPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ConsolePanel />
            <Toaster />
          </div>
        </ConsoleProvider>
      </InterviewTimerProvider>
    </AppProvider>
  )
}
