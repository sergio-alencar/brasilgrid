import { Link } from 'react-router-dom'

export function NotFound({ message = 'Esta página não existe.' }: { message?: string }) {
  return (
    <section className="space-y-3 py-10 text-center">
      <p className="text-5xl" aria-hidden>
        🗺️
      </p>
      <h1 className="text-2xl font-bold">Nada por aqui</h1>
      <p className="text-white/80">{message}</p>
      <Link to="/" className="inline-block rounded-lg bg-white px-4 py-2 font-bold text-brand-green">
        Jogar a grade de hoje
      </Link>
    </section>
  )
}
