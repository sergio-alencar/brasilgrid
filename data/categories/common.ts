import type { Source } from './types.ts'

export const IBGE_CENSO_2022: Source = {
  name: 'IBGE — Censo Demográfico 2022 (SIDRA, tabela 4714)',
  url: 'https://sidra.ibge.gov.br/tabela/4714',
}
export const IBGE_LOCALIDADES: Source = {
  name: 'IBGE — API de localidades',
  url: 'https://servicodados.ibge.gov.br/api/docs/localidades',
}
export const WIKIDATA_BORDERS: Source = {
  name: 'Wikidata — propriedade P47 (faz fronteira com)',
  url: 'https://www.wikidata.org/wiki/Property:P47',
}

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}
