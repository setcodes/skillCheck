import { useSyncExternalStore } from 'react'
import type { Profession } from '@/entities/profession/model/types'
import type { Case } from '@/entities/case/model/types'
import FRONTEND_CASES from '@/shared/cases/frontend.json'
import { CaseSchema } from './case-schema'

// Кейсы (ревью чужого кода и live coding) — только встроенный банк, без пользовательского overlay.
const BUILTIN: Partial<Record<Profession, Case[]>> = {
  frontend: CaseSchema.array().parse(FRONTEND_CASES),
}

const EMPTY: Case[] = []

export const getCases = (prof: Profession): Case[] => BUILTIN[prof] ?? EMPTY

export const useCases = (prof: Profession) =>
  useSyncExternalStore(
    () => () => {},
    () => getCases(prof)
  )
