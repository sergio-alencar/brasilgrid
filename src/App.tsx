import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { authClient } from './lib/authClient.ts'
import { LocaleProvider, useLocale } from './lib/locale.tsx'
import { Archive } from './pages/Archive.tsx'
import { ArchivePlay } from './pages/ArchivePlay.tsx'
import { Home } from './pages/Home.tsx'
import { HowToPlay } from './pages/HowToPlay.tsx'
import { Login } from './pages/Login.tsx'
import { NotFound } from './pages/NotFound.tsx'
import { Privacy } from './pages/Privacy.tsx'
import { Profile } from './pages/Profile.tsx'
import { SharedResultPage } from './pages/SharedResultPage.tsx'
import { Sources } from './pages/Sources.tsx'
import { Stats } from './pages/Stats.tsx'
import { Terms } from './pages/Terms.tsx'

// Rotas só de desenvolvimento (removidas do build).
const ReviewPuzzles = import.meta.env.DEV ? lazy(() => import('./pages/dev/ReviewPuzzles.tsx')) : null
import { BrazilSpinner } from './components/BrazilSpinner.tsx'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-2 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/15 hover:text-white ${
    isActive ? 'text-brand-yellow' : ''
  }`

function LangSwitch({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useLocale()
  return (
    <div
      role="group"
      aria-label={t.langSwitch.ariaLabel}
      className={`flex overflow-hidden rounded-md text-xs font-semibold ${className}`}
    >
      {(['pt', 'en', 'es'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`cursor-pointer px-2 py-1 uppercase transition ${
            locale === l ? 'bg-brand-yellow text-brand-green' : 'bg-white/15 text-white/90 hover:bg-white/25'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function Header() {
  const { data: session } = authClient.useSession()
  const loggedIn = session && !session.user.isAnonymous
  const { pathname } = useLocation()
  const { t } = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPathname, setMenuPathname] = useState(pathname)
  if (pathname !== menuPathname) {
    setMenuPathname(pathname)
    setMenuOpen(false)
  }

  const NAV_LINKS: [string, string][] = [
    ['/como-jogar', t.nav.howToPlay],
    ['/arquivo', t.nav.archive],
    ['/estatisticas', t.nav.stats],
  ]

  const closeMenu = () => setMenuOpen(false)
  const accountLink = loggedIn ? (
    <NavLink to="/perfil" className={navClass} onClick={closeMenu}>
      {t.nav.profile}
    </NavLink>
  ) : (
    <NavLink to="/entrar" className={navClass} onClick={closeMenu}>
      {t.nav.login}
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-brand-green shadow-sm">
      <nav className="relative mx-auto flex max-w-2xl items-center justify-end gap-2 px-4 py-3 sm:px-6 lg:max-w-6xl">
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 text-xl font-semibold tracking-wide text-white"
        >
          Brasil<span className="text-brand-yellow">Grid</span>
        </Link>
        <div className="relative flex items-center gap-2">
          <LangSwitch className="hidden sm:flex" />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={menuOpen}
            className="cursor-pointer rounded-md p-1.5 text-white/90 hover:bg-white/15 hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="absolute top-full right-0 z-20 mt-1 flex w-44 flex-col gap-1.5 rounded-xl border border-white/15 bg-brand-green p-1.5 shadow-xl">
            {NAV_LINKS.map(([to, label]) => (
              <NavLink key={to} to={to} className={navClass} onClick={closeMenu}>
                {label}
              </NavLink>
            ))}
            <div className="my-0.5 border-t border-white/15" />
            {accountLink}
            <div className="my-0.5 border-t border-white/15 sm:hidden" />
            <LangSwitch className="sm:hidden" />
          </div>
        )}
      </nav>
    </header>
  )
}

function AppShell() {
  const { pathname } = useLocation()
  const { t, locale } = useLocale()
  const wide = pathname === '/' || pathname.startsWith('/arquivo/')
  return (
    <>
      <Header />
      <div className={`page-box flex-1 ${wide ? 'page-box--wide' : 'page-box--narrow'}`}>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/arquivo" element={<Archive key={locale} />} />
            <Route path="/arquivo/:id" element={<ArchivePlay />} />
            <Route path="/como-jogar" element={<HowToPlay />} />
            <Route path="/estatisticas" element={<Stats />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/r/:shareId" element={<SharedResultPage />} />
            <Route path="/fontes" element={<Sources />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/termos" element={<Terms />} />
            {import.meta.env.DEV && (
              <Route
                path="/dev/spinner"
                element={
                  <div className="flex flex-wrap items-end gap-8 p-8">
                    {[40, 80, 120, 200].map((s) => (
                      <BrazilSpinner key={s} size={s} />
                    ))}
                  </div>
                }
              />
            )}
            {ReviewPuzzles && (
              <Route
                path="/dev/grades"
                element={
                  <Suspense fallback={<p>Carregando…</p>}>
                    <ReviewPuzzles />
                  </Suspense>
                }
              />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <footer className={`mx-auto flex justify-center gap-4 px-4 py-6 text-xs text-white/70 ${wide ? 'max-w-2xl lg:max-w-6xl' : 'max-w-2xl'}`}>
        <Link to="/fontes" className="hover:text-white hover:underline">
          {t.footer.sources}
        </Link>
        <Link to="/privacidade" className="hover:text-white hover:underline">
          {t.footer.privacy}
        </Link>
        <Link to="/termos" className="hover:text-white hover:underline">
          {t.footer.terms}
        </Link>
      </footer>
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <AppShell />
      </LocaleProvider>
    </BrowserRouter>
  )
}
