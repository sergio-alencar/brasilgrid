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
  return (
    <span className="font-mono">
      {pad(Math.floor(s / 3600))}:{pad(Math.floor((s % 3600) / 60))}:{pad(s % 60)}
    </span>
  )
}
