# Semana 5 - Containerizacao e CI/CD

> Desafio **"Do Dev ao Deploy: Containerize Tudo"** — Django + Next.js + PostgreSQL + Nginx,
> com pipeline de CI/CD no GitHub Actions e publicação de imagens no GitHub Container Registry (GHCR).

**Repositório do projeto:** https://github.com/GGDornelas/semana5-giovanni

| Recurso | Link |
|---|---|
| Código-fonte | https://github.com/GGDornelas/semana5-giovanni |
| Workflow CI/CD | [`.github/workflows/ci.yml`](https://github.com/GGDornelas/semana5-giovanni/blob/main/.github/workflows/ci.yml) |
| Execuções do Actions | https://github.com/GGDornelas/semana5-giovanni/actions |
| Imagem backend (GHCR) | https://github.com/GGDornelas/semana5-giovanni/pkgs/container/semana5-giovanni-backend |
| Imagem frontend (GHCR) | https://github.com/GGDornelas/semana5-giovanni/pkgs/container/semana5-giovanni-frontend |

---

## 1. Identificacao

- **Equipe:** individual
- **Integrantes:** Giovanni Dornelas Ferreira
- **Repositorio:** https://github.com/GGDornelas/semana5-giovanni
- **Descrição:** aplicação desacoplada em que o frontend Next.js consome o endpoint
  `GET /api/health/` de um backend Django, que consulta um PostgreSQL. O projeto foi
  containerizado para desenvolvimento (hot reload) e produção (imagens reduzidas, usuários
  não-root, Nginx com HTTPS), com pipeline automatizado Lint → Build → Test → Publish (GHCR).

Estrutura do repositório:

```
semana5-giovanni/
├── backend/                     # Django (projeto config, app api)
│   ├── Dockerfile               # DEV  (python:3.12-slim, runserver)
│   ├── Dockerfile.prod          # PROD (python:3.12-alpine, gunicorn, usuário django)
│   └── Dockerfile.prod.dockerignore
├── frontend/                    # Next.js App Router (app/page.js)
│   ├── Dockerfile               # DEV  (node:20-alpine, next dev)
│   └── Dockerfile.prod          # PROD (multi-stage deps -> builder -> runner, usuário nextjs)
├── nginx/
│   ├── nginx.conf               # reverse proxy + SSL + redirect
│   └── generate-certs.sh        # certificado autoassinado (openssl)
├── docker-compose.yml           # stack DEV
├── docker-compose-prod.yml      # stack PROD
├── .env.example                 # único arquivo de variáveis versionado
└── .github/workflows/ci.yml     # CI/CD
```

## 2. Arquitetura

- **Stack:** Django 5.2 + Gunicorn 26 · Next.js 16 (App Router) · PostgreSQL 16 · Nginx 1.28 ·
  Docker Compose · GitHub Actions · GHCR.
- **Servicos:**

| Serviço | Imagem | Porta interna | Exposto no host (DEV) | Exposto no host (PROD) |
|---|---|---|---|---|
| `db` | `postgres:16-alpine` | 5432 | não | não |
| `backend` | `backend/Dockerfile(.prod)` | 8000 | 8000 | **não** (`expose`) |
| `frontend` | `frontend/Dockerfile(.prod)` | 3000 | 3000 | **não** (`expose`) |
| `nginx` | `nginx:1.28-alpine` | 80 / 443 | — | **80 e 443** (único) |

- **Redes:**
  - DEV: rede bridge `app_net` com os três serviços. O backend acessa o banco por `db:5432`.
  - PROD: `web_net` (nginx ↔ frontend/backend) e `data_net` (`internal: true`, backend ↔ db).
    O banco fica numa rede sem saída para a internet e sem contato com o Nginx.
- **Volumes:** volume nomeado `postgres_data` montado em `/var/lib/postgresql/data`.
- **Fluxo de comunicacao (PROD):**

```
Navegador ──HTTP :80──► Nginx ──301──► HTTPS :443
Navegador ──HTTPS :443─► Nginx ─┬─ /api/, /admin/, /static/ ─► backend:8000 (Gunicorn) ─► db:5432
                                └─ /                         ─► frontend:3000 (Next standalone)
```

O componente cliente (`app/page.js`) usa o caminho **relativo** `/api/health/`, nunca
`http://localhost:8000`. Em produção o Nginx intercepta `/api/` e o encaminha ao Django; em
desenvolvimento, um `rewrite` do `next.config.mjs` repassa `/api/*` para `http://backend:8000`.

Resposta do endpoint:

```json
{
  "status": "ok",
  "database": "ok",
  "engine": "postgresql",
  "items": ["Configurar Docker", "Automatizar CI", "Publicar no GHCR"]
}
```

## 3. Etapa 1 - DEV

- **Implementacao:**
  - [`backend/Dockerfile`](https://github.com/GGDornelas/semana5-giovanni/blob/main/backend/Dockerfile):
    base `python:3.12-slim`, instala `requirements.txt`, `DJANGO_DEBUG=True` e executa
    `python manage.py runserver 0.0.0.0:8000` (antes roda `migrate`).
  - [`frontend/Dockerfile`](https://github.com/GGDornelas/semana5-giovanni/blob/main/frontend/Dockerfile):
    base `node:20-alpine`, `npm ci` a partir do lockfile e `npm run dev -- --hostname 0.0.0.0`.
    `WATCHPACK_POLLING=true` garante a detecção de mudanças em bind mounts.
  - `.dockerignore` em cada serviço excluindo `.git`, `node_modules`, `.next`, `venv`/`.venv`,
    `__pycache__` e `.env`.
  - O Django lê tudo por variáveis de ambiente (`DJANGO_DEBUG`, `DJANGO_SECRET_KEY`,
    `DJANGO_ALLOWED_HOSTS`, `POSTGRES_*`). Sem `POSTGRES_DB` definido (container isolado),
    usa SQLite, o que permite rodar o backend sozinho no checkpoint 1.
- **Validacao (Checkpoint 1 — cada container isolado com `docker run -v ... -p ...`):**

```bash
docker build -t semana5-backend-dev ./backend
docker build -t semana5-frontend-dev ./frontend

docker run -d --name s5-back  -p 8000:8000 -v "$PWD/backend:/app"  semana5-backend-dev
docker run -d --name s5-front -p 3000:3000 -v "$PWD/frontend:/app" -v /app/node_modules semana5-frontend-dev
```

O volume anônimo `/app/node_modules` evita que o bind mount substitua as dependências
instaladas na imagem pelas do host (binários nativos do macOS).

- **Evidencias:**

```text
$ curl -s localhost:8000/api/health/
{"status": "ok", "database": "ok", "engine": "sqlite", "items": ["Configurar Docker", "Automatizar CI", "Publicar no GHCR"]}
$ curl -s -o /dev/null -w "front %{http_code}\n" localhost:3000/
front 200
```

Hot reload testado editando arquivos no host, **sem rebuild**:

```text
# após adicionar "HOT RELOAD OK" em backend/api/views.py e no título de frontend/app/page.js
$ curl -s localhost:8000/api/health/
{"status": "ok", ..., "items": ["Configurar Docker", "Automatizar CI", "Publicar no GHCR", "HOT RELOAD OK"]}
$ curl -s localhost:3000/ | grep -o "HOT RELOAD OK"
HOT RELOAD OK
$ docker logs s5-back | grep changed
/app/api/views.py changed, reloading.
```

- **Commit:** [`09878f5`](https://github.com/GGDornelas/semana5-giovanni/commit/09878f5e5a0caa2143cd9ded1cbcb52cecc24247)

## 4. Etapa 2 - Docker Compose

- **Implementacao:** [`docker-compose.yml`](https://github.com/GGDornelas/semana5-giovanni/blob/main/docker-compose.yml)
  com `db`, `backend` e `frontend` na rede `app_net`. O backend recebe `POSTGRES_HOST=db` e
  `POSTGRES_PORT=5432` e acessa o banco pelo nome do serviço. Bind mounts mantêm o hot
  reload (`./backend:/app`, `./frontend:/app` + volumes anônimos para `node_modules` e `.next`).
- **Variaveis:** apenas [`.env.example`](https://github.com/GGDornelas/semana5-giovanni/blob/main/.env.example)
  é versionado. O `.env` real (senhas geradas localmente) está no `.gitignore`.
- **Healthcheck:**

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
  interval: 5s
  timeout: 5s
  retries: 5
# backend
depends_on:
  db:
    condition: service_healthy
```

- **Persistencia:** volume nomeado `postgres_data:/var/lib/postgresql/data`.
- **Validacao (Checkpoint 2):**

```text
$ cp .env.example .env && docker compose up -d --build
 Container semana5-giovanni-db-1  Waiting
 Container semana5-giovanni-db-1  Healthy
 Container semana5-giovanni-backend-1  Started
 Container semana5-giovanni-frontend-1  Started

$ docker compose ps
backend   Up   0.0.0.0:8000->8000/tcp
db        Up (healthy)   5432/tcp
frontend  Up   0.0.0.0:3000->3000/tcp

$ curl -s localhost:3000/api/health/        # frontend consumindo a API (via rewrite)
{"status": "ok", "database": "ok", "engine": "postgresql", "items": [...]}
```

O backend só iniciou depois de o banco ficar `Healthy`. Persistência validada inserindo um
registro, executando `docker compose down` e `up` novamente: o registro continuou no banco
(`SELECT count(*)` → `1`).

- **Commit:** [`622d699`](https://github.com/GGDornelas/semana5-giovanni/commit/622d699a227bd8d62fb9a4b6cb4e82b6cc3b678e)

## 5. Etapa 3 - CI

Workflow: [`.github/workflows/ci.yml`](https://github.com/GGDornelas/semana5-giovanni/blob/main/.github/workflows/ci.yml)
(disparado em `push`/`pull_request` no `main` e manualmente).

- **Jobs do backend:** `lint-backend` → `build-backend` → `test-backend`

| Job | `needs` | O que faz |
|---|---|---|
| `lint-backend` | — | `ruff check` + `ruff format --check` |
| `build-backend` | `lint-backend` | `manage.py check`, build da imagem DEV e validação do container; build da imagem PROD e verificação de usuário não-root/sem pip |
| `test-backend` | `build-backend` | `python manage.py test` contra um **service container** `postgres:16-alpine` |

- **Jobs do frontend:** `lint-frontend` → `build-frontend` → `test-frontend`

| Job | `needs` | O que faz |
|---|---|---|
| `lint-frontend` | — | ESLint (`npm run lint`) |
| `build-frontend` | `lint-frontend` | `npm run build`, build da imagem DEV e da imagem PROD, com validação de tamanho < 150 MB e usuário `nextjs` |
| `test-frontend` | `build-frontend` | Vitest (`npm test`, 5 testes de `lib/api.js`) |

- **Cache:** `actions/setup-python` com `cache: 'pip'` (chave em `requirements*.txt`) e
  `actions/setup-node` com `cache: 'npm'` (chave em `package-lock.json`).
- **Fail-Fast:** as trilhas são independentes (uma falha no backend não bloqueia o frontend e
  vice-versa), mas dentro de cada trilha o `needs` interrompe as etapas seguintes. Foram
  provocadas três falhas controladas, **nas duas trilhas ao mesmo tempo**:

| # | Falha provocada | Commit | Resultado | Execução |
|---|---|---|---|---|
| 1 | **Lint:** `import os` não usado (Ruff F401) e atribuição à variável `module` (ESLint `@next/next/no-assign-module-variable`) | [`fd57bb5`](https://github.com/GGDornelas/semana5-giovanni/commit/fd57bb51b638967fe8d5fe2fbd52549774c0fd84) | `lint-*` ❌ · `build-*` ⏭ skipped · `test-*` ⏭ skipped | [run](https://github.com/GGDornelas/semana5-giovanni/actions/runs/36610968073) |
| 2 | **Build:** app inexistente em `INSTALLED_APPS` (`manage.py check`) e import de módulo inexistente no Next (`Module not found`); ambos passam no lint | [`fb15630`](https://github.com/GGDornelas/semana5-giovanni/commit/fb15630a2823c30bf6baab29f294196d403caeec) | `lint-*` ✅ · `build-*` ❌ · `test-*` ⏭ skipped | [run](https://github.com/GGDornelas/semana5-giovanni/actions/runs/36612477007) |
| 3 | **Teste:** asserções incorretas (`status == "erro"` no Django; `toHaveLength(4)` no Vitest) | [`e8187f3`](https://github.com/GGDornelas/semana5-giovanni/commit/e8187f3ad4f21f2f5fb9d88c0d618cfe3768eb1e) | `lint-*` ✅ · `build-*` ✅ · `test-*` ❌ | [run](https://github.com/GGDornelas/semana5-giovanni/actions/runs/36613694909) |
| ✔ | **Correção final** | [`e9d2490`](https://github.com/GGDornelas/semana5-giovanni/commit/e9d2490eaa8c842d79532f3d55111f080c910df2) | todas as 6 jobs ✅ | [run](https://github.com/GGDornelas/semana5-giovanni/actions/runs/36614603240) |

Cada falha foi verificada localmente antes do push, para garantir que quebrava **apenas** a
etapa pretendida (por exemplo, o erro de build passa no Ruff e no ESLint).

- **Evidencias:** links da tabela acima (GitHub Actions → aba *Summary* mostra o grafo dos jobs
  com os estados *failure*/*skipped*).
- **Commit:** [`b2905f3`](https://github.com/GGDornelas/semana5-giovanni/commit/b2905f3c83f9dfde539cc908d19d2d589bd9953c) ·
  [primeira execução do CI (6 jobs verdes)](https://github.com/GGDornelas/semana5-giovanni/actions/runs/36610453234)

## 6. Etapa 4 - Producao

- **Backend** — [`backend/Dockerfile.prod`](https://github.com/GGDornelas/semana5-giovanni/blob/main/backend/Dockerfile.prod):
  - Base `python:3.12-alpine` em dois estágios: `builder` instala as dependências num
    virtualenv (`/opt/venv`) e remove o `pip`; `runtime` recebe apenas o virtualenv e o código.
  - `collectstatic` no build (arquivos do admin servidos pelo WhiteNoise).
  - Execução: `gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3` (após `migrate`).
  - `DJANGO_DEBUG=False`, cookies `Secure`, `SECURE_PROXY_SSL_HEADER` para operar atrás do Nginx.
  - [`Dockerfile.prod.dockerignore`](https://github.com/GGDornelas/semana5-giovanni/blob/main/backend/Dockerfile.prod.dockerignore)
    exclusivo da produção: remove `tests.py`, `requirements-dev.txt` e `ruff.toml` da imagem.
- **Frontend** — [`frontend/Dockerfile.prod`](https://github.com/GGDornelas/semana5-giovanni/blob/main/frontend/Dockerfile.prod):
  - `output: 'standalone'` em [`next.config.mjs`](https://github.com/GGDornelas/semana5-giovanni/blob/main/frontend/next.config.mjs).
- **Multi-stage (frontend):**

| Estágio | Base | Função |
|---|---|---|
| `deps` | `node:20-alpine` | `npm ci` a partir do lockfile |
| `builder` | `node:20-alpine` | `npm run build` (gera `.next/standalone`) |
| `runner` | `alpine:3.23` + binário `node` copiado do builder | copia **apenas** `.next/standalone`, `.next/static` e `public` e executa `node server.js` |

  Otimizações para ficar abaixo de 150 MB: o `runner` não herda npm/yarn/corepack da imagem
  Node (≈ 22 MB) e, como a aplicação não usa `next/image` (`images.unoptimized: true`), o
  `sharp`/libvips (≈ 45 MB) é removido do standalone.
- **Usuarios nao-root:**

```text
$ docker run --rm semana5-backend-prod whoami
django
$ docker run --rm semana5-frontend-prod whoami
nextjs
$ docker exec <backend-prod> sh -c 'which pip ruff || echo "sem pip/ruff"; ls api'
sem pip/ruff
__init__.py  apps.py  urls.py  views.py          # sem tests.py
$ docker exec <frontend-prod> sh -c 'which npm yarn npx || echo "sem npm/yarn/npx"'
sem npm/yarn/npx
```

  No backend, o código e os estáticos pertencem ao root (somente leitura para o usuário
  `django`), então o processo da aplicação não consegue alterar os próprios arquivos.

- **Tamanho final das imagens:**

| Imagem | Descompactada | Compactada (GHCR, linux/amd64) |
|---|---|---|
| backend DEV (`python:3.12-slim`) | 303 MB¹ | — |
| frontend DEV (`node:20-alpine` + devDeps) | 1,35 GB¹ | — |
| **backend PROD** | **≈ 125 MB** | **31,0 MB** |
| **frontend PROD** | **≈ 130 MB** (< 150 MB ✅) | **44,4 MB** |

  ¹ Coluna `SIZE` do `docker images`. No Docker Desktop com *containerd image store*, essa
  coluna soma as camadas compactadas e descompactadas (a imagem de frontend PROD aparece como
  184 MB). Por isso a medida de referência é o tamanho real do sistema de arquivos
  (`du -sxh /` dentro do container = 129,9 MB, confirmado pela soma das camadas no
  `docker history`). O job `build-frontend` do CI **falha automaticamente** se a imagem
  passar de 150 MB (`docker image inspect -f '{{.Size}}'` no runner Linux).

- **Checkpoint 4:** as duas imagens executam sozinhas (backend conectado ao PostgreSQL
  respondeu `engine: postgresql`; frontend respondeu HTTP 200), sem ferramentas de
  desenvolvimento, testes ou dependências temporárias.
- **Commit:** [`3ecb017`](https://github.com/GGDornelas/semana5-giovanni/commit/3ecb0179a783a69f69a00b6c2a921870ee31a7bf).
  As validações de produção (build das imagens `Dockerfile.prod`, limite de 150 MB e usuários
  não-root) rodam nos jobs `build-*` do pipeline; ver a
  [execução completa da Etapa 6](https://github.com/GGDornelas/semana5-giovanni/actions/runs/36614897196).

## 7. Etapa 5 - Nginx e SSL

- **Reverse proxy** — [`nginx/nginx.conf`](https://github.com/GGDornelas/semana5-giovanni/blob/main/nginx/nginx.conf):

```nginx
server {                     # HTTP -> HTTPS
    listen 80;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    ssl_certificate     /etc/nginx/certs/selfsigned.crt;
    ssl_certificate_key /etc/nginx/certs/selfsigned.key;
    location /api/    { proxy_pass http://backend;  }   # backend:8000
    location /admin/  { proxy_pass http://backend;  }
    location /static/ { proxy_pass http://backend;  }   # CSS/JS do admin
    location /        { proxy_pass http://frontend; }   # frontend:3000
}
```

  Cabeçalhos `Host`, `X-Real-IP`, `X-Forwarded-For` e `X-Forwarded-Proto` são repassados.
  Com isso, o Django reconhece a requisição como HTTPS e gera redirects `https://`.
  Também foram adicionados `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
  e `server_tokens off`.
- **Portas expostas:** em [`docker-compose-prod.yml`](https://github.com/GGDornelas/semana5-giovanni/blob/main/docker-compose-prod.yml)
  somente o `nginx` tem `ports` (`80:80`, `443:443`). `backend`, `frontend` e `db` usam
  apenas `expose`. Os healthchecks de backend e frontend fazem o Nginx só subir quando os
  upstreams estão prontos.
- **HTTPS:** TLS 1.2/1.3 e HTTP/2 na porta 443. Certificado autoassinado gerado por
  [`nginx/generate-certs.sh`](https://github.com/GGDornelas/semana5-giovanni/blob/main/nginx/generate-certs.sh)
  (comando `openssl req -x509 ... -subj "/CN=localhost"` do enunciado, acrescido de
  `subjectAltName=DNS:localhost,IP:127.0.0.1`). Os arquivos `.key`/`.crt` **não** são
  versionados (`.gitignore`).
- **Redirecionamento:** `301 Moved Permanently` de HTTP para HTTPS.
- **Validacao (Checkpoint final de produção):**

```text
$ sh nginx/generate-certs.sh
$ docker compose -f docker-compose-prod.yml up -d --build
$ docker compose -f docker-compose-prod.yml ps
backend    Up (healthy)   8000/tcp
db         Up (healthy)
frontend   Up (healthy)   3000/tcp
nginx      Up             0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp

$ curl -sI http://localhost/api/health/
HTTP/1.1 301 Moved Permanently
Location: https://localhost/api/health/

$ curl -sk https://localhost/api/health/
{"status": "ok", "database": "ok", "engine": "postgresql", "items": ["Configurar Docker", "Automatizar CI", "Publicar no GHCR"]}

$ curl -sk -o /dev/null -w "%{http_code} HTTP/%{http_version}\n" https://localhost/
200 HTTP/2
$ curl -sk -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://localhost/admin/
302 -> https://localhost/admin/login/?next=/admin/
$ curl -sk -o /dev/null -w "%{http_code}\n" https://localhost/static/admin/css/base.css
200

$ for p in 8000 3000 5432; do curl -s -m 2 localhost:$p >/dev/null && echo "$p ABERTA" || echo "$p fechada"; done
8000 fechada
3000 fechada
5432 fechada

$ echo | openssl s_client -connect localhost:443 2>/dev/null | openssl x509 -noout -subject
subject=CN=localhost
```

  Página renderizada no navegador (Chrome headless) via `https://localhost/`, com os dados
  vindos do Django/PostgreSQL através do Nginx:

  ![Página em produção via HTTPS](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/etapa5-pagina-https.png)

- **Commit:** [`2a5c116`](https://github.com/GGDornelas/semana5-giovanni/commit/2a5c116ad2743152f0e29bdb6a2e3b084d866580)

## 8. Etapa 6 - GHCR

- **Jobs de deploy:**

| Job | `needs` | Condição | Entrega |
|---|---|---|---|
| `deploy-backend` | `test-backend` | `push` no `main` | build de `backend/Dockerfile.prod` e push no GHCR |
| `deploy-frontend` | `test-frontend` | `push` no `main` | build de `frontend/Dockerfile.prod` e push no GHCR |

  Pipeline completo: `lint → build → test → deploy` em cada trilha. Pull requests executam
  só a validação (sem publicar). Usa `docker/setup-buildx-action`, `docker/login-action` e
  `docker/build-push-action` com cache do BuildKit no GitHub Actions (`type=gha`).
- **Permissoes (menor privilégio, nível do workflow):**

```yaml
permissions:
  contents: read
  packages: write
```

- **Autenticacao:** `docker/login-action` com `registry: ghcr.io`,
  `username: ${{ github.actor }}` e `password: ${{ secrets.GITHUB_TOKEN }}`. É o token
  efêmero do próprio Actions: nenhum token pessoal ou senha fica salvo no repositório.
- **Tags:** o nome do repositório é convertido para minúsculas (`${GITHUB_REPOSITORY,,}`),
  exigência do GHCR.

```text
ghcr.io/ggdornelas/semana5-giovanni-backend:latest
ghcr.io/ggdornelas/semana5-giovanni-backend:${{ github.sha }}
ghcr.io/ggdornelas/semana5-giovanni-frontend:latest
ghcr.io/ggdornelas/semana5-giovanni-frontend:${{ github.sha }}
```

  As imagens recebem os labels `org.opencontainers.image.source` (vincula o pacote ao
  repositório) e `org.opencontainers.image.revision` (SHA do commit).
- **Imagens publicadas:**
  - Backend: https://github.com/GGDornelas/semana5-giovanni/pkgs/container/semana5-giovanni-backend
  - Frontend: https://github.com/GGDornelas/semana5-giovanni/pkgs/container/semana5-giovanni-frontend
- **Evidencias:** [execução com os 8 jobs verdes](https://github.com/GGDornelas/semana5-giovanni/actions/runs/36614897196)
  (inclui `deploy-backend` e `deploy-frontend`). Consulta anônima ao registry confirmando as
  tags `latest` e SHA de cada imagem:

```text
$ curl -s -H "Authorization: Bearer $TOKEN" https://ghcr.io/v2/ggdornelas/semana5-giovanni-backend/tags/list
{"name":"ggdornelas/semana5-giovanni-backend","tags":["latest","b98ec01f3069dcfce2d0053f0fd930a12f4435e9","5b633d9d4e0b5d73765076e51e652b5d892a5df5"]}
$ curl -s -H "Authorization: Bearer $TOKEN" https://ghcr.io/v2/ggdornelas/semana5-giovanni-frontend/tags/list
{"name":"ggdornelas/semana5-giovanni-frontend","tags":["latest","b98ec01f3069dcfce2d0053f0fd930a12f4435e9","5b633d9d4e0b5d73765076e51e652b5d892a5df5"]}
```

  O `latest` e a tag `5b633d9…` correspondem ao commit atual da Etapa 6
  ([`5b633d9`](https://github.com/GGDornelas/semana5-giovanni/commit/5b633d9d4e0b5d73765076e51e652b5d892a5df5)).
  A tag `b98ec01…` é de uma publicação anterior do mesmo código, feita antes de o e-mail de
  autor dos commits ser corrigido (o histórico foi reescrito e os SHAs mudaram).
  Ela demonstra que cada publicação gera uma tag imutável por commit.
- **Commit:** [`5b633d9`](https://github.com/GGDornelas/semana5-giovanni/commit/5b633d9d4e0b5d73765076e51e652b5d892a5df5)

## 9. Validacao Final

- **Comandos executados:**

```bash
# Qualidade local
ruff check . && ruff format --check .          # backend
python manage.py test                          # backend (SQLite e PostgreSQL)
npm run lint && npm test && npm run build      # frontend

# DEV
docker compose up -d --build
curl -s localhost:8000/api/health/
curl -s localhost:3000/api/health/

# PROD
docker build -f backend/Dockerfile.prod  -t semana5-backend-prod  ./backend
docker build -f frontend/Dockerfile.prod -t semana5-frontend-prod ./frontend
sh nginx/generate-certs.sh
docker compose -f docker-compose-prod.yml up -d --build
curl -sI http://localhost/ ; curl -sk https://localhost/api/health/
```

- **Resultados:**
  - Backend: 3 testes (`manage.py test`) passando localmente e no CI (PostgreSQL service container).
  - Frontend: 5 testes (Vitest) passando; ESLint sem erros; `next build` ok.
  - Stack DEV com healthcheck, hot reload e persistência validados.
  - Stack PROD: redirect 301, HTTPS/HTTP2, roteamento `/api/`, `/admin/`, `/static/` e `/`,
    portas 8000/3000/5432 inacessíveis a partir do host.
  - Imagens PROD não-root; frontend ≈ 130 MB (< 150 MB).
  - CI/CD verde com publicação no GHCR (`latest` + SHA).
- **Limitacoes:**
  - O certificado é **autoassinado** (validação local). Navegadores exibem aviso de
    segurança, e o `curl` precisa de `-k`. Num ambiente real, o certificado viria de uma CA
    (ex.: Let's Encrypt/Certbot).
  - As imagens são publicadas apenas para `linux/amd64` (arquitetura do runner). Em Macs com
    Apple Silicon a stack é construída localmente pelo `docker-compose-prod.yml`, ou a imagem
    do GHCR roda com emulação.
  - O "deploy" desta entrega é a **publicação** das imagens no registry (Continuous Delivery).
    Não há servidor remoto que faça `pull` automático das novas versões.
  - As migrações do Django rodam no start do container backend. Com várias réplicas, o ideal
    seria um job de migração separado.
**Checklist de entregas:**

| Etapa | Foco | Entregável obrigatório | Status |
|---|---|---|---|
| 1 | Containerização DEV | Dockerfile em backend e frontend, hot reload e bind mounts | ✅ |
| 2 | Orquestração DEV | `docker-compose.yml` com healthcheck e persistência | ✅ |
| 3 | Qualidade Automatizada | CI com trilhas lint → build → test (+ Fail-Fast validado) | ✅ |
| 4 | Otimização PROD | `Dockerfile.prod` multi-stage e imagens de produção reduzidas | ✅ |
| 5 | Stack PROD | `docker-compose-prod.yml` + Nginx + SSL + portas isoladas | ✅ |
| 6 | Deploy Contínuo | Publicação no GHCR com `:latest` e `${{ github.sha }}` | ✅ |

## 10. Historico Git

| Etapa | Commit | Descricao |
|---|---|---|
| base | [`e474bae`](https://github.com/GGDornelas/semana5-giovanni/commit/e474bae3f449c8fbd57eac25587c16febf10663c) | Aplicação base: Django (`startproject config .`, app `api`, `GET /api/health/`, testes) e Next.js (`create-next-app`, `app/page.js`, Vitest) |
| 1 | [`09878f5`](https://github.com/GGDornelas/semana5-giovanni/commit/09878f5e5a0caa2143cd9ded1cbcb52cecc24247) | Dockerfiles de DEV (`python:3.12-slim` / `node:20-alpine`), `.dockerignore`, bind mounts e hot reload |
| 2 | [`622d699`](https://github.com/GGDornelas/semana5-giovanni/commit/622d699a227bd8d62fb9a4b6cb4e82b6cc3b678e) | `docker-compose.yml` com db, healthcheck `pg_isready`, `service_healthy`, volume `postgres_data`, `.env.example` |
| 3 | [`b2905f3`](https://github.com/GGDornelas/semana5-giovanni/commit/b2905f3c83f9dfde539cc908d19d2d589bd9953c) | `ci.yml` com trilhas lint → build → test, `needs` e cache pip/npm |
| 3 (fail-fast) | [`fd57bb5`](https://github.com/GGDornelas/semana5-giovanni/commit/fd57bb51b638967fe8d5fe2fbd52549774c0fd84) | Falha controlada 1: erro de lint |
| 3 (fail-fast) | [`fb15630`](https://github.com/GGDornelas/semana5-giovanni/commit/fb15630a2823c30bf6baab29f294196d403caeec) | Falha controlada 2: erro de build |
| 3 (fail-fast) | [`e8187f3`](https://github.com/GGDornelas/semana5-giovanni/commit/e8187f3ad4f21f2f5fb9d88c0d618cfe3768eb1e) | Falha controlada 3: teste quebrado |
| 3 (fail-fast) | [`e9d2490`](https://github.com/GGDornelas/semana5-giovanni/commit/e9d2490eaa8c842d79532f3d55111f080c910df2) | Correção final: trilhas verdes |
| 4 | [`3ecb017`](https://github.com/GGDornelas/semana5-giovanni/commit/3ecb0179a783a69f69a00b6c2a921870ee31a7bf) | `Dockerfile.prod` (Gunicorn / Next standalone multi-stage), usuários não-root, imagens reduzidas, validação no CI |
| 5 | [`2a5c116`](https://github.com/GGDornelas/semana5-giovanni/commit/2a5c116ad2743152f0e29bdb6a2e3b084d866580) | `docker-compose-prod.yml`, `nginx.conf` (proxy, SSL, redirect 301), geração de certificado, portas isoladas |
| 6 | [`5b633d9`](https://github.com/GGDornelas/semana5-giovanni/commit/5b633d9d4e0b5d73765076e51e652b5d892a5df5) | Jobs `deploy-backend`/`deploy-frontend` publicando no GHCR (`latest` + SHA) |
