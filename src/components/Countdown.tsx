import { useEffect, useState } from 'react'
import { msUntilNextBrasiliaMidnight } from '../../shared/brasiliaDay.ts'

export function Countdown() {
  const [ms, setMs] = useState(() => msUntilNextBrasiliaMidnight())
  useEffect(() => {
    const t = setInterval(() => setMs(msUntilNextBrasiliaMidnight()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.floor(ms / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return (
    <span aria-label={`${h} horas, ${m} minutos e ${sec} segundos até a próxima grade`}>
      <span aria-hidden className="font-mono">
        {pad(h)}:{pad(m)}:{pad(sec)}
      </span>
    </span>
  )
}
