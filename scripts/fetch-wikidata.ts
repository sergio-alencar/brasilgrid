// Coleta do Wikidata (CC0): capital atual e vizinhos (P47) de cada UF.
// Saída: data/raw/wikidata.json
import { z } from 'zod'
import { dataPath, fetchJson, today, writeJson } from './lib/io.ts'

const ENDPOINT = 'https://query.wikidata.org/sparql'

const QUERY = `
SELECT ?iso ?capitalLabel ?capitalIbge ?nbIso ?nbCountry WHERE {
  ?uf wdt:P300 ?iso . FILTER(STRSTARTS(?iso, "BR-"))
  ?uf wdt:P17 wd:Q155 .
  OPTIONAL { ?uf p:P36 ?cs . ?cs ps:P36 ?capital . FILTER NOT EXISTS { ?cs pq:P582 [] }
             OPTIONAL { ?capital wdt:P1585 ?capitalIbge } }
  OPTIONAL { ?uf wdt:P47 ?nb .
             OPTIONAL { ?nb wdt:P300 ?nbIso }
             OPTIONAL { ?nb wdt:P17 ?nbCountryItem . ?nbCountryItem wdt:P297 ?nbCountry } }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "pt". }
}`

const responseSchema = z.object({
  results: z.object({ bindings: z.array(z.record(z.string(), z.object({ value: z.string() }))) }),
})

const url = `${ENDPOINT}?query=${encodeURIComponent(QUERY)}`
const { results } = responseSchema.parse(
  await fetchJson(url, { headers: { Accept: 'application/sparql-results+json' } }),
)

interface Entry {
  capital: { name: string; ibgeId: number } | null
  neighborUfs: Set<string>
  neighborCountries: Set<string>
}

const byUf = new Map<string, Entry>()
for (const row of results.bindings) {
  const code = row.iso.value.replace('BR-', '')
  const entry = byUf.get(code) ?? { capital: null, neighborUfs: new Set(), neighborCountries: new Set() }
  if (row.capitalLabel && row.capitalIbge) {
    const capital = { name: row.capitalLabel.value, ibgeId: Number(row.capitalIbge.value) }
    if (entry.capital && entry.capital.ibgeId !== capital.ibgeId) {
      throw new Error(`${code} tem mais de uma capital atual no Wikidata`)
    }
    entry.capital = capital
  }
  const nbIso = row.nbIso?.value
  if (nbIso?.startsWith('BR-')) entry.neighborUfs.add(nbIso.replace('BR-', ''))
  else if (row.nbCountry && row.nbCountry.value !== 'BR') entry.neighborCountries.add(row.nbCountry.value)
  byUf.set(code, entry)
}

const ufs = [...byUf.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([code, e]) => ({
    code,
    capital: e.capital,
    neighborUfs: [...e.neighborUfs].sort(),
    neighborCountries: [...e.neighborCountries].sort(),
  }))

await writeJson(dataPath('raw', 'wikidata.json'), {
  source: { name: 'Wikidata (CC0) — P36 capital, P47 faz fronteira com', urls: [ENDPOINT], query: QUERY.trim(), accessed: today() },
  ufs,
})
console.log(`Wikidata: ${ufs.length} UFs → data/raw/wikidata.json`)
