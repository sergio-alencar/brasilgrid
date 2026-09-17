# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

BrasilGrid é um jogo diário de trivia geográfica (estilo Geogrid) sobre as 27 UFs do Brasil (estados + Distrito Federal), em português. Plano completo (fases, decisões) em `docs/plano.md`; diagnóstico do estado atual em `review.md`.

## Comandos

```bash
docker compose up -d              # Postgres local, porta 5433 (5432 costuma estar ocupada)
npm run db:migrate                # aplica drizzle/*.sql
npm run dev                       # SPA + Worker juntos (@cloudflare/vite-plugin), http://localhost:5173

npm run typecheck                 # tsc -b (3 tsconfig: app/worker/node)
npm run lint                      # eslint .
npm test                          # vitest run — testes unitários + integração real com Postgres
npm run test:watch
npx vitest run scripts/gameFunctions.test.ts   # rodar um arquivo de teste específico
npm run test:e2e                  # playwright — precisa do Postgres no ar e da grade de hoje publicada
npm run build                     # vite build (SPA + bundle do worker)
```

Pipeline de dados e grades (ver "Pipeline de dados" abaixo):

```bash
npm run data:fetch-ibge && npm run data:fetch-ibge-territory && npm run data:fetch-ibge-production && npm run data:fetch-wikidata
npm run data:build                # junta raw/*.json → data/ufs.json (com checagens cruzadas)
npm run data:build-categories-catalog
npm run data:validate              # confere o derive()/numeric de cada categoria contra data/ufs.json
npm run puzzles:generate -- --from 2026-11-01 --days 60 --seed 42
npm run puzzles:regenerate -- --file puzzles/<lote>.json --dates 2026-11-02,2026-11-05
npm run puzzles:publish -- --file puzzles/<lote>.json --launch 2026-11-01
npm run reports                    # lista avisos de erro que jogadores reportaram
```

Os scripts `data:*`/`puzzles:*` não precisam de nenhum segredo (IBGE e Wikidata são APIs públicas). Já `npm run dev` precisa de `.dev.vars` (copie `.dev.vars.example`; no mínimo `BETTER_AUTH_SECRET`).

## Arquitetura

**Um único Cloudflare Worker serve tudo.** `worker/index.ts` é um app Hono que trata `/api/*` e `/r/*` (ver `run_worker_first` em `wrangler.jsonc`); qualquer outra rota cai em `env.ASSETS.fetch()`, que serve a SPA já construída. Mesma origem, sem CORS. A ordem das rotas em `worker/index.ts` importa: o `dbMiddleware` (abre uma conexão `pg` via o binding do Hyperdrive) roda antes do middleware de sessão, e `/api/auth/*` é montado *antes* do middleware de sessão (o handler do Better Auth não depende de uma sessão já resolvida). O `scheduled()` no mesmo arquivo é o cron diário (00:05 em `America/Sao_Paulo`) que chama a função SQL `close_day` e apaga visitantes anônimos inativos.

**`shared/` é TypeScript puro, sem dependência de DOM/Node**, importado pela SPA, pelo Worker *e* pelos scripts de dados/grades. É onde moram as regras que cliente e servidor nunca podem discordar: as faixas de raridade (`rarity.ts`), a lógica de "que dia/jogo é hoje" no horário de Brasília (`brasiliaDay.ts`), o texto de compartilhamento sem spoiler (`shareText.ts`) e a normalização da busca (`search.ts` — que, de propósito, não casa pela sigla da UF, só pelo nome, para a busca não dar a resposta de bandeja).

**O gabarito nunca chega ao cliente antes do fim da partida.** `puzzle_cell.valid_ufs` (a lista de respostas certas) só é lida no servidor. Um palpite é conferido chamando a função SQL `submit_guess(...)` (definida em `drizzle/0001_game_functions.sql`, estendida em `0004` para o modo infinito) como SQL cru, a partir de `worker/routes/game.ts` — a conferência, o limite de palpites e a contabilidade de raridade em `cell_pick_count`/`puzzle_stats` acontecem tudo numa única ida ao banco, de propósito, em vez de transação/lock no nível da aplicação.

**"Normal" e "treino" (modo infinito) são partidas separadas (linhas diferentes em `game`)**, não uma marcação numa mesma linha — o índice único é `(user_id, puzzle_id, mode)`. O modo treino nunca escreve em `cell_pick_count`/`puzzle_stats` (não altera a raridade de ninguém) e fica de fora de `/api/me/stats` e dos links de compartilhamento. `merge_user_games` (visitante → conta) também casa duplicatas por modo.

**O pipeline de dados é feito num sentido só, não é um "join" ao vivo.** Os `scripts/fetch-*.ts` consultam IBGE/Wikidata e gravam `data/raw/*.json`. `scripts/build-ufs.ts` junta isso em `data/ufs.json`, conferindo o Wikidata contra o IBGE (ex.: simetria de fronteiras e de capital). As regras de cada categoria ficam em `data/categories/*.ts`: cada uma tem uma lista `members` escrita à mão e, quando possível, uma regra `derive`/`numeric` calculada a partir de `data/ufs.json` — `npm run data:validate` falha se as duas divergirem (isso já pegou erro real, como uma UF faltando numa lista de "sigla = duas primeiras letras"). `scripts/lib/generator.ts` monta as grades diárias (emparelhamento bipartido pra garantir que existe solução com 9 UFs, mais pontuação de armadilha/trivialidade) em `puzzles/<lote>.json`; `/dev/grades` (rota só de desenvolvimento, removida do build de produção via `import.meta.env.DEV`) é onde os lotes são revisados antes de `puzzles:publish` copiá-los para `puzzle`/`puzzle_category`/`puzzle_cell`. Publicar congela o gabarito — editar `data/categories/*.ts` depois nunca muda uma grade já publicada. `data/categories-catalog.json` e `data/flags.json` são as duas exceções que *são* importadas direto no bundle da SPA (o atlas de categorias e a página de créditos); todo o resto em `data/` é só de script/build.

**O CSS do layout (`src/index.css`) implementa uma regra de produto específica**: no desktop, o jogo precisa ocupar a tela sem barra de rolagem até a partida terminar, e só então a página passa a rolar, com as respostas aparecendo abaixo da grade. O tamanho de `.game-square` é `min(largura disponível na coluna, orçamento de altura da tela)` — de propósito, a *mesma fórmula* enquanto joga ou depois de terminar, porque calcular de dois jeitos diferentes (pela altura enquanto joga, pela largura quando a altura sobra) foi um bug real (a grade mudava de tamanho visivelmente ao terminar). `body.game-in-progress` (ligado/desligado em `Home.tsx`) é quem ativa o `overflow: hidden` de segurança.

**O Better Auth é criado a cada requisição** (`worker/auth.ts::createAuth(env, db, ctx?)`), nunca como uma instância única no nível do módulo — os bindings da Cloudflare só existem dentro de uma requisição. A sessão anônima é o ponto de entrada padrão (`ensureSession()` em `src/lib/authClient.ts` é chamada de forma preguiçosa, no primeiro palpite); entrar numa conta de verdade (Google ou código por e-mail) dispara `merge_user_games` via `onLinkAccount`.

**Dois níveis de teste, sem simular o banco.** O Vitest cobre a lógica pura de `shared/` e, à parte, uma suíte de integração real com Postgres (`scripts/gameFunctions.test.ts`) que cria um banco descartável `brasilgrid_test` a cada execução (`scripts/lib/testDb.ts`) e roda as migrações de verdade nele. Os testes de ponta a ponta com Playwright (`tests/e2e/`) rodam contra o servidor de desenvolvimento de verdade e o Postgres do Docker — precisa existir uma grade publicada para hoje, senão esses testes falham. `/api/dev/last-email` (só existe com `LOG_EMAILS=true` e `PUBLIC_URL` em localhost) é como os testes de ponta a ponta pegam o código de verificação sem uma caixa de entrada de verdade.

**Convenção de código**: identificadores e nomes de arquivo em inglês; tudo que o jogador vê, em português (rótulos, mensagens de erro, texto das categorias). Existem três `tsconfig.*.json` separados (`app`/`worker`/`node`) porque `src/` (precisa de `lib` de DOM) e `worker/` (`@cloudflare/workers-types`, sem DOM) têm `lib`/`types` incompatíveis entre si; `shared/` entra nos dois, já que não depende de nenhum dos dois.
