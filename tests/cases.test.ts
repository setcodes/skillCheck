import { describe, it, expect } from 'vitest'
import { transform } from 'sucrase'
import raw from '@/shared/cases/frontend.json'
import { CaseSchema } from '@/shared/bank/case-schema'
import { getCases } from '@/shared/bank/cases'

const cases = getCases('frontend')

describe('кейсы Frontend', () => {
  it('все кейсы проходят схему, id уникальны', () => {
    expect(() => CaseSchema.array().parse(raw)).not.toThrow()
    expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length)
  })

  it('есть и ревью, и live coding, на разных уровнях', () => {
    expect(cases.some((c) => c.kind === 'review')).toBe(true)
    expect(cases.some((c) => c.kind === 'live')).toBe(true)
    expect(new Set(cases.map((c) => c.level)).size).toBeGreaterThanOrEqual(3)
  })

  it('review-кейсы: достаточно находок, есть критичные, у каждой — последствие и исправление', () => {
    for (const c of cases.filter((x) => x.kind === 'review')) {
      expect(c.issues.length, c.id).toBeGreaterThanOrEqual(8)
      expect(c.issues.filter((i) => i.risk === 'critical').length, c.id).toBeGreaterThanOrEqual(3)
      for (const i of c.issues) {
        expect(i.consequence.length, `${c.id}: ${i.title}`).toBeGreaterThan(20)
        expect(i.fix.length, `${c.id}: ${i.title}`).toBeGreaterThan(10)
      }
      expect(c.testsToMention.length, c.id).toBeGreaterThan(0)
    }
  })

  it('код во всех файлах кейсов синтаксически валиден (TS/TSX)', () => {
    for (const c of cases) {
      for (const f of [...c.files, ...c.solution]) {
        const transforms = f.language === 'tsx' ? (['typescript', 'jsx'] as const) : (['typescript'] as const)
        expect(() => transform(f.code, { transforms: [...transforms], disableESTransforms: true }), `${c.id}/${f.name}`).not.toThrow()
      }
    }
  })

  it('live-кейсы с эталоном: решение не совпадает со стартовым шаблоном', () => {
    for (const c of cases.filter((x) => x.solution.length)) {
      expect(c.solution[0].code).not.toBe(c.files[0]?.code)
    }
  })
})
