import { Link } from 'react-router-dom'
import { useLocale } from '../lib/locale.tsx'

export function NotFound({ message }: { message?: string }) {
  const { t } = useLocale()
  return (
    <section className="space-y-3 py-10 text-center">
      <p className="text-5xl" aria-hidden>
        🗺️
      </p>
      <h1 className="text-2xl font-bold">{t.notFound.title}</h1>
      <p className="text-white/80">{message ?? t.notFound.defaultMessage}</p>
      <Link to="/" className="inline-block rounded-lg bg-white px-4 py-2 font-bold text-brand-green">
        {t.notFound.playToday}
      </Link>
    </section>
  )
}
