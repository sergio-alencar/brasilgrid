import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { StatsResponse } from '../../shared/api.ts'
import { BANDS } from '../../shared/rarity.ts'
import { MiniGrid } from '../components/MiniGrid.tsx'
import { ApiError, api } from '../lib/api.ts'
import { authClient } from '../lib/authClient.ts'
import { useLocale } from '../lib/locale.tsx'

export function Stats() {
  const { t, locale } = useLocale()
  const { data: session, isPending } = authClient.useSession()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!session) return
    api.stats().then(setStats, (e) => setError(!(e instanceof ApiError && e.status === 401)))
  }, [session])

  if (isPending) return <p className="text-slate-500">{t.stats.loading}</p>
  if (!session) {
    return (
      <section className="content-panel space-y-2">
        <h1 className="text-2xl font-bold">{t.stats.title}</h1>
        <p>{t.stats.loginPrompt}</p>
        <Link to="/" className="underline">
          {t.stats.goToGame}
        </Link>
      </section>
    )
  }
  if (error) return <p className="text-red-600">{t.stats.loadFailed}</p>
  if (!stats) return <p className="text-slate-500">{t.stats.loading}</p>

  const maxDist = Math.max(1, ...stats.correctDistribution)
  const localeTag = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-419' : 'pt-BR'
  const tiles: [string, string | number][] = [
    [t.stats.tilePlayed, stats.played],
    [t.stats.tileCompleted, stats.completed],
    [t.stats.tileCurrentStreak, stats.currentStreak],
    [t.stats.tileLongestStreak, stats.longestStreak],
    [t.stats.tileAverageCorrect, stats.averageCorrect.toLocaleString(localeTag, { maximumFractionDigits: 1 })],
    [t.stats.tileBestRarity, stats.bestRarity ?? '—'],
  ]

  return (
    <section className="content-panel space-y-8">
      <h1 className="text-2xl font-bold">{t.stats.title}</h1>

      {session.user.isAnonymous && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm">
          {t.stats.guestNotice}{' '}
          <Link to="/entrar" className="font-semibold underline">
            {t.stats.loginToKeep}
          </Link>
          .
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 p-3">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="text-2xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <h2 className="font-semibold">{t.stats.correctByGame}</h2>
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
        <p className="mt-1 text-xs text-slate-500">{t.stats.onlyFinished}</p>
      </div>

      <div>
        <h2 className="font-semibold">{t.stats.correctByRarity}</h2>
        <ul className="mt-2 grid grid-cols-2 gap-1 text-sm sm:grid-cols-3">
          {BANDS.map((b) => (
            <li key={b.band}>
              {b.emoji} {locale === 'en' ? b.labelEn : locale === 'es' ? b.labelEs : b.label}:{' '}
              <strong className="tabular-nums">{stats.bandCounts[b.band] ?? 0}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold">{t.stats.history}</h2>
        {stats.history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t.stats.noGamesYet}</p>
        ) : (
          <table className="mt-2 w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-1 font-normal">{t.stats.colGame}</th>
                <th className="font-normal">{t.stats.colBoard}</th>
                <th className="text-right font-normal">{t.stats.colCorrect}</th>
                <th className="text-right font-normal">{t.stats.colRarity}</th>
              </tr>
            </thead>
            <tbody>
              {stats.history.map((h) => (
                <tr key={h.puzzleId} className="border-t border-slate-100">
                  <td className="py-2">
                    <div className="font-medium">#{h.puzzleId}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(`${h.playDate}T12:00:00`).toLocaleDateString(localeTag)} · {t.gameStatus[h.status]}
                    </div>
                  </td>
                  <td>
                    <MiniGrid cellPercents={h.cellPercents} label={t.stats.correctLabel(h.correctCount)} />
                  </td>
                  <td className="text-right tabular-nums">{h.correctCount}/9</td>
                  <td className="text-right tabular-nums">
                    {h.rarity}
                    {h.status === 'in_progress' && <span className="text-xs text-slate-500"> {t.stats.partial}</span>}
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
