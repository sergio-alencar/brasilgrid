import { bandFor } from './rarity.ts'

export interface ShareInput {
  puzzleNumber: number
  /** 9 células em ordem de leitura; null = vazia. */
  cellPercents: readonly (number | null)[]
  score: number
  url: string
}

// Só faixas e números: nunca nome, sigla ou bandeira de UF.
export function buildShareText({ puzzleNumber, cellPercents, score, url }: ShareInput): string {
  const correct = cellPercents.filter((p) => p !== null).length
  const rows: string[] = []
  for (let r = 0; r < 3; r++) {
    rows.push(cellPercents.slice(r * 3, r * 3 + 3).map((p) => bandFor(p).emoji).join(''))
  }
  return [`BrasilGrid #${puzzleNumber} 🇧🇷`, `✅ ${correct}/9 · Raridade ${score}`, ...rows, url].join('\n')
}
