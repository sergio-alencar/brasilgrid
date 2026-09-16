import { describe, expect, it } from 'vitest'
import { UFS, isUfCode } from './ufs.ts'

describe('UFS', () => {
  it('tem 27 UFs com siglas e códigos IBGE únicos', () => {
    expect(UFS).toHaveLength(27)
    expect(new Set(UFS.map((u) => u.code)).size).toBe(27)
    expect(new Set(UFS.map((u) => u.ibgeId)).size).toBe(27)
  })

  it('distribui as UFs pelas regiões do IBGE', () => {
    const count = (r: string) => UFS.filter((u) => u.region === r).length
    expect([count('N'), count('NE'), count('CO'), count('SE'), count('S')]).toEqual([7, 9, 4, 4, 3])
  })

  it('reconhece siglas válidas', () => {
    expect(isUfCode('SP')).toBe(true)
    expect(isUfCode('XX')).toBe(false)
  })
})
