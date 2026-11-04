import { useEffect, useRef } from 'react'
import { Editor, type BeforeMount, type OnMount } from '@monaco-editor/react'
import { useTheme } from '@/shared/hooks/use-theme'
import { tokenHex } from '@/shared/lib/theme-colors'

type Monaco = Parameters<BeforeMount>[0]
type EditorInstance = Parameters<OnMount>[0]

/** Тема Monaco из токенов текущей темы приложения: фон окна, ANSI-цвета для синтаксиса. */
function defineTheme(monaco: Monaco) {
  const dark = document.documentElement.classList.contains('dark')
  const hex = (name: string) => tokenHex(name).slice(1)
  monaco.editor.defineTheme('skillcheck', {
    base: dark ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: hex('--ansi-blue') },
      { token: 'string', foreground: hex('--ansi-yellow') },
      { token: 'number', foreground: hex('--ansi-magenta') },
      { token: 'type', foreground: hex('--ansi-cyan') },
      { token: 'comment', foreground: hex('--muted-foreground'), fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': tokenHex('--background'),
      'editor.foreground': tokenHex('--foreground'),
      'editorLineNumber.foreground': tokenHex('--muted-foreground') + '80',
      'editorLineNumber.activeForeground': tokenHex('--foreground'),
      'editor.lineHighlightBackground': tokenHex('--card'),
      'editor.lineHighlightBorder': tokenHex('--card'),
      'editor.selectionBackground': tokenHex('--primary') + '40',
      'editorCursor.foreground': tokenHex('--primary'),
      'editorIndentGuide.background1': tokenHex('--border'),
      'editorWidget.background': tokenHex('--popover'),
      'editorWidget.border': tokenHex('--border'),
      'editorSuggestWidget.background': tokenHex('--popover'),
      'editorSuggestWidget.selectedBackground': tokenHex('--accent'),
    },
  })
}

async function formatCode(code: string, language: string): Promise<string> {
  // Prettier грузим по требованию — он не нужен для старта страницы
  const [prettier, estree, babel, ts] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/estree'),
    import('prettier/plugins/babel'),
    import('prettier/plugins/typescript'),
  ])
  return prettier.format(code, {
    parser: language === 'typescript' ? 'typescript' : 'babel',
    plugins: [estree, babel, ts],
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
  })
}

interface Props {
  value: string
  language: string
  onChange: (value: string) => void
  onRun: () => void
  /** доступное имя области редактора */
  label: string
  readOnly?: boolean
}

export function ThemedEditor({ value, language, onChange, onRun, label, readOnly = false }: Props) {
  const { theme } = useTheme()
  const monacoRef = useRef<Monaco | null>(null)
  const editorRef = useRef<EditorInstance | null>(null)
  const runRef = useRef(onRun)
  runRef.current = onRun

  useEffect(() => {
    const monaco = monacoRef.current
    if (!monaco) return
    defineTheme(monaco)
    monaco.editor.setTheme('skillcheck')
  }, [theme])

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current())
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, async () => {
      try {
        const formatted = await formatCode(editor.getValue(), language)
        editor.setValue(formatted)
      } catch {
        // синтаксическая ошибка — оставляем код как есть, её покажут проверки
      }
    })
  }

  return (
    <div className="h-full min-h-0" aria-label={label} role="group">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        beforeMount={(monaco) => {
          monacoRef.current = monaco
          defineTheme(monaco)
        }}
        onMount={onMount}
        theme="skillcheck"
        loading={<span className="p-4 font-mono text-xs text-muted-foreground">загружаю редактор…</span>}
        options={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 14,
          lineHeight: 22,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: 'line',
          overviewRulerLanes: 0,
          padding: { top: 16, bottom: 16 },
          tabSize: 2,
          insertSpaces: true,
          automaticLayout: true,
          readOnly,
          wordWrap: 'on',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        }}
      />
    </div>
  )
}
