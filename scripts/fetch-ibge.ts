// Coleta dados do IBGE: UFs, municípios e Censo 2022 (população e área).
// Saída: data/raw/ibge.json (compacto, com fonte e data de coleta).
import { z } from 'zod'
import { dataPath, fetchJson, today, writeJson } from './lib/io.ts'

const API = 'https://servicodados.ibge.gov.br/api'

const stateSchema = z.array(
  z.object({ id: z.number(), sigla: z.string(), nome: z.string(), regiao: z.object({ sigla: z.string() }) }),
)

const municipalitySchema = z.array(
  z.object({
    id: z.number(),
    nome: z.string(),
    microrregiao: z.object({ mesorregiao: z.object({ UF: z.object({ sigla: z.string() }) }) }).nullable(),
    'regiao-imediata': z
      .object({ 'regiao-intermediaria': z.object({ UF: z.object({ sigla: z.string() }) }) })
      .nullable()
      .optional(),
  }),
)

const aggregateSchema = z.array(
  z.object({
    id: z.string(),
    resultados: z.array(
      z.object({
        series: z.array(z.object({ localidade: z.object({ id: z.string() }), serie: z.record(z.string(), z.string()) })),
      }),
    ),
  }),
)

// Tabela 4714 do SIDRA: variável 93 = população residente, 6318 = área (km²).
async function census(level: 'N3' | 'N6') {
  const url = `${API}/v3/agregados/4714/periodos/2022/variaveis/93%7C6318?localidades=${level}%5Ball%5D`
  const data = aggregateSchema.parse(await fetchJson(url))
  const out = new Map<string, { population: number; areaKm2: number }>()
  for (const variable of data) {
    for (const s of variable.resultados[0].series) {
      const entry = out.get(s.localidade.id) ?? { population: NaN, areaKm2: NaN }
      const value = Number(s.serie['2022'])
      if (variable.id === '93') entry.population = value
      else entry.areaKm2 = value
      out.set(s.localidade.id, entry)
    }
  }
  return { url, values: out }
}

const states = stateSchema.parse(await fetchJson(`${API}/v1/localidades/estados?orderBy=nome`))
const municipalities = municipalitySchema.parse(await fetchJson(`${API}/v1/localidades/municipios`))
const stateCensus = await census('N3')
const cityCensus = await census('N6')

const ufOf = (m: (typeof municipalities)[number]) =>
  m.microrregiao?.mesorregiao.UF.sigla ?? m['regiao-imediata']?.['regiao-intermediaria'].UF.sigla

const result = {
  source: {
    name: 'IBGE — API de localidades e SIDRA (tabela 4714, Censo 2022)',
    urls: [`${API}/v1/localidades/estados`, `${API}/v1/localidades/municipios`, stateCensus.url, cityCensus.url],
    accessed: today(),
  },
  states: states.map((s) => {
    const c = stateCensus.values.get(String(s.id))
    if (!c) throw new Error(`Sem dados do Censo para ${s.sigla}`)
    return { code: s.sigla, ibgeId: s.id, name: s.nome, region: s.regiao.sigla, ...c }
  }),
  municipalities: municipalities.map((m) => {
    const uf = ufOf(m)
    const c = cityCensus.values.get(String(m.id))
    if (!uf) throw new Error(`Município sem UF: ${m.id} ${m.nome}`)
    // Municípios instalados depois do Censo 2022 não têm população.
    return { ibgeId: m.id, name: m.nome, uf, population: c?.population ?? null }
  }),
}

const missing = result.municipalities.filter((m) => m.population === null)
if (missing.length) console.warn('Sem dados do Censo 2022:', missing.map((m) => `${m.name}/${m.uf}`).join(', '))

await writeJson(dataPath('raw', 'ibge.json'), result)
console.log(`IBGE: ${result.states.length} UFs, ${result.municipalities.length} municípios → data/raw/ibge.json`)
