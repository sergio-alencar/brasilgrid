import type { CategoryInfo } from '../../shared/api.ts'

export function CategoryHeader({ category, onOpenAtlas }: { category: CategoryInfo; onOpenAtlas: (categoryId: string) => void }) {
  return (
    <div className="relative aspect-square flex h-full w-full items-stretch p-0.5 text-center sm:p-1">
      <button
        type="button"
        onClick={() => onOpenAtlas(category.categoryId)}
        aria-label={`${category.label}. Ver a regra completa no atlas de categorias.`}
        className="flex w-full flex-1 items-center justify-center rounded-xl border-2 border-white/25 bg-white/10 px-1 text-[11px] leading-tight font-bold text-white transition hover:border-brand-yellow hover:bg-white/20 sm:text-sm"
      >
        {category.label}
        <span aria-hidden className="ml-1 text-white/70">ⓘ</span>
      </button>
    </div>
  )
}
