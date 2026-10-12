# Semana 5 - Containerização e CI/CD

## 1. Identificação

- **Integrante:** Pedro Oliveira Melo
- **Repositório:** https://github.com/P3dr0-M3l0/Makers-Semana-05
- **Descrição:** aplicação desacoplada composta por Django (backend), Next.js (frontend), PostgreSQL (banco de dados) e Nginx (reverse proxy). O foco do desafio foi containerizar totalmente os ambientes de desenvolvimento e produção, e automatizar a esteira de qualidade e publicação (CI/CD) com o GitHub Actions, encerrando com o deploy das imagens de produção no GitHub Container Registry (GHCR).

## 2. Arquitetura

**Stack:** Django + Next.js + PostgreSQL + Nginx, cada um em seu próprio container.

**Serviços (ambiente de desenvolvimento — `docker-compose.yml`):**

| Serviço | Imagem base | Porta |
|---|---|---|
| `db` | `postgres:16-alpine` | 5432 (interna) |
| `backend` | `python:3.12-slim` | 8000 (publicada no host) |
| `frontend` | `node:20-alpine` | 3000 (publicada no host) |

**Serviços (ambiente de produção — `docker-compose-prod.yml`):**

| Serviço | Imagem base | Porta |
|---|---|---|
| `db` | `postgres:16-alpine` | 5432 (interna) |
| `backend` | `python:3.12-alpine` (multi-stage) | 8000 (interna) |
| `frontend` | `node:20-alpine` (multi-stage, standalone) | 3000 (interna) |
| `nginx` | `nginx:alpine` | 80 e 443 (publicadas no host) |

**Redes e volumes:** rede bridge padrão criada pelo Compose, com resolução de nomes de serviço via DNS interno. Volume nomeado `postgres_data` em desenvolvimento e `postgres_data_prod` em produção, ambos mapeados para `/var/lib/postgresql/data`, garantindo persistência dos dados entre reinicializações dos containers.

**Fluxo de comunicação (produção):** o Nginx é o único ponto de entrada público. Requisições HTTP na porta 80 recebem um redirecionamento permanente (301) para HTTPS na porta 443. Na porta 443, o roteamento é feito por prefixo: `/api/` e `/admin/` são encaminhados para `backend:8000`, e todo o restante (`/`) é encaminhado para `frontend:3000`. Nenhum dos serviços internos (`db`, `backend`, `frontend`) expõe portas diretamente ao host em produção.

## 3. Etapa 1 - DEV

**Implementação:**
- `backend/Dockerfile`: base `python:3.12-slim`, instala `requirements.txt` e executa `python manage.py runserver 0.0.0.0:8000`, com `DEBUG=True`.
- `frontend/Dockerfile`: base `node:20-alpine`, instala as dependências com `npm install` e executa `npm run dev`.
- Hot reload e bind mounts feitos via `-v` no `docker run`, espelhando os arquivos do host dentro do container sem necessidade de rebuild.

**Validação (Checkpoint 1):**
```bash
docker build -t meu-backend-dev ./backend
docker run --rm -p 8000:8000 -v "$(pwd)/backend:/app" meu-backend-dev

docker build -t meu-frontend-dev ./frontend
docker run --rm -p 3000:3000 -v "$(pwd)/frontend:/app" -v /app/node_modules -v /app/.next meu-frontend-dev
```
Uma alteração em `views.py` (lista de itens retornada pelo endpoint de health) foi salva com os containers em execução, e o Django recarregou sozinho (`StatReloader`), refletindo a mudança no JSON sem novo build, confirmando o hot reload.

**Evidências:**

![`Images/buildando_frontend.png`](images/buildando_frontend.png)
*Build da imagem de desenvolvimento do frontend*

![`Images/backend_hotreload.png`](images/backend&hotreload.png)
*backend rodando com `docker run`, endpoint `/api/health/` respondendo 200, e log `reloading` após alteração no código.*

**Commit:** `fd1d1e3`

## 4. Etapa 2 - Docker Compose

**Implementação:** `docker-compose.yml` integrando os três serviços (`db`, `backend`, `frontend`) em uma rede interna comum, na qual o backend acessa o banco pelo nome de serviço `db:5432`.

**Healthcheck:**
```yaml
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
    interval: 5s
    timeout: 5s
    retries: 5
backend:
  depends_on:
    db:
      condition: service_healthy
```
O backend só inicia (e roda `migrate`) depois que o Postgres é considerado saudável.

**Persistência:** volume nomeado `postgres_data` mapeado para `/var/lib/postgresql/data`. Credenciais tratadas por variáveis de ambiente; apenas `.env.example` foi versionado, o `.env` real com as credenciais de desenvolvimento ficou fora do Git.

**Validação (Checkpoint 2):**
```bash
docker compose up --build
docker compose ps
docker compose exec db sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"'
```
O `db` subiu como `healthy`, o backend aplicou as migrações pendentes e o frontend consumiu a API através do proxy interno. Teste de persistência: `docker compose down` seguido de `docker compose up`. Na segunda subida o log mostrou `No migrations to apply`, confirmando que os dados sobreviveram ao ciclo down/up (sem uso de `-v`).

**Evidências:**
![`Images/migrations_backend_compose.png`](images/migrations_backend_compose.png)
*subida da stack via `docker compose up`, com o backend aplicando as migrações.*

![`Images/db_healthy.png`](images/db_healthy.png)
*`docker compose ps` mostrando o `db` com status `healthy` e os três serviços publicados.*

**Commit:** `6b50700`

## 5. Etapa 3 - CI

**Jobs do backend:** `lint-backend` → `build-backend` → `test-backend` (Flake8, validação do container e `python manage.py test`).

**Jobs do frontend:** `lint-frontend` → `build-frontend` → `test-frontend` (ESLint, `npm run build` e testes com Vitest).

**Fail-Fast (needs):** `build-*` depende de `lint-*`; `test-*` depende de `build-*`, usando a chave `needs` em cada job.

**Cache:** `actions/setup-python` com `cache: 'pip'` no backend; `actions/setup-node` com `cache: 'npm'` no frontend.

**Validação do Fail-Fast: três falhas provocadas e corrigidas:**
1. **Erro de lint:** `lint-backend` falhou em 8s por violação PEP8 (E302, linha em branco) em `views.py`; `build-backend` e `test-backend` ficaram bloqueados (não executados), enquanto a trilha do frontend seguia normalmente.
2. **Teste quebrado:** `test-frontend` falhou em 19s por não haver um motor de testes configurado no Next.js.
3. **Correção:** criação de um arquivo `.flake8` na raiz ignorando diretórios de sistema (migrações, `.venv`) e reformatação de `views.py`; instalação e configuração do Vitest no frontend (`npm install -D vitest`).

Após as correções, as duas trilhas (6 jobs) rodaram do início ao fim com sucesso.

**Evidências:**
![`Images/CIprimeiravez_erros.png`](images/CIprimeiravez_erros.png)
*primeira execução, com `lint-backend` e `test-frontend` falhando (validação do Fail-Fast).*

![`Images/CIcorrecaofrontend.png`](images/CIcorrecaofrontend.png)
*após corrigir o frontend, trilha frontend totalmente verde enquanto `lint-backend` ainda falhava.*

![`Images/deuBomoCi.png`](images/deuBomoCi.png)
*execução final, com as duas trilhas (6 jobs) verdes.*

**Commit:** `62395fc`

## 6. Etapa 4 - Produção

**Backend:** `backend/Dockerfile.prod`, base `python:3.12-alpine`, servidor `gunicorn config.wsgi:application --bind 0.0.0.0:8000`, executando com um usuário sem privilégios de root (`django-user`).

**Frontend:** `frontend/Dockerfile.prod` em multi-stage com três estágios: `deps` (instala dependências com `npm ci`), `builder` (recebe os módulos e compila o Next.js) e `runner` (recebe apenas os artefatos finais e executa `node server.js`).

**Multi-stage:** `next.config.mjs` com `output: 'standalone'`; o estágio final copia apenas `.next/standalone`, `.next/static` e `public`, descartando ferramentas de build e dependências de desenvolvimento.

**Usuários não-root:** frontend executa com o usuário `nextjs` (grupo `nodejs`, UID 1001); backend executa com o usuário `django-user`.

**Tamanho final das imagens:**

| Imagem | Tamanho (disco) |
|---|---|
| `backend-prod:latest` | 152 MB |
| `frontend-prod:latest` | 72,7 MB |

**Validação (Checkpoint 4):**
```bash
docker build -t backend-prod -f backend/Dockerfile.prod ./backend
docker build -t frontend-prod -f frontend/Dockerfile.prod ./frontend
docker images
```
As imagens sobem e respondem sem nenhuma ferramenta de desenvolvimento, teste ou dependência temporária presente no filesystem final.

**Evidências:**
![`Images/imagesProd.png`](images/imagesProd.png)
*`docker images` com o tamanho final das duas imagens de produção.*

**Commit:** `0a411de`

## 7. Etapa 5 - Nginx e SSL

**Reverse proxy:** `nginx/nginx.conf` define blocos `upstream` para `backend` e `frontend`. Um `server` na porta 80 responde com `return 301 https://$host$request_uri;`, forçando HTTPS. Um segundo `server` na porta 443 carrega o certificado/chave SSL e faz `proxy_pass` conforme o prefixo da URL.

**Portas expostas:** em `docker-compose-prod.yml`, os mapeamentos `ports` foram removidos de `db`, `backend` e `frontend`. Nenhum deles é alcançável diretamente do host. Somente o serviço `nginx` publica portas (80 e 443), montando os arquivos de configuração e os certificados como volumes somente leitura (`:ro`).

**HTTPS:** certificado autoassinado gerado para validação local:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/selfsigned.key \
  -out nginx/certs/selfsigned.crt \
  -subj "/CN=localhost"
```

**Redirecionamento:** acesso por HTTP (porta 80) redireciona automaticamente para HTTPS (porta 443, com o aviso esperado de certificado autoassinado não confiável pelo navegador).

**Validação:**
```bash
docker compose -f docker-compose-prod.yml up -d --build
docker compose -f docker-compose-prod.yml ps
```
Acesso à raiz (`/`) retornou a página do frontend; acesso a `/api/health/` retornou o JSON do Django, confirmando que o tráfego chega ao backend através do Nginx.

**Commit:** `bc6a3d0`

## 8. Etapa 6 - GHCR

**Imagens publicadas:** o workflow de CI foi estendido com os jobs `deploy-backend` (`needs: test-backend`) e `deploy-frontend` (`needs: test-frontend`), que fazem build e push das imagens de produção somente após as respectivas trilhas de teste passarem.

**Tags geradas:**
- `ghcr.io/p3dr0-m3l0/makers-semana-05-backend:latest`
- `ghcr.io/p3dr0-m3l0/makers-semana-05-backend:${{ github.sha }}`
- `ghcr.io/p3dr0-m3l0/makers-semana-05-frontend:latest`
- `ghcr.io/p3dr0-m3l0/makers-semana-05-frontend:${{ github.sha }}`

**Permissões:**
```yaml
permissions:
  contents: read
  packages: write
```

**Evidências:** publicação confirmada na aba **Packages** do repositório no GitHub, com as imagens de backend e frontend disponíveis publicamente.

**Commit:** `d1371cb`

## 9. Validação Final

**Comandos executados ao longo do desafio:**
```bash
docker compose up --build
curl -s localhost:8000/api/health/
curl -s localhost:3000/api/health/
npm install -D vitest
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/certs/selfsigned.key -out nginx/certs/selfsigned.crt -subj "/CN=localhost"
docker compose -f docker-compose-prod.yml up -d --build
docker compose -f docker-compose-prod.yml ps
git add . && git commit -m "..." && git push
```

**Resultados:** todos os checkpoints (1, 2, 4 e final de produção) foram validados com sucesso; a esteira de CI fechou com as duas trilhas verdes após a correção das falhas provocadas; as imagens de produção foram publicadas no GHCR.

**Limitações conhecidas:**
- O ambiente local (Windows/WSL2) ficou sem espaço em disco durante o desenvolvimento, causando queda do daemon do Docker e corrupção de uma imagem. A validação de todo o desafio foi migrada para o **GitHub Codespaces**.
- Dentro do Codespaces, o Docker-in-Docker inicialmente apresentou timeout de conexão com o banco; resolvido ajustando o `devcontainer.json` (`runArgs` com `--privileged` e volume dedicado ao Docker).
- A feature de Docker do devcontainer falhou por incompatibilidade da imagem base; resolvido fixando a imagem em `mcr.microsoft.com/devcontainers/base:jammy` e desativando o `moby`.
- Um hook ausente do `git-lfs` bloqueou o primeiro `git push`; contornado pontualmente com `--no-verify` e depois corrigido instalando o `git-lfs` corretamente.
- O Node instalado via `apt` ficou desatualizado (v12) para os requisitos do projeto; resolvido reinstalando o Node 20.x via NodeSource.

**Checklist final:**

| Etapa | Foco | Status |
|---|---|---|
| 1 | Containerização DEV | ✅ Concluída |
| 2 | Orquestração DEV (Compose) | ✅ Concluída |
| 3 | Qualidade automatizada (CI) | ✅ Concluída |
| 4 | Otimização PROD | ✅ Concluída |
| 5 | Stack PROD com Nginx e SSL | ✅ Concluída |
| 6 | Deploy contínuo (GHCR) | ✅ Concluída |

## 10. Histórico Git

| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `fd1d1e3` | Containerização de desenvolvimento do backend e do frontend (Dockerfiles, bind mounts, hot reload). |
| 2 | `6b50700` | Orquestração com Docker Compose: rede interna, healthcheck do banco, volume de persistência e variáveis de ambiente. |
| 3 | `62395fc` | Pipeline de CI com as trilhas lint → build → test para backend e frontend, com Fail-Fast validado e corrigido. |
| 4 | `0a411de` | Dockerfiles de produção multi-stage, usuários não-root e empacotamento standalone do Next.js. |
| 5 | `bc6a3d0` | Stack de produção com Nginx como proxy reverso, HTTPS com certificado autoassinado e isolamento de portas. |
| 6 | `d1371cb` | Extensão do CI para CD: publicação das imagens de produção no GHCR com tags `latest` e `sha`. |