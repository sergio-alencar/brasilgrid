import type { GameMode } from '../../shared/api.ts'

interface Props {
  guessesLeft: number | null
  maxGuesses: number
  rarity: number | null
  mode: GameMode
  finished: boolean
  busy: boolean
  onGiveUp: () => void
  onModeChange?: (mode: GameMode) => void
}

export function GameSidebar({ guessesLeft, maxGuesses, rarity, mode, finished, busy, onGiveUp, onModeChange }: Props) {
  const infinite = mode === 'practice'
  return (
    <aside aria-label="Painel do jogo" className="flex flex-col gap-2 overflow-y-auto md:min-h-0 md:w-56 md:flex-shrink-0 md:gap-3">
      <div className={`grid gap-2 md:grid-cols-1 md:gap-3 ${onModeChange ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <div
          className="rounded-xl bg-white/10 p-2 text-center md:p-3"
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
        <div className="rounded-xl bg-white/10 p-2 text-center md:p-3" aria-label="raridade">
          <p className="text-3xl font-black">{rarity ?? '—'}</p>
          <p className="text-xs text-white/70">raridade {rarity !== null && '(parcial)'}</p>
        </div>

        {onModeChange && (
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/10 p-2 text-center md:p-3">
            <div className="group relative flex items-center gap-1">
              <p className="text-xs text-white/70">Infinito</p>
              <button
                type="button"
                tabIndex={0}
                aria-label="O que é o modo infinito? Sem limite de palpites; não conta nas estatísticas."
                className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-white/50 text-[9px] leading-none font-bold text-white/80 hover:border-white hover:text-white"
              >
                i
              </button>
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-40 -translate-x-1/2 rounded-lg bg-slate-900 p-2 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-white dark:text-slate-900"
              >
                Sem limite de palpites; não conta nas estatísticas.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onModeChange(infinite ? 'normal' : 'practice')}
              disabled={busy}
              role="switch"
              aria-checked={infinite}
              aria-label="Modo infinito"
              className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${infinite ? 'bg-brand-yellow' : 'bg-white/20'}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${infinite ? 'left-5' : 'left-0.5'}`}
              />
            </button>
          </div>
        )}
      </div>

      {!finished && (
        <button
          type="button"
          onClick={onGiveUp}
          disabled={busy}
          className="cursor-pointer rounded-xl bg-white/10 p-2 text-sm font-semibold hover:bg-white/15 disabled:opacity-50 md:p-3"
        >
          {infinite ? 'Encerrar treino' : 'Desistir e revelar'}
        </button>
      )}
    </aside>
  )
}
