import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GameMode, GameState, TodayResponse } from '../../shared/api.ts'
import { getUf } from '../../shared/ufs.ts'
import { CategoriesAtlas } from '../components/CategoriesAtlas.tsx'
import { GameSidebar } from '../components/GameSidebar.tsx'
import { Grid } from '../components/Grid.tsx'
import { IntroModal } from '../components/IntroModal.tsx'
import { ResultsPanel } from '../components/ResultsPanel.tsx'
import { SearchDialog } from '../components/SearchDialog.tsx'
import { ApiError, api } from '../lib/api.ts'
import { ensureSession } from '../lib/authClient.ts'

const INTRO_SEEN_KEY = 'brasilgrid:intro-seen'

const MESSAGES: Record<string, string> = {
  uf_used: 'Essa UF já foi usada nesta grade.',
  cell_filled: 'Essa célula já está preenchida.',
  game_over: 'A partida já terminou.',
  puzzle_unavailable: 'Esta grade não está mais disponível. Recarregue a página.',
}

/** No desktop, a grade ocupa a tela toda sem rolar — só depois de terminar
 * é que aparece o resto (respostas) e a página passa a rolar normalmente. */
function useNoScrollWhilePlaying(active: boolean) {
  useEffect(() => {
    document.body.classList.toggle('game-in-progress', active)
    return () => document.body.classList.remove('game-in-progress')
  }, [active])
}

export function Home({ archivePuzzleId }: { archivePuzzleId?: number } = {}) {
  const [mode, setMode] = useState<GameMode>(archivePuzzleId ? 'archive' : 'normal')
  const [today, setToday] = useState<TodayResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [game, setGame] = useState<GameState | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [atlasCategory, setAtlasCategory] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [shakeCell, setShakeCell] = useState<number | null>(null)
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !localStorage.getItem(INTRO_SEEN_KEY)
    } catch {
      // Sem localStorage (ex.: navegação privada): não insiste no modal.
      return false
    }
  })

  const dismissIntro = () => {
    setShowIntro(false)
    try {
      localStorage.setItem(INTRO_SEEN_KEY, '1')
    } catch {
      // Sem localStorage: tudo bem, só não lembra entre sessões.
    }
  }

  useEffect(() => {
    const load = archivePuzzleId ? api.puzzle(archivePuzzleId) : api.today(mode)
    load.then(
      (t) => {
        setToday(t)
        setGame(t.game)
      },
      (e) =>
        setLoadError(
          archivePuzzleId
            ? 'Essa grade não está disponível no arquivo.'
            : e instanceof ApiError && e.code === 'no_puzzle_today'
              ? 'Ainda não há grade para hoje.'
              : 'Não foi possível carregar a grade.',
        ),
    )
  }, [mode, archivePuzzleId])

  const toastTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const flash = useCallback((message: string) => {
    clearTimeout(toastTimeout.current)
    setToast(message)
    toastTimeout.current = setTimeout(() => setToast(null), 2500)
  }, [])

  const finished = !!game && game.status !== 'in_progress'
  useNoScrollWhilePlaying(!!today && !finished)

  if (loadError)
    return (
      <>
        <p className="text-center text-white/80">{loadError}</p>
        {showIntro && <IntroModal onClose={dismissIntro} />}
      </>
    )
  if (!today)
    return (
      <>
        <p className="text-center text-white/80">Carregando a grade…</p>
        {showIntro && <IntroModal onClose={dismissIntro} />}
      </>
    )

  const { puzzle, maxGuesses } = today
  const guessesLeft = game?.guessesLeft ?? (mode === 'practice' ? null : maxGuesses)

  const pick = async (uf: string) => {
    if (selected === null) return
    const cell = selected
    setSelected(null)
    setBusy(true)
    try {
      await ensureSession()
      const res = await api.guess(puzzle.id, cell, uf, mode)
      if (res.game) setGame(res.game)
      if (res.result !== 'ok') flash(MESSAGES[res.result] ?? 'Palpite não aceito.')
      else if (!res.correct) {
        flash(`${getUf(uf)?.name} não serve aqui.`)
        setShakeCell(cell)
        setTimeout(() => setShakeCell(null), 500)
      }
    } catch (e) {
      flash(e instanceof ApiError && e.code === 'puzzle_unavailable' ? MESSAGES.puzzle_unavailable : 'Erro ao enviar o palpite.')
    } finally {
      setBusy(false)
    }
  }

  const giveUp = async () => {
    const question =
      mode === 'practice'
        ? 'Encerrar o treino e ver as respostas?'
        : mode === 'archive'
          ? 'Desistir e ver as respostas dessa grade do arquivo?'
          : 'Desistir e ver as respostas? A partida de hoje será encerrada.'
    if (!confirm(question)) return
    setBusy(true)
    try {
      await ensureSession()
      setGame((await api.giveUp(puzzle.id, mode)).game)
    } catch {
      flash('Não foi possível desistir agora.')
    } finally {
      setBusy(false)
    }
  }

  const changeMode = (next: GameMode) => {
    setSelected(null)
    setGame(null)
    setMode(next)
  }

  const rowOf = (cell: number) => puzzle.rows[Math.floor(cell / 3)]
  const colOf = (cell: number) => puzzle.cols[cell % 3]

  return (
    <section className="game-fit">
      {archivePuzzleId && (
        <Link to="/arquivo" className="mb-2 inline-block text-sm text-white/80 underline hover:text-white">
          ← Arquivo
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-4 md:min-h-0 md:flex-row">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="game-square aspect-square w-full max-w-xl">
            <Grid
              puzzleId={puzzle.id}
              rows={puzzle.rows}
              cols={puzzle.cols}
              filled={game?.filled ?? []}
              disabled={busy || finished}
              shakeCell={shakeCell}
              onSelect={setSelected}
              onOpenAtlas={setAtlasCategory}
            />
          </div>
        </div>

        <GameSidebar
          guessesLeft={guessesLeft}
          maxGuesses={maxGuesses}
          rarity={game?.rarity ?? null}
          mode={mode}
          finished={finished}
          busy={busy}
          onGiveUp={giveUp}
          onModeChange={archivePuzzleId ? undefined : changeMode}
        />
      </div>

      {finished && game && (
        <div className="mt-4">
          <ResultsPanel puzzleId={puzzle.id} rows={puzzle.rows} cols={puzzle.cols} game={game} mode={mode} />
        </div>
      )}

      {selected !== null && (
        <SearchDialog
          rowLabel={rowOf(selected).label}
          colLabel={colOf(selected).label}
          usedUfs={game?.usedUfs ?? []}
          wrongHere={(game?.wrongGuesses ?? []).filter((w) => w.cell === selected).map((w) => w.uf)}
          onPick={pick}
          onClose={() => setSelected(null)}
        />
      )}

      {atlasCategory !== null && (
        <CategoriesAtlas initialCategoryId={atlasCategory} onClose={() => setAtlasCategory(null)} />
      )}

      {toast && (
        <div role="status" className="fixed inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      {showIntro && <IntroModal onClose={dismissIntro} />}
    </section>
  )
}
