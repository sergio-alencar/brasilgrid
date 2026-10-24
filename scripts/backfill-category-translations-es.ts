// Preenche label_es/description_es das grades já publicadas, a partir do
// catálogo atual de categorias (por category_id). Rodar uma vez depois da
// migração 0007; não precisa rodar de novo depois (publish.ts já grava os
// três idiomas em grades novas).
import pg from 'pg'
import { CATEGORIES } from '../data/categories/index.ts'
import { LOCAL_DATABASE_URL } from './migrate.ts'

const byId = new Map(CATEGORIES.map((c) => [c.id, c]))
const url = process.env.DATABASE_URL ?? LOCAL_DATABASE_URL
const client = new pg.Client({ connectionString: url })
await client.connect()
try {
  const { rows } = await client.query<{ category_id: string }>(
    `select distinct category_id from puzzle_category where label_es = ''`,
  )
  let updated = 0
  for (const { category_id } of rows) {
    const cat = byId.get(category_id)
    if (!cat) {
      console.warn(`categoria sem tradução no catálogo atual (pulando): ${category_id}`)
      continue
    }
    const res = await client.query(
      `update puzzle_category set label_es = $1, description_es = $2 where category_id = $3`,
      [cat.labelEs, cat.descriptionEs, category_id],
    )
    updated += res.rowCount ?? 0
  }
  console.log(`${updated} linhas de puzzle_category atualizadas em ${new URL(url).host}.`)
} finally {
  await client.end()
}
