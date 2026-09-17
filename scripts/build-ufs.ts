// Junta IBGE + Wikidata em data/ufs.json, com checagens de consistência.
import { UFS } from '../shared/ufs.ts'
import { dataPath, readJson, today, writeJson } from './lib/io.ts'

interface IbgeRaw {
  source: unknown
  states: { code: string; ibgeId: number; name: string; region: string; population: number; areaKm2: number }[]
  municipalities: { ibgeId: number; name: string; uf: string; population: number | null }[]
}
interface WikidataRaw {
  source: unknown
  ufs: { code: string; capital: { name: string; ibgeId: number } | null; neighborUfs: string[]; neighborCountries: string[] }[]
}

interface TerritoryRaw {
  source: unknown
  lists: Record<'legalAmazon' | 'sudene' | 'seaFacing' | 'semiarid' | 'northernHemisphere', { ufs: string[] }>
  predominantBiomeMunicipalitiesByUf: Record<string, Record<string, number>>
}

interface ProductionRaw {
  source: unknown
  soybean: { year: number; values: Record<string, number> }
  coffee: { year: number; values: Record<string, number> }
  cattleHerd: { year: number; values: Record<string, number> }
}

const ibge = await readJson<IbgeRaw>(dataPath('raw', 'ibge.json'))
const territory = await readJson<TerritoryRaw>(dataPath('raw', 'ibge-territory.json'))
const production = await readJson<ProductionRaw>(dataPath('raw', 'ibge-production.json'))

function top5<T extends string>(values: Record<T, number>): Set<T> {
  return new Set(
    (Object.entries(values) as [T, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([code]) => code),
  )
}
const topSoybean = top5(production.soybean.values)
const topCoffee = top5(production.coffee.values)
const topCattle = top5(production.cattleHerd.values)
const wikidata = await readJson<WikidataRaw>(dataPath('raw', 'wikidata.json'))
const errors: string[] = []

const cities = new Map(ibge.municipalities.map((m) => [m.ibgeId, m]))
const wd = new Map(wikidata.ufs.map((u) => [u.code, u]))

const ufs = UFS.map((canon) => {
  const state = ibge.states.find((s) => s.code === canon.code)
  const w = wd.get(canon.code)
  if (!state || !w) throw new Error(`Faltam dados para ${canon.code}`)
  if (state.ibgeId !== canon.ibgeId || state.name !== canon.name || state.region !== canon.region) {
    errors.push(`${canon.code}: shared/ufs.ts diverge do IBGE`)
  }

  const own = ibge.municipalities.filter((m) => m.uf === canon.code)
  const ranked = own.filter((m) => m.population !== null).sort((a, b) => b.population! - a.population!)
  const largest = ranked[0]

  const capitalCity = w.capital ? cities.get(w.capital.ibgeId) : undefined
  if (!capitalCity || capitalCity.uf !== canon.code) errors.push(`${canon.code}: capital do Wikidata não bate com o IBGE`)

  for (const nb of w.neighborUfs) {
    if (!wd.get(nb)?.neighborUfs.includes(canon.code)) errors.push(`${canon.code}↔${nb}: divisa não é simétrica no Wikidata`)
  }

  return {
    code: canon.code,
    ibgeId: canon.ibgeId,
    name: canon.name,
    region: canon.region,
    population2022: state.population,
    areaKm2: state.areaKm2,
    municipalityCount: own.length,
    capital: capitalCity && {
      name: capitalCity.name,
      ibgeId: capitalCity.ibgeId,
      population2022: capitalCity.population,
      isLargestCity: capitalCity.ibgeId === largest.ibgeId,
    },
    largestCity: { name: largest.name, ibgeId: largest.ibgeId, population2022: largest.population },
    neighborUfs: w.neighborUfs,
    neighborCountries: w.neighborCountries,
    territory: Object.fromEntries(
      Object.entries(territory.lists).map(([key, list]) => [key, list.ufs.includes(canon.code)]),
    ) as Record<keyof TerritoryRaw['lists'], boolean>,
    predominantBiomes: territory.predominantBiomeMunicipalitiesByUf[canon.code] ?? {},
    production: {
      soybeanTonnes2024: production.soybean.values[canon.code],
      coffeeTonnes2023: production.coffee.values[canon.code],
      cattleHead2023: production.cattleHerd.values[canon.code],
      topSoybeanProducer: topSoybean.has(canon.code),
      topCoffeeProducer: topCoffee.has(canon.code),
      topCattleProducer: topCattle.has(canon.code),
    },
  }
})

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

await writeJson(dataPath('ufs.json'), {
  generated: today(),
  sources: [ibge.source, wikidata.source, territory.source, production.source],
  notes: [
    'population2022 e areaKm2: Censo 2022 (IBGE, tabela 4714).',
    'municipalityCount: API de localidades do IBGE na data de coleta (inclui municípios criados depois do Censo).',
    'territory: a UF tem ao menos um município na lista oficial do IBGE (Amazônia Legal 2024, SUDENE 2021, defrontantes com o mar 2024, semiárido 2022, hemisfério norte 2024).',
    'predominantBiomes: nº de municípios por bioma predominante (IBGE, 2024).',
    `production: soja e bovinos ${production.soybean.year}, café ${production.coffee.year} (IBGE/SIDRA — PAM e PPM).`,
    'neighborCountries: ISO 3166-1 alfa-2 do país de cada vizinho no Wikidata (Guiana Francesa aparece como FR).',
  ],
  ufs,
})
console.log(`data/ufs.json: ${ufs.length} UFs`)
