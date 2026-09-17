import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Avatar } from './components/Avatar.tsx'
import { authClient } from './lib/authClient.ts'
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

function Header() {
  const { data: session } = authClient.useSession()
  const loggedIn = session && !session.user.isAnonymous
  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-brand-green shadow-sm">
      <nav className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link to="/" className="text-xl font-semibold tracking-wide text-white">
          Brasil<span className="text-brand-yellow">Grid</span>
        </Link>
        <div className="flex items-center gap-1">
          <NavLink to="/como-jogar" className={navClass}>
            Como jogar
          </NavLink>
          <NavLink to="/estatisticas" className={navClass}>
            Estatísticas
          </NavLink>
          {loggedIn ? (
            <NavLink to="/perfil" className={navClass} aria-label="Perfil">
              <Avatar image={session.user.image} label={session.user.name || session.user.email} />
            </NavLink>
          ) : (
            <NavLink to="/entrar" className={navClass}>
              Entrar
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}

function AppShell() {
  const { pathname } = useLocation()
  const wide = pathname === '/'
  return (
    <>
      <Header />
      <div className={`page-box ${wide ? 'page-box--wide' : 'page-box--narrow'}`}>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
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
      <footer className="mx-auto flex max-w-2xl justify-center gap-4 px-4 py-6 text-xs text-white/70">
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
