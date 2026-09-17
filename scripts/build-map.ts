// Baixa a malha das UFs (IBGE, qualidade mínima) e gera src/generated/brazilMap.ts.
import { writeFile } from 'node:fs/promises'
import { UFS } from '../shared/ufs.ts'
import { ROOT, today } from './lib/io.ts'

const URL_MAP =
  'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&intrarregiao=UF&qualidade=minima'

const svg = await (await fetch(URL_MAP)).text()
const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1]
const transform = svg.match(/<g id="BRUF" transform="([^"]+)"/)?.[1]
if (!viewBox || !transform) throw new Error('Formato inesperado do SVG do IBGE')

const paths: Record<string, string> = {}
for (const m of svg.matchAll(/<path id="(\d+)" d="([^"]+)"/g)) {
  const uf = UFS.find((u) => u.ibgeId === Number(m[1]))
  if (!uf) throw new Error(`Código IBGE desconhecido no mapa: ${m[1]}`)
  paths[uf.code] = m[2]
}
const missing = UFS.filter((u) => !paths[u.code]).map((u) => u.code)
if (missing.length) throw new Error(`Faltam UFs no mapa: ${missing.join(', ')}`)

const out = `// Gerado por scripts/build-map.ts em ${today()} — não editar.
// Fonte: IBGE, API de malhas (${URL_MAP})
export const MAP_VIEWBOX = ${JSON.stringify(viewBox)}
export const MAP_TRANSFORM = ${JSON.stringify(transform)}
export const MAP_PATHS: Record<string, string> = ${JSON.stringify(paths, null, 0)}
`
await writeFile(`${ROOT}/src/generated/brazilMap.ts`, out)
console.log(`src/generated/brazilMap.ts: ${Object.keys(paths).length} UFs, ${(out.length / 1024).toFixed(0)} KB`)
