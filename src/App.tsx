import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import { Avatar } from './components/Avatar.tsx'
import { authClient } from './lib/authClient.ts'
import { Home } from './pages/Home.tsx'
import { HowToPlay } from './pages/HowToPlay.tsx'
import { Login } from './pages/Login.tsx'
import { Placeholder } from './pages/Placeholder.tsx'
import { Privacy } from './pages/Privacy.tsx'
import { Profile } from './pages/Profile.tsx'
import { Sources } from './pages/Sources.tsx'
import { Stats } from './pages/Stats.tsx'
import { Terms } from './pages/Terms.tsx'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'font-semibold' : ''}`

function Header() {
  const { data: session } = authClient.useSession()
  const loggedIn = session && !session.user.isAnonymous
  return (
    <header className="border-b border-slate-200 dark:border-slate-800">
      <nav className="mx-auto flex max-w-xl items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="text-lg font-bold">
          Brasil<span className="text-brand-green">Grid</span>
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

export function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="mx-auto max-w-xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/como-jogar" element={<HowToPlay />} />
          <Route path="/estatisticas" element={<Stats />} />
          <Route path="/entrar" element={<Login />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/r/:shareId" element={<Placeholder title="Resultado" />} />
          <Route path="/fontes" element={<Sources />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="*" element={<Placeholder title="Página não encontrada" />} />
        </Routes>
      </main>
      <footer className="mx-auto flex max-w-xl justify-center gap-4 px-4 pb-8 text-xs text-slate-500">
        <Link to="/fontes" className="underline">
          Fontes e créditos
        </Link>
        <Link to="/privacidade" className="underline">
          Privacidade
        </Link>
        <Link to="/termos" className="underline">
          Termos
        </Link>
      </footer>
    </BrowserRouter>
  )
}
