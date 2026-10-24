import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ArchiveEntry } from '../../shared/api.ts'
import { api } from '../lib/api.ts'
import { useLocale } from '../lib/locale.tsx'

export function Archive() {
  const { t, locale } = useLocale()
  const [items, setItems] = useState<ArchiveEntry[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.archive(page, locale).then(
      (r) => {
        setItems((prev) => (page === 0 ? r.items : [...prev, ...r.items]))
        setHasMore(r.hasMore)
        setLoading(false)
      },
      () => {
        setError(true)
        setLoading(false)
      },
    )
  }, [page, locale])

  return (
    <section className="content-panel space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t.archive.title}</h1>
        <p className="text-sm text-slate-500">{t.archive.subtitle}</p>
      </div>

      {error && <p className="text-red-600">{t.archive.loadFailed}</p>}
      {!error && items.length === 0 && loading && <p className="text-slate-500">{t.archive.loading}</p>}
      {!error && items.length === 0 && !loading && <p className="text-slate-500">{t.archive.empty}</p>}

      <ul className="divide-y divide-slate-200">
        {items.map((it) => (
          <li key={it.puzzleId}>
            <Link to={`/arquivo/${it.puzzleId}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50">
              <div>
                <p className="font-semibold">
                  #{it.puzzleId} —{' '}
                  {new Date(`${it.playDate}T12:00:00`).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-419' : 'pt-BR', {
                    dateStyle: 'long',
                  })}
                </p>
                <p className="text-xs text-slate-500">
                  {it.rows.join(' · ')} × {it.cols.join(' · ')}
                </p>
              </div>
              <div className="shrink-0 text-right text-sm text-slate-500">
                {it.myStatus ? (
                  <>
                    {t.gameStatus[it.myStatus]}
                    {it.myCorrectCount !== null && <span className="ml-1">{it.myCorrectCount}/9</span>}
                  </>
                ) : (
                  t.archive.notPlayed
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={() => {
            setLoading(true)
            setPage((p) => p + 1)
          }}
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? t.archive.loading : t.archive.loadMore}
        </button>
      )}
    </section>
  )
}
