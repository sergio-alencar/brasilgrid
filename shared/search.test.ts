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

  it('devolve todas com busca vazia', () => {
    expect(searchUfs('')).toHaveLength(27)
  })
})
