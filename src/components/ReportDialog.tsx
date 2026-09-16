import { useEffect, useRef, useState } from 'react'
import type { CategoryInfo, CellResults } from '../../shared/api.ts'
import { UFS } from '../../shared/ufs.ts'
import { ApiError, api } from '../lib/api.ts'

interface Props {
  puzzleId: number
  rows: CategoryInfo[]
  cols: CategoryInfo[]
  cells: CellResults[]
  initialCell: number
  onClose: () => void
}

export function ReportDialog({ puzzleId, rows, cols, cells, initialCell, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [cell, setCell] = useState<number | null>(initialCell)
  const [uf, setUf] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

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
      setError((err instanceof ApiError && err.serverMessage) || 'Não foi possível enviar agora.')
    }
  }

  const valid = cell !== null ? new Set(cells[cell]?.answers.map((a) => a.uf)) : null

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl bg-white p-5 text-slate-900 shadow-xl backdrop:bg-black/50 dark:bg-slate-900 dark:text-slate-100"
    >
      {state === 'sent' ? (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Obrigado!</h2>
          <p className="text-sm">Vamos conferir. Se o gabarito estiver errado, ele é corrigido para as próximas grades.</p>
          <button type="button" onClick={() => dialog.current?.close()} className="rounded-lg bg-brand-green px-4 py-2 text-white">
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <h2 className="text-lg font-bold">Reportar erro no gabarito</h2>
          <label className="block text-sm font-medium">
            Célula
            <select
              value={cell ?? ''}
              onChange={(e) => setCell(e.target.value === '' ? null : Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-2 py-2 font-normal dark:border-slate-600"
            >
              <option value="">A grade toda</option>
              {cells.map(({ cell: i }) => (
                <option key={i} value={i}>
                  {rows[Math.floor(i / 3)].label} × {cols[i % 3].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            UF envolvida (opcional)
            <select
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-2 py-2 font-normal dark:border-slate-600"
            >
              <option value="">—</option>
              {UFS.map((u) => (
                <option key={u.code} value={u.code}>
                  {u.name}
                  {valid ? (valid.has(u.code) ? ' (aceita)' : ' (não aceita)') : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            O que está errado?
            <textarea
              required
              minLength={5}
              maxLength={1000}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex.: esta UF também atende às duas categorias porque…"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal dark:border-slate-600"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className="rounded-lg px-3 py-2 text-sm">
              Cancelar
            </button>
            <button disabled={state === 'sending'} className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {state === 'sending' ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </form>
      )}
    </dialog>
  )
}
