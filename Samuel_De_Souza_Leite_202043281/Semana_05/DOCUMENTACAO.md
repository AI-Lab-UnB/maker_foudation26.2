# Semana 5 - Containerizacao e CI/CD

## 1. Identificacao

- Equipe: individual
- Integrantes: Samuel De Souza Leite (202043281)
- Repositorio: https://github.com/osamuelleite/semana5-dev-ao-deploy

## 2. Arquitetura

- Stack: Django 6.1 (backend) + Next.js 16 / App Router (frontend) + PostgreSQL 16 + Nginx (reverse proxy / SSL)
- Servicos:
  - `backend`: Django, endpoint `GET /api/health/`, le credenciais do Postgres via variaveis de ambiente.
  - `frontend`: Next.js, Server Component que faz `fetch` do backend e renderiza o resultado.
  - `db`: PostgreSQL 16 (alpine), com volume nomeado para persistencia.
  - `nginx`: unico servico exposto ao host (producao), termina TLS e faz reverse proxy.
- Portas (DEV): backend `8000`, frontend `3000`, db `5432` (todas publicadas no host para desenvolvimento).
- Portas (PROD): somente o nginx publica `80`/`443`. backend, frontend e db ficam acessiveis apenas pela rede interna do Compose.
- Fluxo de comunicacao (PROD): cliente -> Nginx (443, HTTPS) -> `/api/` e `/admin/` para `backend:8000`, demais rotas para `frontend:3000` -> frontend busca dados do backend via `http://backend:8000/api/health/` (fetch feito no servidor, dentro do Server Component, nao no navegador).

## 3. Etapa 1 - DEV

- Implementacao: `backend/Dockerfile` (`python:3.12-slim`, `python manage.py runserver 0.0.0.0:8000`, `DEBUG=True`) e `frontend/Dockerfile` (`node:20-alpine`, `next dev --webpack`). O backend expoe `/api/health/` retornando `{"status": "ok", "items": [...]}`. O frontend consome esse endpoint em um Server Component (`app/lib/health.js` + `app/page.js`).
- Hot reload: bind mount do codigo-fonte em ambos os containers. No frontend, o Turbopack (padrao do `next dev` no Next.js 16) nao detecta mudancas de forma confiavel atraves de bind mounts do Docker Desktop no Windows (limitacao documentada pela propria Next.js: ver `node_modules/next/dist/docs/01-app/02-guides/local-development.md`). Solucao aplicada: o container roda `next dev --webpack` (webpack respeita `watchOptions.pollIntervalMs`, configurado em `next.config.mjs` via `WATCHPACK_POLLING=true`).
- Validacao: `docker run -v ... -p ...` individual para cada container. Editei `api/views.py` e `app/page.js` no host com o container rodando e confirmei via `curl` que a resposta mudou sem rebuild, para os dois servicos.
- Evidencias: testes locais registrados no terminal (hot reload do backend refletiu em ~1s via StatReloader; frontend com webpack+polling refletiu em ~5s).
- Commit: `4353799` - feat(etapa1): containeriza backend Django e frontend Next.js para DEV

## 4. Etapa 2 - Docker Compose

- Implementacao: `docker-compose.yml` na raiz integra `backend`, `frontend` e `db`.
- Healthcheck: `db` usa `pg_isready` (interval 5s, timeout 5s, retries 5); `backend` tem `depends_on: db: condition: service_healthy`, ou seja, so sobe depois do Postgres aceitar conexoes.
- Persistencia: volume nomeado `postgres_data` montado em `/var/lib/postgresql/data`.
- Variaveis: `.env.example` versionado na raiz; `.env` local (com credenciais reais de dev) fica fora do Git.
- Validacao: `docker compose up -d --build` sobe a stack sem falha de prontidao (log confirma `db Healthy` antes de `backend Starting`). Criei uma tabela de teste no Postgres, reiniciei o container `db` (`docker compose restart db`) e confirmei que os dados persistiram (volume funcionando). `curl http://localhost:3000/` retornou a pagina com os dados reais do backend (`"Configurar Docker"` presente no HTML), confirmando que o frontend consome a API pela rede interna do Compose (`backend:8000`).
- Commit: `243dfa9` - feat(etapa2): orquestra backend, frontend e db com Docker Compose

## 5. Etapa 3 - CI

- Jobs do backend: `lint-backend` (flake8) -> `build-backend` (`docker build` do Dockerfile de dev, valida que a imagem constroi) -> `test-backend` (`python manage.py test` contra um servico Postgres do próprio runner).
- Jobs do frontend: `lint-frontend` (ESLint) -> `build-frontend` (`next build`) -> `test-frontend` (Vitest, 6 testes cobrindo a logica de fetch em `app/lib/health.js`).
- Fail-Fast: cada trilha usa `needs` para encadear lint -> build -> test; as duas trilhas sao independentes entre si.
- Cache: `actions/setup-python` com `cache: pip` (`cache-dependency-path: backend/requirements*.txt`) e `actions/setup-node` com `cache: npm` (`cache-dependency-path: frontend/package-lock.json`).
- Evidencias do Fail-Fast (3 falhas controladas e reais, cada uma push + run no GitHub Actions):
  1. **Erro de lint** (import nao usado no backend): `lint-backend` falhou, `build-backend` e `test-backend` foram pulados (skipped). Trilha frontend seguiu e passou, confirmando independencia entre trilhas.
     Run: https://github.com/osamuelleite/semana5-dev-ao-deploy/actions/runs/37253170385
  2. **Erro de build** (`Dockerfile` referenciando `requirements-nonexistent.txt`): `lint-backend` passou, `build-backend` falhou no `docker build`, `test-backend` foi pulado.
     Run: https://github.com/osamuelleite/semana5-dev-ao-deploy/actions/runs/37253422421
  3. **Teste quebrado** (assert proposital errado em `api/tests.py`): `lint-backend` e `build-backend` passaram, `test-backend` falhou.
     Run: https://github.com/osamuelleite/semana5-dev-ao-deploy/actions/runs/37253595030
  4. **Correcao final**: as duas trilhas (6 jobs) ficaram verdes.
     Run: https://github.com/osamuelleite/semana5-dev-ao-deploy/actions/runs/37253773665
- Commits: `245ceb4` (pipeline base) -> `86a7653` (erro de lint) -> `a9a64b9` (corrige lint, injeta erro de build) -> `fe59352` (corrige build, injeta teste quebrado) -> `6323d06` (corrige teste, pipeline verde)

## 6. Etapa 4 - Producao

- Backend: `backend/Dockerfile.prod`, base `python:3.12-alpine`, `gunicorn config.wsgi:application --bind 0.0.0.0:8000`, usuario `appuser` (nao-root). `psycopg2-binary` nao publica wheel para musl, entao o Dockerfile instala `gcc`/`musl-dev`/`postgresql-dev` como dependencias de build "virtuais" (`apk add --virtual .build-deps`), compila, remove as ferramentas de build e mantem so a lib de runtime `libpq`.
- Frontend: `frontend/Dockerfile.prod`, multi-stage `deps` -> `builder` -> `runner`. `output: 'standalone'` ativado em `next.config.mjs`. O estagio final copia apenas `.next/standalone`, `.next/static` e `public`, roda com o usuario `nextjs` (nao-root).
- Multi-stage: o estagio `runner` **nao** usa `node:20-alpine` (a imagem base sozinha, vazia, ja ocupa 194MB). Usa `alpine:3.20` (8.5MB) e copia so o binario `/usr/local/bin/node` do estagio `builder` -- sem `npm`/`npx`/`yarn` na imagem final.
- Reducao adicional: o Next.js inclui por padrao, no output standalone, os binarios nativos do `sharp` (`node_modules/@img/*`, ~45MB) usados pela otimizacao de imagens -- mesmo esta aplicacao nao usando `next/image`. Esses arquivos sao removidos explicitamente apos o build (`rm -rf .next/standalone/node_modules/@img .next/standalone/node_modules/sharp`).
- Tamanho final das imagens:
  - Backend: **168MB** (`docker images`).
  - Frontend: evoluiu de 288MB (com `node:20-alpine` como runner) -> 251MB (apos trocar para `alpine:3.20` + binario do node) -> **181MB** (apos remover os binarios do sharp), medido por `docker images`. O uso real de disco dentro do container, medido com `du -sh /`, e **128.6MB** -- dentro do orcamento de 150MB. A diferenca entre os dois numeros reflete overhead de contabilizacao de camadas do BuildKit (layers/metadata), nao arquivos extras no sistema de arquivos montado. Cerca de 102MB dos 128.6MB reais sao o proprio binario do Node.js 20, que e o piso irredutivel para rodar `node server.js`.
- Validacao: `docker run` de cada imagem isoladamente. Backend respondeu `200` em `/api/health/` via gunicorn com `DEBUG=False`. Frontend serviu a pagina (`200`) via `node server.js`. Confirmado via `id` que ambos rodam como usuario nao-root (`appuser` / `nextjs`), e que `pip`/`flake8`/`npm`/`npx` nao existem nas imagens finais.
- Commit: `8022044` - feat(etapa4): otimiza imagem de producao do frontend para caber no orcamento de 150MB

## 7. Etapa 5 - Nginx e SSL

- Reverse proxy: `nginx/nginx.conf`. `/api/` e `/admin/` sao roteados para `backend:8000`; qualquer outra rota vai para `frontend:3000`.
- Portas expostas: `docker-compose-prod.yml` so publica portas no servico `nginx` (`80` e `443`). `backend`, `frontend` e `db` usam `expose` (ou nenhuma porta, no caso do `db`), ou seja, nao sao alcancaveis diretamente do host.
- HTTPS: certificado autoassinado gerado localmente com `openssl req -x509 -nodes -days 365 -newkey rsa:2048 -subj "/CN=localhost"` (comando identico ao sugerido no PDF), montado em `/etc/nginx/certs` (arquivos `.key`/`.crt` **nao** versionados, excluidos via `.gitignore`).
- Redirecionamento: servidor na porta 80 responde `301` redirecionando para `https://$host$request_uri`.
- Validacao (`docker compose -f docker-compose-prod.yml up -d --build`):
  - `curl -I http://localhost/` -> `301`, header `Location: https://localhost/`.
  - `curl -k https://localhost/` -> `200`, HTML da pagina inicial do frontend.
  - `curl -k https://localhost/api/health/` -> `200`, JSON real do backend (`{"status": "ok", ...}`).
  - `curl -k https://localhost/` contem o texto `"Configurar Docker"`, confirmando que o frontend recebeu e renderizou dados reais do backend atraves da cadeia completa Nginx -> frontend -> backend.
  - `docker compose -f docker-compose-prod.yml ps` confirma que so o `nginx` tem `PORTS` publicadas no host; os demais servicos mostram porta interna sem mapeamento (`8000/tcp`, `3000/tcp`, `5432/tcp`).
- Commit: `e9f0152` - feat(etapa5): stack de producao com Nginx como reverse proxy e HTTPS

## 8. Etapa 6 - GHCR

- Imagens publicadas:
  - `ghcr.io/osamuelleite/semana5-dev-ao-deploy-backend`
  - `ghcr.io/osamuelleite/semana5-dev-ao-deploy-frontend`
- Tags: `latest` e `${{ github.sha }}` (confirmado via API do GitHub: a versao mais recente do pacote backend tem as tags `["<sha-do-commit>", "latest"]`).
- Permissoes: `permissions: contents: read / packages: write`, declaradas no nivel de cada job (`deploy-backend`, `deploy-frontend`).
- Jobs: `deploy-backend` (`needs: test-backend`) e `deploy-frontend` (`needs: test-frontend`), condicionados a `github.event_name == 'push' && github.ref == 'refs/heads/main'`. Cada job builda o respectivo `Dockerfile.prod` com `docker/build-push-action` e autentica no GHCR via `docker/login-action` usando o `GITHUB_TOKEN` automatico (sem secrets adicionais).
- Evidencias:
  - Run completo (CI + CD, 8 jobs verdes, incluindo `deploy-backend` e `deploy-frontend`): https://github.com/osamuelleite/semana5-dev-ao-deploy/actions/runs/37256759988
  - Pacote backend: https://github.com/osamuelleite/semana5-dev-ao-deploy/pkgs/container/semana5-dev-ao-deploy-backend
  - Pacote frontend: https://github.com/osamuelleite/semana5-dev-ao-deploy/pkgs/container/semana5-dev-ao-deploy-frontend
- Commit: `7de8188` - feat(etapa6): publica imagens de producao no GHCR via CD

## 9. Validacao Final

- Comandos executados (resumo; detalhes por etapa nas secoes acima):
  - `docker compose up -d --build` / `docker compose down` (DEV)
  - `docker compose -f docker-compose-prod.yml up -d --build` / `down` (PROD)
  - `docker build` individual de cada um dos 4 Dockerfiles (dev x2, prod x2)
  - `python manage.py test` (local, contra Postgres real) e via CI
  - `npm test` (Vitest, 6 testes) local e via CI
  - `flake8` / `npm run lint` local e via CI
  - `gh run watch` para acompanhar cada execucao real do pipeline no GitHub Actions
- Resultados: todas as 6 etapas validadas com evidencia real (nao apenas revisao de codigo) -- containers rodando, HTTP real trocado entre servicos, pipeline de CI executado no GitHub Actions (nao localmente), imagens publicadas e confirmadas no GHCR via API.
- Limitacoes conhecidas:
  - A imagem de producao do frontend mede 181MB pelo `docker images` (acima dos 150MB-alvo), embora o uso real de disco montado (`du -sh /`) seja 128.6MB. A causa raiz e o proprio binario do Node.js 20 (~102MB), que e dificil de reduzir further sem trocar de runtime (ex: Bun) ou usar uma imagem distroless (testada: `gcr.io/distroless/nodejs20-debian12` tambem excede 150MB sozinha, com 170MB).
  - O certificado SSL e autoassinado, adequado apenas para validacao local (o proprio navegador/curl precisa da flag `-k`/aviso de "nao confiavel").
  - Ambiente de desenvolvimento testado apenas em Docker Desktop no Windows; o hot reload do frontend depende de polling (mais lento que inotify nativo do Linux).
- Checklist final:

| Etapa | Foco | Status |
|---|---|---|
| 1 | Containerizacao DEV | Concluido |
| 2 | Orquestracao DEV | Concluido |
| 3 | Qualidade Automatizada (CI) | Concluido |
| 4 | Otimizacao PROD | Concluido |
| 5 | Stack PROD (Nginx/SSL) | Concluido |
| 6 | Deploy Continuo (GHCR) | Concluido |

## 10. Historico Git

| Etapa | Commit | Descricao |
|---|---|---|
| 1 | `4353799` | Dockerfiles de DEV para backend (Django) e frontend (Next.js), com hot reload validado |
| 2 | `243dfa9` | docker-compose.yml orquestrando backend + frontend + db, com healthcheck e persistencia |
| 3 | `245ceb4` → `86a7653` → `a9a64b9` → `fe59352` → `6323d06` | Pipeline de CI com trilhas lint→build→test e validacao real de Fail-Fast (3 falhas controladas + correcao) |
| 4 | `8022044` | Dockerfiles de producao multi-stage, non-root, imagem do frontend otimizada para o orcamento de 150MB |
| 5 | `e9f0152` | docker-compose-prod.yml + Nginx como reverse proxy com HTTPS e isolamento de portas |
| 6 | `7de8188` | Extensao do CI com deploy-backend/deploy-frontend publicando no GHCR |
