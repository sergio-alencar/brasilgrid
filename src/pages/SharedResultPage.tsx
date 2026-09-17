import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { SharedResult } from '../../shared/api.ts'
import { bandFor } from '../../shared/rarity.ts'
import { api } from '../lib/api.ts'
import { formatPercent } from '../lib/format.ts'
import { NotFound } from './NotFound.tsx'

const STATUS: Record<string, string> = {
  completed: 'Grade completa',
  out_of_guesses: 'Acabaram os palpites',
  gave_up: 'Partida encerrada',
}

export function SharedResultPage() {
  const { shareId = '' } = useParams()
  const [result, setResult] = useState<SharedResult | null | 'missing'>(null)

  useEffect(() => {
    api.shared(shareId).then(setResult, () => setResult('missing'))
  }, [shareId])

  if (result === 'missing') return <NotFound message="Não encontramos esse resultado." />
  if (!result) return <p className="text-center text-slate-500">Carregando…</p>

  return (
    <section className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-slate-500">
          {new Date(`${result.playDate}T12:00:00`).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
        </p>
        <h1 className="text-3xl font-bold">BrasilGrid #{result.puzzleId}</h1>
        <p className="mt-1">
          {STATUS[result.status]} · <strong>{result.correctCount}/9</strong> acertos · raridade{' '}
          <strong>{result.rarity}</strong>
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,0.8fr)_repeat(3,minmax(0,1fr))] gap-1.5">
        <div />
        {result.cols.map((c) => (
          <p key={c} className="flex items-end justify-center p-1 text-center text-[11px] leading-tight font-semibold sm:text-sm">
            {c}
          </p>
        ))}
        {result.rows.map((row, r) => (
          <RowCells key={row} label={row} percents={result.cellPercents.slice(r * 3, r * 3 + 3)} />
        ))}
      </div>

      <p className="text-center text-xs text-slate-500">
        As respostas ficam escondidas para não estragar o jogo de ninguém.
      </p>
      <div className="text-center">
        <Link to="/" className="inline-block rounded-lg bg-brand-blue px-5 py-3 font-semibold text-white">
          Jogar a grade de hoje
        </Link>
      </div>
    </section>
  )
}

function RowCells({ label, percents }: { label: string; percents: (number | null)[] }) {
  return (
    <>
      <p className="flex items-center justify-center p-1 text-center text-[11px] leading-tight font-semibold sm:text-sm">
        {label}
      </p>
      {percents.map((p, i) => {
        const band = bandFor(p)
        return (
          <div
            key={i}
            className={[
              'flex aspect-square flex-col items-center justify-center rounded-xl border-2',
              p === null
                ? 'border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
                : 'border-brand-green bg-emerald-50 dark:bg-emerald-950',
            ].join(' ')}
          >
            <span className="text-3xl" aria-hidden>
              {band.emoji}
            </span>
            <span className="text-center text-[10px] leading-tight sm:text-xs">
              {p === null ? (
                'vazia'
              ) : (
                <>
                  {band.label}
                  <br />
                  {formatPercent(p)}
                </>
              )}
            </span>
          </div>
        )
      })}
    </>
  )
}
