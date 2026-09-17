import type { SharedResult } from '../shared/api.ts'
import { bandFor } from '../shared/rarity.ts'

function emojiGrid(percents: (number | null)[]): string {
  const rows = [0, 1, 2].map((r) => percents.slice(r * 3, r * 3 + 3).map((p) => bandFor(p).emoji).join(''))
  return rows.join(' ')
}

/** Devolve o index.html da SPA com meta tags de prévia para o link compartilhado. */
export async function renderSharePage(request: Request, env: Env, result: SharedResult | null): Promise<Response> {
  const shell = await env.ASSETS.fetch(new Request(new URL('/', request.url), request))
  const origin = env.PUBLIC_URL
  const title = result
    ? `BrasilGrid #${result.puzzleId} — ${result.correctCount}/9 · raridade ${result.rarity}`
    : 'BrasilGrid — o jogo diário dos estados do Brasil'
  const description = result
    ? `${emojiGrid(result.cellPercents)} · Consegue fazer melhor? Jogue a grade de hoje.`
    : 'Preencha a grade 3×3 com estados que combinem com as categorias.'
  const tags: Record<string, string> = {
    'og:title': title,
    'og:description': description,
    'og:type': 'website',
    'og:url': new URL(new URL(request.url).pathname, origin).toString(),
    'og:image': `${origin}/og.png`,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:locale': 'pt_BR',
    'twitter:card': 'summary_large_image',
  }

  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const meta = Object.entries(tags)
    .map(([k, v]) => `<meta ${k.startsWith('og:') ? 'property' : 'name'}="${k}" content="${escape(v)}" />`)
    .join('')

  const rewritten = new HTMLRewriter()
    .on('title', { element: (el) => void el.setInnerContent(title) })
    .on('head', { element: (el) => void el.append(meta, { html: true }) })
    .transform(shell)
  const headers = new Headers(rewritten.headers)
  headers.set('Cache-Control', 'public, max-age=60')
  return new Response(rewritten.body, { status: result ? 200 : 404, headers })
}
