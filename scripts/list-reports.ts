// Lista os avisos de erro em aberto. Uso: npm run reports
import pg from 'pg'
import { LOCAL_DATABASE_URL } from './migrate.ts'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL ?? LOCAL_DATABASE_URL })
await client.connect()
const { rows } = await client.query(`
  select r.id, r.puzzle_id, p.play_date::text, r.cell, r.uf, r.message, r.created_at,
    (select label from puzzle_category where puzzle_id = r.puzzle_id and axis = 'row' and position = r.cell / 3) as row_label,
    (select label from puzzle_category where puzzle_id = r.puzzle_id and axis = 'col' and position = r.cell % 3) as col_label,
    (select r.uf = any(valid_ufs) from puzzle_cell where puzzle_id = r.puzzle_id and cell = r.cell) as uf_accepted
  from report r join puzzle p on p.id = r.puzzle_id
  where r.status = 'open'
  order by r.created_at`)
await client.end()

if (!rows.length) console.log('Nenhum aviso em aberto.')
for (const r of rows) {
  const where = r.cell === null ? 'grade toda' : `${r.row_label} × ${r.col_label}`
  const uf = r.uf ? ` · ${r.uf} (${r.uf_accepted ? 'aceita' : 'não aceita'})` : ''
  console.log(`#${r.id} · jogo ${r.puzzle_id} (${r.play_date}) · ${where}${uf}\n  ${r.message}\n`)
}
