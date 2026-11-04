export type Profession = 'frontend' | 'backend-java' | 'analyst' | 'devops'

export interface ProfessionInfo {
  id: Profession
  title: string
  subtitle: string
  status: 'active' | 'soon'
}
