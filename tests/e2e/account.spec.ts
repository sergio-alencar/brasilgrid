import { expect, test } from '@playwright/test'

test('visitante joga, entra por código e mantém a partida no histórico', async ({ page, request }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /BrasilGrid #\d+/ })).toBeVisible()

  // Um palpite qualquer cria a sessão de visitante e a partida.
  await page.getByRole('button', { name: /Célula 1:/ }).click()
  await page.getByLabel('Buscar UF').fill('Sergipe')
  await page.keyboard.press('Enter')
  await expect(page.getByText('9/10 palpites')).toBeVisible()

  await page.getByRole('link', { name: 'Entrar' }).click()
  const email = `e2e.${Date.now()}@brasilgrid.invalid`
  await page.getByLabel('E-mail').fill(email)
  await page.getByRole('button', { name: 'Receber código por e-mail' }).click()
  await expect(page.getByText(`Enviamos um código de 6 dígitos para ${email}`)).toBeVisible()

  const res = await request.get(`/api/dev/last-email?to=${encodeURIComponent(email)}`)
  expect(res.ok()).toBe(true)
  const otp = ((await res.json()) as { text: string }).text.match(/\b\d{6}\b/)![0]

  await page.getByLabel('Código').fill(otp)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Perfil' })).toBeVisible()
  await expect(page.getByText('9/10 palpites')).toBeVisible()

  await page.getByRole('link', { name: 'Estatísticas' }).click()
  await expect(page.getByText('Você está jogando como visitante')).toHaveCount(0)
  await expect(page.getByRole('cell', { name: /#\d+/ })).toBeVisible()

  await page.getByRole('link', { name: 'Perfil' }).click()
  await expect(page.getByText(email)).toBeVisible()
  await page.getByRole('textbox', { name: 'Apelido' }).fill(`e2e${Date.now() % 100000}`)
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Perfil salvo.')).toBeVisible()

  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Apagar conta' }).click()
  await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
})
