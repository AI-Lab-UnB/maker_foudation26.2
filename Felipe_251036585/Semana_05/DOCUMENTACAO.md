# Semana 5 — Containerização e CI/CD

## 1. Identificação

- **Equipe:** individual
- **Integrante:** Felipe Couto Duque
- **Repositório do projeto:** https://github.com/felipecduque7/semana5-docker-cicd
- **Imagens publicadas:** https://github.com/felipecduque7?tab=packages

Aplicação desacoplada composta por Django (API REST), Next.js (App Router),
PostgreSQL e Nginx. O objetivo do desafio foi containerizar o ambiente de
desenvolvimento, orquestrar os serviços, automatizar a validação por pipeline
de CI e viabilizar um deploy seguro e otimizado para produção.

---

## 2. Arquitetura

### Stack

| Camada | Tecnologia | Imagem base (dev) | Imagem base (prod) |
|---|---|---|---|
| Backend | Django 6.1.1 | `python:3.12-slim` | `python:3.12-alpine` |
| Frontend | Next.js 16.3.6 (App Router) | `node:20-alpine` | `node:20-alpine` (multi-stage) |
| Banco | PostgreSQL 16 | `postgres:16-alpine` | `postgres:16-alpine` |
| Proxy reverso | Nginx | — | `nginx:1.27-alpine` |

### Estrutura do repositório

```
.
├── backend/
│   ├── config/            # projeto Django (settings, urls, views, tests)
│   ├── Dockerfile         # desenvolvimento
│   ├── Dockerfile.prod    # produção
│   ├── pyproject.toml     # configuração do Ruff
│   └── requirements.txt
├── frontend/
│   ├── app/               # App Router (page.js, page.test.js)
│   ├── Dockerfile         # desenvolvimento
│   ├── Dockerfile.prod    # produção (multi-stage)
│   └── next.config.mjs    # output: standalone
├── nginx/
│   ├── certs/             # certificado autoassinado (gerado localmente)
│   └── nginx.conf
├── .github/workflows/ci.yml
├── docker-compose.yml         # DEV
├── docker-compose-prod.yml    # PROD
└── .env.example
```

### Portas e exposição

| Serviço | DEV (host) | PROD (host) | Rede interna |
|---|---|---|---|
| nginx | — | 80, 443 | — |
| frontend | 3000 | não exposto | 3000 |
| backend | 8000 | não exposto | 8000 |
| db | não exposto | não exposto | 5432 |

### Fluxo de comunicação

**Desenvolvimento:** o navegador acessa o frontend em `localhost:3000`. O
componente server-side do Next faz fetch para `http://backend:8000/api/health/`,
resolvido pelo DNS interno do Compose. O backend conecta ao banco por `db:5432`.

**Produção:** o navegador acessa apenas `https://localhost`. O Nginx roteia
`/api/` e `/admin/` para `backend:8000` e todo o resto para `frontend:3000`.
Nenhum serviço interno é alcançável diretamente pelo host.

**Nota sobre a resolução de nomes:** durante a Etapa 1, com os containers
rodando isolados via `docker run`, o fetch precisou usar
`host.docker.internal:8000`, já que `localhost` dentro do container do frontend
aponta para o próprio container. A partir da Etapa 2, com os serviços na mesma
rede do Compose, o endereço passou a ser o nome do serviço (`backend`).

---

## 3. Etapa 1 — Containerização do ambiente de DEV

**Commit:** `c7da9ca`

### Implementação

Dois Dockerfiles voltados para desenvolvimento.

O backend usa `python:3.12-slim`, instala o `requirements.txt` e executa
`python manage.py runserver 0.0.0.0:8000`. O bind `0.0.0.0` é necessário porque
`127.0.0.1` dentro do container não é alcançável a partir do host.

O frontend usa `node:20-alpine`, instala dependências com `npm ci` — que
respeita o `package-lock.json` e garante build reproduzível — e executa
`npm run dev`.

Em ambos, o `COPY` do arquivo de dependências vem antes do `COPY . .` para
aproveitar o cache de camadas: alterações no código não invalidam a instalação
de dependências.

### Bind mounts e hot reload

```bash
docker run --rm -p 8000:8000 -v ${PWD}/backend:/app semana5-backend:dev

docker run --rm -p 3000:3000 \
  -v ${PWD}/frontend:/app \
  -v /app/node_modules \
  semana5-frontend:dev
```

O volume anônimo `-v /app/node_modules` no frontend é necessário porque o bind
mount de `/app` substituiria o diretório inteiro, ocultando o `node_modules`
instalado durante o build da imagem.

### Validação

- `GET http://localhost:8000/api/health/` retornou 200 com o payload JSON.
- Alteração em `backend/config/views.py` disparou o StatReloader do Django e o
  conteúdo mudou no navegador sem rebuild.
- Alteração em `frontend/app/page.js` foi refletida pelo Fast Refresh do Next.

**Evidências:** os outputs de terminal transcritos acima registram a validação
desta etapa.

---

## 4. Etapa 2 — Orquestração com Docker Compose

**Commit:** `cfefe6d`

### Serviços

`docker-compose.yml` integra `db`, `backend` e `frontend` em uma rede padrão
criada pelo Compose, onde cada serviço é resolvido pelo próprio nome.

### Healthcheck

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
  interval: 5s
  timeout: 5s
  retries: 5
```

O cifrão duplo (`$$`) escapa a variável para que o Compose não a interpole — a
expansão acontece no shell dentro do container.

O backend declara `depends_on: db: condition: service_healthy`, de modo que só
inicia após o banco responder ao `pg_isready`. O log confirma a ordem:

```
db-1       | database system is ready to accept connections
Container semana5-docker-cicd-db-1  Healthy
backend-1  | Starting WSGI development server at http://0.0.0.0:8000/
```

### Persistência

Volume nomeado `postgres_data` montado em `/var/lib/postgresql/data`. As 18
migrações das apps internas do Django foram aplicadas com:

```bash
docker compose exec backend python manage.py migrate
```

### Variáveis de ambiente

Apenas `.env.example` é versionado. O `.env` local está no `.gitignore` e
contém as credenciais de desenvolvimento. O `settings.py` lê todas as
credenciais via `os.environ.get`, sem valores sensíveis no código.

### Validação

`docker compose up` iniciou a stack sem falhas de prontidão e o frontend
consumiu a API pelo nome de serviço `backend:8000`.

**Evidências:** o log de inicialização transcrito acima comprova a ordem de
dependência entre banco e backend.

---

## 5. Etapa 3 — Pipeline de CI

**Commit:** `b3016a5`

### Estrutura

Duas trilhas independentes, executadas em paralelo:

| Trilha | Sequência | Ferramentas |
|---|---|---|
| Backend | `lint-backend` → `build-backend` → `test-backend` | Ruff, `docker build`, `manage.py test` |
| Frontend | `lint-frontend` → `build-frontend` → `test-frontend` | ESLint, `npm run build`, Vitest |

O encadeamento é feito por `needs`, que implementa o Fail-Fast: um job só
executa se o anterior da sua trilha passar.

O job `test-backend` levanta um PostgreSQL efêmero via `services`, com
healthcheck próprio. Nesse contexto o host é `localhost`, e não `db`, porque o
serviço é exposto na máquina do runner.

### Cache

```yaml
cache: "pip"
cache-dependency-path: backend/requirements.txt
```

```yaml
cache: "npm"
cache-dependency-path: frontend/package-lock.json
```

Primeira execução completa: 1m18s. Execuções seguintes com cache: ~1m11s.

### Validação do Fail-Fast

Três falhas controladas, cada uma isolando uma etapa:

| Falha | Commit | Introduzida | Resultado observado |
|---|---|---|---|
| Lint | `4202136` | Variável local não utilizada em `views.py` (F841) | `lint-backend` falhou em 8s; `build-backend` e `test-backend` **skipped (0s)** |
| Build | `a1fc2cc` | Import de módulo inexistente em `page.js` | `lint-frontend` passou; `build-frontend` falhou; `test-frontend` **skipped** |
| Teste | `71c227b` | `assertEqual(status_code, 404)` num endpoint que retorna 200 | `lint` e `build` passaram; `test-backend` falhou |

Em todos os casos a trilha oposta permaneceu verde, confirmando a
independência entre elas. Após as correções, as duas trilhas voltaram ao verde
no commit `b3016a5`.

### Evidências

Pipeline completo após as correções (commit `b3016a5`):

![Pipeline verde](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/etapa3-pipeline-verde.png)

Falha de lint — `build-backend` e `test-backend` pulados em 0s:

![Fail-Fast no lint](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/etapa3-failfast-lint.png)

Falha de build — `test-frontend` pulado, trilha do backend intacta:

![Fail-Fast no build](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/etapa3-failfast-build.png)

Falha de teste — lint e build passaram antes de falhar no último job:

![Fail-Fast no teste](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/etapa3-failfast-teste.png)

Histórico completo das execuções, com as seis etapas e as três falhas:

![Histórico de execuções](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/etapa3-historico-execucoes.png)

---

## 6. Etapa 4 — Containers de produção

**Commit:** `0597ad2`

### Backend

Base `python:3.12-alpine`, servidor Gunicorn com 3 workers, usuário
desprivilegiado.

As dependências de compilação do `psycopg2` são instaladas, usadas e removidas
**dentro de um único `RUN`**:

```dockerfile
RUN apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev \
    && pip install --no-cache-dir -r requirements.txt \
    && apk del .build-deps
```

Isso é necessário porque cada `RUN` gera uma camada imutável. Na primeira
tentativa, com `apk add` e `apk del` em camadas separadas, a imagem de produção
ficou **maior** que a de desenvolvimento (293 MB contra 296 MB), já que o
compilador permanecia no histórico. Consolidando em um único `RUN`, caiu para
200 MB.

### Frontend

Multi-stage com três estágios — `deps`, `builder` e `runner` — e
`output: 'standalone'` no `next.config.mjs`. O estágio final copia apenas
`.next/standalone`, `.next/static` e `public`, e executa com o usuário `nextjs`.

### Tamanho final

| Imagem | DEV (comprimido) | PROD (comprimido) | Redução |
|---|---|---|---|
| Backend | 67 MB | **45.1 MB** | 33% |
| Frontend | 348 MB | **72.7 MB** | 79% |

Ambas abaixo do limite de 150 MB.

### Validação de usuário não-root

```bash
$ docker exec teste-prod whoami
appuser
```

O Gunicorn iniciou corretamente, sem servidor de desenvolvimento:

```
[INFO] Starting gunicorn 23.0.0
[INFO] Listening at: http://0.0.0.0:8000 (1)
[INFO] Booting worker with pid: 7
[INFO] Booting worker with pid: 8
[INFO] Booting worker with pid: 9
```

---

## 7. Etapa 5 — Nginx e SSL

**Commit:** `7f3d787`

### Isolamento de portas

Em `docker-compose-prod.yml`, `backend`, `frontend` e `db` usam `expose` em vez
de `ports`, tornando as portas visíveis apenas na rede interna. Apenas o Nginx
publica portas no host:

```
NAME          SERVICE    PORTS
backend-1     backend    8000/tcp
db-1          db         5432/tcp
frontend-1    frontend   3000/tcp
nginx-1       nginx      0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### Roteamento

| Rota | Destino |
|---|---|
| `/api/` | `backend:8000` |
| `/admin/` | `backend:8000` |
| `/` | `frontend:3000` |

Headers `X-Real-IP`, `X-Forwarded-For` e `X-Forwarded-Proto` são repassados
para que o Django identifique a origem real da requisição.

### HTTPS e redirecionamento

O bloco da porta 80 faz redirecionamento permanente:

```nginx
server {
    listen 80;
    server_name localhost;
    return 301 https://$host$request_uri;
}
```

Certificado autoassinado gerado localmente para validação:

```bash
docker run --rm -v ${PWD}/nginx/certs:/certs alpine/openssl \
  req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /certs/selfsigned.key -out /certs/selfsigned.crt \
  -subj "/CN=localhost"
```

### Validação

| Teste | Resultado |
|---|---|
| `http://localhost` | Redirecionado para `https://localhost` (301) |
| `https://localhost/api/health/` | `{"status": "ok", "items": [...]}` |
| `http://localhost:8000` | `ERR_CONNECTION_REFUSED` (esperado) |

```bash
$ curl.exe -k https://localhost/api/health/
{"status": "ok", "items": ["Configurar Docker", "Automatizar CI", "Publicar no GHCR", "Testando hot reload"]}
```

O aviso `ERR_CERT_AUTHORITY_INVALID` no navegador é esperado: o certificado é
autoassinado e não possui cadeia de confiança reconhecida. Em produção real
seria substituído por um certificado emitido por uma CA (Let's Encrypt, por
exemplo).

### Evidências

Redirecionamento de HTTP para HTTPS — a URL digitada foi `http://localhost`:

![Redirecionamento HTTPS](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/etapa5-redirecionamento-https.png)

Endpoint acessível via HTTPS através do Nginx. O aviso de certificado é
esperado por se tratar de certificado autoassinado:

![Certificado autoassinado](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/etapa5-certificado-autoassinado.png)

Porta 8000 inacessível diretamente a partir do host:

![Porta 8000 recusada](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/etapa5-porta-8000-recusada.png)

---

## 8. Etapa 6 — Deploy contínuo no GHCR

**Commit:** `bf59868`

### Jobs

| Job | Dependência | Entrega |
|---|---|---|
| `deploy-backend` | `needs: test-backend` | Imagem de produção do backend no GHCR |
| `deploy-frontend` | `needs: test-frontend` | Imagem de produção do frontend no GHCR |

Cada deploy só executa após a trilha correspondente passar integralmente.

### Permissões

```yaml
permissions:
  contents: read
  packages: write
```

Princípio do menor privilégio: leitura no repositório, escrita apenas em
pacotes. A autenticação usa `secrets.GITHUB_TOKEN`, gerado automaticamente a
cada execução do workflow — nenhuma credencial foi criada ou versionada
manualmente.

### Tags publicadas

```
ghcr.io/felipecduque7/semana5-docker-cicd-backend:latest
ghcr.io/felipecduque7/semana5-docker-cicd-backend:<sha>
ghcr.io/felipecduque7/semana5-docker-cicd-frontend:latest
ghcr.io/felipecduque7/semana5-docker-cicd-frontend:<sha>
```

A tag `latest` aponta sempre para a última versão aprovada; a tag com o SHA do
commit permite rastrear exatamente qual código originou cada imagem e viabiliza
rollback.

Ambos os pacotes estão com visibilidade **pública**.

**Evidência:**

![Imagens publicadas no GHCR](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/etapa6-packages.png)

---

## 9. Validação final

### Comandos executados

```bash
# Desenvolvimento
docker compose up --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py test     # 3 testes, OK
docker compose exec frontend npm test                 # 1 teste, passed

# Produção
docker compose -f docker-compose-prod.yml up -d --build
docker compose -f docker-compose-prod.yml ps
docker compose -f docker-compose-prod.yml exec backend python manage.py migrate
curl.exe -k https://localhost/api/health/
```

### Resultados

- Stack de desenvolvimento sobe com healthcheck e hot reload funcionais.
- Pipeline de CI com 8 jobs, todos verdes no commit final.
- Imagens de produção dentro do limite de tamanho, executando como usuário
  não-root.
- Stack de produção acessível apenas via Nginx, com HTTPS e redirecionamento.
- Imagens publicadas no GHCR com as quatro tags exigidas.

### Limitações conhecidas

1. **Certificado autoassinado.** Válido apenas para validação local; o
   navegador exibe aviso de autoridade não confiável.

2. **`ALLOWED_HOSTS = ["*"]`.** Aceitável no escopo do desafio, mas em produção
   real deveria listar explicitamente os domínios permitidos.

3. **Cobertura de testes mínima.** O teste do frontend valida apenas a
   sanidade do ambiente. Testar componentes server-side do App Router exigiria
   mocking de `fetch` e configuração adicional, fora do escopo desta entrega.

4. **Encoding no Windows.** O `Set-Content -Encoding utf8` do PowerShell grava
   com BOM, o que fez o Nginx falhar com `unknown directive "events"`. Foi
   necessário regravar o `nginx.conf` sem BOM via
   `System.Text.UTF8Encoding $false`.

### Checklist

| Etapa | Foco | Entregável | Status |
|---|---|---|---|
| 1 | Containerização DEV | Dockerfiles, hot reload, bind mounts | Concluída |
| 2 | Orquestração DEV | Compose com healthcheck e persistência | Concluída |
| 3 | Qualidade automatizada | CI com trilhas lint → build → test | Concluída |
| 4 | Otimização PROD | Dockerfile.prod multi-stage, imagens reduzidas | Concluída |
| 5 | Stack PROD | Compose prod + Nginx + SSL + portas isoladas | Concluída |
| 6 | Deploy contínuo | Publicação no GHCR com `latest` e `sha` | Concluída |

---

## 10. Histórico Git

| Etapa | Commit | Descrição |
|---|---|---|
| — | `884e00c` | Setup inicial: projeto Django e Next.js |
| 1 | `c7da9ca` | Containerização do ambiente de desenvolvimento |
| 2 | `cfefe6d` | Orquestração com Docker Compose, healthcheck e persistência |
| 3 | `b3016a5` | Pipeline de CI com trilhas lint, build e test |
| 4 | `0597ad2` | Containers de produção com multi-stage e usuário não-root |
| 5 | `7f3d787` | Stack de produção com Nginx, SSL e portas isoladas |
| 6 | `bf59868` | Deploy contínuo com publicação no GHCR |

### Commits de validação do Fail-Fast

| Commit | Falha demonstrada |
|---|---|
| `4202136` | Erro de lint no backend |
| `a1fc2cc` | Erro de build no frontend |
| `71c227b` | Teste quebrado no backend |
