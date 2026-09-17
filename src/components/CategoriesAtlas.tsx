import { useEffect, useRef, useState } from 'react'
import catalogData from '../../data/categories-catalog.json'

interface CategoryEntry {
  id: string
  family: string
  label: string
  description: string
  source: { name: string; url: string }
  notes?: string
}

const catalog = catalogData as CategoryEntry[]

// Ordem e nome de exibição de cada família, igual ao catálogo do plano.
const FAMILIES: [string, string][] = [
  ['regions', 'Regiões'],
  ['politics', 'Geopolítica'],
  ['coast', 'Litoral e posição'],
  ['hydrography', 'Hidrografia'],
  ['biomes', 'Biomas'],
  ['borders', 'Fronteiras e divisas'],
  ['capitals', 'Capitais'],
  ['names', 'Nome e sigla'],
  ['demography', 'Demografia e economia'],
  ['history', 'História'],
  ['sports', 'Esportes'],
  ['culture', 'Cultura'],
]

interface Props {
  initialCategoryId?: string
  onClose: () => void
}

export function CategoriesAtlas({ initialCategoryId, onClose }: Props) {
  const [selected, setSelected] = useState(initialCategoryId ?? catalog[0]?.id)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialog.current?.showModal()
    // Abre com a família da categoria já visível, mesmo que outra esteja fechada.
    const fam = catalog.find((c) => c.id === initialCategoryId)?.family
    if (fam) {
      const el = document.getElementById(`atlas-item-${initialCategoryId}`)
      el?.scrollIntoView({ block: 'center' })
    }
  }, [initialCategoryId])

  const current = catalog.find((c) => c.id === selected)
  const toggleFamily = (family: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(family)) next.delete(family)
      else next.add(family)
      return next
    })

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="m-auto h-[min(38rem,90vh)] w-[min(48rem,calc(100%-2rem))] rounded-2xl bg-brand-green p-0 text-white shadow-xl backdrop:bg-black/60"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/20 p-4">
          <h2 className="text-lg font-bold">Atlas de categorias</h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Fechar"
            className="rounded-full p-1 text-white/70 hover:bg-white/15 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex min-h-0 flex-1">
          <nav aria-label="Categorias" className="w-1/3 min-w-[9rem] overflow-y-auto border-r border-white/20 p-2 sm:w-2/5">
            {FAMILIES.map(([family, familyLabel]) => {
              const items = catalog.filter((c) => c.family === family)
              if (items.length === 0) return null
              const isCollapsed = collapsed.has(family)
              return (
                <div key={family} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleFamily(family)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-left text-xs font-bold text-brand-yellow hover:bg-white/10"
                  >
                    <span aria-hidden className={`inline-block transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>
                      ▾
                    </span>
                    {familyLabel}
                  </button>
                  {!isCollapsed &&
                    items.map((c) => (
                      <button
                        key={c.id}
                        id={`atlas-item-${c.id}`}
                        type="button"
                        onClick={() => setSelected(c.id)}
                        aria-current={c.id === selected}
                        className={`block w-full rounded px-3 py-1.5 text-left text-sm ${
                          c.id === selected ? 'bg-white font-semibold text-brand-green' : 'text-white/90 hover:bg-white/10'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                </div>
              )
            })}
          </nav>
          <div className="flex-1 overflow-y-auto p-5">
            {current && (
              <>
                <h3 className="text-xl font-bold">{current.label}</h3>
                <hr className="mt-2 mb-3 border-white/20" />
                <p>{current.description}</p>
                {current.notes && <p className="mt-3 text-sm text-white/70 italic">{current.notes}</p>}
                <p className="mt-4 text-sm text-white/70">
                  Fonte:{' '}
                  <a href={current.source.url} target="_blank" rel="noreferrer" className="underline hover:text-white">
                    {current.source.name}
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </dialog>
  )
}
