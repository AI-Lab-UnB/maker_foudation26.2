# Semana 5 - Containerização e CI/CD

## 1. Identificação

- **Aluno:** Arthur Feitosa Gonçalves Lima
- **Matrícula:** 232000721
- **Repositório do projeto:** https://github.com/ArthurFeitosa05/semana5-containerizacao-cicd
- **Repositório de entrega (Makers):** https://github.com/AI-Lab-UnB/maker_foudation26.2
- **Pasta da entrega:** `Arthur_232000721/Semana_05/`

### Descrição do projeto

O projeto implementa uma aplicação desacoplada composta por **Django**, **Next.js**, **PostgreSQL** e **Nginx**, utilizando **Docker** e **Docker Compose** para containerização e orquestração, **GitHub Actions** para integração e entrega contínua e **GitHub Container Registry (GHCR)** para publicação das imagens de produção.

A aplicação possui um endpoint REST de saúde em `/api/health/`, consumido pelo frontend, e uma stack de produção em que o Nginx atua como reverse proxy e único ponto exposto ao host.

---

## 2. Arquitetura

### Stack utilizada

- **Backend:** Django
- **Frontend:** Next.js com App Router
- **Banco de dados:** PostgreSQL 16 Alpine
- **Servidor de aplicação:** Gunicorn
- **Reverse proxy:** Nginx
- **Containerização:** Docker
- **Orquestração:** Docker Compose
- **CI/CD:** GitHub Actions
- **Registro de imagens:** GitHub Container Registry (GHCR)

### Serviços

- `db` — PostgreSQL
- `backend` — Django/Gunicorn
- `frontend` — Next.js
- `nginx` — reverse proxy e terminação SSL

### Fluxo de comunicação em produção

```text
Cliente
  |
  |  HTTP/HTTPS
  v
Nginx :80/:443
  |----------------------|
  |                      |
  | /api/ e /admin/      | /
  v                      v
Backend :8000        Frontend :3000
  |
  v
PostgreSQL :5432
```

### Portas

- **80** — HTTP, exposta somente pelo Nginx
- **443** — HTTPS, exposta somente pelo Nginx
- **8000** — backend, apenas rede interna
- **3000** — frontend, apenas rede interna
- **5432** — PostgreSQL, apenas rede interna

### Persistência

O PostgreSQL utiliza o volume nomeado:

```text
postgres_data
```

montado em:

```text
/var/lib/postgresql/data
```

---

## 3. Etapa 1 - Containerização do ambiente de desenvolvimento

### Implementação

Foram criados Dockerfiles separados para backend e frontend.

#### Backend

Imagem base:

```text
python:3.12-slim
```

Execução:

```text
python manage.py runserver 0.0.0.0:8000
```

O backend disponibiliza o endpoint:

```text
/api/health/
```

com resposta JSON semelhante a:

```json
{
  "status": "ok",
  "items": [
    "Configurar Docker",
    "Automatizar CI",
    "Publicar no GHCR"
  ]
}
```

#### Frontend

Imagem base:

```text
node:20-alpine
```

Execução:

```text
npm run dev
```

O frontend foi criado com Next.js App Router e implementado em `app/page.js`.

### Bind mounts e hot reload

No ambiente de desenvolvimento, os diretórios locais do backend e frontend são montados nos containers, permitindo que alterações no host sejam refletidas sem a necessidade de novo build.

### Validação

Backend:

```bash
docker build -t semana5-backend ./backend
docker run --rm -p 8000:8000 semana5-backend
```

Frontend:

```bash
docker build -t semana5-frontend ./frontend
docker run --rm -p 3000:3000 semana5-frontend
```

### Evidências

- Backend acessível em `http://localhost:8000/api/health/`
- Frontend acessível em `http://localhost:3000`

### Commit

**Commit da Etapa 1:** `2371ce079b34f7b07c6ecc40bda327e07c97f72c`

---

## 4. Etapa 2 - Docker Compose

### Implementação

Foi criado o arquivo:

```text
docker-compose.yml
```

integrando os serviços:

- `db`
- `backend`
- `frontend`

### PostgreSQL

Imagem utilizada:

```text
postgres:16-alpine
```

### Healthcheck

O banco utiliza:

```text
pg_isready
```

para indicar quando está pronto para receber conexões.

O backend depende de:

```text
condition: service_healthy
```

para não iniciar antes do banco.

### Persistência

Volume:

```text
postgres_data
```

### Variáveis de ambiente

Foi utilizado:

```text
.env
```

para credenciais locais e:

```text
.env.example
```

como modelo versionado.

O arquivo `.env` foi incluído no `.gitignore`.

### Comunicação interna

O backend acessa o PostgreSQL através de:

```text
db:5432
```

O frontend acessa o backend através de:

```text
http://backend:8000/api/health/
```

### Validação

```bash
docker compose up --build
docker compose ps
```

Resultado validado:

```text
db        Up (healthy)
backend   Up
frontend  Up
```

O frontend conseguiu consumir corretamente a API e exibiu:

```text
Status: ok
```

### Commit

**Commit da Etapa 2:** `e641ce15ea03c22a115cdc5f77aa90a977540a3a`

---

## 5. Etapa 3 - Integração Contínua

### Workflow

Foi criado:

```text
.github/workflows/ci.yml
```

com duas trilhas independentes.

### Backend

```text
lint-backend
    ↓
build-backend
    ↓
test-backend
```

Responsabilidades:

- Flake8
- build da imagem Docker
- testes do Django com `python manage.py test`

Foi criado um teste para o endpoint `/api/health/`.

### Frontend

```text
lint-frontend
    ↓
build-frontend
    ↓
test-frontend
```

Responsabilidades:

- ESLint
- `npm run build`
- testes com Vitest

### Fail-Fast

Os jobs utilizam `needs`, portanto um job posterior não é executado caso a etapa anterior falhe.

### Cache

Backend:

```yaml
cache: "pip"
```

Frontend:

```yaml
cache: "npm"
```

### Ajustes de lint

O Flake8 foi configurado para ignorar `E501`:

```text
flake8 . --exclude=venv,migrations,__pycache__ --ignore=E501
```

### Validação

Os seis jobs foram executados no GitHub Actions e ficaram verdes:

```text
lint-backend      [OK]
build-backend     [OK]
test-backend      [OK]

lint-frontend     [OK]
build-frontend    [OK]
test-frontend     [OK]
```

### Commit

**Commit da Etapa 3:** `6b2e59ab0c0d2e47c4c3bb2ec041f4cd1c70e467`

---

## 6. Etapa 4 - Containers de produção

### Backend

Foi criado:

```text
backend/Dockerfile.prod
```

Imagem base:

```text
python:3.12-alpine
```

Servidor:

```text
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

O container executa com usuário não-root:

```text
appuser
```

### Frontend

Foi criado:

```text
frontend/Dockerfile.prod
```

Foi utilizado multi-stage build com estágios:

```text
deps
builder
runner
```

No `next.config.mjs`:

```javascript
const nextConfig = {
  output: "standalone",
};

export default nextConfig;
```

O estágio final copia somente:

```text
.next/standalone
.next/static
public
```

O container executa com usuário:

```text
nextjs
```

### Tamanho final das imagens

Resultados observados:

```text
semana5-backend-prod
CONTENT SIZE: 37.9 MB

semana5-frontend-prod
CONTENT SIZE: 64.2 MB
```

O frontend ficou abaixo do limite de 150 MB.

### Validação

Backend de produção:

```bash
docker build -f backend/Dockerfile.prod -t semana5-backend-prod ./backend
docker run --rm -p 8000:8000 semana5-backend-prod
```

Frontend de produção:

```bash
docker build -f frontend/Dockerfile.prod -t semana5-frontend-prod ./frontend
docker run --rm -p 3000:3000 semana5-frontend-prod
```

### Commit

**Commit da Etapa 4:** `37c5e72ec9f8f129366cd90bc114f9b17d646675`

---

## 7. Etapa 5 - Nginx e SSL

### Implementação

Foi criado:

```text
docker-compose-prod.yml
```

e a pasta:

```text
nginx/
```

contendo:

```text
nginx.conf
certs/selfsigned.crt
certs/selfsigned.key
```

### Reverse proxy

O Nginx realiza o seguinte roteamento:

```text
/api/   → backend:8000
/admin/ → backend:8000
/       → frontend:3000
```

### Isolamento das portas

Na stack de produção:

- backend usa apenas `expose: 8000`
- frontend usa apenas `expose: 3000`
- PostgreSQL usa apenas `expose: 5432`

Somente o Nginx publica:

```text
80:80
443:443
```

### HTTPS

Foi criado certificado autoassinado para validação local:

```text
selfsigned.crt
selfsigned.key
```

Como o OpenSSL não estava disponível diretamente no Windows, o certificado foi gerado usando um container Docker com `alpine/openssl`.

### Redirecionamento

A porta 80 redireciona permanentemente para HTTPS.

Fluxo:

```text
http://localhost
      ↓
301 Redirect
      ↓
https://localhost
```

### Validação

Comando utilizado:

```bash
docker compose -f docker-compose-prod.yml up --build
```

Resultado observado:

```text
backend   Up
db        Up (healthy)
frontend  Up
nginx     Up
```

Somente Nginx apresentou publicação de portas 80 e 443.

O acesso a:

```text
https://localhost
```

carregou o frontend com:

```text
Status: ok
```

e os dados fornecidos pelo backend.

Também foi validado:

```text
https://localhost/api/health/
```

O navegador indicou certificado não confiável por ser autoassinado, comportamento esperado em validação local.

### Commit

**Commit da Etapa 5:** `e20cbd69f909c028fde2abccd0c3b53fe52e79b0`

---

## 8. Etapa 6 - Deploy Contínuo no GHCR

### Implementação

O workflow de CI foi estendido com:

```text
deploy-backend
deploy-frontend
```

Dependências:

```text
deploy-backend  needs: test-backend
deploy-frontend needs: test-frontend
```

### Permissões

```yaml
permissions:
  contents: read
  packages: write
```

### Autenticação

O login no GHCR utiliza:

```yaml
username: ${{ github.actor }}
password: ${{ secrets.GITHUB_TOKEN }}
```

### Imagens publicadas

Backend:

```text
ghcr.io/arthurfeitosa05/semana5-containerizacao-cicd-backend:latest
ghcr.io/arthurfeitosa05/semana5-containerizacao-cicd-backend:${{ github.sha }}
```

Frontend:

```text
ghcr.io/arthurfeitosa05/semana5-containerizacao-cicd-frontend:latest
ghcr.io/arthurfeitosa05/semana5-containerizacao-cicd-frontend:${{ github.sha }}
```

### Correção realizada

Na primeira execução, os jobs de deploy falharam porque o nome do proprietário era gerado com letras maiúsculas:

```text
ghcr.io/ArthurFeitosa05/...
```

O GHCR exige nomes de repositório em letras minúsculas.

As tags foram corrigidas para:

```text
ghcr.io/arthurfeitosa05/...
```

Após a correção, todos os jobs ficaram verdes.

### Resultado final do pipeline

```text
lint-backend      [OK]
build-backend     [OK]
test-backend      [OK]
deploy-backend    [OK]

lint-frontend     [OK]
build-frontend    [OK]
test-frontend     [OK]
deploy-frontend   [OK]
```

### Evidências

- GitHub Actions com os oito jobs verdes
- Imagem do backend publicada no GHCR
- Imagem do frontend publicada no GHCR
- Tags `latest` e SHA do commit

### Commit

**Commit da Etapa 6:** `6bcc008521f7f0d4f68958ddf823f732dcf73e1f`

**Correção posterior do GHCR (lowercase):** `62f8e8b1af6a5f18dcf0fe6bed559b050e1ce0c4`

---

## 9. Validação Final

### Comandos principais executados

Desenvolvimento:

```bash
docker build -t semana5-backend ./backend
docker build -t semana5-frontend ./frontend
docker compose up --build
docker compose ps
```

Testes:

```bash
python manage.py test
flake8 . --exclude=venv,migrations,__pycache__ --ignore=E501
npm test
npm run lint
```

Produção:

```bash
docker build -f backend/Dockerfile.prod -t semana5-backend-prod ./backend
docker build -f frontend/Dockerfile.prod -t semana5-frontend-prod ./frontend

docker compose -f docker-compose-prod.yml up --build
docker compose -f docker-compose-prod.yml ps
```

Imagens:

```bash
docker images semana5-backend-prod
docker images semana5-frontend-prod
```

### Resultados

- Backend de desenvolvimento funcionando
- Frontend de desenvolvimento funcionando
- PostgreSQL com healthcheck saudável
- Frontend consumindo a API
- Pipeline CI funcionando
- Testes de backend e frontend passando
- Imagens de produção otimizadas
- Backend executando com Gunicorn
- Containers de produção com usuários não-root
- Nginx funcionando como reverse proxy
- HTTP redirecionando para HTTPS
- SSL autoassinado funcionando localmente
- Somente portas 80 e 443 publicadas em produção
- Imagens publicadas no GHCR
- Pipeline final completamente verde

### Limitações conhecidas

O certificado HTTPS utilizado é autoassinado e serve apenas para validação local. Por isso, navegadores exibem um aviso de certificado não confiável.

Para um ambiente de produção real, seria necessário utilizar um certificado emitido por uma autoridade certificadora confiável, por exemplo via Let's Encrypt.

---

## 10. Histórico Git

| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `2371ce079b34f7b07c6ecc40bda327e07c97f72c` | Containerização do ambiente de desenvolvimento |
| 2 | `e641ce15ea03c22a115cdc5f77aa90a977540a3a` | Orquestração com Docker Compose |
| 3 | `6b2e59ab0c0d2e47c4c3bb2ec041f4cd1c70e467` | Pipeline CI com lint, build e testes |
| 4 | `37c5e72ec9f8f129366cd90bc114f9b17d646675` | Containers otimizados de produção |
| 5 | `e20cbd69f909c028fde2abccd0c3b53fe52e79b0` | Stack de produção com Nginx e SSL |
| 6 | `6bcc008521f7f0d4f68958ddf823f732dcf73e1f` | Deploy contínuo para GitHub Container Registry |

### Commits adicionais

Caso existam commits de correção, eles podem ser listados aqui, por exemplo:

- correção de configuração do Django;
- correção de lint;
- correção das tags do GHCR para lowercase — `62f8e8b1af6a5f18dcf0fe6bed559b050e1ce0c4`.

---

# Checklist Final

- [x] Dockerfile DEV no backend
- [x] Dockerfile DEV no frontend
- [x] Hot reload / bind mounts
- [x] Docker Compose de desenvolvimento
- [x] PostgreSQL
- [x] Healthcheck do banco
- [x] Persistência com volume
- [x] `.env.example` versionado
- [x] Pipeline backend `lint → build → test`
- [x] Pipeline frontend `lint → build → test`
- [x] Cache de pip
- [x] Cache de npm
- [x] Testes automatizados
- [x] Dockerfile de produção do backend
- [x] Gunicorn
- [x] Backend com usuário não-root
- [x] Dockerfile multi-stage do frontend
- [x] Next.js standalone
- [x] Frontend com usuário `nextjs`
- [x] Frontend abaixo de 150 MB
- [x] `docker-compose-prod.yml`
- [x] Nginx
- [x] SSL
- [x] Redirecionamento HTTP → HTTPS
- [x] Portas internas isoladas
- [x] GHCR
- [x] Tags `latest`
- [x] Tags `${{ github.sha }}`
- [x] Pipeline final verde