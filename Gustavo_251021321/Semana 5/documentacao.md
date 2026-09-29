# Semana 5 - Containerizacao e CI/CD

## 1. Identificacao
- **Equipe:** Gustavo da Rocha Machado Quirino
- **Integrantes:** Gustavo da Rocha (<gugarmq@gmail.com>)
- **Repositorio:** [https://github.com/Gustavormq/semana5-cicd-app](https://github.com/Gustavormq/semana5-cicd-app)
- **Descricao:** Projeto de operacionalizacao e modernizacao de uma aplicacao desacoplada full-stack composta por **Django** (backend), **Next.js App Router** (frontend), **PostgreSQL 16** (banco de dados) e **Nginx** (reverse proxy com SSL/HTTPS). A solucao contempla conteinerizacao de desenvolvimento com hot-reload, orquestracao com Docker Compose, esteira automatizada de CI com Fail-Fast no GitHub Actions, imagens de producao otimizadas (multi-stage, standalone, non-root, < 150 MB) e publicacao continua (CD) no GitHub Container Registry (GHCR).

---

## 2. Arquitetura
- **Stack:**
  - **Backend:** Python 3.12, Django 5, Gunicorn, psycopg/psycopg2, Ruff
  - **Frontend:** Node 20, Next.js 16 (App Router), React 19, Vitest, ESLint
  - **Banco de Dados:** PostgreSQL 16 Alpine
  - **Reverse Proxy / Ingress:** Nginx Alpine com suporte a TLS/SSL
  - **Automacao / CI/CD:** GitHub Actions, Docker Buildx, GitHub Container Registry (GHCR)
- **Servicos:**
  - `db`: PostgreSQL 16 Alpine com healthcheck ativo
  - `backend`: API REST Django servindo `/api/health/`
  - `frontend`: Interface web Next.js consumindo o backend
  - `nginx`: Ponto unico de entrada HTTP (80) e HTTPS (443)
- **Portas e Redes:**
  - **Exposicao Externa:** Somente as portas `80` (HTTP) e `443` (HTTPS) do Nginx sao publicadas no host em producao.
  - **Rede Interna:** Rede bridge `app_network` interliga os servicos, isolando `backend:8000`, `frontend:3000` e `db:5432` do acesso externo direto.
- **Volumes:**
  - `postgres_data` (dev) / `postgres_prod_data` (prod): Persistencia dos dados em `/var/lib/postgresql/data`.
- **Fluxo de comunicacao:**
  1. O cliente envia uma requisicao HTTP para a porta `80`. O Nginx intercepta e retorna redirecionamento permanente (`HTTP 301`) para `HTTPS 443`.
  2. Em HTTPS (`443`), o Nginx atua como proxy reverso:
     - Requisicoes sob `/api/` e `/admin/` sao encaminhadas internamente para `http://backend:8000`.
     - Requisicoes sob `/` sao encaminhadas internamente para `http://frontend:3000`.
  3. O backend comunica-se internamente com o banco de dados via DNS de servico `db:5432`.

---

## 3. Etapa 1 - DEV
- **Implementacao:**
  - Criacao dos Dockerfiles de desenvolvimento em `backend/Dockerfile` e `frontend/Dockerfile`.
  - Backend baseado em `python:3.12-slim`, instalando `requirements.txt` e executando `python manage.py runserver 0.0.0.0:8000`.
  - Frontend baseado em `node:20-alpine`, instalando dependencias e executando `npm run dev`.
  - Configuracao de `DEBUG=True` no Django, hot-reload ativado e bind mounts locais.
- **Validacao:**
  - Execucao individual de cada container via `docker run -v $(pwd)/backend:/app -p 8000:8000 backend` e `docker run -v $(pwd)/frontend:/app -p 3000:3000 frontend`. Alteracoes no host foram refletidas instantaneamente nos endpoints sem necessidade de rebuild.
- **Evidencias:**
  - Acesso ao backend: `GET http://localhost:8000/api/health/` retornando `status: ok`.
  - Acesso ao frontend: `GET http://localhost:3000/` renderizando os itens da API.
- **Commit:** `e258ac27312e5f43aa16da5fda59603e83f13dc1`

---

## 4. Etapa 2 - Docker Compose
- **Implementacao:**
  - Criacao de `docker-compose.yml` integrando `db`, `backend` e `frontend`.
  - Configuracao de seguranca de credenciais: `.env` ignorado no `.gitignore` e versionamento apenas de `.env.example`.
  - Configuracao do Django em `backend/config/settings.py` para ler credenciais do PostgreSQL via variaveis de ambiente (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`).
- **Healthcheck:**
  - PostgreSQL configurado com healthcheck nativo:
    ```yaml
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 5s
      retries: 5
    ```
  - Backend configurado com `depends_on: db: condition: service_healthy`, garantindo que o Django so inicia apos a prontidao completa do banco.
- **Persistencia:**
  - Volume nomeado `postgres_data` mapeado para `/var/lib/postgresql/data`.
- **Validacao:**
  - `docker compose up -d` executado com sucesso.
  - Verificacao de status com `docker compose ps` confirmando container `db` como `healthy` antes do backend subir.
- **Commit:** `992ebd8d3ed9fa3e2179c117baaf8e293f18cae1`

---

## 5. Etapa 3 - CI
- **Implementacao:**
  - Criacao do workflow em `.github/workflows/ci.yml` com duas trilhas paralelas e independentes.
  - Implementacao de cache: `cache: 'pip'` no backend e `cache: 'npm'` no frontend.
- **Jobs do backend:**
  1. `lint-backend`: Executa o linter **Ruff** em `backend/config`.
  2. `build-backend` (`needs: lint-backend`): Valida o build da imagem Docker de desenvolvimento.
  3. `test-backend` (`needs: build-backend`): Executa a suite de testes unitarios com `python manage.py test config`.
- **Jobs do frontend:**
  1. `lint-frontend`: Executa **ESLint** nas paginas e componentes.
  2. `build-frontend` (`needs: lint-frontend`): Executa `npm run build` do Next.js.
  3. `test-frontend` (`needs: build-frontend`): Executa os testes de contrato e renderizacao com **Vitest**.
- **Fail-Fast:**
  - O uso estrito de `needs` garante a interrupcao imediata das etapas subsequentes em caso de qualquer falha previa:
    - Falha de Lint bloqueia Build e Testes.
    - Falha de Build bloqueia Testes.
    - As trilhas operam de forma isolada (uma falha no frontend nao interrompe a trilha do backend e vice-versa).
- **Evidencias:**
  - Execucao no GitHub Actions comprovando o bloqueio de `build-frontend` e `test-frontend` diante de inconsistencia no lint/deps, enquanto a trilha do backend executou com sucesso (Run ID `36337030886`).
  - Execucao final totalmente verde com as duas trilhas aprovadas (Run ID `36337161756`).
- **Commit:** `633eeea194d259a7e32532df1ddc7aeddd5f7d0b`

---

## 6. Etapa 4 - Producao
- **Backend (`backend/Dockerfile.prod`):**
  - Base minimalista `python:3.12-alpine`.
  - Servidor WSGI de producao **Gunicorn**: `gunicorn config.wsgi:application --bind 0.0.0.0:8000`.
  - Execucao sob usuario desprivilegiado `appuser` (criado via `addgroup -S appgroup && adduser -S appuser -G appgroup`).
  - Instalacao temporaria de dependencias de build com remocao automatica (`apk del .build-deps`).
- **Frontend (`frontend/Dockerfile.prod`):**
  - **Multi-stage build** em 3 estagios distintos:
    1. `deps`: Base `node:20-alpine`, copia `package*.json` e instala dependencias de producao.
    2. `builder`: Copia dependencias e codigo-fonte, compilando o Next.js com `output: 'standalone'`.
    3. `runner`: Base limpa `node:20-alpine`, cria usuario nao-root `nextjs` (UID 1001), copia exclusivamente `.next/standalone`, `.next/static` e `public`.
  - Execucao sob usuario `nextjs` executando `node server.js`.
- **Tamanho final das imagens:**
  - **Frontend:** O tamanho compactado no registro (GHCR) e de **64.2 MB** e o diretorio `/app` ocupa apenas **48.9 MB** (muito abaixo do limite de 150 MB exigido no desafio, representando reducao de mais de 84% em relacao aos 1.65 GB da imagem de dev).
  - **Backend:** Ocupa **42.3 MB** compactado no GHCR.
- **Commit:** `98f6746e3c9a49d3ad18b9f4bf91c56713ceb0b3`

---

## 7. Etapa 5 - Nginx e SSL
- **Reverse proxy:**
  - Configuracao em `nginx/nginx.conf` atuando como gateway unificado.
  - Encaminhamento com headers proxy preservados (`Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`).
- **Portas expostas:**
  - Apenas as portas `80` e `443` estao publicadas no host pelo Nginx.
  - Servicos `backend` (8000), `frontend` (3000) e `db` (5432) operam com isolamento total, acessiveis exclusivamente na rede interna `app_network`.
- **HTTPS e Redirecionamento:**
  - Porta `80` configurada com `return 301 https://$host$request_uri;`.
  - Porta `443` configurada com certificados SSL autoassinados (`selfsigned.crt` e `selfsigned.key`) gerados com OpenSSL:
    ```bash
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout nginx/certs/selfsigned.key \
      -out nginx/certs/selfsigned.crt \
      -subj "/CN=localhost"
    ```
- **Roteamento:**
  - `/api/` e `/admin/` -> `http://backend:8000`
  - `/` -> `http://frontend:3000`
- **Validacao:**
  - `curl -i http://localhost/` retornou `HTTP/1.1 301 Moved Permanently` para `https://localhost/`.
  - `curl -k -i https://localhost/api/health/` retornou `HTTP/1.1 200 OK` via Nginx com payload JSON correto.
  - `curl -k -i https://localhost/` retornou `HTTP/1.1 200 OK` renderizando o frontend via Nginx.
  - Tentativas de conexao direta em `http://localhost:8000` ou `http://localhost:3000` foram recusadas.
- **Commit:** `6ab3696263dea8c32f5dc9c40f0ea314eee814a1`

---

## 8. Etapa 6 - GHCR
- **Imagens publicadas:**
  - `ghcr.io/gustavormq/semana5-cicd-app-backend`
  - `ghcr.io/gustavormq/semana5-cicd-app-frontend`
- **Tags obrigatórias:**
  - `ghcr.io/gustavormq/semana5-cicd-app-backend:latest`
  - `ghcr.io/gustavormq/semana5-cicd-app-backend:<commit_sha>`
  - `ghcr.io/gustavormq/semana5-cicd-app-frontend:latest`
  - `ghcr.io/gustavormq/semana5-cicd-app-frontend:<commit_sha>`
- **Permissoes e Autenticacao:**
  - Permissoes minimas declaradas no workflow:
    ```yaml
    permissions:
      contents: read
      packages: write
    ```
  - Autenticacao transparente usando `docker/login-action@v3` e o token nativo `${{ secrets.GITHUB_TOKEN }}`.
- **Jobs de deploy:**
  - `deploy-backend`: Depende de `needs: test-backend`.
  - `deploy-frontend`: Depende de `needs: test-frontend`.
- **Evidencias:**
  - Publicacao realizada com sucesso no GitHub Actions (Run ID `36337161756`).
  - Imagens baixadas do registro publico via `docker pull ghcr.io/gustavormq/semana5-cicd-app-backend:latest` e `docker pull ghcr.io/gustavormq/semana5-cicd-app-frontend:latest`.
  - Execucao das imagens baixadas validada com resposta `200 OK`.
- **Commit:** `e7614f942f71241ca915a2e1280178d6b3ad24bb` (e fix complementar `1802f62e9650ac2ab7929a4bd9db324eddd0ef72`)

---

## 9. Validacao Final
- **Comandos executados e resultados:**
  1. `docker compose up -d` (Ambiente DEV):
     - PostgreSQL inicializado, healthcheck respondendo `healthy`, backend conectado via porta 8000 e frontend via porta 3000 com hot-reload ativo.
  2. `docker compose -f docker-compose-prod.yml up -d` (Ambiente PROD):
     - Subida de todos os servicos com Nginx como ponto de entrada unico.
  3. `curl -i http://localhost/`:
     - Resposta `301 Moved Permanently` apontando para `https://localhost/`.
  4. `curl -k -i https://localhost/api/health/`:
     - Resposta `200 OK` com `{"status": "ok", "items": ["Configurar Docker", "Automatizar CI", "Publicar no GHCR"]}`.
  5. `curl -k -s -I https://localhost/`:
     - Resposta `200 OK` do Next.js Standalone intermediado pelo proxy reverso.
  6. Isolamento de portas:
     - Portas 8000, 3000 e 5432 inacessiveis externamente no host.
- **Checklist de Entregas:**
  - [x] **Etapa 1:** Dockerfile em backend e frontend, hot-reload e bind mounts.
  - [x] **Etapa 2:** docker-compose.yml com healthcheck no Postgres e persistencia em volume.
  - [x] **Etapa 3:** CI com trilhas lint -> build -> test, cache e Fail-Fast.
  - [x] **Etapa 4:** Dockerfile.prod multi-stage, standalone, non-root e imagem < 150 MB.
  - [x] **Etapa 5:** docker-compose-prod.yml com Nginx, SSL, HTTP->HTTPS e portas isoladas.
  - [x] **Etapa 6:** Deploy continuo no GHCR com tags `:latest` e `:${{ github.sha }}`.
- **Limitacoes conhecidas:**
  - O certificado SSL e autoassinado para fins de desenvolvimento/homologacao local (`CN=localhost`), o que exige desabilitar a checagem de autoridade certificadora no cliente HTTP (ex: flag `-k` no `curl` ou aceitar o aviso de seguranca no navegador).

---

## 10. Historico Git

| Etapa | Hash do Commit | Descricao |
|---|---|---|
| 1 | `e258ac27312e5f43aa16da5fda59603e83f13dc1` | feat: etapa 1 concluida com containers de dev e bind mounts |
| 2 | `992ebd8d3ed9fa3e2179c117baaf8e293f18cae1` | feat: etapa 2 orquestracao dev com docker compose e postgresql com healthcheck |
| 3 | `633eeea194d259a7e32532df1ddc7aeddd5f7d0b` | feat: etapa 3 pipeline de ci com github actions e fail-fast |
| 4 | `98f6746e3c9a49d3ad18b9f4bf91c56713ceb0b3` | feat: etapa 4 containers otimizados de producao multi-stage e non-root |
| 5 | `6ab3696263dea8c32f5dc9c40f0ea314eee814a1` | feat: etapa 5 stack de producao com nginx reverse proxy e ssl |
| 6 | `e7614f942f71241ca915a2e1280178d6b3ad24bb` | feat: etapa 6 deploy continuo no ghcr com github actions |
| Manutencao | `1802f62e9650ac2ab7929a4bd9db324eddd0ef72` | fix: ensure npm ci uses legacy-peer-deps on frontend ci |

---
Laboratorio AILAB Makers · PSPD-UnB
