import flagData from '../../data/flags.json'
import { getUf } from '../../shared/ufs.ts'

const SOURCES = [
  ['IBGE — Censo Demográfico 2022 (SIDRA)', 'https://sidra.ibge.gov.br/tabela/4714', 'População e área das UFs e dos municípios.'],
  ['IBGE — API de localidades', 'https://servicodados.ibge.gov.br/api/docs/localidades', 'UFs, regiões e municípios.'],
  ['IBGE — Estrutura territorial', 'https://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial/', 'Amazônia Legal, SUDENE, semiárido, litoral e hemisfério norte.'],
  ['IBGE — Bioma predominante por município (2024)', 'https://geoftp.ibge.gov.br/informacoes_ambientais/estudos_ambientais/biomas/documentos/', 'Categorias de biomas.'],
  ['IBGE — API de malhas', 'https://servicodados.ibge.gov.br/api/docs/malhas', 'Mapa das UFs.'],
  ['Wikidata (CC0)', 'https://www.wikidata.org/', 'Capitais, divisas e fronteiras.'],
  ['Wikipédia', 'https://pt.wikipedia.org/', 'Conferência de fatos históricos, esportivos e do Patrimônio Mundial (a fonte de cada categoria aparece no botão ⓘ da grade).'],
] as const

export function Sources() {
  return (
    <article className="space-y-6">
      <h1 className="text-2xl font-bold">Fontes e créditos</h1>
      <section>
        <h2 className="text-lg font-semibold">Dados</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {SOURCES.map(([name, url, what]) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer" className="font-medium underline">
                {name}
              </a>
              <span className="text-slate-500"> — {what}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Bandeiras</h2>
        <p className="mt-1 text-sm text-slate-500">
          Arquivos do Wikimedia Commons, obtidos em {new Date(`${flagData.source.accessed}T12:00:00`).toLocaleDateString('pt-BR')}.
        </p>
        <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          {flagData.flags.map((f) => (
            <li key={f.code} className="flex items-center gap-2">
              <img src={`/flags/${f.code}.svg`} alt="" className="h-4 w-6 rounded-sm object-cover ring-1 ring-black/10" />
              <a href={f.page} target="_blank" rel="noreferrer" className="underline">
                {getUf(f.code)?.name}
              </a>
              <span className="text-slate-500">— {f.license}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
