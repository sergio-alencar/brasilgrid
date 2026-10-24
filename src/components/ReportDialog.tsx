import { useEffect, useRef, useState } from 'react'
import type { CategoryInfo, CellResults, Locale } from '../../shared/api.ts'
import { UFS } from '../../shared/ufs.ts'
import { ApiError, api } from '../lib/api.ts'
import { useLocale } from '../lib/locale.tsx'

interface Props {
  puzzleId: number
  rows: CategoryInfo[]
  cols: CategoryInfo[]
  cells: CellResults[]
  initialCell: number
  locale: Locale
  onClose: () => void
}

export function ReportDialog({ puzzleId, rows, cols, cells, initialCell, locale, onClose }: Props) {
  const { t } = useLocale()
  const dialog = useRef<HTMLDialogElement>(null)
  const [cell, setCell] = useState<number | null>(initialCell)
  const [uf, setUf] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)
  const catLabel = (cat: CategoryInfo) => (locale === 'en' ? cat.labelEn : locale === 'es' ? cat.labelEs : cat.label)

  useEffect(() => dialog.current?.showModal(), [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('sending')
    setError(null)
    try {
      await api.report({ puzzleId, cell, uf: uf || null, message })
      setState('sent')
    } catch (err) {
      setState('idle')
      setError((err instanceof ApiError && err.serverMessage) || t.report.sendFailed)
    }
  }

  const valid = cell !== null ? new Set(cells[cell]?.answers.map((a) => a.uf)) : null

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl bg-white p-5 text-slate-900 shadow-xl backdrop:bg-black/50"
    >
      {state === 'sent' ? (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">{t.report.thanksTitle}</h2>
          <p className="text-sm">{t.report.thanksBody}</p>
          <button type="button" onClick={() => dialog.current?.close()} className="rounded-lg bg-brand-green px-4 py-2 text-white">
            {t.report.close}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <h2 className="text-lg font-bold">{t.report.title}</h2>
          <label className="block text-sm font-medium">
            {t.report.cell}
            <select
              value={cell ?? ''}
              onChange={(e) => setCell(e.target.value === '' ? null : Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 font-normal text-slate-900"
            >
              <option value="">{t.report.wholeGrid}</option>
              {cells.map(({ cell: i }) => (
                <option key={i} value={i}>
                  {catLabel(rows[Math.floor(i / 3)])} × {catLabel(cols[i % 3])}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t.report.ufInvolved}
            <select
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 font-normal text-slate-900"
            >
              <option value="">—</option>
              {UFS.map((u) => (
                <option key={u.code} value={u.code}>
                  {u.name}
                  {valid ? (valid.has(u.code) ? ` ${t.report.accepted}` : ` ${t.report.notAccepted}`) : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t.report.whatIsWrong}
            <textarea
              required
              minLength={5}
              maxLength={1000}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.report.whatIsWrongPlaceholder}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className="rounded-lg px-3 py-2 text-sm">
              {t.report.cancel}
            </button>
            <button disabled={state === 'sending'} className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {state === 'sending' ? t.report.sending : t.report.send}
            </button>
          </div>
        </form>
      )}
    </dialog>
  )
}
