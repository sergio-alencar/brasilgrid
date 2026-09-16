import { MAP_PATHS, MAP_TRANSFORM, MAP_VIEWBOX } from '../generated/brazilMap.ts'
import { getUf } from '../../shared/ufs.ts'

interface Props {
  /** UFs válidas na célula. */
  valid: string[]
  /** UF escolhida pelo jogador, se houver. */
  mine?: string
  title: string
}

export default function BrazilMap({ valid, mine, title }: Props) {
  const names = valid.map((c) => getUf(c)?.name).join(', ')
  return (
    <svg viewBox={MAP_VIEWBOX} role="img" aria-label={`${title}: ${names}`} className="h-auto w-full max-w-xs">
      <g transform={MAP_TRANSFORM} strokeWidth={900} stroke="currentColor" className="text-white dark:text-slate-950">
        {Object.entries(MAP_PATHS).map(([code, d]) => (
          <path
            key={code}
            d={d}
            className={
              code === mine
                ? 'fill-brand-green'
                : valid.includes(code)
                  ? 'fill-emerald-300 dark:fill-emerald-700'
                  : 'fill-slate-200 dark:fill-slate-800'
            }
          >
            <title>{getUf(code)?.name}</title>
          </path>
        ))}
      </g>
    </svg>
  )
}
