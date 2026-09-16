// Gera um lote de grades para revisão.
// Uso: npm run puzzles:generate -- --from 2026-11-01 --days 60 --seed 42
import { parseArgs } from 'node:util'
import { CATEGORIES } from '../data/categories/index.ts'
import { loadUfs } from '../data/categories/ufData.ts'
import { generatePuzzles } from './lib/generator.ts'
import { ROOT, today, writeJson } from './lib/io.ts'
import { validateCategories } from './lib/validateCategories.ts'

const { values } = parseArgs({
  options: {
    from: { type: 'string' },
    days: { type: 'string', default: '60' },
    seed: { type: 'string', default: String(Date.now() % 1_000_000) },
    cooldown: { type: 'string' },
  },
})
if (!values.from || !/^\d{4}-\d{2}-\d{2}$/.test(values.from)) throw new Error('Informe --from AAAA-MM-DD')

const { errors } = validateCategories(CATEGORIES, loadUfs())
if (errors.length) throw new Error(`Categorias inválidas; rode npm run data:validate\n${errors.join('\n')}`)

// Com poucas categorias, um cooldown longo fica impossível (cada dia usa 6).
const maxCooldown = Math.floor(CATEGORIES.length / 6) - 2
const cooldownDays = Number(values.cooldown ?? Math.min(10, maxCooldown))
if (cooldownDays < 10) console.warn(`Aviso: cooldown de ${cooldownDays} dias (o plano pede 10; faltam categorias).`)

const opts = {
  from: values.from,
  days: Number(values.days),
  seed: Number(values.seed),
  cooldownDays,
  minAnswersPerCell: 2,
  minFamilies: 4,
  attemptsPerDay: 20_000,
}
const puzzles = generatePuzzles(CATEGORIES, opts)

const out = `${ROOT}/puzzles/${opts.from}_${opts.days}d.json`
await writeJson(out, { generated: today(), options: opts, categoryCount: CATEGORIES.length, puzzles })

const traps = puzzles.reduce((s, p) => s + p.metrics.traps, 0)
const trivial = puzzles.reduce((s, p) => s + p.metrics.trivialCells, 0)
const relaxed = puzzles.filter((p) => p.cooldownUsed < cooldownDays).length
if (relaxed) console.warn(`Aviso: ${relaxed} grades precisaram de intervalo menor que ${cooldownDays} dias.`)
console.log(`${puzzles.length} grades → ${out.replace(ROOT + '/', '')} (armadilhas: ${traps}, células triviais: ${trivial})`)
