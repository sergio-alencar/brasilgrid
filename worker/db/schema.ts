import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  date,
} from 'drizzle-orm/pg-core'

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()

// --- Better Auth (campos da v1.7.5 + plugin anonymous) ---

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  isAnonymous: boolean('is_anonymous').default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('session_user_id_idx').on(t.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('account_user_id_idx').on(t.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
)

// --- Jogo ---

export const profile = pgTable('profile', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  nickname: text('nickname').unique(),
  showInRanking: boolean('show_in_ranking').notNull().default(false),
  createdAt: createdAt(),
})

export const puzzle = pgTable('puzzle', {
  /** Número do jogo. */
  id: integer('id').primaryKey(),
  playDate: date('play_date').notNull().unique(),
  status: text('status', { enum: ['scheduled', 'published'] }).notNull().default('scheduled'),
  createdAt: createdAt(),
})

export const puzzleCategory = pgTable(
  'puzzle_category',
  {
    puzzleId: integer('puzzle_id')
      .notNull()
      .references(() => puzzle.id, { onDelete: 'cascade' }),
    axis: text('axis', { enum: ['row', 'col'] }).notNull(),
    position: smallint('position').notNull(),
    categoryId: text('category_id').notNull(),
    label: text('label').notNull(),
    description: text('description').notNull(),
    sourceName: text('source_name').notNull(),
    sourceUrl: text('source_url').notNull(),
    /** Membros da categoria (usados para explicar erros depois do jogo). */
    members: text('members').array().notNull(),
  },
  (t) => [primaryKey({ columns: [t.puzzleId, t.axis, t.position] })],
)

export const puzzleCell = pgTable(
  'puzzle_cell',
  {
    puzzleId: integer('puzzle_id')
      .notNull()
      .references(() => puzzle.id, { onDelete: 'cascade' }),
    cell: smallint('cell').notNull(),
    /** Gabarito: nunca sai pela API antes do fim da partida. */
    validUfs: text('valid_ufs').array().notNull(),
  },
  (t) => [primaryKey({ columns: [t.puzzleId, t.cell] }), check('cell_range', sql`${t.cell} between 0 and 8`)],
)

export const game = pgTable(
  'game',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    puzzleId: integer('puzzle_id')
      .notNull()
      .references(() => puzzle.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['in_progress', 'completed', 'out_of_guesses', 'gave_up'] })
      .notNull()
      .default('in_progress'),
    guessesUsed: smallint('guesses_used').notNull().default(0),
    correctCount: smallint('correct_count').notNull().default(0),
    finalRarity: real('final_rarity'),
    shareId: text('share_id')
      .notNull()
      .unique()
      .default(sql`substr(md5(random()::text), 1, 10)`),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('game_user_puzzle_idx').on(t.userId, t.puzzleId), index('game_puzzle_idx').on(t.puzzleId)],
)

export const guess = pgTable(
  'guess',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    gameId: text('game_id')
      .notNull()
      .references(() => game.id, { onDelete: 'cascade' }),
    cell: smallint('cell').notNull(),
    uf: text('uf').notNull(),
    isCorrect: boolean('is_correct').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index('guess_game_idx').on(t.gameId),
    // Uma UF só pode ser acerto uma vez por partida, e cada célula só aceita um acerto.
    uniqueIndex('guess_correct_uf_idx').on(t.gameId, t.uf).where(sql`${t.isCorrect}`),
    uniqueIndex('guess_correct_cell_idx').on(t.gameId, t.cell).where(sql`${t.isCorrect}`),
  ],
)

export const cellPickCount = pgTable(
  'cell_pick_count',
  {
    puzzleId: integer('puzzle_id')
      .notNull()
      .references(() => puzzle.id, { onDelete: 'cascade' }),
    cell: smallint('cell').notNull(),
    uf: text('uf').notNull(),
    picks: integer('picks').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.puzzleId, t.cell, t.uf] })],
)

export const puzzleStats = pgTable('puzzle_stats', {
  puzzleId: integer('puzzle_id')
    .primaryKey()
    .references(() => puzzle.id, { onDelete: 'cascade' }),
  players: integer('players').notNull().default(0),
  completed: integer('completed').notNull().default(0),
})

export const report = pgTable('report', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  puzzleId: integer('puzzle_id')
    .notNull()
    .references(() => puzzle.id, { onDelete: 'cascade' }),
  cell: smallint('cell'),
  uf: text('uf'),
  message: text('message').notNull(),
  status: text('status', { enum: ['open', 'accepted', 'rejected'] }).notNull().default('open'),
  createdAt: createdAt(),
})
