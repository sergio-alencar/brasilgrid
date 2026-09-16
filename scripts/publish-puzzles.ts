// Publica um lote gerado no banco.
// Uso: npm run puzzles:publish -- --file puzzles/2026-11-01_60d.json --launch 2026-11-01
import { readFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import pg from 'pg'
import { CATEGORIES } from '../data/categories/index.ts'
import type { GeneratedPuzzle } from './lib/generator.ts'
import { publishPuzzles } from './lib/publish.ts'
import { LOCAL_DATABASE_URL } from './migrate.ts'

const { values } = parseArgs({ options: { file: { type: 'string' }, launch: { type: 'string' } } })
if (!values.file || !values.launch) throw new Error('Informe --file e --launch AAAA-MM-DD')

const batch = JSON.parse(await readFile(values.file, 'utf8')) as { puzzles: GeneratedPuzzle[] }
const url = process.env.DATABASE_URL ?? LOCAL_DATABASE_URL
const client = new pg.Client({ connectionString: url })
await client.connect()
try {
  const { inserted, skipped } = await publishPuzzles(client, batch.puzzles, CATEGORIES, values.launch)
  console.log(`${inserted} grades publicadas em ${new URL(url).host}.`)
  if (skipped.length) console.log(`Já existiam (ignoradas): ${skipped.join(', ')}`)
} finally {
  await client.end()
}
