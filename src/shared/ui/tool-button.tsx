import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

type Variant = 'outline' | 'primary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  outline: 'border text-muted-foreground hover:border-primary hover:text-foreground',
  primary: 'bg-primary font-medium text-primary-foreground hover:opacity-90',
  ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

/** Компактная кнопка в терминальной стилистике: панели инструментов, строки вкладок, инспектор. */
export const ToolButton = forwardRef<HTMLButtonElement, Props>(function ToolButton(
  { variant = 'outline', className, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-2 font-mono text-xs transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:shrink-0',
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  )
})
