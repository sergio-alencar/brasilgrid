import type { GameState, GuessResponse, ResultsResponse, TodayResponse } from '../../shared/api.ts'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...init?.headers },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, (body as { error?: string }).error ?? 'unknown')
  return body as T
}

export const api = {
  today: () => request<TodayResponse>('/api/puzzle/today'),
  guess: (puzzleId: number, cell: number, uf: string) =>
    request<GuessResponse>('/api/game/guess', { method: 'POST', body: JSON.stringify({ puzzleId, cell, uf }) }),
  giveUp: (puzzleId: number) =>
    request<{ game: GameState }>('/api/game/give-up', { method: 'POST', body: JSON.stringify({ puzzleId }) }),
  results: (puzzleId: number) => request<ResultsResponse>(`/api/game/${puzzleId}/results`),
}
