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
  onOpenAtlas: (categoryId: string) => void
}

export function Grid({ puzzleId, rows, cols, filled, disabled, shakeCell, onSelect, onOpenAtlas }: Props) {
  return (
    <div className="grid h-full grid-cols-4 grid-rows-4 gap-1 sm:gap-1.5">
      <div className="flex aspect-square h-full w-full items-center justify-center rounded-xl bg-brand-yellow p-1 text-center font-black text-brand-green">
        <span className="text-lg sm:text-2xl">#{puzzleId}</span>
      </div>
      {cols.map((c, i) => (
        <CategoryHeader key={`c${i}`} category={c} onOpenAtlas={onOpenAtlas} />
      ))}
      {rows.map((r, row) => (
        <Row key={`r${row}`} row={row} category={r} filled={filled} disabled={disabled} shakeCell={shakeCell} onSelect={onSelect} onOpenAtlas={onOpenAtlas} />
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
  onOpenAtlas,
}: { row: number; category: CategoryInfo } & Omit<Props, 'puzzleId' | 'rows' | 'cols'>) {
  return (
    <>
      <CategoryHeader category={category} onOpenAtlas={onOpenAtlas} />
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
              // Vazia: um "azulejo" liso, sem borda, da mesma família das
              // outras caixas translúcidas da página. Preenchida: cartão
              // branco (legibilidade da bandeira/nome, texto escuro fixo).
              'flex aspect-square h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl p-1 text-center transition cursor-pointer disabled:cursor-not-allowed',
              hit
                ? 'bg-white text-emerald-950 animate-pop dark:bg-emerald-950 dark:text-emerald-50'
                : 'bg-white/10 text-white hover:bg-white/15 disabled:hover:bg-white/10',
              shakeCell === cell ? 'animate-shake bg-red-500/25' : '',
            ].join(' ')}
          >
            {hit && uf && band && (
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
            )}
          </button>
        )
      })}
    </>
  )
}
