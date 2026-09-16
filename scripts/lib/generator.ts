import type { CategoryDef } from '../../data/categories/types.ts'

export interface GeneratorOptions {
  from: string
  days: number
  seed: number
  /** Dias mínimos entre dois usos da mesma categoria. */
  cooldownDays: number
  minAnswersPerCell: number
  minFamilies: number
  attemptsPerDay: number
}

export interface GeneratedPuzzle {
  playDate: string
  rows: string[]
  cols: string[]
  /** 9 células em ordem de leitura, cada uma com as UFs válidas. */
  cells: string[][]
  solution: string[]
  metrics: { minAnswers: number; totalAnswers: number; traps: number; trivialCells: number; difficulty: number }
  /** Intervalo mínimo efetivamente respeitado (menor que o pedido quando faltam categorias). */
  cooldownUsed: number
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Uma UF diferente por célula (Kuhn). Devolve null se não houver. */
export function findMatching(cells: string[][], fixed: Map<number, string> = new Map()): string[] | null {
  const owner = new Map<string, number>()
  for (const [cell, uf] of fixed) owner.set(uf, cell)

  const tryCell = (cell: number, seen: Set<string>): boolean => {
    for (const uf of cells[cell]) {
      if (seen.has(uf)) continue
      seen.add(uf)
      const current = owner.get(uf)
      if (current !== undefined && fixed.has(current)) continue
      if (current === undefined || tryCell(current, seen)) {
        owner.set(uf, cell)
        return true
      }
    }
    return false
  }

  for (let cell = 0; cell < cells.length; cell++) {
    if (fixed.has(cell)) continue
    if (!tryCell(cell, new Set())) return null
  }
  const result: string[] = []
  for (const [uf, cell] of owner) result[cell] = uf
  return result
}

/** Respostas válidas que, se usadas, impedem completar a grade. */
export function countTraps(cells: string[][]): number {
  let traps = 0
  cells.forEach((answers, cell) => {
    for (const uf of answers) {
      if (!findMatching(cells, new Map([[cell, uf]]))) traps++
    }
  })
  return traps
}

function overlap(a: CategoryDef, b: CategoryDef): number {
  const bs = new Set<string>(b.members)
  return a.members.filter((m) => bs.has(m)).length
}

function isSubset(a: Set<string>, b: Set<string>): boolean {
  for (const x of a) if (!b.has(x)) return false
  return true
}

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function pick<T>(items: readonly T[], count: number, rand: () => number): T[] {
  const pool = [...items]
  const out: T[] = []
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  return out
}

export function evaluateGrid(rows: CategoryDef[], cols: CategoryDef[], minAnswers: number) {
  const cells: string[][] = []
  let trivialCells = 0
  for (const r of rows) {
    for (const c of cols) {
      const rs = new Set<string>(r.members)
      const cs = new Set<string>(c.members)
      cells.push([...rs].filter((uf) => cs.has(uf)).sort())
      if (isSubset(rs, cs) || isSubset(cs, rs)) trivialCells++
    }
  }
  if (cells.some((a) => a.length < minAnswers)) return null
  const solution = findMatching(cells)
  if (!solution) return null
  const traps = countTraps(cells)
  const sizes = cells.map((a) => a.length)
  const difficulty =
    [...rows, ...cols].reduce((s, c) => s + c.difficulty, 0) / 6 + sizes.filter((n) => n <= 2).length * 0.2
  return {
    cells,
    solution,
    metrics: {
      minAnswers: Math.min(...sizes),
      totalAnswers: sizes.reduce((a, b) => a + b, 0),
      traps,
      trivialCells,
      difficulty: Math.round(difficulty * 100) / 100,
    },
  }
}

function penalty(m: GeneratedPuzzle['metrics'], cells: string[][]): number {
  const tightCells = cells.filter((a) => a.length === 2).length
  const hugeCells = cells.filter((a) => a.length > 8).length
  return m.traps * 10 + m.trivialCells * 3 + tightCells * 1 + hugeCells * 2
}

export function generatePuzzles(categories: CategoryDef[], opts: GeneratorOptions): GeneratedPuzzle[] {
  const rand = mulberry32(opts.seed)
  const lastUsed = new Map<string, number>()
  const puzzles: GeneratedPuzzle[] = []

  const searchDay = (day: number, cooldown: number) => {
    const available = categories.filter((c) => {
      const used = lastUsed.get(c.id)
      return used === undefined || day - used > cooldown
    })
    let best: { puzzle: GeneratedPuzzle; score: number } | null = null

    for (let attempt = 0; attempt < opts.attemptsPerDay; attempt++) {
      const rows = pick(available, 3, rand)
      if (rows.length < 3 || new Set(rows.map((c) => c.family)).size < 3) continue
      // Só colunas que cruzam bem com as três linhas.
      const compatible = available.filter(
        (c) =>
          !rows.includes(c) &&
          rows.every((r) => overlap(r, c) >= opts.minAnswersPerCell),
      )
      const cols = pick(compatible, 3, rand)
      if (cols.length < 3 || new Set(cols.map((c) => c.family)).size < 3) continue
      if (new Set([...rows, ...cols].map((c) => c.family)).size < opts.minFamilies) continue

      const result = evaluateGrid(rows, cols, opts.minAnswersPerCell)
      if (!result) continue
      const score = penalty(result.metrics, result.cells)
      if (!best || score < best.score) {
        best = {
          score,
          puzzle: {
            playDate: addDays(opts.from, day),
            rows: rows.map((c) => c.id),
            cols: cols.map((c) => c.id),
            ...result,
            cooldownUsed: cooldown,
          },
        }
        if (score === 0) break
      }
    }
    return best
  }

  for (let day = 0; day < opts.days; day++) {
    let best = null
    for (let cooldown = opts.cooldownDays; cooldown >= 0 && !best; cooldown--) best = searchDay(day, cooldown)
    if (!best) throw new Error(`Não achei grade válida para ${addDays(opts.from, day)}; adicione categorias`)
    for (const id of [...best.puzzle.rows, ...best.puzzle.cols]) lastUsed.set(id, day)
    puzzles.push(best.puzzle)
  }
  return puzzles
}
