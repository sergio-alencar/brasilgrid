# BrasilGrid — plano do projeto

## Contexto

Jogo web diário no estilo do [Geogrid](https://www.geogridgame.com/), com as 27 UFs (26 estados + DF) no lugar dos países, todo em português. A pasta `/home/sergio-alencar/Scripts/brasilgrid` está vazia: o projeto começa do zero e ainda não tem git.

**O que o jogo precisa ter:**
- grade diária 3×3;
- categorias brasileiras: capitais, geografia, hidrografia, biomas (fauna e flora), geopolítica, história, esportes, geologia, bandeiras e nomes;
- dados do IBGE, Wikidata/Wikipedia, ANA etc.;
- login opcional com histórico ao longo dos dias;
- compartilhamento sem spoiler.

**Decisões já tomadas com você:**
- sem Supabase: Postgres puro na Neon;
- hospedagem no Cloudflare;
- React SPA + API em Hono, cabendo no plano grátis;
- conta opcional: o visitante joga na hora;
- login com Google e com código por e-mail;
- ranking público só depois do MVP.

---

## 1. Regras (adaptadas do Geogrid)

Conferido no código do Geogrid: 10 palpites, opção de palpites ilimitados, botão "Finish & reveal", abas de respostas (mais e menos populares, todas, seus erros), cada país usado uma vez por grade e célula vazia valendo 100.

- **Grade:** 3 categorias nas linhas × 3 nas colunas. Cada célula pede uma UF que atenda às duas.
- **Repetição:** cada UF só pode ser usada uma vez por grade.
- **Palpites:** 10. Cada erro gasta um palpite. O número fica numa constante, para ajustar depois dos testes.
- **Desistir e revelar:** encerra a partida.
- **Acertos:** X/9.
- **Raridade (quanto menor, melhor):** soma do % de cada uma das 9 células; célula vazia vale 100.
  - `% = escolhas(célula, UF) ÷ jogadores do dia (quem fez ≥ 1 palpite) × 100`.
- **Faixas de raridade** (as do Geogrid; revisar após o lançamento, porque com só 27 UFs os percentuais tendem a ser maiores):
  - 🟩 Comum ≥ 25%
  - 🔷 Incomum ≥ 10%
  - ⚡ Raro ≥ 5%
  - 🌈 Épico ≥ 2%
  - 💎 Lendário ≥ 0,5%
  - 🦄 Mítico < 0,5%
  - ⬛ vazio
- **Raridade ao longo do dia:** é "parcial" e muda conforme mais gente joga. O fechamento das 00:05 grava o valor final no histórico.
- **Virada do dia:** meia-noite de Brasília (`America/Sao_Paulo`). Jogo nº N = dias desde o lançamento + 1.
- **Depois do jogo:**
  - respostas de cada célula com %, em abas: Mais escolhidas, Menos escolhidas, Todas e Seus erros;
  - nos erros, o motivo (ex.: "Bahia não faz fronteira com outro país");
  - mapa destacando as UFs válidas.

## 2. Stack

| Camada | Escolha |
|---|---|
| Front | React 19 + Vite + TypeScript + Tailwind 4 + React Router (SPA) |
| API | Hono no **mesmo** Cloudflare Worker que serve os estáticos (mesmo domínio, sem CORS e sem problema de cookie) |
| Login | Better Auth, com os plugins `anonymous` (visitante), `emailOTP` (código de 6 dígitos) e `captcha` (Turnstile), mais o provedor Google |
| Banco | Postgres: Neon (região São Paulo) em produção e Docker local. Drizzle ORM + driver `pg` via Hyperdrive |
| Agendamento | Cron Trigger do Worker, às 03:05 UTC (00:05 em Brasília) |
| E-mail | Resend (plano grátis) |
| Testes | Vitest (unidade + integração com o Postgres do Docker) e Playwright (E2E) |
| Scripts de dados | TypeScript com `tsx`, rodando localmente (Node 24) |

**Limites dos planos grátis (conferidos hoje):**
- **Cloudflare:** estáticos grátis e ilimitados; 100 mil requisições/dia na API; 10 ms de CPU por requisição; Hyperdrive com 100 mil queries/dia.
  - Cada jogador faz cerca de 14 chamadas por dia, então cabem alguns milhares de jogadores diários.
  - Quando crescer: Workers Paid, a US$ 5/mês.
- **Neon:** 100 CU-hours/mês, 0,5 GB e o banco dorme após 5 min sem uso.
  - Com tráfego o dia inteiro, o limite pode estourar. Aí o caminho é o plano Launch, pago por uso (US$ 0,106 por CU-hora).

**Convenção:** código (identificadores, arquivos, campos) em inglês; tudo que o jogador vê em português.

## 3. Arquitetura

```
brasilgrid.com.br — 1 Worker
├── arquivos estáticos (SPA React)            grátis/ilimitado
└── Worker Hono  (run_worker_first: /api/*, /r/*)
    ├── /api/auth/*        Better Auth (criado por requisição: createAuth(env))
    ├── /api/puzzle, /api/game, /api/me, /api/report, /api/share
    ├── /r/:id             index.html + meta tags via HTMLRewriter
    └── scheduled()        fechamento diário
          │ Hyperdrive (pg)
          ▼
    Neon Postgres (aws-sa-east-1)
```

**Endpoints:**

| Rota | Função |
|---|---|
| `GET /api/puzzle/today` | categorias do dia (rótulo, descrição, fonte) e estado da partida |
| `POST /api/game/guess` `{cell, uf}` | registra um palpite |
| `POST /api/game/give-up` | desiste e revela |
| `GET /api/game/:puzzleId/results` | respostas e %; só com a partida encerrada ou para dia passado |
| `GET /api/me/stats`, `GET /api/me/history` | estatísticas e histórico |
| `PATCH /api/me/profile`, `DELETE /api/me` | perfil e exclusão da conta |
| `POST /api/report` | reportar erro de dados |
| `GET /api/share/:shareId` | dados da página de resultado |
| `GET /api/leaderboard/:puzzleId` | ranking (pós-MVP) |

**Fluxo de um palpite:**
1. Se não houver sessão, o SPA cria uma sessão anônima (`signIn.anonymous` com token do Turnstile no header `x-captcha-response`).
2. `POST /api/game/guess` chama a função SQL `submit_guess`, numa única ida ao banco e de forma atômica. Ela:
   - trava a partida;
   - confere o limite de palpites, a célula vazia e a UF ainda não usada;
   - compara com o gabarito;
   - grava o palpite e incrementa os contadores de raridade.
3. A resposta traz: acertou?, % atual, palpites restantes e status.

**Anti-spoiler e anti-trapaça:**
- O gabarito fica só no banco (uma cópia por grade) e é conferido no servidor. Nunca vai para o navegador antes do fim.
- As respostas completas só saem para quem terminou a partida ou para dias passados.
- Grades futuras nunca aparecem na API.
- A criação de sessões anônimas tem Turnstile e o rate limit do Better Auth.
- A `session.cookieCache` do Better Auth poupa queries (importante para a cota do Hyperdrive).

**Configuração do Cloudflare:**
- `wrangler.jsonc`:
  - `assets.not_found_handling: "single-page-application"`;
  - `run_worker_first: ["/api/*", "/r/*"]`;
  - binding Hyperdrive com `localConnectionString` apontando para o Postgres do Docker;
  - `triggers.crons`.
- `@cloudflare/vite-plugin` roda o SPA e o Worker juntos no `npm run dev`.
- Segredos locais em `.dev.vars` e em produção via `wrangler secret put`. Todos validados com zod.

## 4. Dados e categorias (o coração do jogo)

**Fontes:**

| Fonte | Uso |
|---|---|
| IBGE API de localidades | UFs, códigos e regiões (endpoint testado ✔) |
| IBGE malhas v3 | SVG do mapa por UF, 48 KB (testado ✔) |
| IBGE SIDRA / Censo 2022 | população, área, municípios |
| IBGE PAM / PPM | produção agrícola e pecuária |
| IBGE Biomas 2019 | área de cada bioma por UF |
| Wikidata SPARQL (CC0) | capitais, divisas (P47), ponto culminante, gentílicos, bandeiras |
| Wikipedia | só conferência manual (não copiar texto, que é CC BY-SA) |
| ANA | regiões hidrográficas |
| ICMBio/CNUC | unidades de conservação |
| UNESCO | patrimônio mundial e geoparques |
| ANP | petróleo |
| CBF/FIFA | esportes |
| Wikimedia Commons | SVG das bandeiras (conferir a licença de cada arquivo e creditar em `/fontes`) |

**Formato em `data/`:**
- `data/ufs.json`: as 27 UFs com os fatos base (sigla, nome, código IBGE, região, capital, população 2022, área, UFs vizinhas, países vizinhos, litoral…). Cada fato traz fonte e data de coleta.
- `data/raw/`: respostas brutas das APIs, com data.
- `data/categories/<familia>.ts`: cada categoria segue o formato
  `{ id, family, label (≤ 32 caracteres), description (regra exata), members | rule, source, notes (casos de borda), difficulty 1–3 }`.
- **Dupla checagem:** quando a categoria pode ser calculada dos dados brutos, a lista escrita à mão é comparada com a calculada. Se divergirem, o teste falha.

**Regras de qualidade:**
- Idealmente 3–20 membros; conjuntos menores só como categoria "difícil".
- Nada de fatos voláteis (ex.: "tem time na Série A"). Se entrar algum, o ano vai no rótulo.
- Evitar limiares em que alguma UF fique "na beirada".
- Casos de borda documentados. Exemplos:
  - rio que só faz divisa;
  - bioma com fatia mínima (usar um % mínimo do território);
  - pico na divisa MG/ES;
  - ilhas oceânicas em outro fuso (usar o fuso da capital).

**Catálogo do MVP: cerca de 45 categorias.** Os números entre parênteses são tamanhos já conhecidos; o resto é levantado e conferido na Fase 0.

| Família | Exemplos |
|---|---|
| Regiões e geopolítica | Região Norte, Nordeste, Centro-Oeste, Sudeste ou Sul; faz fronteira com outro país (11); faz fronteira com país hispânico; faz divisa com BA, MG ou GO; faz divisa com só 1–2 UFs; Amazônia Legal; área da SUDENE; sede de TRF |
| Litoral e posição | tem litoral (17) ou não tem (10); capital banhada pelo mar; capital em ilha; cortado pela Linha do Equador (4); cortado pelo Trópico de Capricórnio (3); capital com fuso diferente de Brasília |
| Hidrografia | banhado pelo São Francisco, Amazonas, Tocantins, Araguaia, Paraná ou Paraíba do Sul; tem território na região hidrográfica X (ANA) |
| Biomas (fauna e flora) | tem Amazônia, Caatinga, Cerrado, Mata Atlântica ou Pantanal (com % mínimo); só um bioma; 3 ou mais biomas; Patrimônio Natural da UNESCO; nº de Parques Nacionais |
| Relevo e geologia | ponto culminante acima de 2.000 m; cratera de impacto confirmada; Geoparque Mundial UNESCO; produz petróleo |
| Capitais | começa com a mesma letra da UF; nome com 2 ou mais palavras; capital planejada; já foi capital do Brasil (3); não é a maior cidade da UF (2); mais de 1 milhão de habitantes |
| Nome e sigla | começa com vogal; nome composto; termina em "a"; tem acento ou til; sigla = duas primeiras letras; gentílico termina em "-ense" |
| Demografia e economia | população acima de 10 mi ou abaixo de 1 mi (Censo 2022); área acima de 300 mil km² ou abaixo de 60 mil km²; top 5 em soja, café ou rebanho bovino (ano no rótulo) |
| História | ex-território federal (4); UF criada em 1960 ou depois; palco de revolta regencial; estado natal de presidente da República |
| Esportes | sediou jogo da Copa de 2014 (12); tem clube campeão brasileiro, da Libertadores ou da Copa do Brasil; sediou futebol na Rio 2016 |
| Bandeiras | tem estrela, vermelho, texto, brasão, triângulo, sol ou listras; não tem verde |
| Cultura | tem Patrimônio Cultural da UNESCO |

## 5. Gerador de grades

Comando: `npm run puzzles:generate -- --from 2026-11-01 --days 60 --seed X`

**Como monta cada grade:** sorteia 6 categorias diferentes, de pelo menos 4 famílias, com no máximo uma de cada família por eixo.

**Regras obrigatórias:**
- toda célula tem pelo menos 2 respostas;
- existe uma solução com 9 UFs diferentes (emparelhamento bipartido; com 9 células × 27 UFs, uma busca simples basta).

**Nota de qualidade** (entre os milhares de candidatos por dia, fica o melhor):
- não ter "armadilhas" (resposta válida que torna a grade impossível de completar);
- não ter células triviais (linha contida na coluna);
- a mesma categoria não se repete em menos de 10 dias;
- dificuldade estimada equilibrada.

**Saída:** `puzzles/<lote>.json`, com gabarito e métricas.

**Curadoria:**
1. Você revisa o lote em `/dev/grades`, uma página que só existe em desenvolvimento.
2. `npm run puzzles:publish` grava as grades no banco com uma **cópia do gabarito**. Corrigir os dados depois não altera grades já publicadas.
3. Para correções pontuais, existe `puzzles:fix`.
4. Os reports dos jogadores chegam na tabela `report`.

## 6. Banco (Drizzle + Postgres)

**Tabelas:**
- Better Auth: `user` (com `isAnonymous`), `session`, `account`, `verification`.
- `profile`: `userId`, `nickname` (único, opcional), `showInRanking` (padrão `false`).
- `puzzle`: `id` (= nº do jogo), `playDate` (única), `status`.
- `puzzle_category`: `puzzleId`, `axis`, `position`, `categoryId`, `label`, `description`, `sourceUrl`, `members[]`. Os membros servem para explicar os erros.
- `puzzle_cell`: `puzzleId`, `cell` (0–8), `validUfs[]`. Nunca é lida diretamente pela API pública.
- `game`: `userId`, `puzzleId` (único por usuário), `status` (`in_progress`, `completed`, `out_of_guesses`, `gave_up`), `guessesUsed`, `correctCount`, `finalRarity`, `shareId`, `startedAt`, `finishedAt`.
- `guess`: `gameId`, `cell`, `uf`, `isCorrect`, `createdAt`.
- `cell_pick_count`: `puzzleId`, `cell`, `uf`, `picks`.
- `puzzle_stats`: `puzzleId`, `players`, `completed`.
- `report`: `userId`, `puzzleId`, `cell`, `uf`, `message`, `status`.

**Função `submit_guess`:** migração SQL escrita à mão, com `SELECT … FOR UPDATE` na partida. Tudo acontece numa só chamada.

**Cron diário:**
- encerra as partidas do dia anterior e grava `finalRarity`;
- apaga visitantes anônimos inativos há 60 dias ou mais (os contadores agregados continuam);
- avisa se houver menos de 14 grades agendadas.

## 7. Contas e histórico

- **Visitante:** a sessão anônima é criada no primeiro palpite, com Turnstile invisível.
- **Entrar** (Google ou código por e-mail):
  - `onLinkAccount({ anonymousUser, newUser })` move as partidas do visitante para a conta, seja ela nova ou já existente;
  - se a conta já tiver partida no mesmo dia, fica a da conta;
  - depois o Better Auth apaga o usuário anônimo.
- **Navegador interno do Instagram/Facebook:** o Google bloqueia login ali. O app detecta esse caso e sugere "abrir no navegador"; o código por e-mail funciona normalmente.
- **Estatísticas:**
  - jogos e % de grades completas;
  - média de acertos e raridade média e melhor;
  - sequência atual e máxima;
  - distribuição de acertos (0–9) e contagem por faixa (ex.: "Míticos: 3");
  - calendário com a mini-grade de cada dia.
- **Perfil:** apelido, opção de aparecer no ranking, exportar dados e excluir conta (LGPD).
- **Páginas legais e de créditos:** `/privacidade`, `/termos` e `/fontes`.
- **Cookies:** só os essenciais, então não precisa de banner. Analytics sem cookies (Cloudflare Web Analytics).

## 8. Compartilhamento sem spoiler

```
BrasilGrid #42 🇧🇷
✅ 8/9 · Raridade 187
🟩🔷⚡
🟩⬛💎
🌈🟩🔷
brasilgrid.com.br/r/k3x9a
```

- O texto só traz faixas e números: nunca nome de UF, sigla ou bandeira.
- **Botões:**
  - Compartilhar (menu nativo do celular, via Web Share API);
  - Copiar;
  - WhatsApp, X, Threads, Bluesky, Facebook e Telegram.
- **Imagem do resultado** (1080×1920 para Stories e uma versão quadrada):
  - é gerada no navegador com canvas, sem custo de servidor;
  - no celular vai pelo menu nativo (`navigator.share({ files })`); no desktop, vira download.
- **`/r/:id`:** página pública com grade de faixas, acertos, raridade e botão "Jogar a grade de hoje", sem nenhuma resposta.
  - A prévia do link usa imagem genérica no MVP.
  - A prévia com imagem por resultado fica para quando valer o plano pago.

## 9. Telas

- **`/` (jogo do dia):**
  - cabeçalho: nº do jogo, palpites restantes, raridade parcial, Como jogar, Estatísticas, Entrar;
  - grade 4×4: canto + cabeçalhos com ícone e um botão (i) que mostra a regra completa e a fonte;
  - busca com autocomplete: ignora acentos, aceita sigla, mostra a bandeira e desabilita UFs já usadas;
  - acerto mostra bandeira, nome e %; erro tem animação;
  - botão "Desistir e revelar" e contagem regressiva para a próxima grade.
- **Modal de fim de jogo:** resumo, compartilhar, respostas em abas e mapa.
- **Outras rotas:** `/como-jogar`, `/estatisticas`, `/entrar`, `/perfil`, `/r/:id`, `/fontes`, `/privacidade`, `/termos`.
- **Geral:**
  - pensado primeiro para celular, com tema claro e escuro;
  - acessível: faixa indicada por emoji + texto (não só por cor) e navegação por teclado.

## 10. Estrutura de pastas

```
brasilgrid/
├── src/          React: rotas, componentes (grid/, search/, results/, share/, map/), cliente da API e do auth
├── worker/       Hono: index.ts (fetch + scheduled), auth.ts, routes/, db/schema.ts, cron/
├── shared/       lógica pura comum: pontuação, faixas, dia de Brasília, texto de compartilhamento, lista pública das 27 UFs
├── data/         dados curados (ufs.json, categories/, raw/) — não é importado pelo front nem pelo worker
├── scripts/      fetch-ibge, fetch-wikidata, build-map, validate-data, generate-puzzles, publish-puzzles
├── puzzles/      lotes gerados para revisão
├── drizzle/      migrações (inclui submit_guess)
├── public/       bandeiras SVG, mapa, og-default.png, ícones
├── tests/  e2e/
└── docker-compose.yml · wrangler.jsonc · vite.config.ts · drizzle.config.ts
```

## 11. Fases

**Fase 0 — Dados** (o maior risco; vem antes de qualquer tela)
- `git init`, scaffold (Vite + Worker + Postgres no Docker), lint e testes;
- coleta do IBGE e do Wikidata, montagem do `ufs.json`;
- cerca de 45 categorias, com fonte e dupla checagem;
- mapa e bandeiras;
- gerador e um primeiro lote de 60 grades para revisarmos juntos.

**Fase 1 — Jogo jogável**
- schema e `submit_guess`;
- rotas da API e sessão anônima;
- interface completa: grade, busca, fim de jogo, respostas com % e texto de compartilhamento.

**Fase 2 — Contas e lançamento (MVP)**
- login com Google e código por e-mail;
- migração visitante → conta;
- estatísticas, histórico e perfil;
- páginas LGPD e cron;
- deploy: Neon SP, Hyperdrive, Worker, domínio, Resend e Turnstile.

**Fase 3 — Pós-lançamento**
- ranking diário opcional (com apelido);
- imagem de resultado e mapa;
- PWA e botão de reportar erro;
- prévia dinâmica do link, se migrar para o plano pago.

**Fase 4 — Extras**
- arquivo de grades passadas;
- modo treino com palpites ilimitados (não conta nas estatísticas);
- mais categorias e painel de curadoria;
- lembrete diário por push.

## 12. Verificação

**Ambiente local:**
- `docker compose up -d`, depois `npm run db:migrate` e `npm run db:seed` (uma grade fixa de teste).

**Dados:**
- `npm run data:validate`: toda categoria tem fonte e tamanho válido, e a dupla checagem passa.
- `npm run puzzles:generate`: um teste automatizado confirma que todas as grades seguem as regras da seção 5.

**`npm test` (Vitest):**
- pontuação e faixas;
- dia de Brasília (virada à meia-noite);
- normalização da busca (acentos e siglas);
- gerador;
- texto de compartilhamento: um teste garante que nenhum nome ou sigla de UF aparece como palavra.

**Integração com o Postgres real:**
- `submit_guess`: 11º palpite, UF repetida, célula ocupada;
- gabarito oculto, resultados bloqueados antes do fim e grade futura invisível;
- migração visitante → conta, inclusive com conflito no mesmo dia.

**`npm run test:e2e` (Playwright):**
- jogar uma grade inteira, desistir, compartilhar;
- login por código (em desenvolvimento, o código aparece no console).

**Manual:**
- `npm run dev` e jogar no celular pela rede local;
- deploy de preview e abrir o link `/r/:id` pelo WhatsApp e pelo Instagram, para ver prévia e login.

## 13. Riscos e pontos em aberto

- **Precisão dos dados:** fontes documentadas, dupla checagem, notas de borda e botão de reportar.
- **Poucas respostas possíveis (27 UFs):** gerador rigoroso, sem armadilhas.
- **Raridade instável no começo do dia:** rótulo "parcial"; o valor final sai às 00:05.
- **Limites grátis** (Cloudflare 100 mil req/dia, Hyperdrive 100 mil queries/dia, Neon 100 CU-h): monitorar; os upgrades são baratos (US$ 5/mês no Workers e pago por uso na Neon).
- **Login no navegador do Instagram:** código por e-mail + aviso.
- **Nome provisório "BrasilGrid":** verificar o domínio `brasilgrid.com.br` no Registro.br e a marca no INPI.
- **Ajustes de jogo:** número de palpites (10) e faixas de raridade, a calibrar em testes com amigos antes do lançamento.
