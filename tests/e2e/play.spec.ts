import { expect, test } from '@playwright/test'

test('joga, erra, desiste e vê as respostas sem spoiler no compartilhamento', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/^#\d+$/)).toBeVisible()
  await expect(page.getByLabel('10 de 10 palpites restantes')).toBeVisible()

  // Tenta UFs até errar uma na primeira célula.
  const tried: string[] = []
  for (const name of ['Sergipe', 'Alagoas', 'Rio Grande do Norte', 'Paraíba', 'Espírito Santo']) {
    const cell = page.getByRole('button', { name: /Célula 1:/ })
    if (!(await cell.isVisible())) break
    await cell.click()
    await page.getByLabel('Buscar UF').fill(name)
    await page.keyboard.press('Enter')
    await expect(page.getByRole('status')).toBeVisible()
    tried.push(name)
    if (await page.getByText(`${name} não serve aqui.`).isVisible()) break
  }
  expect(tried.length).toBeGreaterThan(0)
  await expect(page.getByLabel(`${10 - tried.length} de 10 palpites restantes`)).toBeVisible()

  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Desistir e revelar' }).click()
  await expect(page.getByRole('heading', { name: 'Você desistiu' })).toBeVisible()
  await expect(page.getByText(/jogadores? hoje/)).toBeVisible()

  // A grade não deve encolher/desaparecer depois que a partida termina.
  const box = await page.getByRole('button', { name: 'Célula 1: escolher UF' }).boundingBox()
  expect(box!.width).toBeGreaterThan(50)
  expect(box!.height).toBeGreaterThan(50)

  const share = await page.locator('pre').innerText()
  expect(share).toMatch(/^BrasilGrid #\d+ 🇧🇷\n✅ \d\/9 · Raridade \d+/)
  expect(share).not.toMatch(/Sergipe|Alagoas|Paraíba|Espírito|Norte/)

  // O mapa acompanha a célula escolhida nas respostas.
  const cards = page.locator('ol button[aria-pressed]')
  await expect(cards).toHaveCount(9)
  await cards.nth(4).click()
  await expect(cards.nth(4)).toHaveAttribute('aria-pressed', 'true')
  const caption = await page.locator('figcaption').innerText()
  expect(await cards.nth(4).locator('p').innerText()).toBe(caption)
  await expect(page.getByRole('img', { name: new RegExp(caption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })).toBeVisible()

  // Aviso de erro no gabarito.
  await page.getByRole('button', { name: 'Avise a gente' }).click()
  await page.getByLabel('O que está errado?').fill('Teste automático: ignorar este aviso.')
  await page.getByRole('button', { name: 'Enviar' }).click()
  await expect(page.getByRole('heading', { name: 'Obrigado!' })).toBeVisible()
  await page.getByRole('button', { name: 'Fechar' }).click()

  await page.getByRole('tab', { name: 'Seus erros' }).click()
  await expect(page.getByText(/não atende/).or(page.getByText('Nenhum palpite errado'))).toBeVisible()
})

test('link compartilhado mostra o placar sem respostas e tem prévia', async ({ page, request }) => {
  await page.goto('/')
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Desistir e revelar' }).click()
  const share = await page.locator('pre').innerText()
  const url = new URL(share.trim().split('\n').at(-1)!)

  const html = await (await request.get(url.pathname)).text()
  expect(html).toMatch(/<meta property="og:title" content="BrasilGrid #\d+ — 0\/9 · raridade 900"/)

  await page.goto(url.pathname)
  await expect(page.getByText('Partida encerrada')).toBeVisible()
  await expect(page.getByText('vazia')).toHaveCount(9)
  await expect(page.getByRole('link', { name: 'Jogar a grade de hoje' })).toBeVisible()

  const missing = await request.get('/r/naoexiste1')
  expect(missing.status()).toBe(404)
})

test('modo infinito não tem limite de palpites e não interfere na partida normal', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('switch', { name: 'Modo infinito' }).click()
  await expect(page.getByLabel('palpites ilimitados')).toBeVisible()

  // Todos com litoral: garantidamente errados para "Sem litoral", mais que o
  // limite normal de palpites, sem a partida acabar.
  const coastal = ['Sergipe', 'Alagoas', 'Ceará', 'Bahia', 'Pará', 'Piauí', 'Maranhão', 'Espírito Santo', 'Paraíba', 'Pernambuco', 'Paraná', 'Rio de Janeiro']
  for (const uf of coastal) {
    await page.getByRole('button', { name: /Célula 1:/ }).click()
    await page.getByLabel('Buscar UF').fill(uf)
    await page.keyboard.press('Enter')
    await expect(page.getByText(`${uf} não serve aqui.`)).toBeVisible()
  }
  await expect(page.getByLabel('palpites ilimitados')).toBeVisible()

  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Encerrar treino' }).click()
  await expect(page.getByRole('heading', { name: 'Treino encerrado' })).toBeVisible()
  await expect(page.getByText('não conta nas suas estatísticas')).toBeVisible()
  // Treino não tem botão de compartilhar.
  await expect(page.getByRole('button', { name: 'Compartilhar' })).toHaveCount(0)

  // Volta pro modo normal: a partida de hoje está intacta (nenhum palpite usado).
  await page.getByRole('switch', { name: 'Modo infinito' }).click()
  await expect(page.getByLabel('10 de 10 palpites restantes')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Desistir e revelar' })).toBeVisible()
})
