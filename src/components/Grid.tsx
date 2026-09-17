import type { CategoryInfo, FilledCell } from '../../shared/api.ts'
import { bandFor } from '../../shared/rarity.ts'
import { getUf } from '../../shared/ufs.ts'
import { formatPercent } from '../lib/format.ts'
import { CategoryHeader } from './CategoryHeader.tsx'

interface Props {
  puzzleId: number
  rows: CategoryInfo[]
  cols: CategoryInfo[]
  filled: FilledCell[]
  disabled: boolean
  shakeCell: number | null
  onSelect: (cell: number) => void
}

export function Grid({ puzzleId, rows, cols, filled, disabled, shakeCell, onSelect }: Props) {
  return (
    <div className="grid h-full grid-cols-[minmax(0,0.8fr)_repeat(3,minmax(0,1fr))] grid-rows-[auto_repeat(3,minmax(0,1fr))] gap-1.5 sm:gap-2">
      <div className="flex items-center justify-center rounded-xl bg-brand-yellow p-1 text-center font-black text-brand-green">
        <span className="text-lg sm:text-2xl">#{puzzleId}</span>
      </div>
      {cols.map((c, i) => (
        <CategoryHeader key={`c${i}`} category={c} />
      ))}
      {rows.map((r, row) => (
        <Row key={`r${row}`} row={row} category={r} filled={filled} disabled={disabled} shakeCell={shakeCell} onSelect={onSelect} />
      ))}
    </div>
  )
}

function Row({
  row,
  category,
  filled,
  disabled,
  shakeCell,
  onSelect,
}: { row: number; category: CategoryInfo } & Omit<Props, 'puzzleId' | 'rows' | 'cols'>) {
  return (
    <>
      <CategoryHeader category={category} />
      {[0, 1, 2].map((col) => {
        const cell = row * 3 + col
        const hit = filled.find((f) => f.cell === cell)
        const uf = hit && getUf(hit.uf)
        const band = hit && bandFor(hit.percent)
        return (
          <button
            key={cell}
            type="button"
            disabled={disabled || !!hit}
            onClick={() => onSelect(cell)}
            aria-label={hit ? `${uf?.name}, ${formatPercent(hit.percent)}` : `Célula ${cell + 1}: escolher UF`}
            className={[
              // As células são sempre um "azulejo" claro, tingido de verde
              // (nunca cinza-azulado) — texto escuro fixo, não herda o
              // branco do box verde por trás.
              'flex aspect-square h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 p-1 text-center text-emerald-950 transition dark:text-emerald-50',
              hit
                ? 'border-brand-green bg-emerald-100 animate-pop dark:bg-emerald-950'
                : 'border-emerald-100/70 bg-white hover:border-brand-yellow hover:bg-emerald-50 disabled:hover:border-emerald-100/70 dark:border-emerald-900 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70',
              shakeCell === cell ? 'animate-shake border-red-500' : '',
            ].join(' ')}
          >
            {hit && uf && band ? (
              <>
                <img
                  src={`/flags/${uf.code}.svg`}
                  alt=""
                  className="h-7 w-10 rounded-sm object-cover shadow-sm ring-1 ring-black/10 sm:h-10 sm:w-14"
                />
                <span className="mt-1 line-clamp-2 text-[10px] leading-tight font-semibold sm:text-xs">{uf.name}</span>
                <span className="mt-1 text-[10px] sm:text-xs" title={band.label}>
                  {band.emoji} {formatPercent(hit.percent)}
                </span>
              </>
            ) : (
              <span aria-hidden className="text-2xl text-emerald-200 dark:text-emerald-800">
                +
              </span>
            )}
          </button>
        )
      })}
    </>
  )
}
