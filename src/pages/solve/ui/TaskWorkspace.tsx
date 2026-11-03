import { useRef } from 'react'
import { ChevronDown, FileText, Play } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { TimerMenu } from '@/shared/ui/timer-menu'
import { CodeEditor } from '@/features/code-editor/ui'
import type { CodeEditorHandle } from '@/features/code-editor/ui/CodeEditor'
import type { useTimer } from '@/shared/hooks/use-timer'
import type { UITask } from '@/entities/task/model/types'
import type { UserRole } from '@/entities/user/model/types'
import type { Solution } from '../model/useSolutions'
import { detectLanguage, languageLabel } from '../lib/language'
import { HintsPanel } from './HintsPanel'
import { ReferenceSolution } from './ReferenceSolution'
import { ResultsPanel } from './ResultsPanel'
import { ScorePanel } from './ScorePanel'

interface Props {
  task: UITask
  role: UserRole
  solution: Solution
  timer: ReturnType<typeof useTimer>
  logs: string[]
  onCode: (code: string) => void
  onRun: (code: string) => void
  onResetTask: () => void
  onResetTests: () => void
  onClearLogs: () => void
  onScore: (score: number) => void
  onComment: (comment: string) => void
  onSendScore: () => void
  onRevealHint: () => void
  onRubric: (done: number[]) => void
}

const levelVariant = { junior: 'default', middle: 'secondary', senior: 'destructive' } as const

export function TaskWorkspace(p: Props) {
  const { task, role, solution } = p
  const editorRef = useRef<CodeEditorHandle | null>(null)
  const language = detectLanguage(task)
  const code = solution.code ?? task.starter

  return (
    <>
      <div className="p-6 border-b flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TimerMenu timer={p.timer} title="Таймер задачи" align="start" />
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2">
              <Badge variant={levelVariant[task.level]} className="capitalize">{task.level}</Badge>
              <Badge variant="outline" className="text-xs">{languageLabel(language)}</Badge>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden />
            {task.title}
          </h2>
          <p className="text-muted-foreground mt-1">{task.description}</p>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-4">
          <Collapsible>
            <CollapsibleTrigger className="group cursor-pointer flex items-center gap-2 hover:bg-muted/70 transition-colors rounded px-2 py-1">
              <span className="text-sm font-medium">Стартовый шаблон кода</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">{task.starter}</pre>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Редактор живёт скрытым и открывается в полноэкранном режиме */}
        {task.hints && (
          <HintsPanel hints={task.hints} used={solution.hintsUsed ?? 0} role={role} onReveal={p.onRevealHint} />
        )}

        <div className="hidden">
          <CodeEditor
            ref={editorRef}
            value={code}
            onChange={p.onCode}
            language={language}
            height="300px"
            placeholder="Введите ваш код здесь..."
            onFullscreenChange={() => {}}
            onRun={() => p.onRun(code)}
            onResetTask={p.onResetTask}
            onResetTests={p.onResetTests}
            consoleOutput={p.logs}
            onClearConsole={p.onClearLogs}
            timerLabel={p.timer.display}
            timerStatus={p.timer.running ? 'running' : 'paused'}
          />
        </div>

        <div className="flex justify-center mb-6">
          <Button size="lg" onClick={() => editorRef.current?.enterFullscreen()} className="px-8 py-3">
            <Play className="h-5 w-5 mr-2" aria-hidden />
            Перейти к решению
          </Button>
        </div>

        {role === 'interviewer' && task.commonMistakes && task.commonMistakes.length > 0 && (
          <section className="mt-6 border rounded-lg p-4" aria-label="Типичные ошибки">
            <h3 className="text-sm font-medium mb-2">Типичные ошибки</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {task.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </section>
        )}
        {role === 'interviewer' && task.solution && <ReferenceSolution solution={task.solution} language={language} />}
        {role === 'interviewer' && (
          <ScorePanel
            score={solution.score}
            comment={solution.comment}
            rubric={task.rubric}
            rubricDone={solution.rubricDone ?? []}
            hintsUsed={solution.hintsUsed ?? 0}
            onRubric={p.onRubric}
            onScore={p.onScore}
            onComment={p.onComment}
            onSend={p.onSendScore}
          />
        )}
        <ResultsPanel results={solution.lastResult ?? []} tests={task.tests} role={role} />
      </div>
    </>
  )
}
