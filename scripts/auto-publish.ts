// Garante grades publicadas de hoje até HORIZON_DAYS à frente, gerando só as que faltam.
// Roda todo dia no GitHub Actions. Uso: DATABASE_URL=... npm run puzzles:auto
import pg from 'pg'
import { brasiliaDate } from '../shared/brasiliaDay.ts'
import { CATEGORIES } from '../data/categories/index.ts'
import { generatePuzzles, type UsageHistory } from './lib/generator.ts'
import { loadUfs } from './lib/loadUfs.ts'
import { publishPuzzles } from './lib/publish.ts'
import { validateCategories } from './lib/validateCategories.ts'
import { LOCAL_DATABASE_URL } from './migrate.ts'

const HORIZON_DAYS = 30

const { errors } = validateCategories(CATEGORIES, loadUfs())
if (errors.length) throw new Error(`Categorias inválidas:\n${errors.join('\n')}`)

const cooldownDays = Math.min(10, Math.floor(CATEGORIES.length / 6) - 2)
const url = process.env.DATABASE_URL ?? LOCAL_DATABASE_URL
const client = new pg.Client({ connectionString: url })
await client.connect()
try {
  // O número da grade é contado a partir da grade #1, então o lançamento vem do próprio banco.
  const launch = await client.query<{ d: string }>(`select play_date::text as d from puzzle where id = 1`)
  if (!launch.rows[0]) throw new Error('Banco sem a grade #1; publique o primeiro lote manualmente.')

  const today = brasiliaDate()
  const missing = await client.query<{ d: string }>(
    `select d::date::text as d
       from generate_series($1::date, $1::date + $2::int, interval '1 day') d
      where not exists (select 1 from puzzle p where p.play_date = d::date)
      order by d`,
    [today, HORIZON_DAYS],
  )
  if (!missing.rows.length) {
    console.log(`Nada a fazer: grades publicadas até ${HORIZON_DAYS} dias à frente.`)
  } else {
    const from = missing.rows[0].d
    const to = missing.rows.at(-1)!.d
    const days = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1

    const recent = await client.query<{ d: string; ids: string[] }>(
      `select p.play_date::text as d, array_agg(pc.category_id) as ids
         from puzzle p join puzzle_category pc on pc.puzzle_id = p.id
        where p.play_date >= $1::date - $2::int and p.play_date < $1::date
        group by p.play_date`,
      [from, cooldownDays],
    )
    const history: UsageHistory[] = recent.rows.map((r) => ({ playDate: r.d, categoryIds: r.ids }))

    const puzzles = generatePuzzles(
      CATEGORIES,
      {
        from,
        days,
        seed: Number(from.replaceAll('-', '')),
        cooldownDays,
        minAnswersPerCell: 2,
        minFamilies: 4,
        attemptsPerDay: 20_000,
      },
      history,
    )
    const { inserted, skipped } = await publishPuzzles(client, puzzles, CATEGORIES, launch.rows[0].d)
    console.log(`${inserted} grades publicadas (${from} → ${to}) em ${new URL(url).host}.`)
    // Data que faltava e mesmo assim foi ignorada = número da grade já usado por outra data.
    const stillMissing = skipped.filter((d) => missing.rows.some((r) => r.d === d))
    if (stillMissing.length) {
      throw new Error(`Números de grade em conflito; continuam sem grade: ${stillMissing.join(', ')}`)
    }
  }
} finally {
  await client.end()
}
