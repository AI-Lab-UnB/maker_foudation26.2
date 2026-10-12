# Semana 5 - Containerização e CI/CD

## 1. Identificação
- **Estudante:** Thomas Augusto Amorim de Araujo
- **Matricula:** 251016027
- **Repositório:** [https://github.com/Thomas4ugust0/PJ-AILab_SEM05](https://github.com/Thomas4ugust0/PJ-AILab_SEM05)

## 2. Arquitetura
- **Stack utilizada:** Django (Backend API), Next.js (Frontend), PostgreSQL (Banco de dados), Nginx (Proxy Reverso), Docker e GitHub Actions.
- **Serviços e Portas:**
  - `nginx`: 80 (HTTP) e 443 (HTTPS) - *Únicas expostas ao host em produção*.
  - `backend`: 8000 (Django/Gunicorn) - *Rede interna*.
  - `frontend`: 3000 (Next.js) - *Rede interna*.
  - `db`: 5432 (PostgreSQL) - *Rede interna*.
- **Volumes:** `postgres_data` montado em `/var/lib/postgresql/data` para persistência segura do banco.
- **Fluxo de comunicação:**
  - Em produção, o cliente acessa via porta 80 ou 443 (Nginx). 
  - O Nginx redireciona `/api/` e `/admin/` para o `backend:8000`.
  - O Nginx redireciona as demais requisições `/` para o `frontend:3000`.
  - O Next.js (Server Component) faz requisições diretas à API usando a rede interna do docker em `http://backend:8000/api/health/`.

## 3. Etapa 1 - DEV
- **Implementação:** Foram criados os `Dockerfile` base voltados para desenvolvimento, focando em ferramentas de hot reload.
  - **Backend:** Usa `python:3.12-slim`, expõe a porta 8000 e roda o comando padrão `runserver`. O `DEBUG=True` está configurado nativamente no `settings.py`.
  - **Frontend:** Usa `node:20-alpine`, instala todas as dependências (`npm install`) e usa `npm run dev`. O Next.js 16 usa o Turbopack nativamente, gerindo o hot-reload eficientemente sem configurações webpack legadas.
- **Validação e Evidências:** A comunicação foi validada rodando os contêineres individualmente mapeando volumes (bind mounts) para os diretórios locais.

## 4. Etapa 2 - Docker Compose
- **Implementação:** Criação do `docker-compose.yml` base para desenvolvimento, colocando todos os serviços na mesma stack.
- **Healthcheck e Dependências:** Adicionado o script de healthcheck `pg_isready` no serviço `db`, garantindo que o banco de dados esteja totalmente pronto antes do backend subir (`depends_on: db: condition: service_healthy`).
- **Persistência:** Utilizado o volume nomeado `postgres_data`.
- **Credenciais:** Criado um `.env.example` versionado e um `.env` real protegido pelo `.gitignore`.

## 5. Etapa 3 - CI (Integração Contínua)
- **Jobs:** Workflow do Github Actions em `.github/workflows/ci.yml`.
  - **Trilha Backend:** `lint-backend` (com Flake8 e configurações em `.flake8`) -> `build-backend` -> `test-backend` (executado via docker-compose para injetar o DB de forma fluida).
  - **Trilha Frontend:** `lint-frontend` (com ESLint) -> `build-frontend` -> `test-frontend` (usando o Jest configurado com mock do `fetch`).
- **Fail-Fast e Cache:** O atributo `needs` foi utilizado em cada *step* dependente, travando (Fail-Fast) o pipeline caso algum estoure erro. As actions oficiais `setup-python` e `setup-node` estão gerindo caches (`pip` e `npm`) para acelerar a execução.

## 6. Etapa 4 - Produção
- **Backend (`Dockerfile.prod`):** Migração para `python:3.12-alpine` para redução drástica de imagem. Utilização do `gunicorn` para escalabilidade em produção, e criação de usuário seguro `appuser` sem privilégios root.
- **Frontend (`Dockerfile.prod`):** Aplicação do conceito de **Multi-stage build** (dividido nos estágios `deps`, `builder` e `runner`). O Next.js foi configurado com `output: 'standalone'` no `next.config.mjs`, permitindo que apenas os binários vitais fossem copiados para a imagem final executada pelo usuário restrito `nextjs`. A imagem resultante possui alto isolamento e tamanho drasticamente reduzido (menor que 150MB).

## 7. Etapa 5 - Nginx e SSL
- **Reverse Proxy e Portas:** Configuração contida no arquivo `docker-compose-prod.yml`. Remoção de todos os *binds* de portas do Front, Back e DB (garantindo que não vazem para o host). Apenas o Nginx expõe portas 80 e 443.
- **HTTPS e Redirecionamento:** O arquivo `nginx/nginx.conf` possui a regra `return 301 https://$host$request_uri;` que força todos os acessos inseguros para a porta SSL criptografada com certificados locais da pasta `/certs/`.

## 8. Etapa 6 - Deploy no GHCR (GitHub Container Registry)
- **Jobs adicionados:** Estensão da esteira CI/CD adicionando os fluxos paralelos `deploy-backend` e `deploy-frontend`.
- **Permissões:** Concedido o `packages: write` no repositório.
- **Tags Automáticas:** Login realizado com `${{ secrets.GITHUB_TOKEN }}`. As imagens de produção são construídas e publicadas automaticamente sempre que houver *push* na `main`, recebendo obrigatoriamente a tag `:latest` e a respectiva hash identificadora do commit `${{ github.sha }}`.

## 9. Validação Final
- **Comandos executados:** `docker compose -f docker-compose-prod.yml up -d` usando SSL.
- **Resultados:** Acesso local protegido e operante pelo Nginx. O Action rodou perfeitamente os testes paralelizados e o Deploy. As imagens estão disponíveis nas packages do repositório no Github.

## 10. Histórico Git
| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `b943df5` | `feat: Etapa 1 - Containerizacao DEV (Backend e Frontend)` - Boilerplates básicos de Django e Next.js com Dockerfiles. |
| 2 | `d773dd7` | `feat: Etapa 2 - Orquestracao DEV com Docker Compose e DB` - Docker compose integrando Banco, Front e Back. |
| 3 | `0a3cd17` | `feat: Etapa 3 - Pipeline de CI (Fail-Fast e validacao)` - Workflow do Github Actions com steps de dependências (Lint/Build/Test). |
| 4 | `febc39e` | `feat: Etapa 4 - Containers de PRODUCAO (Multi-stage, Alpine, non-root)` - Imagens prod otimizadas em segurança e tamanho. |
| 5 | `e3ed105` | `feat: Etapa 5 - Stack Completo de PRODUCAO com Nginx e SSL` - Proxy reverso, certificados autoassinados e rede isolada. |
| 6 | `923aa2a` | `feat: Etapa 6 - Deploy Continuo (CD) no GHCR` - Publish automatizado das imagens `.prod` com hash única e tag latest na registry. |
