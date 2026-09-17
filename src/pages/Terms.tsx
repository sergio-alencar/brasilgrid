import { Link } from 'react-router-dom'
import { LEGAL_UPDATED_AT } from '../lib/site.ts'

export function Terms() {
  return (
    <article className="content-panel space-y-4 text-sm [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc">
      <h1 className="text-2xl font-bold">Termos de uso</h1>
      <p className="text-xs text-slate-500">
        Atualizados em {new Date(`${LEGAL_UPDATED_AT}T12:00:00`).toLocaleDateString('pt-BR')}
      </p>
      <p>O BrasilGrid é um jogo gratuito de conhecimentos sobre as unidades da federação do Brasil.</p>

      <h2>Uso do jogo</h2>
      <ul>
        <li>Jogue de forma justa: não use programas para automatizar palpites nem para sobrecarregar o serviço.</li>
        <li>Apelidos ofensivos, que se passem por outra pessoa ou que exponham dados pessoais podem ser removidos.</li>
        <li>Podemos suspender contas que descumpram estes termos.</li>
      </ul>

      <h2>Respostas e dados</h2>
      <p>
        As categorias usam fontes públicas, como IBGE e Wikidata, listadas em <Link to="/fontes">Fontes e créditos</Link>.
        Fazemos o possível para que o gabarito esteja certo, mas erros podem acontecer. Se encontrar um, avise: quando
        confirmado, o gabarito é corrigido para as próximas grades.
      </p>

      <h2>Disponibilidade</h2>
      <p>O jogo é oferecido como está, sem garantia de funcionamento contínuo. Regras e pontuação podem mudar.</p>

      <h2>Privacidade</h2>
      <p>
        O tratamento de dados pessoais está descrito na <Link to="/privacidade">Política de privacidade</Link>.
      </p>
    </article>
  )
}
