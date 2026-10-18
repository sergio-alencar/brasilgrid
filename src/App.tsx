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

const mobileNavClass = ({ isActive }: { isActive: boolean }) => `block ${navClass({ isActive })}`

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

  const closeMenu = () => setMenuOpen(false)
  const accountLink = loggedIn ? (
    <NavLink to="/perfil" className={navClass} aria-label="Perfil" onClick={closeMenu}>
      <Avatar image={session.user.image} label={session.user.name || session.user.email} />
    </NavLink>
  ) : (
    <NavLink to="/entrar" className={navClass} onClick={closeMenu}>
      Entrar
    </NavLink>
  )
  const mobileAccountLink = loggedIn ? (
    <NavLink to="/perfil" className={mobileNavClass} onClick={closeMenu}>
      Perfil
    </NavLink>
  ) : (
    <NavLink to="/entrar" className={mobileNavClass} onClick={closeMenu}>
      Entrar
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-brand-green shadow-sm">
      <nav className={`relative mx-auto flex items-center justify-end gap-2 px-4 py-3 sm:px-6 ${wide ? 'max-w-2xl lg:max-w-6xl' : 'max-w-2xl'}`}>
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 text-xl font-semibold tracking-wide text-white"
        >
          Brasil<span className="text-brand-yellow">Grid</span>
        </Link>
        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map(([to, label]) => (
              <NavLink key={to} to={to} className={navClass}>
                {label}
              </NavLink>
            ))}
            {accountLink}
          </div>
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
        {menuOpen && (
          <div className="absolute top-full right-4 z-20 mt-1 flex w-44 flex-col gap-0.5 rounded-xl border border-white/15 bg-brand-green p-1.5 shadow-xl sm:hidden">
            {NAV_LINKS.map(([to, label]) => (
              <NavLink key={to} to={to} className={mobileNavClass}>
                {label}
              </NavLink>
            ))}
            <div className="my-0.5 border-t border-white/15" />
            {mobileAccountLink}
          </div>
        )}
      </nav>
    </header>
  )
}

function AppShell() {
  const { pathname } = useLocation()
  const wide = pathname === '/' || pathname.startsWith('/arquivo/')
  return (
    <>
      <Header wide={wide} />
      <div className={`page-box flex-1 ${wide ? 'page-box--wide' : 'page-box--narrow'}`}>
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
        <Link to="/fontes" className="hover:text-white hover:underline">
          Fontes e créditos
        </Link>
        <Link to="/privacidade" className="hover:text-white hover:underline">
          Privacidade
        </Link>
        <Link to="/termos" className="hover:text-white hover:underline">
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
