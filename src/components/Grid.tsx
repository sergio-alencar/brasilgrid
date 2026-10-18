import type { CategoryInfo, FilledCell } from '../../shared/api.ts'
import { bandFor, type RarityBand } from '../../shared/rarity.ts'
import { getUf } from '../../shared/ufs.ts'
import { formatPercent } from '../lib/format.ts'
import { CategoryHeader } from './CategoryHeader.tsx'

// Cor do selo de %, por faixa de raridade — mesmo espírito do Geogrid
// (comum = verde comum até mítico = cor mais chamativa).
const BAND_COLOR: Record<RarityBand, string> = {
  common: '#16a34a',
  uncommon: '#2563eb',
  rare: '#d97706',
  epic: '#c026d3',
  legendary: '#0891b2',
  mythic: '#e11d48',
  empty: '#64748b',
}

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
              // outras caixas translúcidas da página. Preenchida: a bandeira
              // ocupa a célula toda, com o % em selo no topo e o nome em
              // legenda no rodapé — como no Geogrid.
              'relative aspect-square h-full w-full overflow-hidden rounded-xl bg-white/10 text-center transition cursor-pointer disabled:cursor-not-allowed',
              hit ? 'animate-pop' : 'flex items-center justify-center text-white hover:bg-white/15 disabled:hover:bg-white/10',
              shakeCell === cell ? 'animate-shake bg-red-500/25' : '',
            ].join(' ')}
          >
            {hit && uf && band && (
              <>
                <img src={`/flags/${uf.code}.svg`} alt="" className="absolute inset-0 h-full w-full object-contain p-2" />
                <span
                  className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm sm:text-[11px]"
                  style={{ backgroundColor: BAND_COLOR[band.band] }}
                  title={band.label}
                >
                  {band.emoji} {formatPercent(hit.percent)}
                </span>
                <span className="absolute bottom-1 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-white sm:text-[11px]">
                  {uf.name}
                </span>
              </>
            )}
          </button>
        )
      })}
    </>
  )
}
