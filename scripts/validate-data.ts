import { CATEGORIES } from '../data/categories/index.ts'
import { loadUfs } from '../data/categories/ufData.ts'
import { validateCategories } from './lib/validateCategories.ts'

const { errors, warnings } = validateCategories(CATEGORIES, loadUfs())
for (const w of warnings) console.warn(`aviso: ${w}`)
for (const e of errors) console.error(`erro: ${e}`)

const byFamily = Object.groupBy(CATEGORIES, (c) => c.family)
console.log(`${CATEGORIES.length} categorias:`, Object.entries(byFamily).map(([f, cs]) => `${f} ${cs!.length}`).join(', '))
if (errors.length) process.exit(1)
console.log('Dados válidos.')
