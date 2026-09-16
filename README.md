# BrasilGrid

Jogo diário de geografia do Brasil, no estilo do [Geogrid](https://www.geogridgame.com/): uma grade 3×3 em que cada célula pede uma UF (estado ou Distrito Federal) que satisfaça uma categoria de linha e uma de coluna ao mesmo tempo. Todo o jogo é em português.

O plano completo (regras, arquitetura, catálogo de categorias, fases) está em `docs/plano.md`.

## Stack

- **Front:** React 19 + Vite + TypeScript + Tailwind 4 (SPA)
- **API:** [Hono](https://hono.dev/) no mesmo Cloudflare Worker que serve os arquivos estáticos
- **Banco:** Postgres (Neon em produção, Docker localmente), acessado via Hyperdrive no Worker
- **Dados do jogo:** IBGE (localidades e malhas) e Wikidata, com scripts de coleta em `scripts/`

Convenção: identificadores de código em inglês, texto exibido ao jogador em português.

## Desenvolvimento

```bash
npm install
docker compose up -d      # Postgres local, porta 5433 (5432 costuma estar ocupada)
npm run dev                # SPA + Worker juntos (via @cloudflare/vite-plugin)
```

Outros comandos: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## Dados e grades

```bash
npm run data:fetch-ibge       # Censo 2022 e municípios → data/raw/ibge.json
npm run data:fetch-wikidata   # capitais e divisas → data/raw/wikidata.json
npm run data:build            # junta tudo em data/ufs.json (com checagens)
npm run data:validate         # confere as categorias contra os dados
npm run puzzles:generate -- --from 2026-11-01 --days 60 --seed 42
```

As categorias ficam em `data/categories/`. Cada uma tem o gabarito escrito à mão, a fonte e, quando possível, uma regra calculada a partir de `data/ufs.json`; se as duas divergirem, a validação falha.

## Estado atual

Projeto em construção — ver `docs/plano.md` para as fases. A Fase 0 (estrutura do projeto e coleta de dados) está em andamento.
