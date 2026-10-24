import { BANDS, MAX_GUESSES } from '../../shared/rarity.ts'
import { useLocale } from '../lib/locale.tsx'

export function HowToPlay() {
  const { t, locale } = useLocale()
  return (
    <article className="space-y-4">
      <h1 className="text-2xl font-bold">{t.howToPlay.title}</h1>
      <p>{t.howToPlay.intro}</p>
      <ul className="list-disc space-y-1 pl-5">
        {t.howToPlay.rules(MAX_GUESSES).map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold">{t.howToPlay.rarityTitle}</h2>
      <p>{t.howToPlay.rarityBody}</p>
      <ul className="grid grid-cols-2 gap-1 text-sm">
        {BANDS.map((b) => (
          <li key={b.band}>
            {b.emoji} {locale === 'en' ? b.labelEn : locale === 'es' ? b.labelEs : b.label}{' '}
            {b.minPercent > 0 ? `(≥ ${b.minPercent.toLocaleString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-419' : 'pt-BR')}%)` : `(${t.howToPlay.under})`}
          </li>
        ))}
      </ul>
    </article>
  )
}
