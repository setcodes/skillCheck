import React, { createContext, useContext, useState, useEffect } from 'react'
import type { UserRole } from '@/entities/user/model/types'
import type { Profession } from '@/entities/profession/model/types'
import { DEFAULT_PROFESSION, isProfessionEnabled } from '@/entities/profession/model/constants'

interface AppContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  prof: Profession
  setProf: (prof: Profession) => void
}

const AppContext = createContext<AppContextType>(null as any)

export const useApp = () => useContext(AppContext)

interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [role, setRole] = useState<UserRole>(() => 
    (localStorage.getItem('role') as UserRole) || 'interviewer'
  )
  const [prof, setProf] = useState<Profession>(() => {
    const saved = localStorage.getItem('prof')
    return isProfessionEnabled(saved) ? saved : DEFAULT_PROFESSION
  })

  const saveRole = (newRole: UserRole) => {
    setRole(newRole)
    localStorage.setItem('role', newRole)
  }

  const saveProf = (newProf: Profession) => {
    if (!isProfessionEnabled(newProf)) return
    setProf(newProf)
    localStorage.setItem('prof', newProf)
  }

  return (
    <AppContext.Provider 
      value={{ 
        role, 
        setRole: saveRole, 
        prof, 
        setProf: saveProf, 
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
