# Resumo de Aprendizados — Semana 5: Containerização e CI/CD

Notas de estudo sobre os vídeos, jogos e plataformas indicados no material da semana, e como cada um se conecta com as entregas práticas (containerização da stack Django + Next.js + Postgres + Nginx e o pipeline de CI/CD real no GitHub Actions).

## Vídeos

### Docker do Zero: O que eu faria diferente para aprender? (Diolinux)

- **Container e consistência entre ambientes:** um container empacota a aplicação junto com suas dependências exatas, eliminando o clássico "na minha máquina funciona". Na prática isso apareceu logo na Etapa 1: o backend Django precisa do PostgreSQL via `psycopg2`, mas o Dockerfile de produção usa `python:3.12-alpine`, que não tem wheel pré-compilada para esse pacote — o container só fica consistente porque o Dockerfile instala as dependências de build certas (`gcc`, `musl-dev`, `postgresql-dev`) antes do `pip install`, e não porque "funcionava no Windows".
- **Container vs. máquina virtual:** containers compartilham o kernel do host e isolam só o processo/filesystem, por isso sobem em milissegundos — foi visível na prática: o `db` do `docker-compose.yml` fica "Healthy" em poucos segundos via `pg_isready`, o que permite ao `backend` (com `depends_on: condition: service_healthy`) esperar exatamente o tempo certo, nem mais nem menos.
- **Imagens, containers e registries:** uma imagem é o "molde" (camadas read-only), o container é a instância rodando, e o registry (GHCR, nesta semana) é onde as imagens versionadas ficam guardadas para deploy. Isso ficou concreto na Etapa 6: a mesma imagem de produção do backend foi publicada com duas tags (`latest` e o SHA do commit) no `ghcr.io/osamuelleite/semana5-dev-ao-deploy-backend`.
- **docker pull, docker run e docker ps:** usados o tempo todo durante a semana para testar cada Dockerfile isoladamente antes de orquestrar tudo com Compose (ex: `docker run -v ... -p ...` para validar hot reload do backend e do frontend separadamente, no Checkpoint 1).
- **Mapeamento de portas com -p:** essencial para entender por que, em produção, só o Nginx tem `ports` no `docker-compose-prod.yml` — backend, frontend e banco usam `expose` (ou nada), ficando inacessíveis diretamente pelo host.
- **Limpeza de ambiente com docker system prune:** aplicado na prática várias vezes durante a semana para remover imagens de teste intermediárias (`semana5-backend-dev`, `semana5-frontend-check`, etc.) depois de validar cada etapa, evitando acumular lixo no Docker Desktop.
- **Volumes, Networks, Dockerfile e Docker Compose:** a diferença entre volume nomeado (persistência real, usado em `postgres_data`) e bind mount (sincronizar código do host para hot reload, usado em `./backend:/app`) foi o conceito mais aplicado da semana — inclusive um bug real: o `docker run -v` com caminho Unix-style (`/d/...`) estava sendo reescrito pelo Git Bash para um caminho Windows errado (`C:\Program Files\Git\app`), e só foi diagnosticado comparando a saída de `docker inspect --format '{{json .Mounts}}'` com o que era esperado.

### CI/CD na Prática: Do Commit ao Deploy (Augusto Galego)

- **Continuous Integration, Delivery e Deployment:** CI garante que cada commit é validado automaticamente (lint, build, test); Delivery deixa o artefato pronto para subir; Deployment publica de fato. Nesta semana as três etapas existem como jobs separados e encadeados: `lint-backend → build-backend → test-backend` (CI) e `deploy-backend` (CD, publica no GHCR).
- **Lint, build e testes como barreiras de qualidade:** cada barreira só libera a próxima se passar — e isso foi validado de verdade, não só lido na teoria. Provoquei 3 falhas propositais (import não usado quebrando o lint, Dockerfile referenciando um requirements inexistente quebrando o build, e um `assert` errado quebrando o teste) e observei no GitHub Actions o job seguinte sendo pulado (`skipped`) automaticamente por causa do `needs`.
- **Diferença entre deploy e release:** a imagem chega ao GHCR (deploy) mas isso não significa que está "em produção" para usuários — é só o artefato publicado e taggeado, pronto para alguém decidir rodar.
- **Workflows, runners e needs no GitHub Actions:** `needs: lint-backend` em `build-backend` é literalmente o mecanismo de Fail-Fast do `ci.yml` — sem ele, os jobs rodariam todos em paralelo e um erro de lint não impediria gastar minutos de runner buildando uma imagem quebrada.
- **Secrets e proteção de credenciais:** o job `deploy-backend` usa `secrets.GITHUB_TOKEN` (token automático do próprio Actions, sem precisar cadastrar nada manualmente) para autenticar no GHCR via `docker/login-action` — reforça a "Armadilha Comum" do PDF de nunca versionar credenciais reais (por isso `.env` é local e só `.env.example` vai pro Git).
- **Fluxo completo do git push ao deploy:** resumido no próprio pipeline: `git push` → GitHub Actions dispara `ci.yml` → lint/build/test das duas trilhas → se tudo verde, `deploy-backend`/`deploy-frontend` buildam `Dockerfile.prod` e publicam no GHCR com as tags `latest` e `${{ github.sha }}`.

## Jogos / Plataformas

### docker-game (slecache/docker-game)

- Prática de `docker logs`, `docker inspect`, `docker exec` e `docker cp` em cenários de debugging. Esses comandos não ficaram só no jogo — foram a ferramenta real usada para investigar dois bugs desta semana: `docker logs` revelou o traceback completo do Django tentando resolver o hostname `db` fora do Compose (Etapa 1), e `docker inspect --format '{{json .Mounts}}'` revelou que o bind mount estava apontando para um caminho errado por causa do Git Bash reescrevendo o path.

### GitHub Skills: Hello GitHub Actions / Test with Actions / Publish Docker Images

- **Hello GitHub Actions:** sintaxe básica de `on`, `jobs`, `steps` e `uses` — base direta da estrutura do `ci.yml` desta semana (6 jobs de CI + 2 de CD no mesmo arquivo).
- **Test with Actions:** como rodar a suíte de testes dentro de um job, incluindo serviços auxiliares (`services:` com um container de Postgres) — usado exatamente no job `test-backend`, que sobe um `postgres:16-alpine` como serviço do próprio runner para rodar `python manage.py test` contra um banco real, não um mock.
- **Publish Docker Images:** autenticação no GHCR com `docker/login-action` e publicação com `docker/build-push-action`, usando `permissions: packages: write` no nível do job — replicado nos jobs `deploy-backend` e `deploy-frontend`, com as duas tags obrigatórias (`:latest` e `:${{ github.sha }}`) confirmadas via API do GitHub depois do deploy real.

## Biblioteca de Consulta

- **Docker Docs — Multi-stage Builds:** referência usada para estruturar `frontend/Dockerfile.prod` em três estágios (`deps` → `builder` → `runner`) e entender por que o estágio final não precisa herdar as ferramentas de build dos estágios anteriores.
- **Docker Docs — Building Best Practices:** base para a decisão de trocar `node:20-alpine` (194MB só de base) por `alpine:3.20` + binário do Node copiado manualmente no estágio `runner`, e para remover os binários nativos do `sharp` que o Next.js inclui "por garantia" mesmo sem uso de `next/image`.
- **Next.js Docs — Output Standalone / Self-hosting:** confirmou que `output: 'standalone'` gera um `server.js` autossuficiente, e que ele deve rodar com variáveis `PORT`/`HOSTNAME` em vez de `next start` tradicional.
- **NGINX Docs — Proxy Module / Configuring HTTPS Servers:** usados para montar o `nginx.conf` com `proxy_pass` + headers (`X-Forwarded-For`, `X-Forwarded-Proto`) e o bloco `listen 443 ssl` com o certificado autoassinado.
