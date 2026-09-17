import { BANDS, MAX_GUESSES } from '../../shared/rarity.ts'

export function HowToPlay() {
  return (
    <article className="space-y-4">
      <h1 className="text-2xl font-bold">Como jogar</h1>
      <p>
        Preencha a grade 3×3 com estados brasileiros (ou o Distrito Federal). Cada célula pede uma UF que atenda à
        categoria da linha <strong>e</strong> à da coluna.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Você tem {MAX_GUESSES} palpites; cada erro gasta um.</li>
        <li>Cada UF só pode ser usada uma vez por grade.</li>
        <li>Uma grade nova aparece todo dia à meia-noite (horário de Brasília).</li>
      </ul>
      <h2 className="text-lg font-semibold">Raridade</h2>
      <p>
        Cada acerto vale o percentual de jogadores que escolheram a mesma UF naquela célula; célula vazia vale 100.
        Some tudo: quanto <strong>menor</strong> a raridade, melhor.
      </p>
      <ul className="grid grid-cols-2 gap-1 text-sm">
        {BANDS.map((b) => (
          <li key={b.band}>
            {b.emoji} {b.label} {b.minPercent > 0 ? `(≥ ${b.minPercent.toLocaleString('pt-BR')}%)` : '(< 0,5%)'}
          </li>
        ))}
      </ul>
    </article>
  )
}
