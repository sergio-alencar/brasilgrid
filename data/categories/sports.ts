import { defineCategories } from './types.ts'

export default defineCategories([
  {
    id: 'world-cup-2014-host',
    family: 'sports',
    label: 'Sediou jogos da Copa de 2014',
    description: 'Uma cidade da UF foi sede de jogos da Copa do Mundo FIFA de 2014.',
    members: ['AM', 'BA', 'CE', 'DF', 'MG', 'MT', 'PE', 'PR', 'RJ', 'RN', 'RS', 'SP'],
    source: { name: 'Wikipédia — Copa do Mundo FIFA de 2014', url: 'https://pt.wikipedia.org/wiki/Copa_do_Mundo_FIFA_de_2014' },
    notes: 'Recife: jogos na Arena Pernambuco, em São Lourenço da Mata (PE).',
    difficulty: 2,
  },
  {
    id: 'brazilian-champion-club',
    family: 'sports',
    label: 'Tem clube campeão brasileiro',
    description: 'Algum clube da UF tem título de campeão brasileiro reconhecido pela CBF (inclui Taça Brasil e Robertão).',
    members: ['BA', 'MG', 'PE', 'PR', 'RJ', 'RS', 'SP'],
    source: { name: 'Wikipédia — Campeonato Brasileiro de Futebol', url: 'https://pt.wikipedia.org/wiki/Campeonato_Brasileiro_de_Futebol' },
    notes: 'BA: Bahia (1959, 1988). PE: Sport (1987). PR: Coritiba (1985), Athletico (2001).',
    difficulty: 2,
  },
  {
    id: 'libertadores-champion-club',
    family: 'sports',
    label: 'Tem campeão da Libertadores',
    description: 'Algum clube da UF já venceu a Copa Libertadores da América.',
    members: ['MG', 'RJ', 'RS', 'SP'],
    source: { name: 'Wikipédia — Copa Libertadores da América', url: 'https://pt.wikipedia.org/wiki/Copa_Libertadores_da_Am%C3%A9rica' },
    difficulty: 2,
  },
  {
    id: 'copa-do-brasil-champion-club',
    family: 'sports',
    label: 'Tem campeão da Copa do Brasil',
    description: 'Algum clube da UF já venceu a Copa do Brasil.',
    members: ['MG', 'PE', 'PR', 'RJ', 'RS', 'SC', 'SP'],
    source: { name: 'Wikipédia — Copa do Brasil de Futebol', url: 'https://pt.wikipedia.org/wiki/Copa_do_Brasil_de_Futebol' },
    notes: 'SC: Criciúma (1991). PE: Sport (2008). PR: Athletico (2019). SP inclui Santo André (2004) e Paulista (2005).',
    difficulty: 2,
  },
])
