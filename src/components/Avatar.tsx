import { useState } from 'react'

interface Props {
  image: string | null | undefined
  label: string
  size?: 'sm' | 'lg'
}

export function Avatar({ image, label, size = 'sm' }: Props) {
  const [failed, setFailed] = useState(false)
  const dim = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-16 w-16 text-2xl'
  if (image && !failed) {
    return (
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${dim} rounded-full object-cover ring-1 ring-black/10`}
      />
    )
  }
  return (
    <span aria-hidden className={`${dim} flex items-center justify-center rounded-full bg-white font-bold text-brand-green`}>
      {(label.trim()[0] ?? '?').toUpperCase()}
    </span>
  )
}
