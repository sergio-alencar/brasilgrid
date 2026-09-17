// Contratos da API, usados pelo Worker e pela SPA.

export type GameStatus = 'in_progress' | 'completed' | 'out_of_guesses' | 'gave_up'
export type GameMode = 'normal' | 'practice'

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
  mode: GameMode
  status: GameStatus
  guessesUsed: number
  /** null no modo infinito (sem limite). */
  guessesLeft: number | null
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

export interface HistoryEntry {
  puzzleId: number
  playDate: string
  status: GameStatus
  correctCount: number
  rarity: number
  /** 9 células em ordem de leitura; null = vazia. */
  cellPercents: (number | null)[]
}

export interface StatsResponse {
  played: number
  completed: number
  averageCorrect: number
  averageRarity: number | null
  bestRarity: number | null
  currentStreak: number
  longestStreak: number
  /** Índice = nº de acertos (0 a 9). */
  correctDistribution: number[]
  /** Quantos acertos caíram em cada faixa de raridade. */
  bandCounts: Record<string, number>
  history: HistoryEntry[]
}

export interface MeResponse {
  user: { id: string; name: string; email: string | null; image: string | null; isAnonymous: boolean }
  profile: { nickname: string | null; showInRanking: boolean }
}

/** Resultado público de uma partida: só números e faixas, nunca UFs. */
export interface SharedResult {
  puzzleId: number
  playDate: string
  status: GameStatus
  correctCount: number
  rarity: number
  cellPercents: (number | null)[]
  rows: string[]
  cols: string[]
}
