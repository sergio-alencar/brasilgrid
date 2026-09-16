import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authClient, isInAppBrowser } from '../lib/authClient.ts'

export function Login() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inApp = isInAppBrowser()

  if (session && !session.user.isAnonymous) {
    return (
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Você já entrou</h1>
        <Link to="/perfil" className="underline">
          Ver perfil
        </Link>
      </section>
    )
  }

  const google = async () => {
    setError(null)
    const { error } = await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
    if (error) setError('Não foi possível entrar com o Google.')
  }

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: 'sign-in' })
    setBusy(false)
    if (error) setError('Não foi possível enviar o código. Confira o e-mail e tente de novo.')
    else setStep('code')
  }

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await authClient.signIn.emailOtp({ email: email.trim(), otp: code.trim() })
    setBusy(false)
    if (error) setError(error.code === 'TOO_MANY_ATTEMPTS' ? 'Tentativas demais. Peça um novo código.' : 'Código inválido ou expirado.')
    else navigate('/')
  }

  return (
    <section className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Com uma conta, seu histórico e sua sequência de dias ficam guardados. A partida de hoje vem junto.
        </p>
      </div>

      {inApp && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Você está no navegador de um app, onde o login com Google não funciona. Use o código por e-mail ou abra esta
          página no seu navegador.
        </p>
      )}

      <button
        type="button"
        onClick={google}
        disabled={inApp}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 font-medium hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-900"
      >
        <svg aria-hidden viewBox="0 0 48 48" className="h-5 w-5">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        Entrar com Google
      </button>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        ou
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      {step === 'email' ? (
        <form onSubmit={sendCode} className="space-y-3">
          <label className="block text-sm font-medium">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal dark:border-slate-600"
            />
          </label>
          <button disabled={busy} className="w-full rounded-lg bg-brand-green px-4 py-2.5 font-semibold text-white disabled:opacity-50">
            {busy ? 'Enviando…' : 'Receber código por e-mail'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <p className="text-sm">
            Enviamos um código de 6 dígitos para <strong>{email}</strong>.
          </p>
          <label className="block text-sm font-medium">
            Código
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-center font-mono text-2xl tracking-[0.4em] dark:border-slate-600"
            />
          </label>
          <button disabled={busy} className="w-full rounded-lg bg-brand-green px-4 py-2.5 font-semibold text-white disabled:opacity-50">
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
          <button type="button" onClick={() => setStep('email')} className="w-full text-sm text-slate-500 underline">
            Usar outro e-mail ou reenviar
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <p className="text-xs text-slate-500">
        Ao entrar, você concorda com os{' '}
        <Link to="/termos" className="underline">
          Termos de uso
        </Link>{' '}
        e a{' '}
        <Link to="/privacidade" className="underline">
          Política de privacidade
        </Link>
        .
      </p>
    </section>
  )
}
