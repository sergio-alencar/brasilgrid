import { useEffect, useRef, useState } from 'react'
import catalogData from '../../data/categories-catalog.json'
import { useLocale } from '../lib/locale.tsx'

interface CategoryEntry {
  id: string
  family: string
  label: string
  description: string
  labelEn: string
  descriptionEn: string
  labelEs: string
  descriptionEs: string
  source: { name: string; url: string }
  notes?: string
  notesEn?: string
  notesEs?: string
}

const catalog = catalogData as CategoryEntry[]

// Ordem de exibição de cada família (o nome vem de t.atlas.families).
const FAMILY_ORDER = [
  'regions',
  'politics',
  'coast',
  'hydrography',
  'biomes',
  'geology',
  'borders',
  'capitals',
  'names',
  'demography',
  'history',
  'sports',
  'culture',
]

interface Props {
  initialCategoryId?: string
  onClose: () => void
}

export function CategoriesAtlas({ initialCategoryId, onClose }: Props) {
  const { t, locale } = useLocale()
  const [selected, setSelected] = useState(initialCategoryId ?? catalog[0]?.id)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const dialog = useRef<HTMLDialogElement>(null)
  const catLabel = (c: CategoryEntry) => (locale === 'en' ? c.labelEn : locale === 'es' ? c.labelEs : c.label)
  const catDescription = (c: CategoryEntry) => (locale === 'en' ? c.descriptionEn : locale === 'es' ? c.descriptionEs : c.description)
  const catNotes = (c: CategoryEntry) => (locale === 'en' ? c.notesEn : locale === 'es' ? c.notesEs : c.notes)

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
          <h2 className="text-lg font-bold">{t.atlas.title}</h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={t.atlas.close}
            className="rounded-full p-1 text-white/70 hover:bg-white/15 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex min-h-0 flex-1">
          <nav aria-label={t.atlas.categoriesAria} className="w-1/3 min-w-[9rem] overflow-y-auto border-r border-white/20 p-2 sm:w-2/5">
            {FAMILY_ORDER.map((family) => {
              const familyLabel = t.atlas.families[family]
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
                        {catLabel(c)}
                      </button>
                    ))}
                </div>
              )
            })}
          </nav>
          <div className="flex-1 overflow-y-auto p-5">
            {current && (
              <>
                <h3 className="text-xl font-bold">{catLabel(current)}</h3>
                <hr className="mt-2 mb-3 border-white/20" />
                <p>{catDescription(current)}</p>
                {catNotes(current) && <p className="mt-3 text-sm text-white/70 italic">{catNotes(current)}</p>}
                <p className="mt-4 text-sm text-white/70">
                  {t.atlas.source}{' '}
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
