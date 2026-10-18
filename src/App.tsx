import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Avatar } from './components/Avatar.tsx'
import { authClient } from './lib/authClient.ts'
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

// Revisão de grades: só existe no servidor de desenvolvimento (removida do build).
const ReviewPuzzles = import.meta.env.DEV ? lazy(() => import('./pages/dev/ReviewPuzzles.tsx')) : null

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-2 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/15 hover:text-white ${
    isActive ? 'text-brand-yellow' : ''
  }`

const NAV_LINKS: [string, string][] = [
  ['/como-jogar', 'Como jogar'],
  ['/arquivo', 'Arquivo'],
  ['/estatisticas', 'Estatísticas'],
]

function Header({ wide }: { wide: boolean }) {
  const { data: session } = authClient.useSession()
  const loggedIn = session && !session.user.isAnonymous
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPathname, setMenuPathname] = useState(pathname)
  if (pathname !== menuPathname) {
    setMenuPathname(pathname)
    setMenuOpen(false)
  }

  const accountLink = loggedIn ? (
    <NavLink to="/perfil" className={navClass} aria-label="Perfil" onClick={() => setMenuOpen(false)}>
      <Avatar image={session.user.image} label={session.user.name || session.user.email} />
    </NavLink>
  ) : (
    <NavLink to="/entrar" className={navClass} onClick={() => setMenuOpen(false)}>
      Entrar
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-brand-green shadow-sm">
      <nav className={`mx-auto flex items-center justify-between gap-2 px-4 py-3 sm:px-6 ${wide ? 'max-w-2xl lg:max-w-6xl' : 'max-w-2xl'}`}>
        <Link to="/" className="text-xl font-semibold tracking-wide text-white">
          Brasil<span className="text-brand-yellow">Grid</span>
        </Link>
        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map(([to, label]) => (
              <NavLink key={to} to={to} className={navClass}>
                {label}
              </NavLink>
            ))}
          </div>
          {accountLink}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            className="cursor-pointer rounded-md p-1.5 text-white/90 hover:bg-white/15 hover:text-white sm:hidden"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="border-t border-white/15 px-4 py-2 sm:hidden">
          <div className="mx-auto flex max-w-2xl flex-col gap-1">
            {NAV_LINKS.map(([to, label]) => (
              <NavLink key={to} to={to} className={`${navClass({ isActive: pathname === to })} w-full`}>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

function AppShell() {
  const { pathname } = useLocation()
  const wide = pathname === '/' || pathname.startsWith('/arquivo/')
  return (
    <>
      <Header wide={wide} />
      <div className={`page-box ${wide ? 'page-box--wide' : 'page-box--narrow'}`}>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/arquivo" element={<Archive />} />
            <Route path="/arquivo/:id" element={<ArchivePlay />} />
            <Route path="/como-jogar" element={<HowToPlay />} />
            <Route path="/estatisticas" element={<Stats />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/r/:shareId" element={<SharedResultPage />} />
            <Route path="/fontes" element={<Sources />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/termos" element={<Terms />} />
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
        <Link to="/fontes" className="underline decoration-white/40 hover:text-white">
          Fontes e créditos
        </Link>
        <Link to="/privacidade" className="underline decoration-white/40 hover:text-white">
          Privacidade
        </Link>
        <Link to="/termos" className="underline decoration-white/40 hover:text-white">
          Termos
        </Link>
      </footer>
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
