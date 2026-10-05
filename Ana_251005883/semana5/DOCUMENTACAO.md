# Semana 5 - Containerizacao e CI/CD

## 1. Identificacao

- Integrante: Ana Clara Teixeira Guimarães
- Repositorio: https://github.com/anacllaraxy/semana5

## 2. Arquitetura

- Stack: Django (backend), Next.js App Router (frontend), PostgreSQL 16 (banco), Nginx (proxy reverso), GitHub Actions e GHCR.
- Servicos:
  - backend: Django com endpoint `/api/health/` que retorna JSON. Le as credenciais do PostgreSQL por variaveis de ambiente.
  - frontend: Next.js, pagina `app/page.js` que faz fetch do endpoint e mostra os dados.
  - db: PostgreSQL com volume nomeado.
  - nginx: apenas em producao, unico servico exposto (portas 80 e 443).
- Fluxo de comunicacao:
  - DEV: o frontend (porta 3000) chama `/api/health/`, o Next.js encaminha para o backend (porta 8000), que acessa o banco em `db:5432` pela rede interna do Compose.
  - PROD: o navegador acessa o Nginx. `/api/` e `/admin/` vao para `backend:8000` e `/` vai para `frontend:3000`.

## 3. Etapa 1 - DEV

- Implementacao: `backend/Dockerfile` (python:3.12-slim, `runserver 0.0.0.0:8000`, DEBUG=True) e `frontend/Dockerfile` (node:20-alpine, `npm run dev`), cada um com `.dockerignore`.
- Validacao: cada container executado com `docker run -v ... -p ...`. Ao editar o `views.py` e o `page.js` no host, a alteracao apareceu no navegador sem novo build.
- Evidencias: JSON do backend em `127.0.0.1:8000/api/health/` e pagina do frontend em `localhost:3000` com "Status: ok".
- Commit: `d71940b` - feat(etapa-1): Dockerfiles de desenvolvimento para backend e frontend

## 4. Etapa 2 - Docker Compose

- Implementacao: `docker-compose.yml` na raiz com backend, frontend e db na mesma rede interna. O backend acessa o banco por `db:5432`. So o `.env.example` e versionado.
- Healthcheck: o `db` usa `pg_isready`. O backend so inicia depois que o banco fica saudavel (`depends_on` com `service_healthy`).
- Persistencia: volume nomeado `postgres_data` em `/var/lib/postgresql/data`.
- Validacao: `docker compose up --build` subiu a stack sem falhas. O log mostrou o db "Healthy" antes do backend e do frontend, e a pagina exibiu os dados da API.
- Commit: `9713a23` - feat(etapa-2): docker compose com postgres, healthcheck e volume

## 5. Etapa 3 - CI

- Jobs do backend: `lint-backend` (flake8), `build-backend` (docker build) e `test-backend` (`python manage.py test`).
- Jobs do frontend: `lint-frontend` (ESLint), `build-frontend` (`npm run build`) e `test-frontend` (`npm test`, Jest).
- Fail-Fast: `build-*` depende de `lint-*` e `test-*` depende de `build-*` (`needs`). As duas trilhas sao independentes. Foram feitas tres falhas controladas, cada uma corrigida em seguida:
  - Lint: avisos W293 e W292 no `tests.py`. O lint falhou e build e test foram pulados.
  - Build: linha `COPY` de arquivo inexistente no Dockerfile. O build falhou e o test foi pulado; a trilha do frontend continuou verde.
  - Teste: asserção trocada de 200 para 404. O test-backend falhou; o frontend continuou verde.
  - Ao final, as duas trilhas ficaram verdes.
- Cache: `cache: 'pip'` no backend e `cache: 'npm'` no frontend.
- Evidencias: aba Actions do repositorio, com as execucoes que falharam e a execucao final com os 6 jobs verdes.
- Commit:
  - `06e463a` - (etapa-3) pipeline de CI
  - `10ef07c` - (etapa - 3) corrigir erro
  - `d33a62d` - (etapa 3) pipeline do CI Frontend
  - `a44c98e` - test(etapa-3): falha controlada de build
  - `4faf3ea` - fix(etapa-3): corrige falha de build
  - `d98f97d` - (etapa 3)test corrigido
  - `a0e6ad2` - (etapa 3)falha do controle de test
  - `5b1823e` - (etapa 3)falha do controle de test corrigido
  - `72ca21c` - (etapa 3)falha do controle de test corrigido 2

## 6. Etapa 4 - Producao

- Backend: `backend/Dockerfile.prod` com python:3.12-alpine e `gunicorn config.wsgi:application --bind 0.0.0.0:8000`.
- Frontend: `frontend/Dockerfile.prod` com `output: 'standalone'` no `next.config.mjs`.
- Multi-stage: tres estagios (`deps`, `builder`, `runner`). O estagio final copia apenas `.next/standalone`, `.next/static` e `public`.
- Usuarios nao-root: `app` no backend e `nextjs` no frontend (confirmado com `docker run ... whoami`).
- Tamanho final das imagens:

| Imagem | Compactada | Em disco |
|---|---|---|
| backend dev | 57,9 MB | 265 MB |
| backend prod | 37,6 MB | 173 MB |
| frontend dev | 262 MB | 994 MB |
| frontend prod | 64,2 MB | 261 MB |

  A imagem de producao do frontend tem 64,2 MB de conteudo, abaixo de 150 MB. Em disco ela ocupa 261 MB porque a imagem base node:20-alpine ja tem 194 MB.
- Commit:
  - `c68da6b` - feat(etapa-4): Dockerfile.prod do backend e do frontend (multi-stage, standalone, nao-root)
  - `6d91665` - feat(etapa-4): Dockerfile.prod do backend (gunicorn, usuario nao-root)

## 7. Etapa 5 - Nginx e SSL

- Reverse proxy: `nginx/nginx.conf` roteia `/api/` e `/admin/` para `backend:8000` e `/` para `frontend:3000`.
- Portas expostas: no `docker-compose-prod.yml` somente o nginx publica portas (80 e 443). Backend, frontend e db usam apenas `expose`.
- HTTPS: porta 443 com certificado autoassinado, montado em `nginx/certs/` (nao versionado). Gerado com:

```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/selfsigned.key \
  -out nginx/certs/selfsigned.crt \
  -subj "/CN=localhost"
```

- Redirecionamento: a porta 80 responde `301` para `https://`.
- Validacao:
  - `docker compose -f docker-compose-prod.yml ps`: so o nginx mostra portas publicadas.
  - `curl -I http://localhost`: `301 Moved Permanently` com `Location: https://localhost/`.
  - `curl -k https://localhost/api/health/`: JSON com `"status":"ok"`.
  - `curl` em `localhost:8000` e `localhost:3000`: sem conexao.
- Commit: `811dd7c` - feat(etapa-5): stack de producao com nginx, https e portas isoladas

## 8. Etapa 6 - GHCR

- Imagens publicadas:
  - `ghcr.io/anacllaraxy/semana5-backend`
  - `ghcr.io/anacllaraxy/semana5-frontend`
- Tags: `latest` e `${{ github.sha }}` em cada imagem. Os jobs `deploy-backend` e `deploy-frontend` dependem de `test-backend` e `test-frontend`.
- Permissoes: `contents: read` e `packages: write`, com login usando o `GITHUB_TOKEN` automatico.
- Evidencias: execucao CI #13 com sucesso, pacotes em https://github.com/anacllaraxy?tab=packages e `docker pull` das duas imagens funcionando.
- Commit: `7c9feae` - feat(etapa-6): deploy continuo das imagens de producao no GHCR

## 9. Validacao Final

- Comandos executados: `docker compose up --build`, `docker compose -f docker-compose-prod.yml up -d --build`, `curl -I http://localhost`, `curl -k https://localhost/api/health/`, `docker pull` das imagens do GHCR e `git push` acionando o pipeline.
- Resultados: os 8 jobs do pipeline passaram (lint, build, test e deploy de backend e frontend). A stack de producao funcionou com HTTPS, redirecionamento e portas isoladas, e as imagens foram publicadas no GHCR.
- Limitacoes: o certificado e autoassinado, entao o navegador mostra aviso de seguranca (uso apenas local). O Django mostra aviso de migracoes nao aplicadas, que nao afeta o endpoint.

## 10. Historico Git

| Etapa | Commit | Descricao |
|---|---|---|
| 1 | `d71940b` | Dockerfiles de desenvolvimento do backend e do frontend |
| 2 | `9713a23` | Docker Compose com postgres, healthcheck e volume |
| 3 | `06e463a` a `72ca21c` | Pipeline de CI das duas trilhas e as tres falhas controladas |
| 4 | `c68da6b` e `6d91665` | Dockerfile.prod do frontend e do backend |
| 5 | `811dd7c` | Nginx, HTTPS e portas isoladas |
| 6 | `7c9feae` | Deploy das imagens no GHCR |
