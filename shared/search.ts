import { UFS, type Uf } from './ufs.ts'

export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ')
}

/** Mínimo de letras antes de sugerir UFs: a lista completa daria pistas. */
export const MIN_QUERY_LENGTH = 2

// Busca do autocomplete: começo do nome ou de uma de suas palavras.
// Não aceita a sigla (buscar "RS" não pode sugerir Rio Grande do Sul: essas
// letras não aparecem juntas no nome, seria uma pista injusta) nem trechos
// do meio da palavra, para não revelar terminações (ex.: "ia").
export function searchUfs(query: string): Uf[] {
  const q = normalizeSearch(query)
  if (q.length < MIN_QUERY_LENGTH) return []
  const starts = UFS.filter((uf) => normalizeSearch(uf.name).startsWith(q))
  const wordStarts = UFS.filter(
    (uf) => !starts.includes(uf) && normalizeSearch(uf.name).split(' ').some((w) => w.startsWith(q)),
  )
  return [...starts, ...wordStarts]
}
