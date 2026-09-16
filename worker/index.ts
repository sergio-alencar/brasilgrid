import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { sql } from 'drizzle-orm'
import { Client } from 'pg'
import { brasiliaDate } from '../shared/brasiliaDay.ts'
import { createAuth, type AuthSession } from './auth.ts'
import { dbMiddleware, type Db } from './db/client.ts'
import { gameRoutes } from './routes/game.ts'

type AppEnv = { Bindings: Env; Variables: { db: Db; session: AuthSession | null } }

const app = new Hono<AppEnv>()

const sessionMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const auth = createAuth(c.env, c.get('db'))
  c.set('session', await auth.api.getSession({ headers: c.req.raw.headers }))
  await next()
})

app.use('/api/*', dbMiddleware)

app.get('/api/health', async (c) => {
  const { rows } = await c.get('db').execute<{ now: string }>(sql`select now() as now`)
  return c.json({ ok: true, db: 'connected', dbTime: rows[0].now })
})

app.all('/api/auth/*', (c) => createAuth(c.env, c.get('db')).handler(c.req.raw))

app.use('/api/*', sessionMiddleware)
app.route('/api', gameRoutes)

app.all('/api/*', (c) => c.json({ error: 'not_found' }, 404))

app.onError((error, c) => {
  console.error(error)
  return c.json({ error: 'internal_error' }, 500)
})

// /r/* ainda não tem tratamento no servidor: cai na SPA.
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default {
  fetch: app.fetch,
  async scheduled(controller, env, ctx) {
    // Fecha o dia que acabou de terminar (o cron roda às 00:05 de Brasília).
    const yesterday = new Date(controller.scheduledTime - 24 * 3_600_000)
    const client = new Client({ connectionString: env.HYPERDRIVE.connectionString })
    await client.connect()
    try {
      const { rows } = await client.query<{ n: number }>('select close_day($1::date) as n', [brasiliaDate(yesterday)])
      console.log(`close_day ${brasiliaDate(yesterday)}: ${rows[0].n} partidas`)
    } finally {
      ctx.waitUntil(client.end())
    }
  },
} satisfies ExportedHandler<Env>
