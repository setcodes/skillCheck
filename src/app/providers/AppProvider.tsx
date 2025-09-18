import React, { createContext, useContext, useState, useEffect } from 'react'
import type { UserRole } from '@/entities/user/model/types'
import type { Profession } from '@/entities/profession/model/types'

interface AppContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  prof: Profession
  setProf: (prof: Profession) => void
  selectedProf: Profession | null
  setSelectedProf: (prof: Profession | null) => void
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
  const [prof, setProf] = useState<Profession>(() => 
    (localStorage.getItem('prof') as Profession) || 'frontend'
  )
  const [selectedProf, setSelectedProf] = useState<Profession | null>(null)

  const saveRole = (newRole: UserRole) => {
    setRole(newRole)
    localStorage.setItem('role', newRole)
  }

  const saveProf = (newProf: Profession) => {
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
        selectedProf, 
        setSelectedProf 
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
