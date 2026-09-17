import { useCallback, useEffect, useState } from 'react'
import type { GameState, TodayResponse } from '../../shared/api.ts'
import { getUf } from '../../shared/ufs.ts'
import { Grid } from '../components/Grid.tsx'
import { ResultsPanel } from '../components/ResultsPanel.tsx'
import { SearchDialog } from '../components/SearchDialog.tsx'
import { ApiError, api } from '../lib/api.ts'
import { ensureSession } from '../lib/authClient.ts'

const MESSAGES: Record<string, string> = {
  uf_used: 'Essa UF já foi usada nesta grade.',
  cell_filled: 'Essa célula já está preenchida.',
  game_over: 'A partida já terminou.',
  puzzle_unavailable: 'Esta grade não está mais disponível. Recarregue a página.',
}

export function Home() {
  const [today, setToday] = useState<TodayResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [game, setGame] = useState<GameState | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [shakeCell, setShakeCell] = useState<number | null>(null)

  useEffect(() => {
    api.today().then(
      (t) => {
        setToday(t)
        setGame(t.game)
      },
      (e) => setLoadError(e instanceof ApiError && e.code === 'no_puzzle_today' ? 'Ainda não há grade para hoje.' : 'Não foi possível carregar a grade.'),
    )
  }, [])

  const flash = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }, [])

  if (loadError) return <p className="text-center text-white/80">{loadError}</p>
  if (!today) return <p className="text-center text-white/80">Carregando a grade…</p>

  const { puzzle, maxGuesses } = today
  const finished = !!game && game.status !== 'in_progress'
  const guessesLeft = game?.guessesLeft ?? maxGuesses

  const pick = async (uf: string) => {
    if (selected === null) return
    const cell = selected
    setSelected(null)
    setBusy(true)
    try {
      await ensureSession()
      const res = await api.guess(puzzle.id, cell, uf)
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
    if (!confirm('Desistir e ver as respostas? A partida de hoje será encerrada.')) return
    setBusy(true)
    try {
      await ensureSession()
      setGame((await api.giveUp(puzzle.id)).game)
    } catch {
      flash('Não foi possível desistir agora.')
    } finally {
      setBusy(false)
    }
  }

  const rowOf = (cell: number) => puzzle.rows[Math.floor(cell / 3)]
  const colOf = (cell: number) => puzzle.cols[cell % 3]

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">BrasilGrid #{puzzle.id}</h1>
          <p className="text-xs text-white/70">
            {new Date(`${puzzle.playDate}T12:00:00`).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
          </p>
        </div>
        <div className="text-right text-sm">
          <p>
            <strong className="text-lg">{guessesLeft}</strong>/{maxGuesses} palpites
          </p>
          {game && <p className="text-xs text-white/70">raridade {game.rarity}</p>}
        </div>
      </div>

      <Grid
        rows={puzzle.rows}
        cols={puzzle.cols}
        filled={game?.filled ?? []}
        disabled={busy || finished}
        shakeCell={shakeCell}
        onSelect={setSelected}
      />

      {!finished && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={giveUp}
            disabled={busy}
            className="rounded-lg border border-white/40 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
          >
            Desistir e revelar
          </button>
        </div>
      )}

      {finished && game && <ResultsPanel puzzleId={puzzle.id} rows={puzzle.rows} cols={puzzle.cols} game={game} />}

      {selected !== null && (
        <SearchDialog
          title={`${rowOf(selected).label} × ${colOf(selected).label}`}
          usedUfs={game?.usedUfs ?? []}
          wrongHere={(game?.wrongGuesses ?? []).filter((w) => w.cell === selected).map((w) => w.uf)}
          onPick={pick}
          onClose={() => setSelected(null)}
        />
      )}

      {toast && (
        <div role="status" className="fixed inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-white dark:text-slate-900">
          {toast}
        </div>
      )}
    </section>
  )
}
