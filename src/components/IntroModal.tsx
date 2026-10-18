import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MAX_GUESSES } from '../../shared/rarity.ts'

export function IntroModal({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => dialog.current?.showModal(), [])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl bg-brand-green p-5 text-white shadow-xl backdrop:bg-black/60"
    >
      <h2 className="text-xl font-bold">
        Bem-vindo ao Brasil<span className="text-brand-yellow">Grid</span>!
      </h2>
      <p className="mt-2 text-sm text-white/80">
        Um jogo diário de geografia do Brasil. Preencha a grade 3×3 com estados (ou o Distrito Federal) que atendam à
        categoria da linha <strong>e</strong> à da coluna.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/90">
        <li>Você tem {MAX_GUESSES} palpites; cada erro gasta um.</li>
        <li>Cada UF só pode ser usada uma vez por grade.</li>
        <li>Quanto menor a raridade, mais rara (e melhor) foi sua resposta.</li>
        <li>Uma grade nova aparece todo dia à meia-noite (horário de Brasília).</li>
      </ul>
      <div className="mt-5 flex items-center justify-between gap-3">
        <Link to="/como-jogar" className="text-sm text-white/80 underline hover:text-white">
          Regras completas
        </Link>
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="cursor-pointer rounded-lg bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-green hover:brightness-95"
        >
          Entendi, vamos jogar!
        </button>
      </div>
    </dialog>
  )
}
