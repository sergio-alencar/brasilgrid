// Substitui, dentro do mesmo lote, as grades rejeitadas na revisão (/dev/grades).
// Uso: npm run puzzles:regenerate -- --file puzzles/2026-11-01_60d.json --dates 2026-11-02,2026-11-05
import { parseArgs } from 'node:util'
import { CATEGORIES } from '../data/categories/index.ts'
import { loadUfs } from './lib/loadUfs.ts'
import { regeneratePuzzle } from './lib/generator.ts'
import { readJson, writeJson } from './lib/io.ts'
import { validateCategories } from './lib/validateCategories.ts'
import type { GeneratedPuzzle } from './lib/generator.ts'

const { values } = parseArgs({ options: { file: { type: 'string' }, dates: { type: 'string' } } })
if (!values.file || !values.dates) throw new Error('Informe --file e --dates AAAA-MM-DD,AAAA-MM-DD,...')

const { errors } = validateCategories(CATEGORIES, loadUfs())
if (errors.length) throw new Error(`Categorias inválidas; rode npm run data:validate\n${errors.join('\n')}`)

interface Batch {
  generated: string
  options: { seed: number; cooldownDays: number; minAnswersPerCell: number; minFamilies: number; attemptsPerDay: number }
  categoryCount: number
  puzzles: GeneratedPuzzle[]
}

const path = values.file
const batch = await readJson<Batch>(path)
const dates = values.dates.split(',').map((d) => d.trim())
const byId = new Map(CATEGORIES.map((c) => [c.id, c]))

for (const date of dates) {
  const index = batch.puzzles.findIndex((p) => p.playDate === date)
  if (index === -1) {
    console.warn(`Sem grade em ${date} no lote — ignorando.`)
    continue
  }
  // Semente diferente da original a cada tentativa, para não repetir a grade rejeitada.
  const seed = batch.options.seed + Number(date.replaceAll('-', '')) + Math.floor(Math.random() * 1_000_000)
  const puzzle = regeneratePuzzle(CATEGORIES, batch.puzzles, date, batch.options, seed)
  batch.puzzles[index] = puzzle
  const label = (id: string) => byId.get(id)?.label ?? id
  console.log(
    `${date}: [${puzzle.rows.map(label).join(' | ')}] × [${puzzle.cols.map(label).join(' | ')}]` +
      ` (armadilhas ${puzzle.metrics.traps}, intervalo ${puzzle.cooldownUsed}d)`,
  )
}

await writeJson(path, batch)
console.log(`Lote atualizado: ${path}`)
