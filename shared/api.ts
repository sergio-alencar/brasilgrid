// Contratos da API, usados pelo Worker e pela SPA.

export type GameStatus = 'in_progress' | 'completed' | 'out_of_guesses' | 'gave_up'

export interface CategoryInfo {
  label: string
  description: string
  sourceName: string
  sourceUrl: string
}

export interface FilledCell {
  cell: number
  uf: string
  percent: number
}

export interface GameState {
  status: GameStatus
  guessesUsed: number
  guessesLeft: number
  correctCount: number
  filled: FilledCell[]
  /** Siglas que já foram acerto (não podem ser usadas de novo). */
  usedUfs: string[]
  wrongGuesses: { cell: number; uf: string }[]
  /** Raridade parcial (muda conforme mais gente joga). */
  rarity: number
  shareId: string
}

export interface TodayResponse {
  puzzle: { id: number; playDate: string; rows: CategoryInfo[]; cols: CategoryInfo[] }
  maxGuesses: number
  players: number
  game: GameState | null
}

export type GuessResult = 'ok' | 'uf_used' | 'cell_filled' | 'game_over' | 'puzzle_unavailable' | 'invalid_cell'

export interface GuessResponse {
  result: GuessResult
  correct: boolean
  game: GameState | null
}

export interface CellResults {
  cell: number
  answers: { uf: string; picks: number; percent: number }[]
}

export interface WrongGuessExplanation {
  cell: number
  uf: string
  /** Quais categorias a UF não atende. */
  failed: ('row' | 'col')[]
}

export interface ResultsResponse {
  players: number
  cells: CellResults[]
  wrongGuesses: WrongGuessExplanation[]
}

export interface ApiError {
  error: string
}
