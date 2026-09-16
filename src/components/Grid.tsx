import type { CategoryInfo, FilledCell } from '../../shared/api.ts'
import { bandFor } from '../../shared/rarity.ts'
import { getUf } from '../../shared/ufs.ts'
import { formatPercent } from '../lib/format.ts'
import { CategoryHeader } from './CategoryHeader.tsx'

interface Props {
  rows: CategoryInfo[]
  cols: CategoryInfo[]
  filled: FilledCell[]
  disabled: boolean
  shakeCell: number | null
  onSelect: (cell: number) => void
}

export function Grid({ rows, cols, filled, disabled, shakeCell, onSelect }: Props) {
  return (
    <div className="grid grid-cols-[minmax(0,0.8fr)_repeat(3,minmax(0,1fr))] gap-1.5">
      <div />
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
}: { row: number; category: CategoryInfo } & Omit<Props, 'rows' | 'cols'>) {
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
              'flex aspect-square flex-col items-center justify-center rounded-xl border-2 p-1 text-center transition',
              hit
                ? 'border-brand-green bg-emerald-50 dark:bg-emerald-950'
                : 'border-slate-300 bg-slate-50 hover:border-brand-green hover:bg-white disabled:hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
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
              <span aria-hidden className="text-2xl text-slate-300 dark:text-slate-600">
                +
              </span>
            )}
          </button>
        )
      })}
    </>
  )
}
