import { and, asc, eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import type {
  CategoryInfo,
  CellResults,
  GameMode,
  GameState,
  GuessResponse,
  GuessResult,
  ResultsResponse,
  TodayResponse,
} from '../../shared/api.ts'
import { brasiliaDate } from '../../shared/brasiliaDay.ts'
import { MAX_GUESSES, pickPercent } from '../../shared/rarity.ts'
import { isUfCode } from '../../shared/ufs.ts'
import type { AuthSession } from '../auth.ts'
import type { Db } from '../db/client.ts'
import { cellPickCount, game, guess, puzzle, puzzleCategory, puzzleCell, puzzleStats } from '../db/schema.ts'

type AppEnv = { Bindings: Env; Variables: { db: Db; session: AuthSession | null } }

const modeSchema = z.enum(['normal', 'practice']).default('normal')

async function playersOf(db: Db, puzzleId: number): Promise<number> {
  const [row] = await db.select({ players: puzzleStats.players }).from(puzzleStats).where(eq(puzzleStats.puzzleId, puzzleId))
  return row?.players ?? 0
}

async function loadGameState(db: Db, userId: string, puzzleId: number, mode: GameMode): Promise<GameState | null> {
  const [g] = await db
    .select()
    .from(game)
    .where(and(eq(game.userId, userId), eq(game.puzzleId, puzzleId), eq(game.mode, mode)))
  if (!g) return null

  const [guesses, counts, players] = await Promise.all([
    db.select().from(guess).where(eq(guess.gameId, g.id)).orderBy(asc(guess.id)),
    db.select().from(cellPickCount).where(eq(cellPickCount.puzzleId, puzzleId)),
    playersOf(db, puzzleId),
  ])
  const picksOf = (cell: number, uf: string) => counts.find((c) => c.cell === cell && c.uf === uf)?.picks ?? 0

  const filled = guesses
    .filter((x) => x.isCorrect)
    .map((x) => ({ cell: x.cell, uf: x.uf, percent: pickPercent(picksOf(x.cell, x.uf), players) }))
  const rarity = filled.reduce((s, f) => s + f.percent, 0) + (9 - filled.length) * 100

  return {
    mode: g.mode,
    status: g.status,
    guessesUsed: g.guessesUsed,
    guessesLeft: mode === 'practice' ? null : Math.max(MAX_GUESSES - g.guessesUsed, 0),
    correctCount: g.correctCount,
    filled,
    usedUfs: filled.map((f) => f.uf),
    wrongGuesses: guesses.filter((x) => !x.isCorrect).map((x) => ({ cell: x.cell, uf: x.uf })),
    rarity: Math.round(rarity),
    shareId: g.shareId,
  }
}

async function todayPuzzle(db: Db) {
  const [p] = await db
    .select()
    .from(puzzle)
    .where(and(eq(puzzle.playDate, brasiliaDate()), eq(puzzle.status, 'published')))
  return p
}

const guessBody = z.object({
  puzzleId: z.number().int().positive(),
  cell: z.number().int().min(0).max(8),
  uf: z.string().refine(isUfCode, 'UF inválida'),
  mode: modeSchema,
})
const giveUpBody = z.object({ puzzleId: z.number().int().positive(), mode: modeSchema })

export const gameRoutes = new Hono<AppEnv>()

gameRoutes.get('/puzzle/today', async (c) => {
  const mode = modeSchema.safeParse(c.req.query('mode')).data ?? 'normal'
  const db = c.get('db')
  const p = await todayPuzzle(db)
  if (!p) return c.json({ error: 'no_puzzle_today' }, 404)

  const cats = await db
    .select()
    .from(puzzleCategory)
    .where(eq(puzzleCategory.puzzleId, p.id))
    .orderBy(asc(puzzleCategory.position))
  const info = (axis: 'row' | 'col'): CategoryInfo[] =>
    cats
      .filter((x) => x.axis === axis)
      .map(({ categoryId, label, description, sourceName, sourceUrl }) => ({ categoryId, label, description, sourceName, sourceUrl }))

  const session = c.get('session')
  const body: TodayResponse = {
    puzzle: { id: p.id, playDate: p.playDate, rows: info('row'), cols: info('col') },
    maxGuesses: MAX_GUESSES,
    players: await playersOf(db, p.id),
    game: session ? await loadGameState(db, session.user.id, p.id, mode) : null,
  }
  c.header('Cache-Control', 'private, no-store')
  return c.json(body)
})

gameRoutes.post('/game/guess', async (c) => {
  const session = c.get('session')
  if (!session) return c.json({ error: 'unauthenticated' }, 401)
  const parsed = guessBody.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'invalid_body' }, 400)
  const { puzzleId, cell, uf, mode } = parsed.data

  const db = c.get('db')
  const { rows } = await db.execute<{ result: GuessResult; is_correct: boolean }>(
    sql`select result, is_correct from submit_guess(${session.user.id}, ${puzzleId}, ${cell}::smallint, ${uf}, ${MAX_GUESSES}::smallint, ${mode})`,
  )
  const row = rows[0]
  const body: GuessResponse = {
    result: row.result,
    correct: row.is_correct,
    game: await loadGameState(db, session.user.id, puzzleId, mode),
  }
  return c.json(body, row.result === 'puzzle_unavailable' ? 409 : 200)
})

gameRoutes.post('/game/give-up', async (c) => {
  const session = c.get('session')
  if (!session) return c.json({ error: 'unauthenticated' }, 401)
  const parsed = giveUpBody.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'invalid_body' }, 400)
  const { puzzleId, mode } = parsed.data

  const db = c.get('db')
  const { rows } = await db.execute<{ status: string }>(
    sql`select give_up(${session.user.id}, ${puzzleId}, ${mode}) as status`,
  )
  if (rows[0].status === 'puzzle_unavailable') return c.json({ error: 'puzzle_unavailable' }, 409)
  return c.json({ game: await loadGameState(db, session.user.id, puzzleId, mode) })
})

gameRoutes.get('/game/:puzzleId/results', async (c) => {
  const puzzleId = Number(c.req.param('puzzleId'))
  if (!Number.isInteger(puzzleId)) return c.json({ error: 'invalid_puzzle' }, 400)
  const mode = modeSchema.safeParse(c.req.query('mode')).data ?? 'normal'
  const session = c.get('session')
  const db = c.get('db')

  const [p] = await db.select().from(puzzle).where(eq(puzzle.id, puzzleId))
  if (!p || p.status !== 'published' || p.playDate > brasiliaDate()) return c.json({ error: 'not_found' }, 404)

  // Gabarito só depois do fim da partida (ou de um dia que já passou).
  const state = session ? await loadGameState(db, session.user.id, puzzleId, mode) : null
  const isPast = p.playDate < brasiliaDate()
  if (!isPast && (!state || state.status === 'in_progress')) return c.json({ error: 'game_not_finished' }, 403)

  const [cells, counts, cats, players] = await Promise.all([
    db.select().from(puzzleCell).where(eq(puzzleCell.puzzleId, puzzleId)).orderBy(asc(puzzleCell.cell)),
    db.select().from(cellPickCount).where(eq(cellPickCount.puzzleId, puzzleId)),
    db.select().from(puzzleCategory).where(eq(puzzleCategory.puzzleId, puzzleId)),
    playersOf(db, puzzleId),
  ])

  const cellResults: CellResults[] = cells.map(({ cell, validUfs }) => ({
    cell,
    answers: validUfs
      .map((uf) => {
        const picks = counts.find((x) => x.cell === cell && x.uf === uf)?.picks ?? 0
        return { uf, picks, percent: pickPercent(picks, players) }
      })
      .sort((a, b) => b.picks - a.picks || a.uf.localeCompare(b.uf)),
  }))

  const membersOf = (axis: 'row' | 'col', position: number) =>
    cats.find((x) => x.axis === axis && x.position === position)?.members ?? []

  const body: ResultsResponse = {
    players,
    cells: cellResults,
    wrongGuesses: (state?.wrongGuesses ?? []).map(({ cell, uf }) => ({
      cell,
      uf,
      failed: [
        ...(membersOf('row', Math.floor(cell / 3)).includes(uf) ? [] : (['row'] as const)),
        ...(membersOf('col', cell % 3).includes(uf) ? [] : (['col'] as const)),
      ],
    })),
  }
  return c.json(body)
})
