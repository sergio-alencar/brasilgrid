// Aplica as migrações do Drizzle no banco de DATABASE_URL (padrão: Postgres local).
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'
import { ROOT } from './lib/io.ts'

export const LOCAL_DATABASE_URL = 'postgres://brasilgrid:brasilgrid@localhost:5433/brasilgrid'

export async function runMigrations(url: string) {
  const client = new pg.Client({ connectionString: url })
  await client.connect()
  try {
    await migrate(drizzle(client), { migrationsFolder: `${ROOT}/drizzle` })
  } finally {
    await client.end()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.env.DATABASE_URL ?? LOCAL_DATABASE_URL
  await runMigrations(url)
  console.log(`Migrações aplicadas em ${new URL(url).host}${new URL(url).pathname}`)
}
