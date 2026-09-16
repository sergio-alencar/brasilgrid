import { useState } from 'react'

export function ShareButtons({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const encoded = encodeURIComponent(text)
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const links = [
    ['WhatsApp', `https://wa.me/?text=${encoded}`],
    ['X', `https://x.com/intent/post?text=${encoded}`],
    ['Threads', `https://www.threads.net/intent/post?text=${encoded}`],
    ['Bluesky', `https://bsky.app/intent/compose?text=${encoded}`],
    ['Telegram', `https://t.me/share/url?text=${encoded}`],
  ] as const

  return (
    <div className="space-y-2">
      <pre className="rounded-lg bg-slate-100 p-3 text-sm whitespace-pre-wrap dark:bg-slate-800">{text}</pre>
      <div className="flex flex-wrap gap-2">
        {canShare && (
          <button
            type="button"
            onClick={() => navigator.share({ text }).catch(() => {})}
            className="rounded-lg bg-brand-green px-3 py-2 text-sm font-semibold text-white"
          >
            Compartilhar
          </button>
        )}
        <button type="button" onClick={copy} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600">
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
        {links.map(([name, href]) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
          >
            {name}
          </a>
        ))}
      </div>
    </div>
  )
}
