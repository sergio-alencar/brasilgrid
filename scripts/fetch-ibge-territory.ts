// Listas territoriais oficiais do IBGE, agregadas por UF.
// Saída: data/raw/ibge-territory.json
import * as XLSX from 'xlsx'
import { UFS } from '../shared/ufs.ts'
import { dataPath, today, writeJson } from './lib/io.ts'

const TERR = 'https://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial'
const BIOMES_CSV =
  'https://geoftp.ibge.gov.br/informacoes_ambientais/estudos_ambientais/biomas/documentos/Bioma_Predominante_por_Municipio_2024.csv'

const DATASETS = {
  legalAmazon: `${TERR}/amazonia_legal/2024/Municipios_da_Amazonia_Legal_2024.xls`,
  sudene: `${TERR}/area_atuacao_SUDENE/2021/SUDENE_2021.xls`,
  seaFacing: `${TERR}/municipios_defrontantes_com_o_mar/2024/Municipios_Defrontantes_com_o_Mar_2024.xls`,
  semiarid: `${TERR}/semiarido_brasileiro/Situacao_2022/lista_municipios_Semiarido_2022.xlsx`,
  northernHemisphere: `${TERR}/municipios_localizados_no_hemisferio_norte/2024/Municipios_Hemisferio_Norte_2024.xls`,
} as const

const ufByIbgeId = new Map(UFS.map((u) => [u.ibgeId, u.code]))

async function download(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} — ${url}`)
  return res.arrayBuffer()
}

/** UFs dos municípios listados na primeira planilha (coluna CD_MUN). */
async function ufsOfMunicipalityList(url: string): Promise<{ ufs: string[]; municipalities: number }> {
  const wb = XLSX.read(await download(url))
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]])
  const codes = rows.map((r) => String(r.CD_MUN ?? '').trim()).filter((c) => /^\d{7}$/.test(c))
  if (codes.length === 0) throw new Error(`Nenhum código de município em ${url}`)
  const ufs = new Set<string>()
  for (const code of codes) {
    const uf = ufByIbgeId.get(Number(code.slice(0, 2)))
    if (!uf) throw new Error(`Código de UF desconhecido em ${code} (${url})`)
    ufs.add(uf)
  }
  return { ufs: [...ufs].sort(), municipalities: codes.length }
}

async function biomesByUf(): Promise<Record<string, Record<string, number>>> {
  const text = new TextDecoder('utf-8').decode(await download(BIOMES_CSV)).replace(/^\uFEFF/, '')
  const out: Record<string, Record<string, number>> = {}
  for (const line of text.split(/\r?\n/).slice(1)) {
    const [code, , uf, biome] = line.split(';')
    if (!/^\d{7}$/.test(code ?? '')) continue
    if (!ufByIbgeId.has(Number(code.slice(0, 2)))) throw new Error(`Município inválido: ${line}`)
    out[uf] ??= {}
    out[uf][biome] = (out[uf][biome] ?? 0) + 1
  }
  return out
}

const lists: Record<string, { ufs: string[]; municipalities: number; url: string }> = {}
for (const [key, url] of Object.entries(DATASETS)) {
  lists[key] = { ...(await ufsOfMunicipalityList(url)), url }
  console.log(`${key}: ${lists[key].municipalities} municípios em ${lists[key].ufs.length} UFs`)
}
const biomes = await biomesByUf()

await writeJson(dataPath('raw', 'ibge-territory.json'), {
  source: {
    name: 'IBGE — Estrutura territorial e Bioma predominante por município (2024)',
    urls: [BIOMES_CSV, ...Object.values(DATASETS)],
    accessed: today(),
  },
  lists,
  predominantBiomeMunicipalitiesByUf: biomes,
})
console.log('→ data/raw/ibge-territory.json')
