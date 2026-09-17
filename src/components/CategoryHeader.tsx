import { useId, useState } from 'react'
import type { CategoryInfo } from '../../shared/api.ts'

export function CategoryHeader({ category }: { category: CategoryInfo }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="relative flex h-full items-center justify-center p-1 text-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${category.label}. Ver a regra completa e a fonte.`}
        className="rounded-md px-1 text-[11px] leading-tight font-semibold sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {category.label}
        <span aria-hidden className="ml-1 text-slate-400">ⓘ</span>
      </button>
      {open && (
        <div
          id={id}
          role="dialog"
          className="absolute top-full z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs font-normal shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <p>{category.description}</p>
          <a href={category.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 block text-slate-500 underline">
            Fonte: {category.sourceName}
          </a>
          <button type="button" onClick={() => setOpen(false)} className="mt-2 text-slate-500 underline">
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}
