const DAY_MS = 86_400_000
const toDay = (date: string) => Math.round(Date.parse(`${date}T00:00:00Z`) / DAY_MS)

/**
 * Sequência de dias jogados. A atual só conta se o último jogo foi hoje ou ontem
 * (quem ainda não jogou hoje não perde a sequência antes da meia-noite).
 */
export function streaks(playDates: string[], today: string): { current: number; longest: number } {
  const days = [...new Set(playDates.map(toDay))].sort((a, b) => a - b)
  let longest = 0
  let run = 0
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] === days[i - 1] + 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }
  const last = days.at(-1)
  const current = last !== undefined && toDay(today) - last <= 1 ? run : 0
  return { current, longest }
}
