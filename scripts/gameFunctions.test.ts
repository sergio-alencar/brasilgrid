import pg from 'pg'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { CATEGORIES } from '../data/categories/index.ts'
import { brasiliaDate } from '../shared/brasiliaDay.ts'
import { MAX_GUESSES } from '../shared/rarity.ts'
import type { GeneratedPuzzle } from './lib/generator.ts'
import { publishPuzzles } from './lib/publish.ts'
import { isDatabaseAvailable, resetTestDatabase } from './lib/testDb.ts'

const available = await isDatabaseAvailable()
const today = brasiliaDate()

// Grade fixa com gabarito arbitrário: aqui só importa a lógica das funções SQL.
const CELLS = [
  ['SP', 'RJ'], ['MG', 'ES'], ['BA', 'PE'],
  ['AM', 'PA'], ['CE', 'RN'], ['PR', 'SC'],
  ['GO', 'DF'], ['RS', 'AL'], ['MT', 'MS'],
]
const puzzle: GeneratedPuzzle = {
  playDate: today,
  rows: ['region-north', 'region-south', 'region-northeast'],
  cols: ['name-multiword', 'landlocked', 'has-coastline'],
  cells: CELLS,
  solution: CELLS.map((c) => c[0]),
  metrics: { minAnswers: 2, totalAnswers: 18, traps: 0, trivialCells: 0, difficulty: 1 },
  cooldownUsed: 10,
}

describe.skipIf(!available)('funções do jogo no Postgres', () => {
  let db: pg.Client
  const PUZZLE_ID = 2

  beforeAll(async () => {
    db = new pg.Client({ connectionString: await resetTestDatabase() })
    await db.connect()
    // Lançamento "ontem" para a grade de hoje ser a nº 2; a de 2020 fica inválida de propósito.
    const launch = new Date(Date.parse(`${today}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10)
    await publishPuzzles(db, [puzzle], CATEGORIES, launch)
    await db.query(`insert into puzzle (id, play_date, status) values (1, '2020-01-01', 'published')`)
  })

  afterAll(async () => {
    await db?.end()
  })

  beforeEach(async () => {
    await db.query('truncate game, guess, cell_pick_count, puzzle_stats, "user" cascade')
    for (const id of ['ana', 'bia', 'caio']) {
      await db.query(`insert into "user" (id, name, email) values ($1, $1, $1 || '@teste.dev')`, [id])
    }
  })

  const guess = async (user: string, cell: number, uf: string, puzzleId = PUZZLE_ID) => {
    const { rows } = await db.query('select * from submit_guess($1, $2, $3::smallint, $4, $5::smallint)', [
      user, puzzleId, cell, uf, MAX_GUESSES,
    ])
    return rows[0] as {
      result: string
      is_correct: boolean
      pick_percent: number | null
      guesses_left: number
      game_status: string
      correct_count: number
    }
  }

  it('aceita acerto e calcula o % sobre os jogadores', async () => {
    const r = await guess('ana', 0, 'SP')
    expect(r).toMatchObject({ result: 'ok', is_correct: true, guesses_left: 9, game_status: 'in_progress' })
    expect(r.pick_percent).toBe(100)

    await guess('bia', 0, 'RJ')
    const c = await guess('caio', 0, 'SP')
    expect(c.pick_percent).toBeCloseTo((2 / 3) * 100, 3)
  })

  it('erro gasta palpite e não conta como escolha', async () => {
    const r = await guess('ana', 0, 'AC')
    expect(r).toMatchObject({ result: 'ok', is_correct: false, guesses_left: 9, correct_count: 0 })
    expect(r.pick_percent).toBeNull()
    const { rows } = await db.query('select count(*)::int n from cell_pick_count')
    expect(rows[0].n).toBe(0)
  })

  it('bloqueia UF repetida e célula já preenchida sem gastar palpite', async () => {
    await guess('ana', 0, 'SP')
    expect(await guess('ana', 1, 'SP')).toMatchObject({ result: 'uf_used', guesses_left: 9 })
    expect(await guess('ana', 0, 'RJ')).toMatchObject({ result: 'cell_filled', guesses_left: 9 })
  })

  it('permite reusar uma UF que foi palpite errado', async () => {
    await guess('ana', 1, 'SP') // SP não vale na célula 1
    expect(await guess('ana', 0, 'SP')).toMatchObject({ result: 'ok', is_correct: true })
  })

  it('encerra ao acabar os palpites e recusa o 11º', async () => {
    for (let i = 0; i < MAX_GUESSES - 1; i++) await guess('ana', 0, 'AC')
    expect(await guess('ana', 0, 'AC')).toMatchObject({ guesses_left: 0, game_status: 'out_of_guesses' })
    expect(await guess('ana', 0, 'SP')).toMatchObject({ result: 'game_over' })
    const { rows } = await db.query(`select count(*)::int n from guess`)
    expect(rows[0].n).toBe(MAX_GUESSES)
  })

  it('completa a grade com 9 acertos', async () => {
    let last
    for (const [cell, answers] of CELLS.entries()) last = await guess('ana', cell, answers[0])
    expect(last).toMatchObject({ game_status: 'completed', correct_count: 9 })
    const { rows } = await db.query('select players, completed from puzzle_stats')
    expect(rows[0]).toEqual({ players: 1, completed: 1 })
  })

  it('só aceita a grade de hoje e células de 0 a 8', async () => {
    expect((await guess('ana', 0, 'SP', 1)).result).toBe('puzzle_unavailable')
    expect((await guess('ana', 0, 'SP', 99)).result).toBe('puzzle_unavailable')
    expect((await guess('ana', 9, 'SP')).result).toBe('invalid_cell')
  })

  it('desistir encerra a partida', async () => {
    await guess('ana', 0, 'SP')
    const { rows } = await db.query('select give_up($1, $2) s', ['ana', PUZZLE_ID])
    expect(rows[0].s).toBe('gave_up')
    expect((await guess('ana', 1, 'MG')).result).toBe('game_over')
  })

  it('calcula a raridade e fecha o dia', async () => {
    await guess('ana', 0, 'SP')
    await guess('bia', 0, 'SP')
    await guess('bia', 1, 'MG')
    const count = await db.query('select close_day($1::date) n', [today])
    expect(count.rows[0].n).toBe(2)
    const { rows } = await db.query(
      `select user_id, status, final_rarity from game order by user_id`,
    )
    // 2 jogadores. Ana: SP (100%) + 8 vazias. Bia: SP (100%) + MG (50%) + 7 vazias.
    expect(rows).toEqual([
      { user_id: 'ana', status: 'gave_up', final_rarity: 900 },
      { user_id: 'bia', status: 'gave_up', final_rarity: 850 },
    ])
  })

  it('ignora datas já publicadas', async () => {
    const again = await publishPuzzles(db, [puzzle], CATEGORIES, '2020-01-01')
    expect(again.skipped).toEqual([today])
  })

  it('junta as partidas do visitante na conta, sem contar a pessoa duas vezes', async () => {
    // Ana (conta) e Bia (visitante) jogaram a mesma grade; Caio (visitante) também.
    await guess('ana', 0, 'SP')
    await guess('bia', 0, 'SP')
    await guess('bia', 1, 'MG')
    await guess('caio', 0, 'RJ')

    const dup = await db.query('select merge_user_games($1, $2) n', ['bia', 'ana'])
    expect(dup.rows[0].n).toBe(0)
    const stats = await db.query('select players from puzzle_stats')
    expect(stats.rows[0].players).toBe(2)
    const picks = await db.query('select cell, uf, picks from cell_pick_count order by cell, uf')
    expect(picks.rows).toEqual([
      { cell: 0, uf: 'RJ', picks: 1 },
      { cell: 0, uf: 'SP', picks: 1 },
      { cell: 1, uf: 'MG', picks: 0 },
    ])

    // Sem conflito, a partida só muda de dono.
    await db.query(`insert into "user" (id, name, email) values ('dani', 'dani', 'dani@teste.dev')`)
    const moved = await db.query('select merge_user_games($1, $2) n', ['caio', 'dani'])
    expect(moved.rows[0].n).toBe(1)
    const owners = await db.query('select user_id from game order by user_id')
    expect(owners.rows.map((r) => r.user_id)).toEqual(['ana', 'dani'])
  })
})
