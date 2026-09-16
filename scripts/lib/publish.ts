import type pg from 'pg'
import type { CategoryDef } from '../../data/categories/types.ts'
import { puzzleNumber } from '../../shared/brasiliaDay.ts'
import type { GeneratedPuzzle } from './generator.ts'

export interface PublishResult {
  inserted: number
  skipped: string[]
}

/** Grava as grades com cópia do gabarito. Datas já publicadas são ignoradas. */
export async function publishPuzzles(
  client: pg.Client,
  puzzles: GeneratedPuzzle[],
  categories: CategoryDef[],
  launchDate: string,
): Promise<PublishResult> {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const result: PublishResult = { inserted: 0, skipped: [] }

  await client.query('begin')
  try {
    for (const p of puzzles) {
      const id = puzzleNumber(p.playDate, launchDate)
      if (id < 1) throw new Error(`${p.playDate} é anterior ao lançamento (${launchDate})`)
      const inserted = await client.query(
        `insert into puzzle (id, play_date, status) values ($1, $2, 'published') on conflict do nothing`,
        [id, p.playDate],
      )
      if (inserted.rowCount === 0) {
        result.skipped.push(p.playDate)
        continue
      }
      const axes = [
        ['row', p.rows],
        ['col', p.cols],
      ] as const
      for (const [axis, ids] of axes) {
        for (const [position, categoryId] of ids.entries()) {
          const cat = byId.get(categoryId)
          if (!cat) throw new Error(`Categoria desconhecida: ${categoryId}`)
          await client.query(
            `insert into puzzle_category
               (puzzle_id, axis, position, category_id, label, description, source_name, source_url, members)
             values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, axis, position, cat.id, cat.label, cat.description, cat.source.name, cat.source.url, cat.members],
          )
        }
      }
      for (const [cell, validUfs] of p.cells.entries()) {
        await client.query(`insert into puzzle_cell (puzzle_id, cell, valid_ufs) values ($1, $2, $3)`, [
          id,
          cell,
          validUfs,
        ])
      }
      result.inserted++
    }
    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  }
  return result
}
