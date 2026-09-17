import { describe, expect, it } from 'vitest'
import { buildShareText } from './shareText.ts'
import { UFS } from './ufs.ts'

const input = {
  puzzleNumber: 42,
  cellPercents: [30, 12, 6, 40, null, 0.8, 3, 50, 11],
  score: 253,
  url: 'https://brasilgrid.com.br/r/k3x9a',
}

describe('buildShareText', () => {
  it('monta o texto com a grade de faixas', () => {
    expect(buildShareText(input)).toBe(
      ['BrasilGrid #42 🇧🇷', '✅ 8/9 · Raridade 253', '🟩🔷⚡', '🟩⬛💎', '🌈🟩🔷', 'https://brasilgrid.com.br/r/k3x9a'].join('\n'),
    )
  })

  it('não revela nenhum nome nem sigla de UF', () => {
    const text = buildShareText(input)
    const words = new Set(text.split(/[^\p{L}]+/u).filter(Boolean))
    for (const uf of UFS) {
      expect(text.toLowerCase()).not.toContain(uf.name.toLowerCase())
      expect(words.has(uf.code)).toBe(false)
    }
  })
})
