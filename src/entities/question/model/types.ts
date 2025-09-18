export interface TheoryQuestion {
  id: string
  title: string
  category: string
  difficulty: number
  bucket: 'screening' | 'deep' | 'architecture'
  prompt: string
  answer: string
}
