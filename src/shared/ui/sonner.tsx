"use client"

import { Toaster as Sonner } from "sonner"
import { useTheme } from "@/shared/hooks/use-theme"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()
  return (
    <Sonner
      theme={theme === "light" ? "light" : "dark"}
      position="bottom-right"
      offset={40}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-sm group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:font-mono group-[.toaster]:text-xs group-[.toaster]:text-foreground group-[.toaster]:shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)]",
          title: "group-[.toast]:font-bold",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:leading-relaxed",
          success: "group-[.toaster]:[&_[data-icon]]:text-ok",
          error: "group-[.toaster]:[&_[data-icon]]:text-ansi-red",
          warning: "group-[.toaster]:[&_[data-icon]]:text-ansi-yellow",
          info: "group-[.toaster]:[&_[data-icon]]:text-ansi-blue",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
