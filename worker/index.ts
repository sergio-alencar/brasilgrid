import { Hono } from 'hono'
import { Client } from 'pg'

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', async (c) => {
  const client = new Client({ connectionString: c.env.HYPERDRIVE.connectionString })
  try {
    await client.connect()
    const { rows } = await client.query<{ now: Date }>('select now() as now')
    return c.json({ ok: true, db: 'connected', dbTime: rows[0].now })
  } catch (error) {
    console.error('health check failed', error)
    return c.json({ ok: false, db: 'unreachable' }, 503)
  } finally {
    c.executionCtx.waitUntil(client.end())
  }
})

app.all('/api/*', (c) => c.json({ error: 'not_found' }, 404))

// /r/* ainda não tem tratamento no servidor: cai na SPA.
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default {
  fetch: app.fetch,
  async scheduled(controller) {
    // Fechamento diário (Fase 2): encerra partidas e grava a raridade final.
    console.log('cron', controller.cron, new Date(controller.scheduledTime).toISOString())
  },
} satisfies ExportedHandler<Env>
