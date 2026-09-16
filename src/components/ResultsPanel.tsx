import { lazy, Suspense, useEffect, useState } from 'react'
import type { CategoryInfo, GameState, ResultsResponse } from '../../shared/api.ts'
import { bandFor } from '../../shared/rarity.ts'
import { buildShareText } from '../../shared/shareText.ts'
import { getUf } from '../../shared/ufs.ts'
import { api } from '../lib/api.ts'
import { formatPercent } from '../lib/format.ts'
import { Countdown } from './Countdown.tsx'
import { ShareButtons } from './ShareButtons.tsx'

const BrazilMap = lazy(() => import('./BrazilMap.tsx'))

type Tab = 'popular' | 'rare' | 'all' | 'wrong'
const TABS: [Tab, string][] = [
  ['popular', 'Mais escolhidas'],
  ['rare', 'Menos escolhidas'],
  ['all', 'Todas'],
  ['wrong', 'Seus erros'],
]

interface Props {
  puzzleId: number
  rows: CategoryInfo[]
  cols: CategoryInfo[]
  game: GameState
}

export function ResultsPanel({ puzzleId, rows, cols, game }: Props) {
  const [results, setResults] = useState<ResultsResponse | null>(null)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<Tab>('popular')
  const [mapCell, setMapCell] = useState(0)

  useEffect(() => {
    api.results(puzzleId).then(setResults, () => setError(true))
  }, [puzzleId, game.status])

  const cellPercents = Array.from({ length: 9 }, (_, i) => game.filled.find((f) => f.cell === i)?.percent ?? null)
  const shareText = buildShareText({
    puzzleNumber: puzzleId,
    cellPercents,
    score: game.rarity,
    url: `${window.location.origin}/r/${game.shareId}`,
  })

  const title =
    game.status === 'completed' ? 'Grade completa!' : game.status === 'gave_up' ? 'Você desistiu' : 'Acabaram os palpites'

  return (
    <section className="mt-6 space-y-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-slate-500">
          {game.correctCount}/9 acertos · raridade {game.rarity} (parcial) · próxima grade em <Countdown />
        </p>
      </div>

      <ShareButtons text={shareText} />

      <div>
        <h3 className="font-semibold">Respostas</h3>
        {error && <p className="text-sm text-red-600">Não foi possível carregar as respostas.</p>}
        {!results && !error && <p className="text-sm text-slate-500">Carregando…</p>}
        {results && (
          <>
            <p className="text-xs text-slate-500">
              {results.players} {results.players === 1 ? 'jogador' : 'jogadores'} hoje · toque numa célula para ver no mapa
            </p>
            <figure className="mt-3 flex flex-col items-center">
              <Suspense fallback={<div className="aspect-square w-full max-w-xs" />}>
                <BrazilMap
                  title={`${rows[Math.floor(mapCell / 3)].label} × ${cols[mapCell % 3].label}`}
                  valid={results.cells[mapCell].answers.map((a) => a.uf)}
                  mine={game.filled.find((f) => f.cell === mapCell)?.uf}
                />
              </Suspense>
              <figcaption className="mt-1 text-center text-xs text-slate-500">
                {rows[Math.floor(mapCell / 3)].label} × {cols[mapCell % 3].label}
              </figcaption>
            </figure>
            <div role="tablist" className="mt-2 flex flex-wrap gap-1">
              {TABS.map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={[
                    'rounded-full px-3 py-1 text-xs',
                    tab === id ? 'bg-brand-green text-white' : 'bg-slate-100 dark:bg-slate-800',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === 'wrong' ? (
              <WrongList results={results} rows={rows} cols={cols} />
            ) : (
              <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                {results.cells.map(({ cell, answers }) => {
                  const shown =
                    tab === 'popular' ? answers.slice(0, 3) : tab === 'rare' ? [...answers].reverse().slice(0, 3) : answers
                  const mine = game.filled.find((f) => f.cell === cell)?.uf
                  return (
                    <li key={cell}>
                      <button
                        type="button"
                        onClick={() => setMapCell(cell)}
                        aria-pressed={mapCell === cell}
                        className={[
                          'h-full w-full rounded-lg p-2 text-left text-xs',
                          mapCell === cell
                            ? 'bg-emerald-50 ring-2 ring-brand-green dark:bg-emerald-950'
                            : 'bg-slate-50 dark:bg-slate-900',
                        ].join(' ')}
                      >
                      <p className="font-semibold">
                        {rows[Math.floor(cell / 3)].label} × {cols[cell % 3].label}
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {shown.map((a) => (
                          <li key={a.uf} className={a.uf === mine ? 'font-bold text-brand-green' : ''}>
                            {a.picks > 0 ? bandFor(a.percent).emoji : '·'} {getUf(a.uf)?.name} —{' '}
                            {a.picks > 0 ? formatPercent(a.percent) : 'ninguém escolheu'}
                          </li>
                        ))}
                      </ul>
                      </button>
                    </li>
                  )
                })}
              </ol>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function WrongList({ results, rows, cols }: { results: ResultsResponse; rows: CategoryInfo[]; cols: CategoryInfo[] }) {
  if (!results.wrongGuesses.length) return <p className="mt-3 text-sm text-slate-500">Nenhum palpite errado. 👏</p>
  return (
    <ul className="mt-3 space-y-1 text-sm">
      {results.wrongGuesses.map((w, i) => {
        const failed = w.failed.map((axis) =>
          axis === 'row' ? rows[Math.floor(w.cell / 3)].label : cols[w.cell % 3].label,
        )
        return (
          <li key={i}>
            <strong>{getUf(w.uf)?.name}</strong> não atende: {failed.join(' e ')}
          </li>
        )
      })}
    </ul>
  )
}
