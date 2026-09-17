import { useEffect, useRef, useState } from 'react'
import { MIN_QUERY_LENGTH, normalizeSearch, searchUfs } from '../../shared/search.ts'

interface Props {
  rowLabel: string
  colLabel: string
  usedUfs: string[]
  wrongHere: string[]
  onPick: (uf: string) => void
  onClose: () => void
}

export function SearchDialog({ rowLabel, colLabel, usedUfs, wrongHere, onPick, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const results = searchUfs(query)
  const selectable = results.filter((u) => !usedUfs.includes(u.code) && !wrongHere.includes(u.code))

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  const choose = (code: string) => {
    if (usedUfs.includes(code) || wrongHere.includes(code)) return
    onPick(code)
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-black/60 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-slate-500">Encontre uma UF que atenda às duas:</p>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Fechar"
            className="-mt-1 -mr-1 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-brand-green dark:bg-emerald-950 dark:text-emerald-300">
            {rowLabel}
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-brand-green dark:bg-emerald-950 dark:text-emerald-300">
            {colLabel}
          </span>
        </div>
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, selectable.length - 1))
            if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0))
            if (e.key === 'Enter' && selectable[active]) choose(selectable[active].code)
          }}
          placeholder="Nome do estado…"
          aria-label="Buscar UF"
          className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-green dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      {normalizeSearch(query).length < MIN_QUERY_LENGTH ? (
        <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-700">
          Digite pelo menos {MIN_QUERY_LENGTH} letras.
        </p>
      ) : results.length === 0 ? (
        <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-700">
          Nenhuma UF encontrada.
        </p>
      ) : (
        <ul className="max-h-72 overflow-y-auto border-t border-slate-200 dark:border-slate-700" role="listbox">
          {results.map((u) => {
            const used = usedUfs.includes(u.code)
            const wrong = wrongHere.includes(u.code)
            const disabled = used || wrong
            const isActive = selectable[active]?.code === u.code
            return (
              <li
                key={u.code}
                role="option"
                aria-selected={isActive}
                aria-disabled={disabled}
                className={`flex items-center justify-between gap-3 px-4 py-2 ${isActive ? 'bg-emerald-50 dark:bg-emerald-950' : ''}`}
              >
                <span className={disabled ? 'text-slate-400 dark:text-slate-500' : ''}>
                  {u.name}
                  {used && <span className="ml-2 text-xs">já usada</span>}
                  {wrong && <span className="ml-2 text-xs">errou aqui</span>}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => choose(u.code)}
                  className="shrink-0 rounded-lg bg-brand-green px-3 py-1.5 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700"
                >
                  Chutar
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </dialog>
  )
}
