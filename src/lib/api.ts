import type {
  GameState,
  GuessResponse,
  MeResponse,
  ResultsResponse,
  StatsResponse,
  TodayResponse,
} from '../../shared/api.ts'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code)
  }
  /** Mensagem legível enviada pelo servidor, quando houver. */
  serverMessage?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...init?.headers },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const { error, message } = body as { error?: string; message?: string }
    const err = new ApiError(res.status, error ?? 'unknown')
    err.serverMessage = message
    throw err
  }
  return body as T
}

export const api = {
  today: () => request<TodayResponse>('/api/puzzle/today'),
  guess: (puzzleId: number, cell: number, uf: string) =>
    request<GuessResponse>('/api/game/guess', { method: 'POST', body: JSON.stringify({ puzzleId, cell, uf }) }),
  giveUp: (puzzleId: number) =>
    request<{ game: GameState }>('/api/game/give-up', { method: 'POST', body: JSON.stringify({ puzzleId }) }),
  results: (puzzleId: number) => request<ResultsResponse>(`/api/game/${puzzleId}/results`),
  me: () => request<MeResponse>('/api/me'),
  stats: () => request<StatsResponse>('/api/me/stats'),
  updateProfile: (data: { nickname?: string | null; showInRanking?: boolean }) =>
    request<{ ok: true }>('/api/me/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAccount: () => request<{ ok: true }>('/api/me', { method: 'DELETE' }),
}
