import React, { useRef, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { Button } from '@/shared/ui/button'
import { Wand2, Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import * as prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import parserHtml from 'prettier/parser-html'
import parserCss from 'prettier/parser-postcss'
import parserYaml from 'prettier/parser-yaml'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  className?: string
  placeholder?: string
  onFullscreenChange?: (isFullscreen: boolean) => void
}

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '300px',
  className,
  placeholder = 'Введите ваш код здесь...',
  onFullscreenChange
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

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
    return (
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
        
        <div className="flex-1">
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
      </div>
    )
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
}
