import { toast as sonnerToast } from "sonner"

export const toast = {
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
    })
  },
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
    })
  },
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
    })
  },
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
    })
  },
  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
    })
  },
  custom: (jsx: React.ReactNode) => {
    return sonnerToast.custom(jsx as any)
  },
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId)
  },
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}

export const useToast = () => ({ toast })
