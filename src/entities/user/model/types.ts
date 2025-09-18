export type UserRole = 'interviewer' | 'candidate'

export interface User {
  role: UserRole
  name?: string
  position?: string
  notes?: string
}
