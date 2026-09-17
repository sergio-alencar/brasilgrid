// Produção agropecuária por UF (IBGE/SIDRA): soja, café e efetivo de bovinos.
// Saída: data/raw/ibge-production.json
import { UFS } from '../shared/ufs.ts'
import { dataPath, fetchJson, today, writeJson } from './lib/io.ts'

const API = 'https://servicodados.ibge.gov.br/api/v3/agregados'

const idByIbgeId = new Map(UFS.map((u) => [u.ibgeId, u.code]))

interface Aggregate {
  resultados: { series: { localidade: { id: string }; serie: Record<string, string> }[] }[]
}

async function byUf(url: string): Promise<Record<string, number>> {
  const [data] = await fetchJson<Aggregate[]>(url)
  const out: Record<string, number> = {}
  for (const s of data.resultados[0].series) {
    const uf = idByIbgeId.get(Number(s.localidade.id))
    if (!uf) throw new Error(`UF desconhecida: ${s.localidade.id}`)
    const value = Object.values(s.serie)[0]
    out[uf] = value === '-' || value === '...' ? 0 : Number(value)
  }
  if (Object.keys(out).length !== 27) throw new Error(`Esperava 27 UFs, veio ${Object.keys(out).length} (${url})`)
  return out
}

const datasets = {
  soybean: {
    year: 2024,
    unit: 't',
    url: `${API}/1612/periodos/2024/variaveis/214?localidades=N3[all]&classificacao=81[2713]`,
  },
  coffee: {
    year: 2023,
    unit: 't',
    url: `${API}/1613/periodos/2023/variaveis/214?localidades=N3[all]&classificacao=82[2723]`,
  },
  cattleHerd: {
    year: 2023,
    unit: 'cabeças',
    url: `${API}/3939/periodos/2023/variaveis/105?localidades=N3[all]&classificacao=79[2670]`,
  },
} as const

const result: Record<string, { year: number; unit: string; url: string; values: Record<string, number> }> = {}
for (const [key, d] of Object.entries(datasets)) {
  result[key] = { year: d.year, unit: d.unit, url: d.url, values: await byUf(d.url) }
  const top = Object.entries(result[key].values).sort((a, b) => b[1] - a[1]).slice(0, 5)
  console.log(`${key} ${d.year}: top 5 = ${top.map(([uf, v]) => `${uf} (${Math.round(v).toLocaleString('pt-BR')})`).join(', ')}`)
}

await writeJson(dataPath('raw', 'ibge-production.json'), {
  source: {
    name: 'IBGE/SIDRA — Produção Agrícola Municipal (soja, café) e Pesquisa Pecuária Municipal (bovinos), por UF',
    accessed: today(),
  },
  ...result,
})
