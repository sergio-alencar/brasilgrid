interface Props {
  playDate: string
  guessesLeft: number
  maxGuesses: number
  rarity: number | null
  finished: boolean
  busy: boolean
  onGiveUp: () => void
}

export function GameSidebar({ playDate, guessesLeft, maxGuesses, rarity, finished, busy, onGiveUp }: Props) {
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
          aria-label={`${guessesLeft} de ${maxGuesses} palpites restantes`}
        >
          <p className="text-3xl font-black">
            {guessesLeft}
            <span className="text-base font-normal text-white/70">/{maxGuesses}</span>
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
          <p className="text-xs text-white/70">Em breve</p>
        </div>
        <button
          type="button"
          disabled
          aria-label="Modo infinito (em breve)"
          className="relative h-6 w-11 shrink-0 rounded-full bg-white/20 opacity-50"
        >
          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white" />
        </button>
      </div>

      {!finished && (
        <button
          type="button"
          onClick={onGiveUp}
          disabled={busy}
          className="rounded-xl border-2 border-white/40 p-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-50 md:p-3"
        >
          Desistir e revelar
        </button>
      )}
    </aside>
  )
}
