import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, LEGAL_UPDATED_AT } from '../lib/site.ts'

export function Privacy() {
  return (
    <article className="content-panel prose-sm space-y-4 [&_h2]:mt-6 [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc">
      <h1 className="text-2xl font-bold">Política de privacidade</h1>
      <p className="text-xs text-slate-500">
        Atualizada em {new Date(`${LEGAL_UPDATED_AT}T12:00:00`).toLocaleDateString('pt-BR')}
      </p>
      <p>
        Esta página explica quais dados o BrasilGrid guarda, por quê e o que você pode fazer com eles, conforme a Lei
        Geral de Proteção de Dados (Lei 13.709/2018).
      </p>

      <h2>O que guardamos</h2>
      <ul>
        <li>
          <strong>Partidas:</strong> os palpites de cada grade, acertos, raridade e datas. São necessários para o jogo
          funcionar e para calcular suas estatísticas.
        </li>
        <li>
          <strong>Sessão:</strong> um cookie que identifica seu navegador, além do endereço IP e do tipo de navegador da
          sessão, usados para segurança e para evitar abuso.
        </li>
        <li>
          <strong>Se você criar uma conta:</strong> seu e-mail e, no login com Google, o nome e a foto que o Google
          fornece. O apelido é opcional e só aparece no ranking se você escolher.
        </li>
      </ul>

      <h2>O que não fazemos</h2>
      <ul>
        <li>Não vendemos nem compartilhamos seus dados para publicidade.</li>
        <li>Não usamos cookies de rastreamento. O cookie de sessão é essencial para o jogo.</li>
        <li>Não mostramos nome nem e-mail para outros jogadores.</li>
      </ul>

      <h2>Com quem os dados são tratados</h2>
      <ul>
        <li>Cloudflare (hospedagem e proteção contra robôs)</li>
        <li>Neon (banco de dados)</li>
        <li>Resend (envio do código de login por e-mail)</li>
        <li>Google (só se você entrar com Google)</li>
      </ul>

      <h2>Por quanto tempo</h2>
      <ul>
        <li>Partidas de visitantes sem conta são apagadas após 60 dias sem uso.</li>
        <li>Dados de contas ficam até você apagar a conta.</li>
        <li>
          Os percentuais de raridade de cada grade são contagens agregadas e anônimas; eles continuam existindo depois
          que uma conta é apagada.
        </li>
      </ul>

      <h2>Seus direitos</h2>
      <p>
        No seu <Link to="/perfil">perfil</Link> você pode baixar todos os seus dados e apagar sua conta a qualquer
        momento.{' '}
        {CONTACT_EMAIL ? (
          <>
            Para outros pedidos, escreva para <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </>
        ) : (
          <>Para outros pedidos, use o contato informado nesta página (em breve).</>
        )}
      </p>
    </article>
  )
}
