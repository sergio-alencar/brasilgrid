import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GameMode, GameState, TodayResponse } from '../../shared/api.ts'
import { getUf } from '../../shared/ufs.ts'
import { CategoriesAtlas } from '../components/CategoriesAtlas.tsx'
import { ConfirmDialog } from '../components/ConfirmDialog.tsx'
import { GameSidebar } from '../components/GameSidebar.tsx'
import { Grid } from '../components/Grid.tsx'
import { IntroModal } from '../components/IntroModal.tsx'
import { BrazilSpinner } from '../components/BrazilSpinner.tsx'
import { ResultsPanel } from '../components/ResultsPanel.tsx'
import { SearchDialog } from '../components/SearchDialog.tsx'
import { ApiError, api } from '../lib/api.ts'
import { ensureSession } from '../lib/authClient.ts'
import { useLocale } from '../lib/locale.tsx'

const INTRO_SEEN_KEY = 'brasilgrid:intro-seen'

/** No desktop, a grade ocupa a tela toda sem rolar — só depois de terminar
 * é que aparece o resto (respostas) e a página passa a rolar normalmente. */
function useNoScrollWhilePlaying(active: boolean) {
  useEffect(() => {
    document.body.classList.toggle('game-in-progress', active)
    return () => document.body.classList.remove('game-in-progress')
  }, [active])
}

export function Home({ archivePuzzleId }: { archivePuzzleId?: number } = {}) {
  const { t, locale } = useLocale()
  const [mode, setMode] = useState<GameMode>(archivePuzzleId ? 'archive' : 'normal')
  const [today, setToday] = useState<TodayResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [game, setGame] = useState<GameState | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [atlasCategory, setAtlasCategory] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [shakeCell, setShakeCell] = useState<number | null>(null)
  const [confirmingGiveUp, setConfirmingGiveUp] = useState(false)
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
            ? t.home.archiveUnavailable
            : e instanceof ApiError && e.code === 'no_puzzle_today'
              ? t.home.noPuzzleToday
              : t.home.loadFailed,
        ),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="flex justify-center py-16"><BrazilSpinner size={120} /></div>
        {showIntro && <IntroModal onClose={dismissIntro} />}
      </>
    )

  const { puzzle, maxGuesses } = today
  const guessesLeft = game?.guessesLeft ?? (mode === 'practice' ? null : maxGuesses)

  const MESSAGES: Record<string, string> = {
    uf_used: t.home.ufUsed,
    cell_filled: t.home.cellFilled,
    game_over: t.home.gameOver,
    puzzle_unavailable: t.home.puzzleUnavailable,
  }

  const pick = async (uf: string) => {
    if (selected === null) return
    const cell = selected
    setSelected(null)
    setBusy(true)
    try {
      await ensureSession()
      const res = await api.guess(puzzle.id, cell, uf, mode)
      if (res.game) setGame(res.game)
      if (res.result !== 'ok') flash(MESSAGES[res.result] ?? t.home.guessRejected)
      else if (!res.correct) {
        flash(t.home.wrongUf(getUf(uf)?.name ?? uf))
        setShakeCell(cell)
        setTimeout(() => setShakeCell(null), 500)
      }
    } catch (e) {
      flash(e instanceof ApiError && e.code === 'puzzle_unavailable' ? MESSAGES.puzzle_unavailable : t.home.guessFailed)
    } finally {
      setBusy(false)
    }
  }

  const confirmGiveUp = async () => {
    setBusy(true)
    try {
      await ensureSession()
      setGame((await api.giveUp(puzzle.id, mode)).game)
    } catch {
      flash(t.home.giveUpFailed)
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
  const catLabel = (cat: { label: string; labelEn: string; labelEs: string }) =>
    locale === 'en' ? cat.labelEn : locale === 'es' ? cat.labelEs : cat.label

  return (
    <section className="game-fit">
      {archivePuzzleId && (
        <Link to="/arquivo" className="mb-2 inline-block text-sm text-white/80 underline hover:text-white">
          {t.home.backToArchive}
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
              locale={locale}
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
          onGiveUp={() => setConfirmingGiveUp(true)}
          onModeChange={archivePuzzleId ? undefined : changeMode}
        />
      </div>

      {finished && game && (
        <div className="mt-4">
          <ResultsPanel puzzleId={puzzle.id} rows={puzzle.rows} cols={puzzle.cols} game={game} mode={mode} locale={locale} />
        </div>
      )}

      {selected !== null && (
        <SearchDialog
          rowLabel={catLabel(rowOf(selected))}
          colLabel={catLabel(colOf(selected))}
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

      {confirmingGiveUp && (
        <ConfirmDialog
          title={mode === 'practice' ? t.home.giveUpTitlePractice : t.home.giveUpTitleDefault}
          message={
            mode === 'practice'
              ? t.home.giveUpMessagePractice
              : mode === 'archive'
                ? t.home.giveUpMessageArchive
                : t.home.giveUpMessageNormal
          }
          confirmLabel={mode === 'practice' ? t.home.giveUpConfirmPractice : t.home.giveUpConfirmDefault}
          cancelLabel={t.home.cancel}
          onConfirm={confirmGiveUp}
          onClose={() => setConfirmingGiveUp(false)}
        />
      )}
    </section>
  )
}
