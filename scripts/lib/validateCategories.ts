import type { CategoryDef } from '../../data/categories/types.ts'
import type { UfRecord } from '../../data/categories/ufData.ts'

export interface ValidationReport {
  errors: string[]
  warnings: string[]
}

const MAX_LABEL = 32
const NUMERIC_MARGIN = 0.03

export function validateCategories(categories: CategoryDef[], ufs: UfRecord[]): ValidationReport {
  const errors: string[] = []
  const warnings: string[] = []
  const codes = new Set(ufs.map((u) => u.code))
  const ids = new Set<string>()

  for (const cat of categories) {
    const at = `[${cat.id}]`
    if (ids.has(cat.id)) errors.push(`${at} id repetido`)
    ids.add(cat.id)

    if (cat.label.length > MAX_LABEL) errors.push(`${at} rótulo com ${cat.label.length} caracteres (máx. ${MAX_LABEL})`)
    if (!cat.description.trim()) errors.push(`${at} sem descrição`)
    if (!cat.source.url.startsWith('https://')) errors.push(`${at} fonte sem URL https`)

    const members = new Set<string>(cat.members)
    if (members.size !== cat.members.length) errors.push(`${at} membros repetidos`)
    for (const m of cat.members) if (!codes.has(m)) errors.push(`${at} UF inválida: ${m}`)
    if (members.size === 0 || members.size === ufs.length) errors.push(`${at} não discrimina nenhuma UF`)
    if (members.size < 3 && cat.difficulty !== 3) warnings.push(`${at} só ${members.size} membros; marque como difícil (3)`)
    if (members.size > 20) warnings.push(`${at} ${members.size} membros: restringe pouco`)

    const expected = cat.derive
      ? ufs.filter(cat.derive)
      : cat.numeric
        ? ufs.filter((u) => {
            const v = cat.numeric!.metric(u)
            return cat.numeric!.op === '>' ? v > cat.numeric!.threshold : v < cat.numeric!.threshold
          })
        : null
    if (expected) {
      const exp = new Set<string>(expected.map((u) => u.code))
      const missing = [...exp].filter((c) => !members.has(c))
      const extra = [...members].filter((c) => !exp.has(c))
      if (missing.length || extra.length) {
        errors.push(`${at} gabarito diverge dos dados — faltam: [${missing.join(', ')}], sobram: [${extra.join(', ')}]`)
      }
    }

    if (cat.numeric) {
      const { metric, threshold } = cat.numeric
      for (const u of ufs) {
        const distance = Math.abs(metric(u) - threshold) / threshold
        if (distance < NUMERIC_MARGIN) {
          warnings.push(`${at} ${u.code} está a ${(distance * 100).toFixed(1)}% do limiar`)
        }
      }
    }
  }

  return { errors, warnings }
}
