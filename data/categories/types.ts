import type { UfCode, UfRecord } from './ufData.ts'

export type Family =
  | 'regions'
  | 'borders'
  | 'politics'
  | 'coast'
  | 'hydrography'
  | 'biomes'
  | 'geology'
  | 'capitals'
  | 'demography'
  | 'history'
  | 'sports'
  | 'flags'
  | 'culture'

export interface Source {
  name: string
  url: string
}

export interface NumericRule {
  /** Valor usado para decidir; a validação avisa se alguma UF estiver perto do limiar. */
  metric: (uf: UfRecord) => number
  op: '>' | '<'
  threshold: number
}

export interface CategoryDef {
  id: string
  family: Family
  /** Rótulo curto exibido na grade (≤ 32 caracteres). */
  label: string
  /** Regra exata, exibida no botão (i). */
  description: string
  /** Gabarito escrito à mão. */
  members: UfCode[]
  source: Source
  /** Casos de borda e decisões tomadas. */
  notes?: string
  difficulty: 1 | 2 | 3
  /** Cálculo independente a partir de data/ufs.json; precisa bater com members. */
  derive?: (uf: UfRecord) => boolean
  numeric?: NumericRule
}

export function defineCategories(defs: CategoryDef[]): CategoryDef[] {
  return defs
}
