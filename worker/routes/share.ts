import { sql } from 'drizzle-orm'
import { Hono } from 'hono'
import type { SharedResult } from '../../shared/api.ts'
import type { Db } from '../db/client.ts'

type AppEnv = { Bindings: Env; Variables: { db: Db } }

interface Row extends Record<string, unknown> {
  puzzle_id: number
  play_date: string
  status: SharedResult['status']
  correct_count: number
  rarity: number
  cells: { cell: number; percent: number }[] | null
  rows: string[]
  cols: string[]
}

export async function loadSharedResult(db: Db, shareId: string): Promise<SharedResult | null> {
  if (!/^[a-z0-9]{6,20}$/.test(shareId)) return null
  const { rows } = await db.execute<Row>(sql`
    select g.puzzle_id, p.play_date::text as play_date, g.status, g.correct_count,
      coalesce(g.final_rarity, game_rarity(g.id)) as rarity,
      (
        select json_agg(json_build_object('cell', gu.cell, 'percent', cpc.picks::real / greatest(ps.players, 1) * 100))
        from guess gu
        join cell_pick_count cpc on cpc.puzzle_id = g.puzzle_id and cpc.cell = gu.cell and cpc.uf = gu.uf
        left join puzzle_stats ps on ps.puzzle_id = g.puzzle_id
        where gu.game_id = g.id and gu.is_correct
      ) as cells,
      array(select label from puzzle_category where puzzle_id = g.puzzle_id and axis = 'row' order by position) as rows,
      array(select label from puzzle_category where puzzle_id = g.puzzle_id and axis = 'col' order by position) as cols
    from game g
    join puzzle p on p.id = g.puzzle_id
    where g.share_id = ${shareId} and g.status <> 'in_progress'
  `)
  const r = rows[0]
  if (!r) return null
  const cellPercents: (number | null)[] = Array(9).fill(null)
  for (const c of r.cells ?? []) cellPercents[c.cell] = c.percent
  return {
    puzzleId: r.puzzle_id,
    playDate: r.play_date,
    status: r.status,
    correctCount: r.correct_count,
    rarity: Math.round(r.rarity),
    cellPercents,
    rows: r.rows,
    cols: r.cols,
  }
}

export const shareRoutes = new Hono<AppEnv>()

shareRoutes.get('/:shareId', async (c) => {
  const result = await loadSharedResult(c.get('db'), c.req.param('shareId'))
  if (!result) return c.json({ error: 'not_found' }, 404)
  c.header('Cache-Control', 'public, max-age=60')
  return c.json(result)
})
