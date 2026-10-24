import { test as base, expect } from '@playwright/test'

// Marca o modal de boas-vindas como já visto antes de cada página carregar,
// senão ele cobre a tela (o navegador de teste começa sem localStorage) e
// bloqueia os cliques seguintes em todo teste.
export const test = base.extend({
  page: async ({ page }, runTest) => {
    await page.addInitScript(() => localStorage.setItem('brasilgrid:intro-seen', '1'))
    await runTest(page)
  },
})

export { expect }
