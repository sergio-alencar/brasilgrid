import type { Biome, UfRecord } from './ufData.ts'
import { defineCategories } from './types.ts'

const IBGE_BIOMES = {
  name: 'IBGE — Bioma predominante por município para fins estatísticos (2024)',
  url: 'https://geoftp.ibge.gov.br/informacoes_ambientais/estudos_ambientais/biomas/documentos/',
}
const IBGE_SEMIARID = {
  name: 'IBGE — Municípios do Semiárido (2022)',
  url: 'https://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial/semiarido_brasileiro/Situacao_2022/',
}

const hasBiome = (biome: Biome) => (uf: UfRecord) => (uf.predominantBiomes[biome] ?? 0) > 0
const biomeCount = (uf: UfRecord) => Object.values(uf.predominantBiomes).filter((n) => n && n > 0).length

const RULE =
  'Conta se ao menos um município da UF tem esse bioma como predominante, segundo o IBGE (2024). Faixas pequenas de um bioma dentro de municípios onde outro predomina não contam.'

export default defineCategories([
  {
    id: 'biome-amazon',
    family: 'biomes',
    label: 'Tem Amazônia',
    description: `A UF tem municípios no bioma Amazônia. ${RULE}`,
    members: ['AC', 'AM', 'AP', 'MA', 'MT', 'PA', 'RO', 'RR', 'TO'],
    source: IBGE_BIOMES,
    difficulty: 1,
    derive: hasBiome('Amazônia'),
  },
  {
    id: 'biome-caatinga',
    family: 'biomes',
    label: 'Tem Caatinga',
    description: `A UF tem municípios no bioma Caatinga. ${RULE}`,
    members: ['AL', 'BA', 'CE', 'MG', 'PB', 'PE', 'PI', 'RN', 'SE'],
    source: IBGE_BIOMES,
    notes: 'O Ceará é a única UF com todos os municípios na Caatinga.',
    difficulty: 2,
    derive: hasBiome('Caatinga'),
  },
  {
    id: 'biome-cerrado',
    family: 'biomes',
    label: 'Tem Cerrado',
    description: `A UF tem municípios no bioma Cerrado. ${RULE}`,
    members: ['BA', 'DF', 'GO', 'MA', 'MG', 'MS', 'MT', 'PI', 'PR', 'SP', 'TO'],
    source: IBGE_BIOMES,
    notes: 'No Paraná, só um município tem o Cerrado como bioma predominante.',
    difficulty: 2,
    derive: hasBiome('Cerrado'),
  },
  {
    id: 'biome-atlantic-forest',
    family: 'biomes',
    label: 'Tem Mata Atlântica',
    description: `A UF tem municípios no bioma Mata Atlântica. ${RULE}`,
    members: ['AL', 'BA', 'ES', 'GO', 'MG', 'MS', 'PB', 'PE', 'PR', 'RJ', 'RN', 'RS', 'SC', 'SE', 'SP'],
    source: IBGE_BIOMES,
    difficulty: 2,
    derive: hasBiome('Mata Atlântica'),
  },
  {
    id: 'biome-pantanal',
    family: 'biomes',
    label: 'Tem Pantanal',
    description: `A UF tem municípios no bioma Pantanal. ${RULE}`,
    members: ['MS', 'MT'],
    source: IBGE_BIOMES,
    difficulty: 3,
    derive: hasBiome('Pantanal'),
  },
  {
    id: 'single-biome',
    family: 'biomes',
    label: 'Um único bioma',
    description: `Todos os municípios da UF têm o mesmo bioma predominante. ${RULE}`,
    members: ['AC', 'AM', 'AP', 'CE', 'DF', 'ES', 'PA', 'RJ', 'RO', 'RR', 'SC'],
    source: IBGE_BIOMES,
    difficulty: 2,
    derive: (uf) => biomeCount(uf) === 1,
  },
  {
    id: 'three-biomes',
    family: 'biomes',
    label: 'Três biomas ou mais',
    description: `Os municípios da UF se dividem em pelo menos três biomas predominantes. ${RULE}`,
    members: ['BA', 'MG', 'MS', 'MT'],
    source: IBGE_BIOMES,
    difficulty: 3,
    derive: (uf) => biomeCount(uf) >= 3,
  },
  {
    id: 'semiarid',
    family: 'biomes',
    label: 'Tem área no Semiárido',
    description: 'A UF tem ao menos um município na delimitação oficial do Semiárido brasileiro (SUDENE, 2022).',
    members: ['AL', 'BA', 'CE', 'ES', 'MA', 'MG', 'PB', 'PE', 'PI', 'RN', 'SE'],
    source: IBGE_SEMIARID,
    notes: 'A delimitação de 2021 incluiu municípios do Espírito Santo e do Maranhão.',
    difficulty: 3,
    derive: (uf) => uf.territory.semiarid,
  },
])
