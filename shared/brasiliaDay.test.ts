import { describe, expect, it } from 'vitest'
import { brasiliaDate, msUntilNextBrasiliaMidnight, puzzleNumber } from './brasiliaDay.ts'

describe('brasiliaDate', () => {
  it('vira à meia-noite de Brasília, não à de UTC', () => {
    expect(brasiliaDate(new Date('2026-10-02T02:59:59Z'))).toBe('2026-10-01')
    expect(brasiliaDate(new Date('2026-10-02T03:00:00Z'))).toBe('2026-10-02')
  })
})

describe('puzzleNumber', () => {
  it('o dia do lançamento é o jogo 1', () => {
    expect(puzzleNumber('2026-11-01', '2026-11-01')).toBe(1)
    expect(puzzleNumber('2026-11-30', '2026-11-01')).toBe(30)
    expect(puzzleNumber('2027-01-01', '2026-12-31')).toBe(2)
  })
})

describe('msUntilNextBrasiliaMidnight', () => {
  it('conta até 03:00 UTC do dia seguinte', () => {
    expect(msUntilNextBrasiliaMidnight(new Date('2026-10-01T23:00:00Z'))).toBe(4 * 3_600_000)
    expect(msUntilNextBrasiliaMidnight(new Date('2026-10-02T01:00:00Z'))).toBe(2 * 3_600_000)
  })
})
