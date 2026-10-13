# Semana 5 - Containerização e CI/CD

## 1. Identificação

- **Aluna:** Julia Neiva Lima (trabalho individual)
- **Repositório:** https://github.com/lianeiv/devops-semana5
- **Descrição:** aplicação desacoplada com backend Django, frontend Next.js (App Router), banco PostgreSQL e Nginx como reverse proxy. O projeto cobre containerização de DEV e PROD, orquestração com Docker Compose, CI com GitHub Actions e publicação das imagens no GitHub Container Registry (GHCR).

## 2. Arquitetura

- **Stack:** Django 5 (Gunicorn em produção), Next.js 15+ (modo `standalone`), PostgreSQL 16, Nginx 1.27, Docker Compose, GitHub Actions, GHCR.
- **Estrutura do repositório:** `/backend`, `/frontend`, `/nginx`, `docker-compose.yml` (DEV), `docker-compose-prod.yml` (PROD), `.github/workflows/ci.yml`.

| Serviço | Imagem / build | Porta interna | Publicada no host (PROD) |
|---|---|---|---|
| db | postgres:16-alpine | 5432 | Não |
| backend | `backend/Dockerfile.prod` (python:3.12-alpine + Gunicorn) | 8000 | Não |
| frontend | `frontend/Dockerfile.prod` (node:20-alpine, standalone) | 3000 | Não |
| nginx | nginx:1.27-alpine | 80 e 443 | **Sim (80 e 443)** |

- **Rede e volumes:** os serviços conversam pela rede padrão do Compose, usando o nome do serviço como host (`db:5432`, `backend:8000`, `frontend:3000`). Volumes nomeados: `postgres_data` (DEV) e `postgres_data_prod` (PROD), ambos em `/var/lib/postgresql/data`.
- **Fluxo de comunicação (PROD):**

```
Navegador --HTTP:80--> Nginx --301--> HTTPS:443
Navegador --HTTPS:443--> Nginx
   /api/, /admin/, /static/  -> backend:8000 -> db:5432
   /                         -> frontend:3000
```

O frontend chama a API por caminho relativo (`/api/health/`), então o navegador nunca acessa `localhost:8000` diretamente.

## 3. Etapa 1 - DEV

- **Implementação:**
  - `backend/Dockerfile`: `python:3.12-slim`, instala `requirements.txt` antes de copiar o código (aproveita cache) e executa `python manage.py runserver 0.0.0.0:8000`.
  - `frontend/Dockerfile`: `node:20-alpine`, `npm ci` e `npm run dev` com `-H 0.0.0.0`.
  - Django com `DEBUG=True` via variável de ambiente e credenciais do PostgreSQL lidas de variáveis de ambiente.
  - `.dockerignore` em `backend/` e `frontend/` (exclui `.git`, `venv`, `node_modules`, `.next`, `.env`, `__pycache__`).
- **Problemas encontrados e corrigidos:**
  - Credenciais fixas no `settings.py` movidas para variáveis de ambiente.
  - `fetch` com `http://localhost:8000` causava CORS; passou a usar `/api/health/` com `rewrites` no `next.config.mjs`.
  - Ausência de `.dockerignore` fazia o build copiar `node_modules` e outros arquivos locais.
- **Validação (bind mounts e hot reload):**

```bash
docker build -t app-back-dev ./backend
docker run --rm -p 8000:8000 -v "$(pwd)/backend:/app" -e DEBUG=True app-back-dev

docker build -t app-front-dev ./frontend
docker run --rm -p 3000:3000 \
  -v "$(pwd)/frontend:/app" -v /app/node_modules -v /app/.next \
  -e WATCHPACK_POLLING=true app-front-dev
```

Os volumes anônimos `/app/node_modules` e `/app/.next` impedem que o bind mount apague as dependências instaladas na imagem. Alterações em `views.py` e `page.js` aparecem sem novo build.

- **Evidências:** comandos acima, com alterações em `views.py` e `page.js` refletidas no navegador sem novo build. Histórico de commits: https://github.com/lianeiv/devops-semana5/commits/main
- **Commits:** `2f61fd1`, `2462832`, `dd2db47`, `972b585`, `5cdca54`, `03c39ee`

## 4. Etapa 2 - Docker Compose

- **Implementação:** `docker-compose.yml` na raiz com `db`, `backend` e `frontend`.
  - Rede interna: o backend acessa o banco em `db:5432`.
  - O backend executa `python manage.py migrate` antes do `runserver`.
  - O frontend usa `BACKEND_URL=http://backend:8000` e `WATCHPACK_POLLING=true`.
- **Healthcheck:**

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
  interval: 5s
  timeout: 5s
  retries: 5
```

Com `depends_on: db: condition: service_healthy`, o backend só inicia depois que o PostgreSQL responde. O `$$` evita que o Compose interpole a variável no host.

- **Persistência:** volume nomeado `postgres_data` montado em `/var/lib/postgresql/data`.
- **Variáveis:** apenas `.env.example` é versionado; o `.env` local está no `.gitignore`.
- **Validação:**

```bash
docker compose up --build
docker compose ps                      # db (healthy)
curl http://localhost:8000/api/health/
# http://localhost:3000 exibe os itens retornados pela API
```

- **Evidências:** comandos acima e arquivos `docker-compose.yml` e `.env.example` versionados no repositório.
- **Commits:** `02eb5df`, `d38f90a`

## 5. Etapa 3 - CI

Workflow: `.github/workflows/ci.yml`, disparado em push na `main` e em pull requests.

- **Jobs do backend:** `lint-backend` (flake8) -> `build-backend` (`docker build` do container) -> `test-backend` (`python manage.py test`).
- **Jobs do frontend:** `lint-frontend` (ESLint) -> `build-frontend` (`npm run build`) -> `test-frontend` (Jest).
- **Fail-Fast:** cada job usa `needs` do anterior (`build-* needs lint-*`, `test-* needs build-*`). Se um job falha, os seguintes são pulados. As duas trilhas são independentes entre si.
- **Cache:**
  - Backend: `actions/setup-python` com `cache: pip` e `cache-dependency-path: backend/requirements.txt`.
  - Frontend: `actions/setup-node` com `cache: npm` e `cache-dependency-path: frontend/package-lock.json`.
- **Ajustes feitos a partir das execuções do pipeline:** o commit `96a933b` corrigiu o `cache-dependency-path` e a configuração do flake8, e o commit `e855a0d` corrigiu testes e formatação PEP 8 do backend. Quando um job falha, os seguintes são pulados por causa do `needs`.
- **Histórico de execuções:** https://github.com/lianeiv/devops-semana5/actions/workflows/ci.yml
- **Commits:** `2557fee`, `18b6259`, `96a933b`, `e855a0d`

## 6. Etapa 4 - Produção

- **Backend (`backend/Dockerfile.prod`):** base `python:3.12-alpine`, servidor `gunicorn config.wsgi:application --bind 0.0.0.0:8000`, usuário sem privilégios (`app`), `collectstatic` no build e WhiteNoise para servir os estáticos do admin com `DEBUG=False`.
- **Frontend (`frontend/Dockerfile.prod`):** multi-stage com estágios `deps`, `builder` e `runner`.
- **Multi-stage:** as dependências e o build ficam nos estágios `deps` e `builder`. O estágio `runner` copia apenas `.next/standalone`, `.next/static` e `public`, e executa `node server.js` com `HOSTNAME=0.0.0.0`. `output: 'standalone'` está ativo no `next.config.mjs`.
- **Usuários não-root:** `app` (backend) e `nextjs` (frontend).
- **Tamanho final das imagens:** medido com `docker images | grep app-` (comando na validação abaixo). O requisito é que a imagem do frontend fique abaixo de 150 MB; para isso o estágio `runner` copia apenas o necessário.

- **Validação:**

```bash
docker build -f backend/Dockerfile.prod -t app-back-prod ./backend
docker build -f frontend/Dockerfile.prod -t app-front-prod ./frontend
docker images | grep app-
docker run --rm app-back-prod id
docker run --rm app-front-prod whoami
```

- **Commit:** `c3354fd` (`Dockerfile.prod` do frontend)

## 7. Etapa 5 - Nginx e SSL

- **Reverse proxy:** `nginx/nginx.conf` com `upstream backend` (`backend:8000`) e `upstream frontend` (`frontend:3000`).
  - `/api/` e `/admin/` vão para o backend.
  - `/static/` vai para o backend (CSS do admin).
  - `/` vai para o frontend.
  - Cabeçalhos `Host`, `X-Real-IP`, `X-Forwarded-For` e `X-Forwarded-Proto` repassados.
- **Portas expostas:** somente o `nginx` publica portas (80 e 443). Backend e frontend usam `expose`, e o banco não declara portas.
- **HTTPS:** porta 443 com certificado autoassinado, TLS 1.2 e 1.3.
- **Redirecionamento:** o servidor da porta 80 responde `return 301 https://$host$request_uri;`.
- **Certificados locais:** gerados por `nginx/gen-certs.sh` (`openssl req -x509 ... -subj "/CN=localhost"`). A pasta `nginx/certs/` não é versionada, então é preciso rodar `bash nginx/gen-certs.sh` antes de subir a stack.
- **Django atrás do proxy:** `SECURE_PROXY_SSL_HEADER` e `CSRF_TRUSTED_ORIGINS` configurados.
- **Validação:**

```bash
bash nginx/gen-certs.sh
docker compose -f docker-compose-prod.yml up -d --build
docker compose -f docker-compose-prod.yml ps
curl -I http://localhost                    # 301 -> https://localhost/
curl -k https://localhost/api/health/       # JSON via Nginx
curl -m 3 http://localhost:8000             # deve falhar
curl -m 3 http://localhost:3000             # deve falhar
```

- **Evidências:** comandos de validação acima; `docker-compose-prod.yml`, `nginx/nginx.conf` e `nginx/gen-certs.sh` versionados no repositório.
- **Commit:** `f4664da`

## 8. Etapa 6 - GHCR

- **Imagens publicadas:**
  - `ghcr.io/lianeiv/devops-semana5-backend`
  - `ghcr.io/lianeiv/devops-semana5-frontend`
- **Tags:** `latest` e `${{ github.sha }}` em cada imagem.
- **Jobs:** `deploy-backend` (`needs: test-backend`) e `deploy-frontend` (`needs: test-frontend`), executados apenas em push na `main`. O build usa `Dockerfile.prod` de cada serviço.
- **Permissões:**

```yaml
permissions:
  contents: read
  packages: write
```

- **Autenticação:** `docker/login-action` com `github.actor` e `secrets.GITHUB_TOKEN` (sem secret manual). O nome da imagem é convertido para minúsculas (`${GITHUB_REPOSITORY,,}`), exigência do GHCR.
- **Evidências:** execuções do workflow em https://github.com/lianeiv/devops-semana5/actions/workflows/ci.yml e pacotes publicados em https://github.com/lianeiv?tab=packages. Teste de download: `docker pull ghcr.io/lianeiv/devops-semana5-backend:latest`.
- **Commit:** `b546d87`

## 9. Validação final

- **Comandos executados:** ver as seções de validação de cada etapa.
- **Resultados:** as 6 etapas estão registradas no histórico Git (seção 10), o pipeline roda no GitHub Actions (link na seção 5) e os comandos de validação de cada etapa estão nas respectivas seções.
- **Limitações conhecidas:**
  - O certificado é autoassinado, então o navegador exibe aviso de segurança. Serve apenas para validação local.
  - O diretório `nginx/certs/` não é versionado; é preciso gerar os certificados antes de subir o compose de produção.
  - Os testes cobrem o endpoint de saúde e a renderização da página, não o sistema completo.
- **Checklist final:**

| Etapa | Foco | Status |
|---|---|---|
| 1 | Containerização DEV | [x] |
| 2 | Orquestração DEV | [x] |
| 3 | Qualidade automatizada (CI) | [~] CI implementado com `needs` e cache; registro das falhas controladas pendente |
| 4 | Otimização PROD | [x] |
| 5 | Stack PROD (Nginx + SSL) | [x] |
| 6 | Deploy contínuo (GHCR) | [x] |

## 10. Histórico Git

| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `2f61fd1` | Backend Django com endpoint `/api/health/` |
| 1 | `2462832` | Credenciais do PostgreSQL e `DEBUG` por variáveis de ambiente |
| 1 | `dd2db47` | Página Next.js consumindo a API |
| 1 | `972b585` | Fetch com caminho relativo e rewrite de `/api` no Next |
| 1 | `5cdca54` | Dockerfiles de desenvolvimento (backend e frontend) |
| 1 | `03c39ee` | `.dockerignore` no backend e no frontend |
| 2 | `02eb5df` | `docker-compose.yml` de desenvolvimento |
| 2 | `d38f90a` | Healthcheck com `$$`, `depends_on: service_healthy` e migrate na subida |
| 3 | `2557fee` | Testes automatizados do backend (Django) e do frontend (Jest) |
| 3 | `18b6259` | Pipeline de CI com trilhas backend e frontend |
| 3 | `96a933b` | `cache-dependency-path` e configuração do flake8 |
| 3 | `e855a0d` | Correção dos testes e formatação PEP 8 do backend |
| 4 | `c3354fd` | `Dockerfile.prod` do frontend (multi-stage, standalone, usuário `nextjs`) |
| 5 | `f4664da` | Stack de produção com Nginx, SSL autoassinado e portas isoladas |
| 6 | `b546d87` | Deploy contínuo das imagens de produção no GHCR |
