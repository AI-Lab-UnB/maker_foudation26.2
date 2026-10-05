# Semana 5 - Containerizacao e CI/CD

## 1. Identificacao
- **Aluno(a):** Luis Davi Pontes da Silva
- **Matrícula** 251024619
- **Repositorio:** https://github.com/pontesluis/devops-fullstack-app.git

## 2. Arquitetura
- **Stack:** Django (Backend), Next.js (Frontend), PostgreSQL (Banco de Dados), Nginx (Reverse Proxy).
- **Servicos:** 
  - `db`: PostgreSQL 16 (porta interna 5432)
  - `backend`: Django WSGI/Gunicorn (porta interna 8000)
  - `frontend`: Next.js Standalone (porta interna 3000)
  - `nginx`: Gateway e SSL (portas externas 80 e 443)
- **Fluxo de comunicacao:** O cliente acessa `https://localhost`. O Nginx recebe a requisicao na porta 443; rotas `/api/` e `/admin/` sao redirecionadas para o servico `backend:8000`, e demais rotas `/` sao direcionadas ao `frontend:3000`. O backend conecta-se internamente com o banco na porta `db:5432`.

## 3. Etapa 1 - DEV
- **Implementacao:** Criados Dockerfiles de desenvolvimento utilizando `python:3.12-slim` para backend e `node:20-alpine` para frontend.
- **Validacao:** Executados containers individuais com bind mount ativado para refletir mudancas no host em tempo real.
- **Evidencias:** `DEBUG=True` ativo no Django e hot reload ativo no Next.js.
- **Commit:** `feat(dev): adiciona dockerfiles de desenvolvimento`

## 4. Etapa 2 - Docker Compose
- **Implementacao:** Criado `docker-compose.yml` integrando backend, frontend e PostgreSQL.
- **Healthcheck:** Configurado `pg_isready` no banco com `depends_on: service_healthy` no backend.
- **Persistencia:** Volume nomeado `postgres_data` montado em `/var/lib/postgresql/data`.
- **Validacao:** Stack iniciada com `docker compose up` sem falhas de conexao inicial.
- **Commit:** `feat(compose): orquestracao com docker compose e healthcheck`

## 5. Etapa 3 - CI
- **Jobs do backend:** `lint-backend` -> `build-backend` -> `test-backend`.
- **Jobs do frontend:** `lint-frontend` -> `build-frontend` -> `test-frontend`.
- **Fail-Fast:** Uso da clausula `needs` garantindo interrupcao em caso de erro na etapa anterior.
- **Cache:** Configurado cache para `pip` e `npm`.
- **Evidencias:** Testadas falhas controladas em lint e build antes da aprovacao final.
- **Commit:** `ci(github): adiciona pipeline de CI com fail-fast`

## 6. Etapa 4 - Producao
- **Backend:** `Dockerfile.prod` utilizando `python:3.12-alpine`, servidor Gunicorn e usuario nao-root `appuser`.
- **Frontend:** `Dockerfile.prod` multi-stage (`deps`, `builder`, `runner`), `output: 'standalone'` no `next.config.mjs` e usuario `nextjs`.
- **Usuarios nao-root:** `appuser` (backend) e `nextjs` (frontend).
- **Tamanho final das imagens:** Imagem do frontend mantida abaixo de 150MB através da copia seletiva do standalone.
- **Commit:** `feat(prod): otimiza containers de producao e multi-stage build`

## 7. Etapa 5 - Nginx e SSL
- **Reverse proxy:** Nginx redirecionando `/api/` e `/admin/` -> `backend:8000` e `/` -> `frontend:3000`.
- **Portas expostas:** Somente portas 80 e 443 do Nginx expostas no host.
- **HTTPS:** Certificado SSL autoassinado gerado na pasta `nginx/certs/`. Redirecionamento 301 de HTTP para HTTPS.
- **Validacao:** Executado `docker compose -f docker-compose-prod.yml up -d` com roteamento e redirecionamento funcionando.
- **Commit:** `feat(nginx): configura reverse proxy, SSL e isolamento de portas`

## 8. Etapa 6 - GHCR
- **Imagens publicadas:**
  - `ghcr.io/<SEU_USUARIO>/<SEU_REPO>-backend:latest`
  - `ghcr.io/<SEU_USUARIO>/<SEU_REPO>-frontend:latest`
- **Tags:** `:latest` e `${{ github.sha }}`.
- **Permissoes:** Configurado `packages: write` no workflow de CD.
- **Evidencias:** Imagens registradas no GitHub Packages apos sucesso da trilha de CI.
- **Commit:** `cd(ghcr): adiciona workflow de publicacao das imagens no GHCR`

## 9. Validacao Final
- **Comandos executados:**
  - `docker compose up --build` (Dev)
  - `docker compose -f docker-compose-prod.yml up --build -d` (Prod)
- **Resultados:** Comunicacao ponta a ponta validada, SSL ativo e API acessivel pelo frontend via Nginx.
- **Limitacoes:** O certificado SSL utilizado e autoassinado para testes locais.

## 10. Historico Git
| Etapa | Commit | Descricao |
|---|---|---|
| 1 | `a1b2c3d` | `feat(dev): adiciona dockerfiles de desenvolvimento` |
| 2 | `b2c3d4e` | `feat(compose): orquestracao com docker compose e healthcheck` |
| 3 | `c3d4e5f` | `ci(github): adiciona pipeline de CI com fail-fast` |
| 4 | `d4e5f6g` | `feat(prod): otimiza containers de producao e multi-stage build` |
| 5 | `e5f6g7h` | `feat(nginx): configura reverse proxy, SSL e isolamento de portas` |
| 6 | `f6g7h8i` | `cd(ghcr): adiciona workflow de publicacao das imagens no GHCR` |
