import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../data/categories/index.ts'
import { countTraps, findMatching, generatePuzzles, regeneratePuzzle } from './lib/generator.ts'

describe('findMatching', () => {
  it('acha UFs distintas quando existe solução', () => {
    const m = findMatching([['SP', 'RJ'], ['SP'], ['RJ', 'MG']])
    expect(m).toEqual(['RJ', 'SP', 'MG'])
  })

  it('devolve null quando duas células dependem da mesma UF', () => {
    expect(findMatching([['SP'], ['SP'], ['RJ']])).toBeNull()
  })

  it('respeita uma célula já preenchida', () => {
    expect(findMatching([['SP', 'RJ'], ['SP']], new Map([[0, 'SP']]))).toBeNull()
    expect(findMatching([['SP', 'RJ'], ['SP']], new Map([[0, 'RJ']]))).toEqual(['RJ', 'SP'])
  })
})

describe('countTraps', () => {
  it('conta respostas válidas que tornam a grade impossível', () => {
    // Usar SP na célula 0 deixa a célula 1 sem opção.
    expect(countTraps([['SP', 'RJ'], ['SP']])).toBe(1)
    expect(countTraps([['SP', 'RJ'], ['SP', 'RJ']])).toBe(0)
  })
})

describe('generatePuzzles', () => {
  const opts = {
    from: '2026-11-01',
    days: 14,
    seed: 7,
    cooldownDays: 3,
    minAnswersPerCell: 2,
    minFamilies: 4,
    attemptsPerDay: 3000,
  }
  const puzzles = generatePuzzles(CATEGORIES, opts)
  const byId = new Map(CATEGORIES.map((c) => [c.id, c]))

  it('gera um dia por grade, em sequência', () => {
    expect(puzzles.map((p) => p.playDate)).toEqual(
      Array.from({ length: 14 }, (_, i) => `2026-11-${String(i + 1).padStart(2, '0')}`),
    )
  })

  it('toda grade segue as regras', () => {
    for (const p of puzzles) {
      const six = [...p.rows, ...p.cols]
      expect(new Set(six).size).toBe(6)
      expect(new Set(six.map((id) => byId.get(id)!.family)).size).toBeGreaterThanOrEqual(4)
      expect(new Set(p.rows.map((id) => byId.get(id)!.family)).size).toBe(3)
      expect(new Set(p.cols.map((id) => byId.get(id)!.family)).size).toBe(3)

      p.cells.forEach((answers, i) => {
        const row = byId.get(p.rows[Math.floor(i / 3)])!
        const col = byId.get(p.cols[i % 3])!
        const expected = row.members.filter((uf) => (col.members as string[]).includes(uf)).sort()
        expect(answers).toEqual(expected)
        expect(answers.length).toBeGreaterThanOrEqual(2)
        expect(answers).toContain(p.solution[i])
      })
      expect(new Set(p.solution).size).toBe(9)
    }
  })

  it('respeita o intervalo efetivo entre usos da mesma categoria', () => {
    const last = new Map<string, number>()
    puzzles.forEach((p, day) => {
      for (const id of [...p.rows, ...p.cols]) {
        if (last.has(id)) expect(day - last.get(id)!).toBeGreaterThan(p.cooldownUsed)
        last.set(id, day)
      }
    })
  })

  it('é determinístico para a mesma semente', () => {
    expect(generatePuzzles(CATEGORIES, opts)).toEqual(puzzles)
  })
})

describe('regeneratePuzzle', () => {
  const opts = { cooldownDays: 5, minAnswersPerCell: 2, minFamilies: 4, attemptsPerDay: 3000 }
  const batch = generatePuzzles(CATEGORIES, { from: '2026-11-01', days: 14, seed: 11, ...opts })
  const byId = new Map(CATEGORIES.map((c) => [c.id, c]))

  it('substitui só a data pedida, mantendo as outras', () => {
    const target = batch[5]
    const replacement = regeneratePuzzle(CATEGORIES, batch, target.playDate, opts, 999)
    expect(replacement.playDate).toBe(target.playDate)
    const six = [...replacement.rows, ...replacement.cols]
    expect(new Set(six).size).toBe(6)
    expect(new Set(six.map((id) => byId.get(id)!.family)).size).toBeGreaterThanOrEqual(4)
  })

  it('respeita o intervalo efetivo com as outras grades do lote', () => {
    const target = batch[5]
    const replacement = regeneratePuzzle(CATEGORIES, batch, target.playDate, opts, 999)
    const used = [...replacement.rows, ...replacement.cols]
    for (const p of batch) {
      if (p.playDate === target.playDate) continue
      const distance = Math.abs(
        (Date.parse(`${p.playDate}T00:00:00Z`) - Date.parse(`${target.playDate}T00:00:00Z`)) / 86_400_000,
      )
      if (distance > replacement.cooldownUsed) continue
      for (const id of used) expect(p.rows).not.toContain(id)
      for (const id of used) expect(p.cols).not.toContain(id)
    }
  })

  it('nunca devolve de volta a mesma grade que está substituindo', () => {
    const target = batch[5]
    const replacement = regeneratePuzzle(CATEGORIES, batch, target.playDate, opts, 999)
    const before = new Set([...target.rows, ...target.cols])
    const after = new Set([...replacement.rows, ...replacement.cols])
    for (const id of after) expect(before.has(id)).toBe(false)
  })
})
