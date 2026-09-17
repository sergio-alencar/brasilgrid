// Gera public/og.png (1200×630), a imagem de prévia usada nos links compartilhados.
import { chromium } from '@playwright/test'
import { ROOT } from './lib/io.ts'

const cells = ['🟩', '🔷', '⚡', '🌈', '🟩', '💎', '🟩', '🦄', '🔷']
const html = `<!doctype html><html><body style="margin:0">
<div style="width:1200px;height:630px;box-sizing:border-box;padding:70px 80px;display:flex;align-items:center;gap:80px;
  background:linear-gradient(135deg,#042b17,#0f9b58 65%,#002776);font-family:'Fredoka',sans-serif;color:white">
  <div style="flex:1">
    <div style="font-size:104px;font-weight:900;letter-spacing:-2px">Brasil<span style="color:#ffdf00">Grid</span></div>
    <div style="font-size:42px;margin-top:24px;line-height:1.25">O jogo diário dos estados do Brasil</div>
    <div style="font-size:30px;margin-top:36px;opacity:.85">Uma grade nova todo dia. Qual é a sua raridade?</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,130px);gap:16px">
    ${cells.map((c) => `<div style="height:130px;border-radius:24px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:72px">${c}</div>`).join('')}
  </div>
</div></body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
await page.screenshot({ path: `${ROOT}/public/og.png` })
await browser.close()
console.log('public/og.png')
