import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { SharedResult } from '../../shared/api.ts'
import { bandFor } from '../../shared/rarity.ts'
import { api } from '../lib/api.ts'
import { formatPercent } from '../lib/format.ts'
import { useLocale } from '../lib/locale.tsx'
import { NotFound } from './NotFound.tsx'

export function SharedResultPage() {
  const { t, locale } = useLocale()
  const { shareId = '' } = useParams()
  const [result, setResult] = useState<SharedResult | null | 'missing'>(null)

  useEffect(() => {
    api.shared(shareId, locale).then(setResult, () => setResult('missing'))
  }, [shareId, locale])

  const STATUS: Record<string, string> = {
    completed: t.sharedResult.completed,
    out_of_guesses: t.sharedResult.outOfGuesses,
    gave_up: t.sharedResult.gaveUp,
  }

  if (result === 'missing') return <NotFound message={t.sharedResult.notFound} />
  if (!result) return <p className="text-center text-white/80">{t.sharedResult.loading}</p>

  return (
    <section className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-white/70">
          {new Date(`${result.playDate}T12:00:00`).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-419' : 'pt-BR', { dateStyle: 'long' })}
        </p>
        <h1 className="text-3xl font-bold">BrasilGrid #{result.puzzleId}</h1>
        <p className="mt-1">
          {STATUS[result.status]} · <strong>{result.correctCount}/9</strong> {t.sharedResult.correctSuffix} ·{' '}
          {t.sharedResult.scoreLabel} <strong>{result.rarity}</strong>
        </p>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <div className="aspect-square" />
        {result.cols.map((c) => (
          <p key={c} className="flex aspect-square items-end justify-center p-1 text-center text-[11px] leading-tight font-bold text-white sm:text-sm">
            {c}
          </p>
        ))}
        {result.rows.map((row, r) => (
          <RowCells key={row} label={row} percents={result.cellPercents.slice(r * 3, r * 3 + 3)} locale={locale} empty={t.sharedResult.empty} />
        ))}
      </div>

      <p className="text-center text-xs text-white/70">{t.sharedResult.hiddenNote}</p>
      <div className="text-center">
        <Link to="/" className="inline-block rounded-lg bg-white px-5 py-3 font-bold text-brand-green">
          {t.sharedResult.playToday}
        </Link>
      </div>
    </section>
  )
}

function RowCells({
  label,
  percents,
  locale,
  empty,
}: {
  label: string
  percents: (number | null)[]
  locale: 'pt' | 'en' | 'es'
  empty: string
}) {
  return (
    <>
      <p className="flex items-center justify-center p-1 text-center text-[11px] leading-tight font-bold text-white sm:text-sm">
        {label}
      </p>
      {percents.map((p, i) => {
        const band = bandFor(p)
        return (
          <div
            key={i}
            className={[
              'flex aspect-square flex-col items-center justify-center rounded-xl border-2 text-slate-900',
              p === null ? 'border-slate-200 bg-slate-100' : 'border-brand-green bg-emerald-50',
            ].join(' ')}
          >
            <span className="text-3xl" aria-hidden>
              {band.emoji}
            </span>
            <span className="text-center text-[10px] leading-tight sm:text-xs">
              {p === null ? (
                empty
              ) : (
                <>
                  {locale === 'en' ? band.labelEn : locale === 'es' ? band.labelEs : band.label}
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
