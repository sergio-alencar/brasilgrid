// Corrige o gap de IDs causado pelo --launch errado no segundo publish.
//
// Situação atual em produção:
//   IDs  1-30: play_date Oct 18 – Nov 16 (corretos)
//   IDs 31-75: play_date Dec 17 – Jan 30 (IDs calculados com launch=Nov 17, deveriam ser 61-105)
//   FALTANDO:  play_date Nov 17 – Dec 16 (IDs 31-60 estavam livres mas foram pulados)
//
// Correção:
//   1. Apaga IDs 31-75 (são puzzles futuros; nenhuma partida existe)
//   2. Re-publica puzzles/2026-11-17_75d.json com launch=2026-10-18
//      → IDs corretos: 31 (Nov 17) … 105 (Jan 30)
//
// Uso: DATABASE_URL="..." npx tsx scripts/fix-puzzle-id-gap.ts
import { readFile } from 'node:fs/promises'
import pg from 'pg'
import { CATEGORIES } from '../data/categories/index.ts'
import type { GeneratedPuzzle } from './lib/generator.ts'
import { publishPuzzles } from './lib/publish.ts'
import { LOCAL_DATABASE_URL } from './migrate.ts'

const PUZZLE_FILE = 'puzzles/2026-11-17_75d.json'
const CORRECT_LAUNCH = '2026-10-18'
const DELETE_FROM_ID = 31

const url = process.env.DATABASE_URL ?? LOCAL_DATABASE_URL
const client = new pg.Client({ connectionString: url })
await client.connect()

try {
  const { rows: before } = await client.query<{ count: string }>(
    `select count(*) as count from puzzle where id >= $1`,
    [DELETE_FROM_ID],
  )
  const toDelete = Number(before[0].count)
  console.log(`Apagando ${toDelete} puzzles com id >= ${DELETE_FROM_ID} em ${new URL(url).host}…`)

  await client.query(`delete from puzzle where id >= $1`, [DELETE_FROM_ID])
  console.log(`${toDelete} puzzles apagados (cascade: puzzle_category, puzzle_cell).`)

  const batch = JSON.parse(await readFile(PUZZLE_FILE, 'utf8')) as { puzzles: GeneratedPuzzle[] }
  console.log(`\nPublicando ${batch.puzzles.length} puzzles com launch=${CORRECT_LAUNCH}…`)

  const { inserted, skipped } = await publishPuzzles(client, batch.puzzles, CATEGORIES, CORRECT_LAUNCH)
  console.log(`\n${inserted} grades publicadas.`)
  if (skipped.length) console.log(`Já existiam (ignoradas): ${skipped.join(', ')}`)
} finally {
  await client.end()
}
