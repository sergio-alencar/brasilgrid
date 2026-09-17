export function formatPercent(value: number): string {
  if (value > 0 && value < 0.1) return '<0,1%'
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: value < 10 ? 1 : 0 })}%`
}
