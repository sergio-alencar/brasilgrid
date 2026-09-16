import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../data/categories/index.ts'
import type { UfCode } from '../data/categories/ufData.ts'
import { loadUfs } from './lib/loadUfs.ts'
import { validateCategories } from './lib/validateCategories.ts'

const ufs = loadUfs()

describe('categorias', () => {
  it('passam na validação e na dupla checagem', () => {
    expect(validateCategories(CATEGORIES, ufs).errors).toEqual([])
  })

  it('litoral e sem litoral se complementam', () => {
    const coast = CATEGORIES.find((c) => c.id === 'has-coastline')!.members
    const land = CATEGORIES.find((c) => c.id === 'landlocked')!.members
    expect(coast.filter((c) => land.includes(c))).toEqual([])
    expect(coast.length + land.length).toBe(27)
  })

  it('regiões particionam as 27 UFs', () => {
    const regions = CATEGORIES.filter((c) => c.family === 'regions').flatMap((c) => c.members)
    expect(new Set(regions).size).toBe(27)
    expect(regions).toHaveLength(27)
  })

  it('o validador detecta gabarito errado', () => {
    const wrong = { ...CATEGORIES.find((c) => c.id === 'borders-bolivia')!, members: ['AC', 'MS', 'MT', 'PR'] as UfCode[] }
    expect(validateCategories([wrong], ufs).errors[0]).toMatch(/faltam: \[RO\], sobram: \[PR\]/)
  })
})
