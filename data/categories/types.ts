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
  | 'names'
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
  /** Mesma coisa que label, em inglês (≤ 32 caracteres). Nomes próprios de UF/cidade não se traduzem. */
  labelEn: string
  /** Mesma coisa que description, em inglês. */
  descriptionEn: string
  /** Mesma coisa que label, em espanhol (≤ 32 caracteres). Nomes próprios de UF/cidade não se traduzem. */
  labelEs: string
  /** Mesma coisa que description, em espanhol. */
  descriptionEs: string
  /** Gabarito escrito à mão. */
  members: UfCode[]
  source: Source
  /** Casos de borda e decisões tomadas. */
  notes?: string
  /** Mesma coisa que notes, em inglês. Obrigatório sempre que notes existir e não for "". */
  notesEn?: string
  /** Mesma coisa que notes, em espanhol. Obrigatório sempre que notes existir e não for "". */
  notesEs?: string
  difficulty: 1 | 2 | 3
  /** Cálculo independente a partir de data/ufs.json; precisa bater com members. */
  derive?: (uf: UfRecord) => boolean
  numeric?: NumericRule
}

export function defineCategories(defs: CategoryDef[]): CategoryDef[] {
  return defs
}
