import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { Download, RotateCcw, Upload } from 'lucide-react'
import { useApp } from '@/app/providers/AppProvider'
import { exportBank, importBank, MAX_IMPORT_BYTES, resetBank, useQuestions, useTasks } from '@/shared/bank'
import { useToast } from '@/shared/hooks/use-sonner'
import { cn } from '@/shared/lib/utils'
import { InspectorSection } from '@/shared/ui/inspector-section'
import { ToolButton } from '@/shared/ui/tool-button'

type LogLine = { id: number; text: string; tone: 'ok' | 'error' | 'muted' }

function Command({ cmd, children, hint }: { cmd: string; hint: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-sm border bg-card px-4 py-4">
      <p className="text-muted-foreground">
        <span className="text-primary-text" aria-hidden>$ </span>
        {cmd}
      </p>
      <p className="font-sans text-[0.9rem] leading-relaxed text-muted-foreground">{hint}</p>
      {children}
    </section>
  )
}

const now = () => new Date().toLocaleTimeString('ru-RU')

export default function DataHubPage() {
  const { prof } = useApp()
  const { toast } = useToast()
  const questions = useQuestions(prof)
  const tasks = useTasks(prof)
  const [log, setLog] = useState<LogLine[]>([])
  const [dragging, setDragging] = useState(false)
  const nextId = useRef(1)
  const fileRef = useRef<HTMLInputElement>(null)

  const write = (text: string, tone: LogLine['tone']) => setLog((l) => [...l, { id: nextId.current++, text: `[${now()}] ${text}`, tone }].slice(-50))

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(exportBank(prof), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bank-${prof}.json`
    a.click()
    URL.revokeObjectURL(url)
    write(`export → bank-${prof}.json: вопросов ${questions.length}, задач ${tasks.length}`, 'ok')
    toast.success('Экспортировано', `Данные ${prof} экспортированы в файл.`)
  }

  const importFile = async (file: File) => {
    if (file.size > MAX_IMPORT_BYTES) {
      write(`import ${file.name}: файл больше ${MAX_IMPORT_BYTES / 1024 / 1024} МБ`, 'error')
      toast.error('Файл слишком большой', `Максимум ${MAX_IMPORT_BYTES / 1024 / 1024} МБ`)
      return
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(await file.text())
    } catch {
      write(`import ${file.name}: неверный JSON`, 'error')
      toast.error('Ошибка', 'Неверный формат JSON файла.')
      return
    }
    const report = importBank(prof, parsed)
    const q = report.questions
    const t = report.tasks
    const imported = q.added + q.updated + t.added + t.updated
    const rejected = q.rejected + t.rejected
    if (imported === 0) {
      write(`import ${file.name}: ничего не импортировано — ${report.errors[0] ?? 'нет подходящих записей'}`, 'error')
      toast.error('Ничего не импортировано', report.errors[0] ?? 'Нет подходящих записей')
      return
    }
    write(`import ${file.name}: вопросы +${q.added}, обновлено ${q.updated}; задачи +${t.added}, обновлено ${t.updated}`, 'ok')
    for (const err of report.errors.slice(0, 5)) write(`  отклонено: ${err}`, 'error')
    if (report.errors.length > 5) write(`  …и ещё ${report.errors.length - 5}`, 'muted')
    toast.success(
      'Импортировано',
      `Вопросы: +${q.added}, обновлено ${q.updated}. Задачи: +${t.added}, обновлено ${t.updated}.` + (rejected ? ` Отклонено: ${rejected} (${report.errors[0]})` : '')
    )
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void importFile(file)
  }

  const resetToDefaults = () => {
    if (!window.confirm('Сбросить импортированные вопросы и задачи к встроенной базе?')) return
    resetBank(prof)
    write('reset: банк возвращён к встроенному', 'ok')
    toast.info('Сброшено', `Банк ${prof} сброшен к встроенному`)
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <div className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
        <div className="flex h-9 shrink-0 items-stretch border-b bg-card font-mono">
          <span className="flex items-center border-r bg-background px-3 text-xs text-foreground shadow-[inset_0_2px_0_hsl(var(--primary))]">bank-{prof}.json</span>
        </div>
        <div className="flex-1 bg-background lg:min-h-0 lg:overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 px-5 py-8 font-mono text-[0.85rem] sm:px-8">
            <header className="space-y-2">
              <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">Импорт / Экспорт — {prof}</h1>
              <p className="font-sans text-base leading-relaxed text-muted-foreground">
                Сейчас в банке: <span className="tabular-nums text-foreground">{questions.length}</span> вопросов и{' '}
                <span className="tabular-nums text-foreground">{tasks.length}</span> задач. Данные хранятся в браузере.
              </p>
            </header>

            <Command cmd={`skillcheck export > bank-${prof}.json`} hint="Сохранить текущий банк вопросов и задач в файл — для резервной копии или переноса в другой браузер.">
              <ToolButton variant="primary" onClick={exportJSON} className="h-8 px-3">
                <Download aria-hidden />
                Экспортировать
              </ToolButton>
            </Command>

            <Command cmd="skillcheck import <file.json>" hint="Записи с тем же id заменяют встроенные, остальные добавляются; невалидные отклоняются с причиной в логе.">
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-4 py-8 text-center transition-colors',
                  dragging ? 'border-primary bg-primary/10' : 'bg-background'
                )}
              >
                <Upload className="h-5 w-5 text-muted-foreground" aria-hidden />
                <p className="text-muted-foreground">перетащите JSON-файл сюда или</p>
                <ToolButton onClick={() => fileRef.current?.click()}>Импортировать</ToolButton>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  className="sr-only"
                  tabIndex={-1}
                  aria-label="Файл банка в формате JSON"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = '' // чтобы можно было выбрать тот же файл повторно
                    if (file) void importFile(file)
                  }}
                />
                <p className="text-xs text-muted-foreground">до {MAX_IMPORT_BYTES / 1024 / 1024} МБ</p>
              </div>
            </Command>

            <Command cmd="skillcheck reset" hint="Убрать всё импортированное и вернуть встроенный банк. Оценки и решения не затрагиваются.">
              <ToolButton onClick={resetToDefaults} className="h-8 border-ansi-red px-3 text-ansi-red hover:border-ansi-red hover:bg-ansi-red/10 hover:text-ansi-red">
                <RotateCcw aria-hidden />
                Сбросить к базе
              </ToolButton>
            </Command>

            <section aria-label="Журнал операций" className="rounded-sm border bg-card">
              <p className="border-b px-4 py-2 text-xs text-muted-foreground">журнал</p>
              <div className="space-y-0.5 px-4 py-3" aria-live="polite">
                {log.length === 0 ? (
                  <p className="text-muted-foreground">пока пусто — здесь появятся результаты экспорта, импорта и сброса</p>
                ) : (
                  log.map((l) => (
                    <p key={l.id} className={cn('whitespace-pre-wrap break-words', l.tone === 'ok' ? 'text-ok' : l.tone === 'error' ? 'text-ansi-red' : 'text-muted-foreground')}>
                      {l.text}
                    </p>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <aside aria-label="Инспектор" className="shrink-0 border-t bg-card font-mono lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0 2xl:w-96">
        <InspectorSection label="Форматы импорта" title="Форматы импорта">
          <div className="space-y-3 leading-relaxed text-muted-foreground">
            <p>Объект с вопросами и задачами:</p>
            <pre className="rounded-sm bg-background p-2 text-xs text-foreground">{'{ "questions": [...],\n  "tasks": [...] }'}</pre>
            <p>или просто массив вопросов:</p>
            <pre className="rounded-sm bg-background p-2 text-xs text-foreground">{'[{ id, level, category,\n   question, answer }]'}</pre>
            <p>Данные хранятся в браузере и не теряются при обновлении встроенной базы.</p>
          </div>
        </InspectorSection>
      </aside>
    </div>
  )
}
