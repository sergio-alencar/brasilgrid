import { UFS, type Uf } from './ufs.ts'

export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ')
}

// Busca do autocomplete: aceita sigla exata ou trecho do nome, sem acento.
export function searchUfs(query: string): Uf[] {
  const q = normalizeSearch(query)
  if (!q) return [...UFS]
  const exact = UFS.filter((uf) => uf.code.toLowerCase() === q)
  const byName = UFS.filter((uf) => !exact.includes(uf) && normalizeSearch(uf.name).includes(q))
  const starts = byName.filter((uf) => normalizeSearch(uf.name).startsWith(q))
  const rest = byName.filter((uf) => !starts.includes(uf))
  return [...exact, ...starts, ...rest]
}
