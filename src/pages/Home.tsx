import { useEffect, useState } from 'react'

type Health = { ok: boolean; db: string } | null

export function Home() {
  const [health, setHealth] = useState<Health>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json() as Promise<Health>)
      .then(setHealth)
      .catch(() => setHealth({ ok: false, db: 'unreachable' }))
  }, [])

  return (
    <section>
      <h1 className="text-2xl font-bold">Grade do dia</h1>
      <p className="mt-2 text-slate-500">A grade jogável chega na Fase 1.</p>
      <p className="mt-6 text-xs text-slate-400">
        API: {health === null ? 'verificando…' : health.ok ? 'ok, banco conectado' : 'banco indisponível'}
      </p>
    </section>
  )
}
