import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { StatsResponse } from '../../shared/api.ts'
import { BANDS } from '../../shared/rarity.ts'
import { MiniGrid } from '../components/MiniGrid.tsx'
import { ApiError, api } from '../lib/api.ts'
import { authClient } from '../lib/authClient.ts'

const STATUS: Record<string, string> = {
  completed: 'completa',
  out_of_guesses: 'sem palpites',
  gave_up: 'desistiu',
  in_progress: 'em andamento',
}

export function Stats() {
  const { data: session, isPending } = authClient.useSession()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!session) return
    api.stats().then(setStats, (e) => setError(!(e instanceof ApiError && e.status === 401)))
  }, [session])

  if (isPending) return <p className="text-slate-500">Carregando…</p>
  if (!session) {
    return (
      <section className="content-panel space-y-2">
        <h1 className="text-2xl font-bold">Estatísticas</h1>
        <p>Jogue a grade de hoje para começar suas estatísticas.</p>
        <Link to="/" className="underline">
          Ir para a grade
        </Link>
      </section>
    )
  }
  if (error) return <p className="text-red-600">Não foi possível carregar suas estatísticas.</p>
  if (!stats) return <p className="text-slate-500">Carregando…</p>

  const maxDist = Math.max(1, ...stats.correctDistribution)
  const tiles: [string, string | number][] = [
    ['Jogos', stats.played],
    ['Grades completas', stats.completed],
    ['Sequência atual', stats.currentStreak],
    ['Maior sequência', stats.longestStreak],
    ['Média de acertos', stats.averageCorrect.toLocaleString('pt-BR', { maximumFractionDigits: 1 })],
    ['Melhor raridade', stats.bestRarity ?? '—'],
  ]

  return (
    <section className="content-panel space-y-8">
      <h1 className="text-2xl font-bold">Estatísticas</h1>

      {session.user.isAnonymous && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm dark:bg-emerald-950">
          Você está jogando como visitante: estes dados ficam só neste navegador.{' '}
          <Link to="/entrar" className="font-semibold underline">
            Entre para guardá-los
          </Link>
          .
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="text-2xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <h2 className="font-semibold">Acertos por grade</h2>
        <ol className="mt-2 space-y-1">
          {stats.correctDistribution.map((n, correct) => (
            <li key={correct} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-right tabular-nums">{correct}</span>
              <span
                className="h-5 rounded bg-brand-green"
                style={{ width: `${Math.max(2, (n / maxDist) * 100)}%`, opacity: n ? 1 : 0.25 }}
              />
              <span className="tabular-nums text-slate-500">{n}</span>
            </li>
          ))}
        </ol>
        <p className="mt-1 text-xs text-slate-500">Só conta partidas encerradas.</p>
      </div>

      <div>
        <h2 className="font-semibold">Acertos por raridade</h2>
        <ul className="mt-2 grid grid-cols-2 gap-1 text-sm sm:grid-cols-3">
          {BANDS.map((b) => (
            <li key={b.band}>
              {b.emoji} {b.label}: <strong className="tabular-nums">{stats.bandCounts[b.band] ?? 0}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold">Histórico</h2>
        {stats.history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Nenhuma partida ainda.</p>
        ) : (
          <table className="mt-2 w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-1 font-normal">Jogo</th>
                <th className="font-normal">Grade</th>
                <th className="text-right font-normal">Acertos</th>
                <th className="text-right font-normal">Raridade</th>
              </tr>
            </thead>
            <tbody>
              {stats.history.map((h) => (
                <tr key={h.puzzleId} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-2">
                    <div className="font-medium">#{h.puzzleId}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(`${h.playDate}T12:00:00`).toLocaleDateString('pt-BR')} · {STATUS[h.status]}
                    </div>
                  </td>
                  <td>
                    <MiniGrid cellPercents={h.cellPercents} label={`${h.correctCount} de 9 acertos`} />
                  </td>
                  <td className="text-right tabular-nums">{h.correctCount}/9</td>
                  <td className="text-right tabular-nums">
                    {h.rarity}
                    {h.status === 'in_progress' && <span className="text-xs text-slate-500"> (parcial)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
