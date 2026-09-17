export type RegionCode = 'N' | 'NE' | 'CO' | 'SE' | 'S'

export interface Uf {
  code: string
  ibgeId: number
  name: string
  region: RegionCode
}

// Lista canônica das 27 UFs (fonte: IBGE, API de localidades).
export const UFS: readonly Uf[] = [
  { code: 'AC', ibgeId: 12, name: 'Acre', region: 'N' },
  { code: 'AL', ibgeId: 27, name: 'Alagoas', region: 'NE' },
  { code: 'AP', ibgeId: 16, name: 'Amapá', region: 'N' },
  { code: 'AM', ibgeId: 13, name: 'Amazonas', region: 'N' },
  { code: 'BA', ibgeId: 29, name: 'Bahia', region: 'NE' },
  { code: 'CE', ibgeId: 23, name: 'Ceará', region: 'NE' },
  { code: 'DF', ibgeId: 53, name: 'Distrito Federal', region: 'CO' },
  { code: 'ES', ibgeId: 32, name: 'Espírito Santo', region: 'SE' },
  { code: 'GO', ibgeId: 52, name: 'Goiás', region: 'CO' },
  { code: 'MA', ibgeId: 21, name: 'Maranhão', region: 'NE' },
  { code: 'MT', ibgeId: 51, name: 'Mato Grosso', region: 'CO' },
  { code: 'MS', ibgeId: 50, name: 'Mato Grosso do Sul', region: 'CO' },
  { code: 'MG', ibgeId: 31, name: 'Minas Gerais', region: 'SE' },
  { code: 'PA', ibgeId: 15, name: 'Pará', region: 'N' },
  { code: 'PB', ibgeId: 25, name: 'Paraíba', region: 'NE' },
  { code: 'PR', ibgeId: 41, name: 'Paraná', region: 'S' },
  { code: 'PE', ibgeId: 26, name: 'Pernambuco', region: 'NE' },
  { code: 'PI', ibgeId: 22, name: 'Piauí', region: 'NE' },
  { code: 'RJ', ibgeId: 33, name: 'Rio de Janeiro', region: 'SE' },
  { code: 'RN', ibgeId: 24, name: 'Rio Grande do Norte', region: 'NE' },
  { code: 'RS', ibgeId: 43, name: 'Rio Grande do Sul', region: 'S' },
  { code: 'RO', ibgeId: 11, name: 'Rondônia', region: 'N' },
  { code: 'RR', ibgeId: 14, name: 'Roraima', region: 'N' },
  { code: 'SC', ibgeId: 42, name: 'Santa Catarina', region: 'S' },
  { code: 'SP', ibgeId: 35, name: 'São Paulo', region: 'SE' },
  { code: 'SE', ibgeId: 28, name: 'Sergipe', region: 'NE' },
  { code: 'TO', ibgeId: 17, name: 'Tocantins', region: 'N' },
]

const byCode = new Map(UFS.map((uf) => [uf.code, uf]))

export function isUfCode(value: string): boolean {
  return byCode.has(value)
}

export function getUf(code: string): Uf | undefined {
  return byCode.get(code)
}
