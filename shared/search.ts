import { UFS, type Uf } from './ufs.ts'

export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ')
}

/** Mínimo de letras antes de sugerir UFs: a lista completa daria pistas. */
export const MIN_QUERY_LENGTH = 2

// Busca do autocomplete: sigla exata, ou começo do nome ou de uma de suas palavras.
// Não casa trechos do meio da palavra, para não revelar terminações (ex.: "ia").
export function searchUfs(query: string): Uf[] {
  const q = normalizeSearch(query)
  if (q.length < MIN_QUERY_LENGTH) return []
  const exact = UFS.filter((uf) => uf.code.toLowerCase() === q)
  const rest = UFS.filter((uf) => !exact.includes(uf))
  const starts = rest.filter((uf) => normalizeSearch(uf.name).startsWith(q))
  const wordStarts = rest.filter(
    (uf) => !starts.includes(uf) && normalizeSearch(uf.name).split(' ').some((w) => w.startsWith(q)),
  )
  return [...exact, ...starts, ...wordStarts]
}
