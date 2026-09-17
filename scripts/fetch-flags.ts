// Baixa a bandeira de cada UF do Wikimedia Commons (arquivo indicado no Wikidata, P41)
// e registra licença e autoria. Saída: public/flags/<UF>.svg e data/flags.json
import { writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { optimize } from 'svgo'
import { z } from 'zod'
import { UFS } from '../shared/ufs.ts'
import { ROOT, dataPath, fetchJson, today, writeJson } from './lib/io.ts'

const QUERY = `SELECT ?iso ?flag WHERE {
  ?uf wdt:P300 ?iso . FILTER(STRSTARTS(?iso, "BR-")) ?uf wdt:P17 wd:Q155 .
  ?uf wdt:P41 ?flag .
}`

const sparql = z.object({
  results: z.object({ bindings: z.array(z.object({ iso: z.object({ value: z.string() }), flag: z.object({ value: z.string() }) })) }),
})
const imageInfo = z.object({
  query: z.object({
    pages: z.record(
      z.string(),
      z.object({
        title: z.string(),
        imageinfo: z.array(
          z.object({
            url: z.string(),
            descriptionurl: z.string(),
            extmetadata: z.record(z.string(), z.object({ value: z.unknown() })),
          }),
        ),
      }),
    ),
  }),
})

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

const { results } = sparql.parse(
  await fetchJson(`https://query.wikidata.org/sparql?query=${encodeURIComponent(QUERY)}`, {
    headers: { Accept: 'application/sparql-results+json' },
  }),
)
const fileByUf = new Map<string, string>()
for (const r of results.bindings) {
  const code = r.iso.value.replace('BR-', '')
  const file = decodeURIComponent(r.flag.value.split('/').pop()!)
  if (fileByUf.has(code) && fileByUf.get(code) !== file) throw new Error(`${code} tem mais de uma bandeira no Wikidata`)
  fileByUf.set(code, file)
}

// Compara original e otimizado renderizados; devolve a fração de pixels diferentes.
const browser = await chromium.launch()
const page = await browser.newPage()
// Código do navegador como texto: o tsx injeta helpers que não existem na página.
const PIXEL_DIFF_JS = `async ([svgA, svgB]) => {
  const draw = async (svg) => {
    const img = new Image()
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
    await img.decode()
    const canvas = new OffscreenCanvas(300, 200)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, 300, 200)
    return ctx.getImageData(0, 0, 300, 200).data
  }
  const [pa, pb] = await Promise.all([draw(svgA), draw(svgB)])
  let diff = 0
  for (let i = 0; i < pa.length; i += 4) {
    const d = Math.abs(pa[i] - pb[i]) + Math.abs(pa[i + 1] - pb[i + 1]) + Math.abs(pa[i + 2] - pb[i + 2])
    if (d > 30) diff++
  }
  return diff / (pa.length / 4)
}`

async function pixelDiff(a: string, b: string): Promise<number> {
  const fn = await page.evaluateHandle(PIXEL_DIFF_JS)
  return (await fn.evaluate((f, args) => (f as (x: string[]) => Promise<number>)(args), [a, b])) as number
}

const flags = []
for (const uf of UFS) {
  const file = fileByUf.get(uf.code)
  if (!file) throw new Error(`Sem bandeira para ${uf.code}`)
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&titles=${encodeURIComponent(`File:${file}`)}`
  const page = Object.values(imageInfo.parse(await fetchJson(api)).query.pages)[0]
  const info = page.imageinfo[0]
  const meta = (k: string) => stripHtml(String(info.extmetadata[k]?.value ?? ''))

  const res = await fetch(info.url, { headers: { 'User-Agent': 'BrasilGrid-data/0.1 (https://github.com/sergio-alencar/brasilgrid)' } })
  if (!res.ok) throw new Error(`${res.status} ao baixar ${info.url}`)
  const original = await res.text()
  if (!original.includes('<svg')) throw new Error(`${file} não parece um SVG`)
  const optimized = optimize(original, { multipass: true, floatPrecision: 2 }).data
  const diff = await pixelDiff(original, optimized)
  const optimizedOk = diff < 0.002
  const svg = optimizedOk ? optimized : original
  await writeFile(`${ROOT}/public/flags/${uf.code}.svg`, svg)

  flags.push({
    code: uf.code,
    file,
    page: info.descriptionurl,
    license: meta('LicenseShortName'),
    author: meta('Artist'),
    bytes: svg.length,
  })
  console.log(
    `${uf.code} ${meta('LicenseShortName')} — ${(svg.length / 1024).toFixed(0)} KB` +
      (optimizedOk ? '' : ` (otimização descartada: ${(diff * 100).toFixed(1)}% dos pixels mudaram)`),
  )
  await new Promise((r) => setTimeout(r, 300))
}

await browser.close()

await writeJson(dataPath('flags.json'), {
  source: { name: 'Wikimedia Commons (arquivos indicados no Wikidata, P41)', accessed: today() },
  flags,
})
