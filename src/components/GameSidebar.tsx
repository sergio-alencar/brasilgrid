import type { GameMode } from '../../shared/api.ts'

interface Props {
  playDate: string
  guessesLeft: number | null
  maxGuesses: number
  rarity: number | null
  mode: GameMode
  finished: boolean
  busy: boolean
  onGiveUp: () => void
  onModeChange: (mode: GameMode) => void
}

export function GameSidebar({
  playDate,
  guessesLeft,
  maxGuesses,
  rarity,
  mode,
  finished,
  busy,
  onGiveUp,
  onModeChange,
}: Props) {
  const infinite = mode === 'practice'
  return (
    <aside aria-label="Painel do jogo" className="flex flex-col gap-2 overflow-y-auto md:min-h-0 md:w-56 md:flex-shrink-0 md:gap-3">
      <div className="rounded-xl border-2 border-white/25 bg-white/10 p-2 text-center md:p-3">
        <p className="text-xs text-white/70">
          {new Date(`${playDate}T12:00:00`).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:gap-3">
        <div
          className="rounded-xl border-2 border-white/25 bg-white/10 p-2 text-center md:p-3"
          aria-label={guessesLeft === null ? 'palpites ilimitados' : `${guessesLeft} de ${maxGuesses} palpites restantes`}
        >
          <p className="text-3xl font-black">
            {guessesLeft === null ? (
              '∞'
            ) : (
              <>
                {guessesLeft}
                <span className="text-base font-normal text-white/70">/{maxGuesses}</span>
              </>
            )}
          </p>
          <p className="text-xs text-white/70">palpites</p>
        </div>
        <div className="rounded-xl border-2 border-white/25 bg-white/10 p-2 text-center md:p-3" aria-label="raridade">
          <p className="text-3xl font-black">{rarity ?? '—'}</p>
          <p className="text-xs text-white/70">raridade {rarity !== null && '(parcial)'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-white/25 bg-white/10 p-2 md:p-3">
        <div>
          <p className="text-sm font-semibold">Modo infinito</p>
          <p className="text-xs text-white/70">Sem limite de palpites; não conta nas estatísticas.</p>
        </div>
        <button
          type="button"
          onClick={() => onModeChange(infinite ? 'normal' : 'practice')}
          disabled={busy}
          role="switch"
          aria-checked={infinite}
          aria-label="Modo infinito"
          className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${infinite ? 'bg-brand-yellow' : 'bg-white/20'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${infinite ? 'left-5' : 'left-0.5'}`}
          />
        </button>
      </div>

      {!finished && (
        <button
          type="button"
          onClick={onGiveUp}
          disabled={busy}
          className="rounded-xl border-2 border-white/40 p-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-50 md:p-3"
        >
          {infinite ? 'Encerrar treino' : 'Desistir e revelar'}
        </button>
      )}
    </aside>
  )
}
