import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home.tsx'
import { HowToPlay } from './pages/HowToPlay.tsx'
import { Placeholder } from './pages/Placeholder.tsx'

export function App() {
  return (
    <BrowserRouter>
      <header className="border-b border-slate-200 dark:border-slate-800">
        <nav className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold">
            Brasil<span className="text-brand-green">Grid</span>
          </Link>
          <Link to="/como-jogar" className="text-sm underline-offset-4 hover:underline">
            Como jogar
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/como-jogar" element={<HowToPlay />} />
          <Route path="/estatisticas" element={<Placeholder title="Estatísticas" />} />
          <Route path="/entrar" element={<Placeholder title="Entrar" />} />
          <Route path="/perfil" element={<Placeholder title="Perfil" />} />
          <Route path="/r/:shareId" element={<Placeholder title="Resultado" />} />
          <Route path="/fontes" element={<Placeholder title="Fontes e créditos" />} />
          <Route path="/privacidade" element={<Placeholder title="Política de privacidade" />} />
          <Route path="/termos" element={<Placeholder title="Termos de uso" />} />
          <Route path="*" element={<Placeholder title="Página não encontrada" />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
