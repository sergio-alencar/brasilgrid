# BrasilGrid

Jogo diário de geografia do Brasil, no estilo do [Geogrid](https://www.geogridgame.com/): uma grade 3×3 em que cada célula pede uma UF (estado ou Distrito Federal) que satisfaça uma categoria de linha e uma de coluna ao mesmo tempo. Todo o jogo é em português.

O plano completo (regras, arquitetura, catálogo de categorias, fases) está em `docs/plano.md`. O diagnóstico do que já foi construído, as decisões tomadas (com o porquê) e o estado atual por fase estão em [`review.md`](review.md).

## Stack

- **Front:** React 19 + Vite + TypeScript + Tailwind 4 (SPA)
- **API:** [Hono](https://hono.dev/) no mesmo Cloudflare Worker que serve os arquivos estáticos
- **Banco:** Postgres (Neon em produção, Docker localmente), acessado via Hyperdrive no Worker
- **Login:** Better Auth — sessão anônima por padrão, com login por código de e-mail ou Google
- **Dados do jogo:** IBGE (localidades, malhas, Censo 2022, produção agropecuária) e Wikidata, com scripts de coleta em `scripts/`

Convenção: identificadores de código em inglês, texto exibido ao jogador em português.

## Desenvolvimento

```bash
npm install
cp .dev.vars.example .dev.vars   # e preencha BETTER_AUTH_SECRET (openssl rand -base64 32)
docker compose up -d      # Postgres local, porta 5433 (5432 costuma estar ocupada)
npm run db:migrate
npm run puzzles:generate -- --from $(date +%F) --days 30 --seed 1
npm run puzzles:publish -- --file puzzles/$(date +%F)_30d.json --launch $(date +%F)
npm run dev                # SPA + Worker juntos (via @cloudflare/vite-plugin), em http://localhost:5173
```

Outros comandos: `npm run typecheck`, `npm run lint`, `npm test` (inclui os testes das funções SQL, se o Postgres estiver no ar), `npm run test:e2e`, `npm run build`, `npm run reports` (lista os avisos de erro enviados por jogadores).

## Dados e grades

```bash
npm run data:fetch-ibge             # municípios e UFs → data/raw/ibge.json
npm run data:fetch-ibge-territory   # área e fronteiras → data/raw/ibge-territory.json
npm run data:fetch-ibge-production  # Censo 2022 e produção agropecuária → data/raw/ibge-production.json
npm run data:fetch-wikidata         # capitais, divisas, pontos culminantes → data/raw/wikidata.json
npm run data:fetch-flags            # bandeiras (SVG) → public/flags/
npm run data:build                  # junta tudo em data/ufs.json (com checagens cruzadas)
npm run data:build-map              # mapa SVG por UF
npm run data:build-categories-catalog  # data/categories-catalog.json (atlas de categorias, sem gabarito)
npm run data:validate                # confere as categorias contra data/ufs.json
npm run puzzles:generate -- --from 2026-11-01 --days 60 --seed 42
npm run puzzles:regenerate -- --file puzzles/<lote>.json --dates 2026-11-02,2026-11-05
npm run puzzles:publish -- --file puzzles/<lote>.json --launch 2026-11-01
npm run build:og-image               # imagem padrão usada nas prévias de link
```

As categorias ficam em `data/categories/`. Cada uma tem o gabarito escrito à mão, a fonte e, quando possível, uma regra calculada a partir de `data/ufs.json`; se as duas divergirem, a validação falha. Publicar uma grade congela o gabarito: editar as categorias depois não altera grades já publicadas.

## Estado atual

Jogo completo e jogável de ponta a ponta: grade diária, sessão anônima com migração para conta (Google ou código por e-mail), limite de palpites com raridade por célula, desistência com revelação do gabarito, compartilhamento sem spoiler com página pública (`/r/:id`), modo treino com palpites ilimitados (fora das estatísticas) e atlas de categorias. Ver [`review.md`](review.md) para o diagnóstico detalhado por fase.
