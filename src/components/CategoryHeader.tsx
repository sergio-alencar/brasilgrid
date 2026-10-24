import type { CategoryInfo, Locale } from '../../shared/api.ts'
import { useLocale } from '../lib/locale.tsx'

export function CategoryHeader({
  category,
  locale,
  onOpenAtlas,
}: {
  category: CategoryInfo
  locale: Locale
  onOpenAtlas: (categoryId: string) => void
}) {
  const { t } = useLocale()
  const label = locale === 'en' ? category.labelEn : locale === 'es' ? category.labelEs : category.label
  return (
    <button
      type="button"
      onClick={() => onOpenAtlas(category.categoryId)}
      aria-label={t.grid.categoryAria(label)}
      className="flex aspect-square h-full w-full cursor-pointer items-center justify-center rounded-xl bg-white/15 px-1 text-center text-sm leading-tight font-bold text-white transition hover:bg-white/25 sm:text-base"
    >
      {label}
    </button>
  )
}
