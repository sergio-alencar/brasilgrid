import { useEffect, useRef, useState } from 'react'
import { MIN_QUERY_LENGTH, normalizeSearch, searchUfs } from '../../shared/search.ts'
import { useLocale } from '../lib/locale.tsx'

interface Props {
  rowLabel: string
  colLabel: string
  usedUfs: string[]
  wrongHere: string[]
  onPick: (uf: string) => void
  onClose: () => void
}

export function SearchDialog({ rowLabel, colLabel, usedUfs, wrongHere, onPick, onClose }: Props) {
  const { t } = useLocale()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const results = searchUfs(query)
  const selectable = results.filter((u) => !usedUfs.includes(u.code) && !wrongHere.includes(u.code))

  useEffect(() => {
    dialog.current?.showModal()
    // showModal() move o foco por conta própria; autoFocus no input corre
    // com isso e perde. Foca de novo depois que o diálogo já abriu.
    input.current?.focus()
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
      className="mx-auto mt-12 mb-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-black/60 sm:mt-16"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-slate-500">{t.search.prompt}</p>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={t.search.close}
            className="-mt-1 -mr-1 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            ✕
          </button>
        </div>
        <div className="mt-2 flex flex-col items-center gap-1">
          <span className="w-full rounded-lg bg-brand-green px-2.5 py-1.5 text-center text-sm font-semibold text-white">
            {rowLabel}
          </span>
          <span aria-hidden className="text-xs font-bold text-brand-green">
            ✕
          </span>
          <span className="w-full rounded-lg bg-brand-green px-2.5 py-1.5 text-center text-sm font-semibold text-white">
            {colLabel}
          </span>
        </div>
        <input
          ref={input}
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
          placeholder={t.search.placeholder}
          aria-label={t.search.inputAria}
          className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
        />
      </div>
      {normalizeSearch(query).length < MIN_QUERY_LENGTH ? (
        <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500">{t.search.minLength(MIN_QUERY_LENGTH)}</p>
      ) : results.length === 0 ? (
        <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500">{t.search.noResults}</p>
      ) : (
        <ul className="max-h-72 overflow-y-auto border-t border-slate-200" role="listbox">
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
                className={`flex items-center justify-between gap-3 px-4 py-2 ${isActive ? 'bg-emerald-50' : ''}`}
              >
                <span className={disabled ? 'text-slate-400' : 'text-slate-900'}>
                  {u.name}
                  {used && <span className="ml-2 text-xs">{t.search.alreadyUsed}</span>}
                  {wrong && <span className="ml-2 text-xs">{t.search.wrongHere}</span>}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => choose(u.code)}
                  className="shrink-0 rounded-lg bg-brand-green px-3 py-1.5 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {t.search.guess}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </dialog>
  )
}
