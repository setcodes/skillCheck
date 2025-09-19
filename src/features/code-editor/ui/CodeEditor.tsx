import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { Editor } from '@monaco-editor/react'
import { Button } from '@/shared/ui/button'
import { Wand2, Maximize2, Minimize2, X, Play, RotateCcw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import * as prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import parserHtml from 'prettier/parser-html'
import parserCss from 'prettier/parser-postcss'
import parserYaml from 'prettier/parser-yaml'

export type CodeEditorHandle = {
  enterFullscreen: () => void
}

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  className?: string
  placeholder?: string
  onFullscreenChange?: (isFullscreen: boolean) => void
  // fullscreen actions (optional)
  onRun?: () => void
  onResetTask?: () => void
  onResetTests?: () => void
  consoleOutput?: string[]
  onClearConsole?: () => void
}

const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '300px',
  className,
  placeholder = 'Введите ваш код здесь...',
  onFullscreenChange,
  onRun,
  onResetTask,
  onResetTests,
  consoleOutput,
  onClearConsole
}: CodeEditorProps, ref) {
  const editorRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showConsole, setShowConsole] = useState(true)
  const consoleRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!showConsole) return
    const el = consoleRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [consoleOutput, showConsole])
  useEffect(() => {
    if (Array.isArray(consoleOutput) && consoleOutput.length > 0) {
      setShowConsole(true)
    }
  }, [consoleOutput])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Настройка темы
    monaco.editor.defineTheme('customTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#f8fafc',
        'editor.foreground': '#1e293b',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editor.selectionBackground': '#e2e8f0',
        'editor.inactiveSelectionBackground': '#f1f5f9',
        'editorCursor.foreground': '#1e293b',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#64748b',
        'editorIndentGuide.background': '#e2e8f0',
        'editorIndentGuide.activeBackground': '#cbd5e1',
      }
    })

    monaco.editor.setTheme('customTheme')

    // Настройка для темной темы
    monaco.editor.defineTheme('customThemeDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e293b',
        'editor.foreground': '#f1f5f9',
        'editor.lineHighlightBackground': '#334155',
        'editor.selectionBackground': '#475569',
        'editor.inactiveSelectionBackground': '#334155',
        'editorCursor.foreground': '#f1f5f9',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#94a3b8',
        'editorIndentGuide.background': '#334155',
        'editorIndentGuide.activeBackground': '#475569',
      }
    })

    // Автоматическое определение темы
    const isDark = document.documentElement.classList.contains('dark')
    monaco.editor.setTheme(isDark ? 'customThemeDark' : 'customTheme')

    // Слушатель изменения темы
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      monaco.editor.setTheme(isDark ? 'customThemeDark' : 'customTheme')
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    // Добавляем горячие клавиши для форматирования
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      formatCode()
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '')
  }

  const toggleFullscreen = () => {
    const newFullscreen = !isFullscreen
    setIsFullscreen(newFullscreen)
    onFullscreenChange?.(newFullscreen)
  }

  useImperativeHandle(ref, () => ({
    enterFullscreen: () => {
      if (!isFullscreen) {
        setIsFullscreen(true)
        onFullscreenChange?.(true)
      }
    }
  }), [isFullscreen, onFullscreenChange])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      toggleFullscreen()
    }
  }

  const formatCode = async () => {
    if (!editorRef.current) return

    try {
      const currentValue = editorRef.current.getValue()
      if (!currentValue.trim()) return

      let formattedCode = currentValue

      // Форматирование в зависимости от языка
      switch (language) {
        case 'javascript':
        case 'typescript':
          formattedCode = await prettier.format(currentValue, {
            parser: 'babel',
            plugins: [parserBabel],
            semi: true,
            singleQuote: true,
            tabWidth: 2,
            trailingComma: 'es5',
          })
          break
        case 'html':
          formattedCode = await prettier.format(currentValue, {
            parser: 'html',
            plugins: [parserHtml],
            tabWidth: 2,
            printWidth: 80,
          })
          break
        case 'css':
          formattedCode = await prettier.format(currentValue, {
            parser: 'css',
            plugins: [parserCss],
            tabWidth: 2,
          })
          break
        case 'yaml':
          formattedCode = await prettier.format(currentValue, {
            parser: 'yaml',
            plugins: [parserYaml],
            tabWidth: 2,
          })
          break
        case 'java':
          // Для Java используем простое форматирование
          formattedCode = currentValue
            .split('\n')
            .map((line: string) => line.trim())
            .join('\n')
            .replace(/\{\s*\n/g, ' {\n')
            .replace(/\n\s*\}/g, '\n}')
            .replace(/;\s*\n/g, ';\n')
          break
        case 'sql':
          // Для SQL используем простое форматирование
          formattedCode = currentValue
            .replace(/\bSELECT\b/gi, '\nSELECT')
            .replace(/\bFROM\b/gi, '\nFROM')
            .replace(/\bWHERE\b/gi, '\nWHERE')
            .replace(/\bJOIN\b/gi, '\nJOIN')
            .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
            .replace(/\bORDER BY\b/gi, '\nORDER BY')
            .replace(/\bHAVING\b/gi, '\nHAVING')
            .trim()
          break
        default:
          return
      }

      // Обновляем содержимое редактора
      editorRef.current.setValue(formattedCode)
      onChange(formattedCode)
    } catch (error) {
      console.error('Ошибка форматирования кода:', error)
    }
  }

  if (isFullscreen) {
    const overlay = (
      <div 
        className="fixed inset-0 z-50 bg-background flex flex-col"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Fullscreen Toolbar */}
        <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">
              {language.toUpperCase()} Editor - Полноэкранный режим
            </div>
            <div className="text-xs text-muted-foreground">
              Нажмите ESC для выхода
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {typeof onRun === 'function' && (
              <Button
                variant="default"
                size="sm"
                onClick={onRun}
                className="h-8 px-3 text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Запустить
              </Button>
            )}
            {typeof onResetTests === 'function' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetTests}
                className="h-8 px-3 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Очистить тесты
              </Button>
            )}
            {typeof consoleOutput !== 'undefined' && (
              <Button
                variant={showConsole ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowConsole(s => !s)}
                className="h-8 px-3 text-xs"
              >
                Консоль {showConsole ? '▾' : '▸'}
              </Button>
            )}
            {typeof consoleOutput !== 'undefined' && consoleOutput && consoleOutput.length>0 && typeof onClearConsole==='function' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearConsole}
                className="h-8 px-3 text-xs"
              >
                Очистить консоль
              </Button>
            )}
            {typeof onResetTask === 'function' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetTask}
                className="h-8 px-3 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Сбросить задачу
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={formatCode}
              className="h-8 px-3 text-xs"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Format
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 px-3 text-xs"
            >
              <Minimize2 className="h-3 w-3 mr-1" />
              Выйти
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 flex">
          <div className="flex-1 min-w-0">
            <Editor
              height="100%"
              language={language}
              value={value}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 16,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                },
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                padding: { top: 20, bottom: 20 },
                quickSuggestions: {
                  other: 'on',
                  comments: 'off',
                  strings: 'on',
                },
                parameterHints: {
                  enabled: true,
                },
                hover: {
                  enabled: true,
                },
                contextmenu: true,
                mouseWheelZoom: true,
                cursorBlinking: 'blink',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
              }}
            />
          </div>
          {typeof consoleOutput !== 'undefined' && showConsole && (
            <div className="w-[28rem] max-w-full border-l bg-muted/40 flex flex-col">
              <div className="px-3 py-2 text-xs border-b flex items-center justify-between">
                <span className="text-muted-foreground">Консоль</span>
                {typeof onClearConsole==='function' && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onClearConsole}>Очистить</Button>
                )}
              </div>
              <div ref={consoleRef} className="flex-1 overflow-auto p-2 text-xs font-mono">
                {Array.isArray(consoleOutput) && consoleOutput.length>0 ? (
                  consoleOutput.map((line, i)=> (
                    <div key={i} className="whitespace-pre-wrap text-muted-foreground">{line}</div>
                  ))
                ) : (
                  <div className="text-muted-foreground/70">Консоль пуста</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
    // Рендерим оверлей через портал, чтобы не влияли overflow/stacking контексты предков
    return createPortal(overlay, document.body)
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
        <div className="text-xs text-muted-foreground">
          {language.toUpperCase()} Editor
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={formatCode}
            className="h-7 px-2 text-xs"
          >
            <Wand2 className="h-3 w-3 mr-1" />
            Format
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-7 px-2 text-xs"
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Полный экран
          </Button>
        </div>
      </div>
      
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          quickSuggestions: {
            other: 'on',
            comments: 'off',
            strings: 'on',
          },
          parameterHints: {
            enabled: true,
          },
          hover: {
            enabled: true,
          },
          contextmenu: true,
          mouseWheelZoom: true,
          cursorBlinking: 'blink',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
        }}
      />
    </div>
  )
})

export default CodeEditor
