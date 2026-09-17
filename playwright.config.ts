import { defineConfig, devices } from '@playwright/test'

// Requer o Postgres local (docker compose up -d) com a grade de hoje publicada.
export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:5173', ...devices['Pixel 7'] },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
