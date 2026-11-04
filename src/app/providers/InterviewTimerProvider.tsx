import { createContext, useContext, type ReactNode } from 'react'
import { useToast } from '@/shared/hooks/use-sonner'
import { useTimer } from '@/shared/hooks/use-timer'
import { formatSeconds } from '@/shared/lib/timer'
import { KEYS } from '@/shared/storage/storage'

type InterviewTimer = ReturnType<typeof useTimer>

const TimerContext = createContext<InterviewTimer | null>(null)

/** Глобальный таймер интервью — один на приложение: им управляют и панель разделов, и консоль. */
export function InterviewTimerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  // по умолчанию выключен, переживает перезагрузку
  const timer = useTimer({
    storageKey: KEYS.interviewTimer,
    defaults: { mode: 'up', limitSec: 3600 },
    onEvent: (event, remaining) => {
      if (event === 'half') toast.info('Половина времени прошла', `Осталось ~ ${formatSeconds(remaining)}`)
      if (event === 'tenPercent') toast.warning('Меньше 10% времени', `Осталось ~ ${formatSeconds(remaining)}`)
      if (event === 'expired') toast.error('Время истекло', 'Глобальный таймер остановлен')
    },
  })
  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>
}

export function useInterviewTimer(): InterviewTimer {
  const timer = useContext(TimerContext)
  if (!timer) throw new Error('useInterviewTimer вне InterviewTimerProvider')
  return timer
}
