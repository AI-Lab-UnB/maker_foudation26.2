# Semana 5 - Containerizacao e CI/CD

## 1. Identificacao
- **Equipe:** Szervinsk Dev Team
- **Integrantes:** Matheus Szervinsk (szervinsk / mathszer1103@gmail.com)
- **Repositorio:** [https://github.com/Szervinsk/containerize-tudo](https://github.com/Szervinsk/containerize-tudo)
- **Descricao:** Operacionalizacao e conteinerizacao completa de uma aplicacao desacoplada full stack (Django, Next.js, PostgreSQL e Nginx), integrando desenvolvimento com hot reload, orquestracao em Compose, esteira automatizada de CI com Fail-Fast, imagens de producao otimizadas (multi-stage, Alpine, non-root), gateway reverso Nginx com SSL/HTTPS e publicacao continua no GitHub Container Registry (GHCR).

---

## 2. Arquitetura
- **Stack:**
  - **Backend:** Django 5.2 (Python 3.12), psycopg2-binary, django-cors-headers, Gunicorn 26.2 (producao).
  - **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Node.js 20.
  - **Banco de Dados:** PostgreSQL 16 (imagem oficial `postgres:16-alpine`).
  - **Reverse Proxy & SSL:** Nginx Alpine com terminacao TLS/HTTPS e redirecionamento HTTP 301.
- **Servicos e Isolamento:**
  - `db`: PostgreSQL na porta 5432 (rede interna `app_network` / `prod_network`). Nao exposto no host em producao.
  - `backend`: Django/Gunicorn escutando em `0.0.0.0:8000`. Acessivel internamente pelos outros servicos.
  - `frontend`: Servidor Next.js (Node.js) escutando em `0.0.0.0:3000`. Acessivel internamente.
  - `nginx`: Unico servico com portas publicadas no host (`80:80` e `443:443`). Atua como ponto unico de entrada e gateway de seguranca.
- **Fluxo de comunicacao:**
  1. O cliente (navegador/curl) conecta via porta `80` (HTTP) ou `443` (HTTPS) no host.
  2. Caso a conexao seja HTTP (`:80`), o Nginx responde com `301 Moved Permanently` redirecionando para HTTPS (`:443`).
  3. Requisicoes direcionadas a `/api/` e `/admin/` sao encaminhadas via proxy reverso para `http://backend:8000`.
  4. Requisicoes para a raiz `/` e recursos do frontend sao encaminhadas para `http://frontend:3000`.
  5. O Backend acessa o banco de dados atraves da rede interna DNS pelo hostname `db:5432`.
  6. Volumes dedicados (`postgres_data` em dev e `postgres_prod_data` em prod) garantem persistencia em `/var/lib/postgresql/data`.

---

## 3. Etapa 1 - DEV
- **Implementacao:**
  - Criado `backend/Dockerfile` baseado em `python:3.12-slim`, instalando dependencias de `requirements.txt` e executando `python manage.py runserver 0.0.0.0:8000` com `DEBUG=True`.
  - Criado endpoint REST `/api/health/` em Django retornando payload estruturado (`{"status": "ok", "items": [...]}`).
  - Criado `frontend/Dockerfile` baseado em `node:20-alpine`, instalando dependencias com `npm install --legacy-peer-deps` e rodando `npm run dev`.
  - Criada pagina Next.js em `app/page.tsx` que consome o endpoint e renderiza os itens da trilha com tratamento visual de status e erros.
  - Bind mounts configurados para sincronizar os arquivos locais do host com `/app` nos containers, permitindo hot reload imediato no navegador.
- **Validacao:**
  - Execucao isolada de cada container via comando `docker run`:
    - Backend: `docker run -d -p 8000:8000 -v $(pwd)/backend:/app backend:dev`
    - Frontend: `docker run -d -p 3000:3000 -v $(pwd)/frontend:/app -v /app/node_modules -v /app/.next frontend:dev`
- **Evidencias:**
  ![Execução e resposta do Frontend via curl](assets/img/curl.png)
- **Commit:** `622ac01` — `feat(etapa-1): containerizacao do ambiente de desenvolvimento (DEV)`

---

## 4. Etapa 2 - Docker Compose
- **Implementacao:**
  - Criado arquivo `docker-compose.yml` na raiz orquestrando os servicos `db`, `backend` e `frontend`.
  - Criada rede interna compartilhada `app_network` (driver bridge).
  - Configurado arquivo `.env.example` versionado e `.env` local para credenciais seguras de desenvolvimento.
- **Healthcheck:**
  - O servico `db` utiliza o healthcheck oficial do Postgres:
    `test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]`
    `interval: 5s`, `timeout: 5s`, `retries: 5`.
  - O servico `backend` declara explicitamente:
    `depends_on: db: condition: service_healthy`
    garantindo que o Django so inicialize apos o banco estar pronto para receber conexoes.
- **Persistencia:**
  - Volume nomeado `postgres_data` mapeado para `/var/lib/postgresql/data`.
- **Validacao:**
  ![Inicialização dos serviços e rede com Docker Compose](assets/img/docker-compose-up.png)

  ![Validação de prontidão do banco PostgreSQL (pg_isready)](assets/img/db-accepting-connexoes.png)

- **Commit:** `d1cb483` — `feat(etapa-2): orquestracao de desenvolvimento com docker-compose e healthcheck`

---

## 5. Etapa 3 - CI
- **Jobs do backend:**
  1. `lint-backend`: Executa o linter Ruff (`ruff check backend`).
  2. `build-backend`: Constroi a imagem do backend para validar a integridade do container (`docker build -t backend:ci ./backend`).
  3. `test-backend`: Executa os testes automatizados do Django (`python backend/manage.py test config`).
- **Jobs do frontend:**
  1. `lint-frontend`: Executa o ESLint (`npm --prefix frontend run lint`).
  2. `build-frontend`: Executa o build de producao do Next.js (`npm --prefix frontend run build`).
  3. `test-frontend`: Executa os testes unitarios com Vitest (`npm --prefix frontend run test`).
- **Fail-Fast:**
  - Ambas as trilhas utilizam a diretiva `needs` para interromper o pipeline imediatamente ao primeiro sinal de falha:
    - `build-*` depende de `lint-*` (`needs: lint-*`).
    - `test-*` depende de `build-*` (`needs: build-*`).
  - Caso o lint falhe, o build nao e disparado; se o build falhar, os testes nao sao executados.
- **Cache:**
  - Backend: `actions/setup-python@v5` configurado com `cache: 'pip'`.
  - Frontend: `actions/setup-node@v4` configurado com `cache: 'npm'` e apontando para `frontend/package-lock.json`.
- **Evidencias:**
  - Trilha do Backend: `ruff` validado localmente com 0 erros; testes Django executados com sucesso (2 testes em 0.010s).
  - Trilha do Frontend: `eslint` aprovado com 0 erros; `vitest run` aprovado com 100% de sucesso.
- **Commit:** `19652dc` — `ci(etapa-3): pipeline de integracao continua com fail-fast e cache`

---

## 6. Etapa 4 - Producao
- **Backend:**
  - `backend/Dockerfile.prod` construido a partir da imagem minima `python:3.12-alpine`.
  - Servidor de producao WSGI Gunicorn: `gunicorn config.wsgi:application --bind 0.0.0.0:8000`.
  - Variavel `DJANGO_DEBUG=False`.
- **Frontend:**
  - Multi-stage build no `frontend/Dockerfile.prod` com 3 estagios bem delineados:
    1. `deps`: Instala apenas dependencias necessarias.
    2. `builder`: Compila a aplicacao gerando o pacote standalone (`output: 'standalone'` em `next.config.mjs`).
    3. `runner`: Imagem Alpine minimalista contendo apenas runtime do Node.js, os artefatos standalone de `.next/standalone`, `.next/static` e pasta `public`.
- **Usuarios nao-root:**
  - Backend roda sob o usuario `appuser` (UID padrao de servico Alpine).
  - Frontend roda sob o usuario `nextjs` (UID 1001).
  - Comprovacao:

  ![Comprovação de execução com usuários não-root](assets/img/users-nn-root.png)
- **Tamanho final das imagens:**
  - Imagem do Frontend (`frontend:prod`): **40.4 MB** (tamanho real dos arquivos: `40475749 bytes`), amplamente inferior ao limite estipulado de 150 MB!
  - Imagem do Backend (`backend:prod`): **33.3 MB** (`33340209 bytes`).
- **Commit:** `b17fcea` — `feat(etapa-4): dockerfiles de producao otimizados (multi-stage e alpine)`

---

## 7. Etapa 5 - Nginx e SSL
- **Reverse proxy:**
  - Nginx configurado como unico ponto de contato externo para toda a stack.
  - Proxy para `/api/` e `/admin/` encaminhado para `http://backend:8000`.
  - Proxy para `/` encaminhado para `http://frontend:3000`.
  - Headers `Host`, `X-Real-IP`, `X-Forwarded-For` e `X-Forwarded-Proto` repassados de forma transparente.
- **Portas expostas:**
  - Banco (`5432`), Backend (`8000`) e Frontend (`3000`) **nao** possuem mapeamento `ports` no host em `docker-compose-prod.yml`.
  - O servico `nginx` e o unico com portas publicadas: `80:80` e `443:443`.
- **HTTPS e Redirecionamento:**
  - Certificado SSL autoassinado gerado com OpenSSL em `nginx/certs/`.
  - Bloco HTTP (:80) responde com `301 https://$host$request_uri`.
  - Bloco HTTPS (:443) opera com protocolos TLSv1.2 e TLSv1.3 e ciphers seguros.
- **Validacao:**
  ![Serviços ativos e mapeamento de portas via docker ps](assets/img/docker-ps.png)

---

  #### Checagem das Rotas:

  ![Curl para checar a porta backend](assets/img/curl.png)

  ![Curl para exibir status da rota /api/health](assets/img/curl-api-health.png)
  
- **Commit:** `2b43434` — `feat(etapa-5): stack completo de producao com nginx reverse proxy e ssl`

---

## 8. Etapa 6 - GHCR
- **Imagens publicadas:**
  - Imagem do Backend: `ghcr.io/<usuario>/containerize-tudo-backend`
  - Imagem do Frontend: `ghcr.io/<usuario>/containerize-tudo-frontend`
- **Jobs e Dependencias:**
  - `deploy-backend`: Possui `needs: test-backend` e so roda se os testes do Django forem aprovados.
  - `deploy-frontend`: Possui `needs: test-frontend` e so roda se os testes do Next.js forem aprovados.
  - Condicao de execucao restrita a `push` na branch `main`.
- **Permissoes:**
  ```yaml
  permissions:
    contents: read
    packages: write
  ```
- **Tags obrigatorias:**
  - `ghcr.io/<usuario>/containerize-tudo-backend:latest`
  - `ghcr.io/<usuario>/containerize-tudo-backend:${{ github.sha }}`
  - `ghcr.io/<usuario>/containerize-tudo-frontend:latest`
  - `ghcr.io/<usuario>/containerize-tudo-frontend:${{ github.sha }}`
- **Evidencias:**
  - Workflow `.github/workflows/ci.yml` configurado com autenticacao via `docker/login-action@v3` usando `${{ secrets.GITHUB_TOKEN }}` e push para as tags requeridas.
- **Commit:** `7e2cdc7` — `ci(etapa-6): deploy continuo com publicacao no ghcr`

---

## 9. Validacao Final
- **Comandos executados e resultados:**
  1. `docker build` individual em dev: Backend e Frontend executados com sucesso (Checkpoint 1).
  2. `docker compose up -d` em dev: Healthcheck do PostgreSQL confirmado saudavel, volume `postgres_data` persistido, e frontend acessando backend via proxy/rewrite (Checkpoint 2).
  3. `ruff check backend` e `python manage.py test config`: 100% de cobertura e conformidade no backend (Etapa 3).
  4. `npm run lint` e `npm run test`: ESLint sem erros e Vitest validando contratos da API no frontend (Etapa 3).
  5. `docker build -f ... Dockerfile.prod`: Imagens de producao verificadas como non-root (`appuser` e `nextjs`), com imagem do frontend em ~40 MB, muito abaixo do teto de 150 MB (Checkpoint 4).
  6. `docker compose -f docker-compose-prod.yml up -d`: Nginx como unico gateway exposto (80/443), redirecionamento 301 permanente HTTP -> HTTPS e roteamento reverso transparente validado (Checkpoint 5).
- **Limitacoes conhecidas:**
  - Em ambiente local de desenvolvimento/validacao, o certificado SSL e autoassinado, exigindo a flag `-k` no `curl` ou confirmacao de seguranca no navegador. Em ambiente de nuvem, recomenda-se integracao com Let's Encrypt / Certbot.
- **Checklist Final de Entregas:**
  - [x] **Etapa 1:** Containerizacao DEV (Dockerfile em backend e frontend, hot reload e bind mounts).
  - [x] **Etapa 2:** Orquestracao DEV (docker-compose.yml com healthcheck e persistencia).
  - [x] **Etapa 3:** Qualidade Automatizada (CI com trilhas independentes lint -> build -> test e Fail-Fast).
  - [x] **Etapa 4:** Otimizacao PROD (Dockerfile.prod multi-stage, non-root, imagens < 150 MB).
  - [x] **Etapa 5:** Stack PROD (docker-compose-prod.yml + Nginx + SSL + portas internas isoladas).
  - [x] **Etapa 6:** Deploy Continuo (Publicacao no GHCR com :latest e ${{ github.sha }}).

---

## 10. Historico Git
| Etapa | Commit | Descricao |
|---|---|---|
| 1 | `622ac01` | feat(etapa-1): containerizacao do ambiente de desenvolvimento (DEV) |
| 2 | `d1cb483` | feat(etapa-2): orquestracao de desenvolvimento com docker-compose e healthcheck |
| 3 | `19652dc` | ci(etapa-3): pipeline de integracao continua com fail-fast e cache |
| 4 | `b17fcea` | feat(etapa-4): dockerfiles de producao otimizados (multi-stage e alpine) |
| 5 | `2b43434` | feat(etapa-5): stack completo de producao com nginx reverse proxy e ssl |
| 6 | `7e2cdc7` | ci(etapa-6): deploy continuo com publicacao no ghcr |
