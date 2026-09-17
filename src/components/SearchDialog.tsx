import { useEffect, useRef, useState } from 'react'
import { MIN_QUERY_LENGTH, normalizeSearch, searchUfs } from '../../shared/search.ts'

interface Props {
  title: string
  usedUfs: string[]
  wrongHere: string[]
  onPick: (uf: string) => void
  onClose: () => void
}

export function SearchDialog({ title, usedUfs, wrongHere, onPick, onClose }: Props) {
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
      className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-2xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-black/50 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="p-4">
        <p className="text-sm text-slate-500">{title}</p>
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
          placeholder="Digite o nome ou a sigla"
          aria-label="Buscar UF"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 outline-none focus:border-brand-green dark:border-slate-600"
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
          const isActive = selectable[active]?.code === u.code
          return (
            <li key={u.code} role="option" aria-selected={isActive} aria-disabled={used || wrong}>
              <button
                type="button"
                disabled={used || wrong}
                onClick={() => choose(u.code)}
                className={[
                  'flex w-full items-center gap-3 px-4 py-2 text-left disabled:opacity-40',
                  isActive ? 'bg-emerald-50 dark:bg-emerald-950' : 'hover:bg-slate-50 dark:hover:bg-slate-800',
                ].join(' ')}
              >
                <span className="flex-1">{u.name}</span>
                {used && <span className="text-xs">já usada</span>}
                {wrong && <span className="text-xs">errou aqui</span>}
              </button>
            </li>
          )
        })}
      </ul>
      )}
      <div className="border-t border-slate-200 p-3 text-right dark:border-slate-700">
        <button type="button" onClick={() => dialog.current?.close()} className="rounded-lg px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
          Cancelar
        </button>
      </div>
    </dialog>
  )
}
