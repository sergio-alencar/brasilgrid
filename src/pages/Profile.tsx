import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { MeResponse } from '../../shared/api.ts'
import { Avatar } from '../components/Avatar.tsx'
import { ApiError, api } from '../lib/api.ts'
import { authClient } from '../lib/authClient.ts'

export function Profile() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [nickname, setNickname] = useState('')
  const [showInRanking, setShowInRanking] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!session || session.user.isAnonymous) return
    api.me().then((m) => {
      setMe(m)
      setNickname(m.profile.nickname ?? '')
      setShowInRanking(m.profile.showInRanking)
    })
  }, [session])

  if (isPending) return <p className="text-slate-500">Carregando…</p>
  if (!session || session.user.isAnonymous) {
    return (
      <section className="content-panel space-y-2">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p>
          <Link to="/entrar" className="underline">
            Entre
          </Link>{' '}
          para ter um perfil e guardar seu histórico.
        </p>
      </section>
    )
  }
  if (!me) return <p className="text-slate-500">Carregando…</p>

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      await api.updateProfile({ nickname: nickname.trim() || null, showInRanking })
      setMessage({ ok: true, text: 'Perfil salvo.' })
    } catch (err) {
      setMessage({ ok: false, text: (err instanceof ApiError && err.serverMessage) || 'Não foi possível salvar.' })
    }
  }

  const signOut = async () => {
    await authClient.signOut()
    navigate('/')
  }

  const remove = async () => {
    if (!confirm('Apagar sua conta e todo o histórico? Isso não pode ser desfeito.')) return
    await api.deleteAccount()
    await authClient.signOut().catch(() => {})
    navigate('/')
  }

  return (
    <section className="content-panel space-y-8">
      <div className="flex items-center gap-4">
        <Avatar image={me.user.image} label={me.user.name || me.user.email || '?'} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{me.user.name || 'Perfil'}</h1>
          <p className="text-sm text-slate-500">{me.user.email}</p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-4">
        <label className="block text-sm font-medium">
          Apelido
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            placeholder="Como você aparece no ranking"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 font-normal dark:border-slate-600"
          />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={showInRanking}
            onChange={(e) => setShowInRanking(e.target.checked)}
            className="mt-1"
          />
          <span>
            Aparecer no ranking diário com meu apelido
            <span className="block text-xs text-slate-500">O ranking chega em breve. Nome e e-mail nunca são mostrados.</span>
          </span>
        </label>
        <button className="rounded-lg bg-brand-blue px-4 py-2 font-semibold text-white">Salvar</button>
        {message && (
          <p role="status" className={message.ok ? 'text-sm text-brand-green' : 'text-sm text-red-600'}>
            {message.text}
          </p>
        )}
      </form>

      <div className="space-y-2 border-t border-slate-200 pt-6 dark:border-slate-800">
        <h2 className="font-semibold">Seus dados</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/api/me/export" className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600">
            Baixar meus dados
          </a>
          <button type="button" onClick={signOut} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600">
            Sair
          </button>
          <button type="button" onClick={remove} className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:text-red-400">
            Apagar conta
          </button>
        </div>
      </div>
    </section>
  )
}
