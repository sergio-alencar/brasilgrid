import { describe, expect, it } from 'vitest'
import { streaks } from './streak.ts'

describe('streaks', () => {
  it('conta a sequência atual até hoje', () => {
    expect(streaks(['2026-10-01', '2026-10-02', '2026-10-03'], '2026-10-03')).toEqual({ current: 3, longest: 3 })
  })

  it('mantém a sequência se o último jogo foi ontem', () => {
    expect(streaks(['2026-10-01', '2026-10-02'], '2026-10-03')).toEqual({ current: 2, longest: 2 })
  })

  it('zera a atual depois de um dia sem jogar, mas guarda a maior', () => {
    expect(streaks(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-06'], '2026-10-08')).toEqual({
      current: 0,
      longest: 3,
    })
  })

  it('funciona na virada de mês e sem jogos', () => {
    expect(streaks(['2026-10-31', '2026-11-01'], '2026-11-01').current).toBe(2)
    expect(streaks([], '2026-11-01')).toEqual({ current: 0, longest: 0 })
  })
})
