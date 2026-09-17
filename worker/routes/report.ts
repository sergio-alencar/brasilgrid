import { and, eq, gt, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { isUfCode } from '../../shared/ufs.ts'
import type { AuthSession } from '../auth.ts'
import type { Db } from '../db/client.ts'
import { puzzle, report } from '../db/schema.ts'

type AppEnv = { Bindings: Env; Variables: { db: Db; session: AuthSession | null } }

const MAX_REPORTS_PER_DAY = 5

const body = z.object({
  puzzleId: z.number().int().positive(),
  cell: z.number().int().min(0).max(8).nullable(),
  uf: z.string().refine(isUfCode).nullable(),
  message: z.string().trim().min(5, 'Conte um pouco mais').max(1000, 'Use no máximo 1000 caracteres'),
})

export const reportRoutes = new Hono<AppEnv>()

reportRoutes.post('/', async (c) => {
  const session = c.get('session')
  if (!session) return c.json({ error: 'unauthenticated' }, 401)
  const parsed = body.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'invalid_body', message: parsed.error.issues[0]?.message }, 400)
  const db = c.get('db')

  const [p] = await db.select({ id: puzzle.id }).from(puzzle).where(eq(puzzle.id, parsed.data.puzzleId))
  if (!p) return c.json({ error: 'not_found' }, 404)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(report)
    .where(and(eq(report.userId, session.user.id), gt(report.createdAt, sql`now() - interval '1 day'`)))
  if (count >= MAX_REPORTS_PER_DAY) {
    return c.json({ error: 'too_many_reports', message: 'Você já enviou muitos avisos hoje. Obrigado!' }, 429)
  }

  await db.insert(report).values({ userId: session.user.id, ...parsed.data })
  return c.json({ ok: true }, 201)
})
