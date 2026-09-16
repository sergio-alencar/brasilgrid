export const MAX_GUESSES = 10
export const EMPTY_CELL_SCORE = 100

export type RarityBand = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'empty'

export interface BandInfo {
  band: RarityBand
  label: string
  emoji: string
  minPercent: number
}

// Faixas do Geogrid; revisar depois do lançamento (com 27 UFs os % tendem a ser maiores).
export const BANDS: readonly BandInfo[] = [
  { band: 'common', label: 'Comum', emoji: '🟩', minPercent: 25 },
  { band: 'uncommon', label: 'Incomum', emoji: '🔷', minPercent: 10 },
  { band: 'rare', label: 'Raro', emoji: '⚡', minPercent: 5 },
  { band: 'epic', label: 'Épico', emoji: '🌈', minPercent: 2 },
  { band: 'legendary', label: 'Lendário', emoji: '💎', minPercent: 0.5 },
  { band: 'mythic', label: 'Mítico', emoji: '🦄', minPercent: 0 },
]

export const EMPTY_BAND: BandInfo = { band: 'empty', label: 'Vazio', emoji: '⬛', minPercent: 0 }

/** % de jogadores que usaram essa UF nessa célula; null = célula vazia. */
export function pickPercent(picks: number, players: number): number {
  if (players <= 0) return 0
  return (picks / players) * 100
}

export function bandFor(percent: number | null): BandInfo {
  if (percent === null) return EMPTY_BAND
  return BANDS.find((b) => percent >= b.minPercent) ?? BANDS[BANDS.length - 1]
}

/** Raridade total: soma dos % das células; vazia vale 100. Menor é melhor. */
export function rarityScore(cells: readonly (number | null)[]): number {
  const total = cells.reduce<number>((sum, p) => sum + (p === null ? EMPTY_CELL_SCORE : p), 0)
  return Math.round(total)
}
