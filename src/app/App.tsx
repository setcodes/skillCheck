import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/shared/ui/sonner'
import { AppProvider } from './providers/AppProvider'
import { Header } from './layout/Header'
import { WorkspaceLayout } from './layout/WorkspaceLayout'
import HomePage from '@/pages/home/HomePage'

const SolvePage = lazy(() => import('@/pages/solve/SolvePage'))
const TheoryPage = lazy(() => import('@/pages/theory/TheoryPage'))
const MockPage = lazy(() => import('@/pages/mock/MockPage'))
const InterviewPage = lazy(() => import('@/pages/interview/InterviewPage'))
const DataHubPage = lazy(() => import('@/pages/data-hub/DataHubPage'))

export default function App() {
  return (
    <AppProvider>
      <div className="h-screen bg-background flex flex-col justify-between print:h-auto print:overflow-visible">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<WorkspaceLayout />}>
            <Route path="/solve/:taskId?" element={<SolvePage />} />
            <Route path="/theory/:questionId?" element={<TheoryPage />} />
            <Route path="/mock" element={<MockPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/data" element={<DataHubPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
          <div className="container mx-auto px-4 py-3 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SkillCheck. Все права защищены.</p>
          </div>
        </footer>
        <Toaster />
      </div>
    </AppProvider>
  )
}
