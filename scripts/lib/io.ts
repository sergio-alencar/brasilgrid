import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export function dataPath(...parts: string[]): string {
  return resolve(ROOT, 'data', ...parts)
}

export async function fetchJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      ...init,
      headers: { 'User-Agent': 'BrasilGrid-data/0.1 (https://github.com/sergio-alencar/brasilgrid)', ...init?.headers },
    })
    if (res.ok) return (await res.json()) as T
    if (attempt >= 3 || res.status < 500) throw new Error(`${res.status} ${res.statusText} — ${url}`)
    await new Promise((r) => setTimeout(r, 1000 * attempt))
  }
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(value, null, 2) + '\n')
}

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
