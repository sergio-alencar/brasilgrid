// Catálogo público de todas as categorias (sem o gabarito/members) — o
// "Atlas de categorias" da SPA. Só regra e fonte, iguais em qualquer dia.
import { CATEGORIES } from '../data/categories/index.ts'
import { ROOT, writeJson } from './lib/io.ts'

const catalog = CATEGORIES.map(({ id, family, label, description, source, notes, difficulty }) => ({
  id,
  family,
  label,
  description,
  source,
  notes,
  difficulty,
})).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))

await writeJson(`${ROOT}/data/categories-catalog.json`, catalog)
console.log(`data/categories-catalog.json: ${catalog.length} categorias`)
