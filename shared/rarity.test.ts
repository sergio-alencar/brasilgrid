import { describe, expect, it } from 'vitest'
import { bandFor, pickPercent, rarityScore } from './rarity.ts'

describe('bandFor', () => {
  it.each([
    [80, 'common'],
    [25, 'common'],
    [24.9, 'uncommon'],
    [10, 'uncommon'],
    [5, 'rare'],
    [2, 'epic'],
    [0.5, 'legendary'],
    [0.49, 'mythic'],
    [0, 'mythic'],
  ])('%s%% → %s', (percent, band) => {
    expect(bandFor(percent).band).toBe(band)
  })

  it('célula vazia', () => {
    expect(bandFor(null).band).toBe('empty')
  })
})

describe('rarityScore', () => {
  it('soma os % e conta 100 por célula vazia', () => {
    expect(rarityScore([10, 20, null, 5, 5, 5, null, 1, 0.4])).toBe(Math.round(10 + 20 + 100 + 15 + 100 + 1.4))
  })

  it('grade vazia vale 900', () => {
    expect(rarityScore(Array(9).fill(null))).toBe(900)
  })
})

describe('pickPercent', () => {
  it('calcula sobre o total de jogadores', () => {
    expect(pickPercent(25, 200)).toBe(12.5)
    expect(pickPercent(3, 0)).toBe(0)
  })
})
