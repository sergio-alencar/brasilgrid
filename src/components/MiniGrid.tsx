import { bandFor } from '../../shared/rarity.ts'

export function MiniGrid({ cellPercents, label }: { cellPercents: (number | null)[]; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-grid grid-cols-3 gap-px text-[10px] leading-none">
      {cellPercents.map((p, i) => (
        <span key={i}>{bandFor(p).emoji}</span>
      ))}
    </span>
  )
}
