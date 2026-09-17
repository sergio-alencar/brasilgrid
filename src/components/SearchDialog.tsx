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
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl bg-brand-green p-0 text-white shadow-xl backdrop:bg-black/60"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-white/70">Encontre uma UF que atenda a:</p>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Fechar"
            className="-mt-1 -mr-1 rounded-full p-1 text-white/70 hover:bg-white/15 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="mt-2 flex flex-col items-center gap-1">
          <span className="w-full rounded-lg bg-white px-2.5 py-1.5 text-center text-sm font-semibold text-brand-green">
            {rowLabel}
          </span>
          <span aria-hidden className="text-xs font-bold text-brand-yellow">
            ✕
          </span>
          <span className="w-full rounded-lg bg-white px-2.5 py-1.5 text-center text-sm font-semibold text-brand-green">
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
          placeholder="Nome do estado…"
          aria-label="Buscar UF"
          className="mt-3 w-full rounded-lg border border-white/30 bg-white px-3 py-2 text-slate-900 outline-none focus:border-brand-yellow"
        />
      </div>
      {normalizeSearch(query).length < MIN_QUERY_LENGTH ? (
        <p className="border-t border-white/20 px-4 py-3 text-sm text-white/70">Digite pelo menos {MIN_QUERY_LENGTH} letras.</p>
      ) : results.length === 0 ? (
        <p className="border-t border-white/20 px-4 py-3 text-sm text-white/70">Nenhuma UF encontrada.</p>
      ) : (
        <ul className="max-h-72 overflow-y-auto border-t border-white/20" role="listbox">
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
                className={`flex items-center justify-between gap-3 px-4 py-2 ${isActive ? 'bg-white/15' : ''}`}
              >
                <span className={disabled ? 'text-white/40' : 'text-white'}>
                  {u.name}
                  {used && <span className="ml-2 text-xs">já usada</span>}
                  {wrong && <span className="ml-2 text-xs">errou aqui</span>}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => choose(u.code)}
                  className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-brand-green disabled:bg-white/20 disabled:text-white/40"
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
