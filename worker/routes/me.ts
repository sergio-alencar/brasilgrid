import { eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import type { HistoryEntry, MeResponse, StatsResponse } from '../../shared/api.ts'
import { brasiliaDate } from '../../shared/brasiliaDay.ts'
import { bandFor } from '../../shared/rarity.ts'
import { streaks } from '../../shared/streak.ts'
import { createAuth, type AuthSession } from '../auth.ts'
import type { Db } from '../db/client.ts'
import { profile, user } from '../db/schema.ts'

type AppEnv = { Bindings: Env; Variables: { db: Db; session: AuthSession | null } }

export const meRoutes = new Hono<AppEnv>()

meRoutes.use('*', async (c, next) => {
  if (!c.get('session')) return c.json({ error: 'unauthenticated' }, 401)
  await next()
})

meRoutes.get('/', async (c) => {
  const { user: u } = c.get('session')!
  const [p] = await c.get('db').select().from(profile).where(eq(profile.userId, u.id))
  const isAnonymous = Boolean((u as { isAnonymous?: boolean }).isAnonymous)
  const body: MeResponse = {
    user: { id: u.id, name: u.name, email: isAnonymous ? null : u.email, image: u.image ?? null, isAnonymous },
    profile: { nickname: p?.nickname ?? null, showInRanking: p?.showInRanking ?? false },
  }
  return c.json(body)
})

interface GameRow extends Record<string, unknown> {
  puzzle_id: number
  play_date: string
  status: HistoryEntry['status']
  correct_count: number
  guesses_used: number
  rarity: number
  cells: { cell: number; percent: number }[] | null
}

meRoutes.get('/stats', async (c) => {
  const userId = c.get('session')!.user.id
  // Raridade final quando o dia já fechou; senão, a parcial.
  const { rows } = await c.get('db').execute<GameRow>(sql`
    select g.puzzle_id, p.play_date::text as play_date, g.status, g.correct_count, g.guesses_used,
      coalesce(g.final_rarity, game_rarity(g.id)) as rarity,
      (
        select json_agg(json_build_object(
          'cell', gu.cell,
          'percent', cpc.picks::real / greatest(ps.players, 1) * 100
        ))
        from guess gu
        join cell_pick_count cpc on cpc.puzzle_id = g.puzzle_id and cpc.cell = gu.cell and cpc.uf = gu.uf
        left join puzzle_stats ps on ps.puzzle_id = g.puzzle_id
        where gu.game_id = g.id and gu.is_correct
      ) as cells
    from game g
    join puzzle p on p.id = g.puzzle_id
    where g.user_id = ${userId} and g.mode = 'normal' and (g.guesses_used > 0 or g.status <> 'in_progress')
    order by p.play_date desc
  `)

  const finished = rows.filter((r) => r.status !== 'in_progress')
  const history: HistoryEntry[] = rows.map((r) => {
    const cellPercents: (number | null)[] = Array(9).fill(null)
    for (const x of r.cells ?? []) cellPercents[x.cell] = x.percent
    return {
      puzzleId: r.puzzle_id,
      playDate: r.play_date,
      status: r.status,
      correctCount: r.correct_count,
      rarity: Math.round(r.rarity),
      cellPercents,
    }
  })

  const correctDistribution = Array(10).fill(0)
  for (const r of finished) correctDistribution[r.correct_count]++
  const bandCounts: Record<string, number> = {}
  for (const h of history) {
    for (const p of h.cellPercents) if (p !== null) bandCounts[bandFor(p).band] = (bandCounts[bandFor(p).band] ?? 0) + 1
  }
  const rarities = finished.map((r) => r.rarity)
  const { current, longest } = streaks(
    rows.map((r) => r.play_date),
    brasiliaDate(),
  )

  const body: StatsResponse = {
    played: rows.length,
    completed: finished.filter((r) => r.status === 'completed').length,
    averageCorrect: finished.length ? finished.reduce((s, r) => s + r.correct_count, 0) / finished.length : 0,
    averageRarity: rarities.length ? Math.round(rarities.reduce((a, b) => a + b, 0) / rarities.length) : null,
    bestRarity: rarities.length ? Math.round(Math.min(...rarities)) : null,
    currentStreak: current,
    longestStreak: longest,
    correctDistribution,
    bandCounts,
    history: history.slice(0, 90),
  }
  return c.json(body)
})

const profileBody = z.object({
  nickname: z
    .string()
    .trim()
    .min(3, 'Use pelo menos 3 caracteres')
    .max(20, 'Use no máximo 20 caracteres')
    .regex(/^[\p{L}\p{N}_. -]+$/u, 'Use só letras, números, espaço, ponto, hífen ou _')
    .nullable()
    .optional(),
  showInRanking: z.boolean().optional(),
})

meRoutes.patch('/profile', async (c) => {
  const session = c.get('session')!
  if ((session.user as { isAnonymous?: boolean }).isAnonymous) return c.json({ error: 'account_required' }, 403)
  const parsed = profileBody.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'invalid_body', message: parsed.error.issues[0]?.message }, 400)
  const { nickname, showInRanking } = parsed.data
  const db = c.get('db')

  if (nickname) {
    const [taken] = await db
      .select({ userId: profile.userId })
      .from(profile)
      .where(sql`lower(${profile.nickname}) = lower(${nickname}) and ${profile.userId} <> ${session.user.id}`)
    if (taken) return c.json({ error: 'nickname_taken', message: 'Esse apelido já está em uso' }, 409)
  }
  const values = {
    ...(nickname !== undefined && { nickname }),
    ...(showInRanking !== undefined && { showInRanking }),
  }
  await db
    .insert(profile)
    .values({ userId: session.user.id, ...values })
    .onConflictDoUpdate({ target: profile.userId, set: values })
  return c.json({ ok: true })
})

// LGPD: apaga a conta e as partidas (os contadores agregados de raridade ficam).
meRoutes.delete('/', async (c) => {
  const session = c.get('session')!
  const db = c.get('db')
  await db.delete(user).where(eq(user.id, session.user.id))
  const auth = createAuth(c.env, db)
  const res = await auth.api.signOut({ headers: c.req.raw.headers, asResponse: true })
  const cookies = res.headers.getSetCookie()
  for (const cookie of cookies) c.header('Set-Cookie', cookie, { append: true })
  return c.json({ ok: true })
})

// LGPD: exporta tudo que guardamos sobre a pessoa.
meRoutes.get('/export', async (c) => {
  const userId = c.get('session')!.user.id
  const db = c.get('db')
  const [u] = await db.select().from(user).where(eq(user.id, userId))
  const [p] = await db.select().from(profile).where(eq(profile.userId, userId))
  const { rows: games } = await db.execute(sql`
    select g.puzzle_id, g.status, g.guesses_used, g.correct_count, g.final_rarity, g.started_at, g.finished_at,
      (select json_agg(json_build_object('cell', cell, 'uf', uf, 'correct', is_correct, 'at', created_at) order by id)
       from guess where game_id = g.id) as guesses
    from game g where g.user_id = ${userId} order by g.puzzle_id
  `)
  c.header('Content-Disposition', 'attachment; filename="brasilgrid-meus-dados.json"')
  return c.json({ exportedAt: new Date().toISOString(), user: u, profile: p ?? null, games })
})
