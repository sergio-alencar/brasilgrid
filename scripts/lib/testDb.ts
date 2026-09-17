import pg from 'pg'
import { runMigrations } from '../migrate.ts'

const ADMIN_URL = process.env.TEST_ADMIN_DATABASE_URL ?? 'postgres://brasilgrid:brasilgrid@localhost:5433/postgres'
const TEST_DB = 'brasilgrid_test'

export async function isDatabaseAvailable(): Promise<boolean> {
  const client = new pg.Client({ connectionString: ADMIN_URL, connectionTimeoutMillis: 1500 })
  try {
    await client.connect()
    return true
  } catch {
    return false
  } finally {
    await client.end().catch(() => {})
  }
}

/** Recria o banco de teste do zero e aplica as migrações. */
export async function resetTestDatabase(): Promise<string> {
  const admin = new pg.Client({ connectionString: ADMIN_URL })
  await admin.connect()
  try {
    await admin.query(`drop database if exists ${TEST_DB} with (force)`)
    await admin.query(`create database ${TEST_DB}`)
  } finally {
    await admin.end()
  }
  const url = new URL(ADMIN_URL)
  url.pathname = `/${TEST_DB}`
  await runMigrations(url.toString())
  return url.toString()
}
