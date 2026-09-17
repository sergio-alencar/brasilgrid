import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

// Config da SPA + Worker (dev/build). Testes ficam em vitest.config.ts,
// separado, porque o plugin da Cloudflare não precisa (nem deve) rodar
// durante os testes unitários de shared/.
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
})
