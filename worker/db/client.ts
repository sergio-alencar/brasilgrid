import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { createMiddleware } from 'hono/factory'
import { Client } from 'pg'
import * as schema from './schema.ts'

export type Db = NodePgDatabase<typeof schema>

/** Uma conexão por requisição; o Hyperdrive faz o pool do lado da Cloudflare. */
export const dbMiddleware = createMiddleware<{ Bindings: Env; Variables: { db: Db } }>(async (c, next) => {
  const client = new Client({ connectionString: c.env.HYPERDRIVE.connectionString })
  await client.connect()
  c.set('db', drizzle(client, { schema }))
  try {
    await next()
  } finally {
    c.executionCtx.waitUntil(client.end())
  }
})
