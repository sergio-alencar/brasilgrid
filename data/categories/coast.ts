import { defineCategories } from './types.ts'

const IBGE_COAST = {
  name: 'IBGE — Municípios defrontantes com o mar (2024)',
  url: 'https://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial/municipios_defrontantes_com_o_mar/2024/',
}
const IBGE_NORTH = {
  name: 'IBGE — Municípios localizados no hemisfério norte (2024)',
  url: 'https://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial/municipios_localizados_no_hemisferio_norte/2024/',
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
    derive: (uf) => uf.territory.seaFacing,
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
    derive: (uf) => !uf.territory.seaFacing,
  },
  {
    id: 'crossed-by-equator',
    family: 'coast',
    label: 'Cortado pela Linha do Equador',
    description: 'A Linha do Equador atravessa o território da UF.',
    members: ['AM', 'AP', 'PA', 'RR'],
    source: IBGE_NORTH,
    notes: 'Conferido pela lista do IBGE de municípios com território no hemisfério norte; as quatro UFs também têm território ao sul.',
    difficulty: 2,
    derive: (uf) => uf.territory.northernHemisphere,
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
