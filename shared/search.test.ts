import { describe, expect, it } from 'vitest'
import { normalizeSearch, searchUfs } from './search.ts'

describe('normalizeSearch', () => {
  it('remove acentos, caixa e espaços extras', () => {
    expect(normalizeSearch('  São   Paulo ')).toBe('sao paulo')
    expect(normalizeSearch('PIAUÍ')).toBe('piaui')
  })
})

describe('searchUfs', () => {
  it('aceita sigla exata primeiro', () => {
    expect(searchUfs('pa')[0].code).toBe('PA')
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
