import { defineCategories } from './types.ts'

const IBGE_COAST = {
  name: 'IBGE — Municípios defrontantes com o mar',
  url: 'https://www.ibge.gov.br/geociencias/organizacao-do-territorio/estrutura-territorial/24072-municipios-defrontantes-com-o-mar.html',
}
const IBGE_ATLAS = {
  name: 'IBGE — Atlas Geográfico Escolar',
  url: 'https://atlasescolar.ibge.gov.br/',
}

export default defineCategories([
  {
    id: 'has-coastline',
    family: 'coast',
    label: 'Banhado pelo oceano',
    description: 'A UF tem litoral no Oceano Atlântico.',
    members: ['AL', 'AP', 'BA', 'CE', 'ES', 'MA', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RS', 'SC', 'SE', 'SP'],
    source: IBGE_COAST,
    difficulty: 1,
  },
  {
    id: 'landlocked',
    family: 'coast',
    label: 'Sem litoral',
    description: 'A UF não tem litoral no oceano.',
    members: ['AC', 'AM', 'DF', 'GO', 'MG', 'MS', 'MT', 'RO', 'RR', 'TO'],
    source: IBGE_COAST,
    notes: 'O Amazonas não chega ao mar: o rio desemboca no Pará e no Amapá.',
    difficulty: 1,
  },
  {
    id: 'crossed-by-equator',
    family: 'coast',
    label: 'Cortado pela Linha do Equador',
    description: 'A Linha do Equador atravessa o território da UF.',
    members: ['AM', 'AP', 'PA', 'RR'],
    source: IBGE_ATLAS,
    difficulty: 2,
  },
  {
    id: 'crossed-by-capricorn',
    family: 'coast',
    label: 'Cruza o Trópico de Capricórnio',
    description: 'O Trópico de Capricórnio atravessa o território da UF.',
    members: ['MS', 'PR', 'SP'],
    source: IBGE_ATLAS,
    difficulty: 2,
  },
])
