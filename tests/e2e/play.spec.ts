import { expect, test } from '@playwright/test'

test('joga, erra, desiste e vê as respostas sem spoiler no compartilhamento', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /BrasilGrid #\d+/ })).toBeVisible()
  await expect(page.getByText('10/10 palpites')).toBeVisible()

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
  await expect(page.getByText(`${10 - tried.length}/10 palpites`)).toBeVisible()

  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Desistir e revelar' }).click()
  await expect(page.getByRole('heading', { name: 'Você desistiu' })).toBeVisible()
  await expect(page.getByText(/jogadores? hoje/)).toBeVisible()

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

  await page.getByRole('tab', { name: 'Seus erros' }).click()
  await expect(page.getByText(/não atende/).or(page.getByText('Nenhum palpite errado'))).toBeVisible()
})
