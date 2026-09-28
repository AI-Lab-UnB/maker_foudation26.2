# Semana 5 - Containerização e CI/CD

## 1. Identificação

- Equipe: Individual
- Integrantes: Letícia da Silva Pereira
- Repositório: https://github.com/leticiadsp/semana5-dev-ao-deploy
- Descrição: Containerização e automação de CI/CD de uma aplicação desacoplada (Django + Next.js + PostgreSQL + Nginx), adaptando o desafio "Do Dev ao Deploy" do curso PSPD-UnB para GitHub Actions e GitHub Container Registry (GHCR).

## 2. Arquitetura

- Stack: Django (backend), Next.js App Router (frontend), PostgreSQL (banco), Nginx (reverse proxy, apenas em produção).

- Serviços:
  - backend: Django, expõe o endpoint REST `/api/health/` com payload JSON de status
  - frontend: Next.js, consome o endpoint do backend e renderiza os dados na página inicial
  - db: PostgreSQL, com persistência via volume nomeado `postgres_data`

- Fluxo de comunicação:
  - Em desenvolvimento, o frontend (porta 3000) chama diretamente o backend (porta 8000), que acessa o banco pelo nome de serviço `db:5432` na rede interna do Compose.
  - Em produção, apenas o Nginx é exposto (portas 80 e 443) e encaminha `/api/` e `/admin/` para o backend e o restante para o frontend.

## 3. Etapa 1 - DEV

- Implementação: Dockerfiles de desenvolvimento para backend e frontend.
  - Backend: `python:3.12-slim`, instala `requirements.txt` e roda `python manage.py runserver 0.0.0.0:8000` com `DEBUG=True`.
  - Frontend: `node:20-alpine`, instala dependências e roda `npm run dev` com hot reload.

- Validação: cada container foi executado individualmente com `docker run` usando bind mounts (`-v`) e mapeamento de portas (`-p`). Alterações nos arquivos do host apareceram no navegador sem novo build.

- Evidências: execução local com hot reload funcionando.

- Commit:
  - Etapa 1: Dockerfile de desenvolvimento do backend com endpoint /api/health/
  - Etapa 1: Dockerfile de desenvolvimento do frontend com hot reload

## 4. Etapa 2 - Docker Compose

- Implementação: `docker-compose.yml` na raiz integrando backend, frontend e db em uma rede interna. O backend acessa o banco por `db:5432`.

- Healthcheck: o serviço `db` usa `pg_isready`, e o backend só inicia após o banco ficar saudável (`depends_on` com `condition: service_healthy`).

- Persistência: volume nomeado `postgres_data` em `/var/lib/postgresql/data`.

- Validação: `docker compose up` sobe a stack sem falhas de prontidão do banco.

- Commit: Etapa 2: Docker Compose com backend, frontend e banco PostgreSQL

## 5. Etapa 3 - CI

### Jobs
- Backend: `lint-backend` (flake8, `--max-line-length=120`), `build-backend` (`docker build` da imagem) e `test-backend` (`python manage.py test` com um serviço PostgreSQL do próprio workflow).
- Frontend: `lint-frontend` (`npm run lint`), `build-frontend` (`npm run build`) e `test-frontend` (`npm test`).

### Sequência (needs)
Cada trilha segue lint → build → test: `build-*` depende de `lint-*` e `test-*` depende de `build-*`.

### Cache
`cache: 'pip'` no backend e `cache: 'npm'` no frontend.

### Evidências do Fail-Fast
Durante o desenvolvimento, o pipeline falhou de formas reais, sempre interrompendo apenas a trilha afetada:
1. Lint do backend: o flake8 apontou 8 problemas (imports não usados, linhas em branco, falta de quebra de linha no final do arquivo, import fora do topo), corrigidos um a um.
2. Build do frontend: o TypeScript não reconhecia `test` e `expect`; corrigido com `@types/jest` e `"types"` no `tsconfig.json`.
3. Test do backend: o Django tinha o host do banco fixo em `'db'`, inexistente no GitHub Actions. Corrigido lendo `POSTGRES_HOST` do ambiente (`os.environ.get('POSTGRES_HOST', 'db')`) e adicionando um serviço PostgreSQL ao job, com credenciais em secrets do repositório.
4. Sintaxe do workflow: `secrets` não é permitido no campo `options` do healthcheck; a referência foi removida.

Ao final, as duas trilhas ficaram verdes.

- Commit:
  - Etapa 3: pipeline de CI com lint, build e testes
  - corrige lint do backend e types do jest no frontend
  - adiciona banco postgres no test-backend do CI
  - corrige healthcheck do postgres no CI
  - le POSTGRES_HOST do ambiente no settings.py

## 6. Etapa 4 - Produção

- Backend: `backend/Dockerfile.prod` com `python:3.12-alpine` e servidor `gunicorn config.wsgi:application --bind 0.0.0.0:8000`.

- Frontend: `frontend/Dockerfile.prod` multi-stage, com `output: "standalone"` no `next.config.ts`.

- Multi-stage: três estágios (`deps`, `builder`, `runner`). O estágio final copia apenas `.next/standalone`, `.next/static` e `public`.

- Usuários não-root: `appuser` no backend e `nextjs` no frontend.

- Tamanho final: `backend-prod` com 34.3 MB e `frontend-prod` com 64.2 MB de conteúdo próprio, abaixo do limite de 150 MB e bem menor que a imagem de desenvolvimento do frontend (341 MB).

- Validação: os dois containers foram executados com `docker run`. O backend respondeu `/api/health/` com HTTP 200 e o JSON esperado, e o frontend carregou normalmente.

- Correção adicional: o frontend ainda exibia a página padrão do Next.js. Foi implementado o `fetch` do endpoint em `app/page.tsx`, o que expôs um bloqueio de CORS, resolvido com `django-cors-headers` autorizando `http://localhost:3000`.

- Commit:
  - Etapa 4: Dockerfiles de producao com multi-stage e usuarios nao-root
  - Etapa 4: Dockerfiles de producao, CORS e frontend consumindo API do backend

## 7. Etapa 5 - Nginx e SSL

- Reverse proxy: `nginx/nginx.conf` com dois blocos `server`. A porta 80 redireciona para HTTPS (`return 301`). A porta 443 usa SSL e roteia `/api/` e `/admin/` para `backend:8000` e `/` para `frontend:3000`.

- Portas expostas: no `docker-compose-prod.yml`, somente o `nginx` publica portas (80 e 443). `db`, `backend` e `frontend` ficam acessíveis apenas pela rede interna.

- HTTPS: certificado autoassinado gerado com `openssl` (via container `alpine/openssl`, pois o Windows não tem a ferramenta), em `nginx/certs/`, montado como volume somente leitura.

- Redirecionamento: `http://localhost` é redirecionado automaticamente para `https://localhost`.

- Validação: `docker compose -f docker-compose-prod.yml up -d` subiu os 4 containers (db healthy). Em `https://localhost` a página exibiu "Status: ok" com a lista vinda do backend através do Nginx.

- Correção adicional: como o backend deixou de expor a porta 8000, o `fetch` com `http://localhost:8000` quebrou em produção. Foi criada a variável `NEXT_PUBLIC_API_URL`, definida como `/api` no `Dockerfile.prod`, mantendo `http://localhost:8000/api` como padrão em desenvolvimento.

- Commit: Etapa 5: Nginx com SSL, redirecionamento HTTPS e roteamento para backend e frontend

## 8. Etapa 6 - GHCR

- Imagens publicadas: `ghcr.io/leticiadsp/semana5-dev-ao-deploy-backend` e `ghcr.io/leticiadsp/semana5-dev-ao-deploy-frontend`, publicadas pelos jobs `deploy-backend` e `deploy-frontend`, que só rodam após `test-backend` e `test-frontend` passarem.

- Tags: `latest` e `${{ github.sha }}` em cada imagem.

- Permissões: `contents: read` e `packages: write`, com autenticação pelo `GITHUB_TOKEN` automático.

- Evidências: pacotes visíveis em https://github.com/leticiadsp/semana5-dev-ao-deploy/pkgs/container/semana5-dev-ao-deploy-backend (e equivalente para o frontend).

- Correção adicional: o `test-frontend` falhou porque o teste ainda verificava a página padrão do Next.js e o `fetch` não tinha backend no ambiente de teste. O teste foi reescrito com mock do `fetch`, validando o texto "Status: ok".

- Commit:
  - Etapa 6: publica imagens de producao no GHCR
  - corrige teste do frontend com mock do fetch

## 9. Validação Final

- Comandos executados:
  - `docker build` e `docker run` de `backend-prod` e `frontend-prod`
  - `docker compose -f docker-compose-prod.yml up -d`
  - Requisição a `http://localhost:8000/api/health/` (backend isolado)
  - Acesso a `https://localhost` no navegador
  - `git push` acionando as 8 trilhas do `ci.yml`

- Resultados: as 8 trilhas do pipeline (lint, build, test e deploy de backend e frontend) passaram. A stack de produção funciona de ponta a ponta: banco com persistência e healthcheck, API respondendo, frontend consumindo os dados via Nginx, HTTPS com redirecionamento e imagens publicadas no GHCR.

- Limitações: o certificado é autoassinado (aviso de segurança esperado no navegador) e serve apenas para testes locais.

## 10. Histórico Git

| Etapa | Commit | Descrição |
|---|---|---|
| 1 | Etapa 1: Dockerfile de desenvolvimento do frontend com hot reload | Containerização de DEV |
| 2 | Etapa 2: Docker Compose com backend, frontend e banco PostgreSQL | Orquestração com Docker Compose |
| 3 | le POSTGRES_HOST do ambiente no settings.py | Pipeline de CI e correções do Fail-Fast |
| 4 | Etapa 4: Dockerfiles de producao, CORS e frontend consumindo API do backend | Containers de produção |
| 5 | Etapa 5: Nginx com SSL, redirecionamento HTTPS e roteamento para backend e frontend | Nginx, SSL e stack de produção |
| 6 | corrige teste do frontend com mock do fetch | Deploy contínuo e publicação no GHCR |
