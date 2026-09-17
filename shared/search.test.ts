import { describe, expect, it } from 'vitest'
import { normalizeSearch, searchUfs } from './search.ts'

describe('normalizeSearch', () => {
  it('remove acentos, caixa e espaços extras', () => {
    expect(normalizeSearch('  São   Paulo ')).toBe('sao paulo')
    expect(normalizeSearch('PIAUÍ')).toBe('piaui')
  })
})

describe('searchUfs', () => {
  it('não aceita a sigla como pista: as letras precisam aparecer juntas no nome', () => {
    // "rs" não aparece em "rio grande do sul" — não pode sugerir a UF pela sigla.
    expect(searchUfs('rs')).toEqual([])
    expect(searchUfs('sp')).toEqual([])
    expect(searchUfs('mg')).toEqual([])
    // "pa" continua achando Pará/Paraíba/Paraná (começo do nome) e São
    // Paulo (começo da segunda palavra) — nunca pela sigla.
    expect(searchUfs('pa').map((u) => u.code).sort()).toEqual(['PA', 'PB', 'PR', 'SP'])
  })

  it('encontra sem acento', () => {
    expect(searchUfs('goias').map((u) => u.code)).toEqual(['GO'])
    expect(searchUfs('maranhao').map((u) => u.code)).toEqual(['MA'])
  })

  it('prioriza nomes que começam com o termo', () => {
    const codes = searchUfs('rio').map((u) => u.code)
    expect(codes.slice(0, 3).sort()).toEqual(['RJ', 'RN', 'RS'])
  })

  it('casa o começo de qualquer palavra do nome', () => {
    expect(searchUfs('grosso').map((u) => u.code)).toEqual(['MT', 'MS'])
    expect(searchUfs('norte').map((u) => u.code)).toEqual(['RN'])
  })

  it('não casa trechos do meio da palavra', () => {
    expect(searchUfs('ia')).toEqual([])
    expect(searchUfs('ba').map((u) => u.code)).toEqual(['BA'])
  })

  it('não sugere nada antes de 2 letras', () => {
    expect(searchUfs('')).toEqual([])
    expect(searchUfs('a')).toEqual([])
    expect(searchUfs(' p ')).toEqual([])
  })
})
