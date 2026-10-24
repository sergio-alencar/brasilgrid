import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { MeResponse } from '../../shared/api.ts'
import { Avatar } from '../components/Avatar.tsx'
import { ApiError, api } from '../lib/api.ts'
import { authClient } from '../lib/authClient.ts'
import { useLocale } from '../lib/locale.tsx'

export function Profile() {
  const { t } = useLocale()
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

  if (isPending) return <p className="text-slate-500">{t.profile.loading}</p>
  if (!session || session.user.isAnonymous) {
    return (
      <section className="content-panel space-y-2">
        <h1 className="text-2xl font-bold">{t.nav.profile}</h1>
        <p>
          <Link to="/entrar" className="underline">
            {t.profile.loginPrompt}
          </Link>{' '}
          {t.profile.loginSuffix}
        </p>
      </section>
    )
  }
  if (!me) return <p className="text-slate-500">{t.profile.loading}</p>

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      await api.updateProfile({ nickname: nickname.trim() || null, showInRanking })
      setMessage({ ok: true, text: t.profile.saved })
    } catch (err) {
      setMessage({ ok: false, text: (err instanceof ApiError && err.serverMessage) || t.profile.saveFailed })
    }
  }

  const signOut = async () => {
    await authClient.signOut()
    navigate('/')
  }

  const remove = async () => {
    if (!confirm(t.profile.deleteConfirm)) return
    await api.deleteAccount()
    await authClient.signOut().catch(() => {})
    navigate('/')
  }

  return (
    <section className="content-panel space-y-8">
      <div className="flex items-center gap-4">
        <Avatar image={me.user.image} label={me.user.name || me.user.email || '?'} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{me.user.name || t.profile.defaultName}</h1>
          <p className="text-sm text-slate-500">{me.user.email}</p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-4">
        <label className="block text-sm font-medium">
          {t.profile.nickname}
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            placeholder={t.profile.nicknamePlaceholder}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
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
            {t.profile.showInRanking}
            <span className="block text-xs text-slate-500">{t.profile.rankingNote}</span>
          </span>
        </label>
        <button className="rounded-lg bg-brand-green px-4 py-2 font-semibold text-white">{t.profile.save}</button>
        {message && (
          <p role="status" className={message.ok ? 'text-sm text-brand-green' : 'text-sm text-red-600'}>
            {message.text}
          </p>
        )}
      </form>

      <div className="space-y-2 border-t border-slate-200 pt-6">
        <h2 className="font-semibold">{t.profile.yourData}</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/api/me/export" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {t.profile.downloadData}
          </a>
          <button type="button" onClick={signOut} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {t.profile.signOut}
          </button>
          <button type="button" onClick={remove} className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700">
            {t.profile.deleteAccount}
          </button>
        </div>
      </div>
    </section>
  )
}
