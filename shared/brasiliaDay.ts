export const BRASILIA_TZ = 'America/Sao_Paulo'

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BRASILIA_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Data (YYYY-MM-DD) no horário de Brasília. */
export function brasiliaDate(now: Date = new Date()): string {
  return dateFormatter.format(now)
}

const DAY_MS = 86_400_000

function dateToUtcMs(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Número do jogo: dias desde o lançamento + 1. */
export function puzzleNumber(playDate: string, launchDate: string): number {
  return Math.round((dateToUtcMs(playDate) - dateToUtcMs(launchDate)) / DAY_MS) + 1
}

// Brasil não tem horário de verão desde 2019: offset fixo de -3h.
const BRASILIA_OFFSET_MS = 3 * 3_600_000

/** Milissegundos até a próxima meia-noite de Brasília. */
export function msUntilNextBrasiliaMidnight(now: Date = new Date()): number {
  const nextMidnightUtc = dateToUtcMs(brasiliaDate(now)) + DAY_MS + BRASILIA_OFFSET_MS
  return nextMidnightUtc - now.getTime()
}
