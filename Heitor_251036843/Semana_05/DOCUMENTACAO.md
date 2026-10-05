# Semana 5 - Containerização e CI/CD

## 1. Identificação
- **Equipe:** Individual
- **Integrantes:** Heitor Gomes Monteiro (Matrícula: 251036843)
- **Repositório do Projeto:** [https://github.com/heitormontt/Semana-05-Makers-Docker](https://github.com/heitormontt/Semana-05-Makers-Docker)

## 2. Arquitetura
- **Stack:** Django (Backend), Next.js (Frontend com App Router), PostgreSQL (Banco de Dados), Nginx (Reverse Proxy).
- **Serviços:**
  - `db`: PostgreSQL na porta 5432 (isolada na rede interna do Docker).
  - `backend`: Django API na porta 8000 (isolada na produção).
  - `frontend`: Next.js na porta 3000 (isolada na produção).
  - `nginx`: Reverse proxy exposto nas portas 80 (HTTP) e 443 (HTTPS).
- **Fluxo de comunicação:** Os clientes externos comunicam exclusivamente com o Nginx (porta 80/443). O Nginx redireciona o tráfego HTTP para HTTPS e faz o encaminhamento (*proxy_pass*) das requisições: rotas `/api/` e `/admin/` para o `backend:8000` e a rota `/` para o `frontend:3000`. O backend comunica com o `db` através da rede interna do Compose.

## 3. Etapa 1 - DEV
- **Implementação:** Foram criados dois arquivos `Dockerfile` para o ambiente de desenvolvimento. O backend utilizou a imagem base `python:3.12-slim` com `manage.py runserver` e `DEBUG=True`. O frontend utilizou a imagem `node:20-alpine` com o comando `npm run dev`.
- **Validação:** A execução individual foi validada utilizando comandos `docker run` com as *flags* `-v` (*bind mounts*) para espelhar as pastas do *host* para dentro dos contêineres, permitindo o *hot reload* imediato das alterações no código.
- **Commit:** `f49ce70` - *feat: adiciona Dockerfiles de desenvolvimento do backend e frontend*

## 4. Etapa 2 - Docker Compose
- **Implementação:** Foi criado o arquivo `docker-compose.yml` integrando o `backend`, `frontend` e `db` numa rede isolada. As variáveis de ambiente foram protegidas através da leitura de um arquivo `.env` não versionado.
- **Healthcheck:** Configurado no serviço PostgreSQL usando o comando `pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB`, garantindo que o backend apenas arranca quando o banco de dados estiver pronto para receber conexões.
- **Persistência:** Foi criado o volume nomeado `postgres_data` mapeado para `/var/lib/postgresql/data`.
- **Validação:** O comando `docker compose up` levantou a *stack* inteira sem falhas de conexão ao banco de dados.
- **Commit:** `7b45a97` - *feat: orquestracao com docker-compose, persistencia e healthcheck*

## 5. Etapa 3 - CI
- **Jobs do backend:** Sequência `lint-backend` (Flake8) -> `build-backend` -> `test-backend` (Django tests) utilizando o *runner* `ubuntu-latest` com Python 3.12.
- **Jobs do frontend:** Sequência `lint-frontend` (ESLint) -> `build-frontend` -> `test-frontend` utilizando o *runner* `ubuntu-latest` com Node.js 20.
- **Fail-Fast:** Implementado em ambas as vias com a diretiva `needs`. Se o *lint* falhar, o *build* não inicia; se o *build* falhar, os testes são bloqueados. Evidência no link do workflow: [https://github.com/heitormontt/Semana-05-Makers-Docker/actions](https://github.com/heitormontt/Semana-05-Makers-Docker/actions)
- **Cache:** Utilizada a diretiva `cache: 'pip'` no backend e `cache: 'npm'` (com leitura do `package-lock.json`) no frontend.
- **Commit:** `3a369c7` - *ci: cria pipeline github actions com fail-fast para backend frontend*

## 6. Etapa 4 - Produção
- **Backend:** Criado o `Dockerfile.prod` utilizando a imagem `python:3.12-alpine`, servindo a aplicação através de Gunicorn.
- **Frontend:** Implementado *multi-stage build* (`deps`, `builder`, `runner`). O `next.config.mjs` foi configurado com `output: 'standalone'` para empacotar apenas o código necessário.
- **Usuários não-root:** Ambos os contêineres de produção executam com processos desprivilegiados. Criados os usuários `appuser` (backend) e `nextjs` (frontend, grupo `nodejs`).
- **Tamanho final das imagens:** A otimização com Alpine e Standalone reduziu substancialmente o tamanho da imagem do frontend para debaixo da meta dos 150 MB.
- **Commit:** `d39fdf2` - *feat: Dockerfiles otimizados para producao (standalone e multi-stage)*

## 7. Etapa 5 - Nginx e SSL
- **Reverse proxy:** Configurado no `nginx/nginx.conf` para ser o único ponto de entrada para a aplicação.
- **Portas expostas:** O arquivo `docker-compose-prod.yml` isola as portas 8000 e 3000 do *host*. Apenas o contêiner do Nginx expõe as portas 80 e 443.
- **HTTPS:** Configurado certificado autoassinado (gerado via OpenSSL localmente) mapeado via *bind mount* *read-only* para `/etc/nginx/certs`.
- **Redirecionamento:** O bloco de escuta na porta 80 implementa um `return 301 https://$host$request_uri;` garantindo comunicação segura.
- **Validação:** Acessar `http://localhost` no navegador redireciona instantaneamente para `https://localhost`.
- **Commit:** `fb877cf` - *feat: adiciona nginx, ssl e docker-compose isolado para producao*

## 8. Etapa 6 - GHCR
- **Imagens publicadas:** O arquivo `ci.yml` foi expandido com as *jobs* `deploy-backend` e `deploy-frontend`.
- **Tags:** Ambas as imagens recebem a dupla marcação `latest` e a hash unívoca `${{ github.sha }}`.
- **Permissões:** Utilizada a diretiva `permissions: contents: read, packages: write` para autorizar a publicação pelo `github.actor` usando o `${{ secrets.GITHUB_TOKEN }}`. Os pacotes estão disponíveis em: [https://github.com/heitormontt/Semana-05-Makers-Docker/pkgs/container/semana-05-makers-docker-backend](https://github.com/heitormontt/Semana-05-Makers-Docker/pkgs/container/semana-05-makers-docker-backend)
- **Commit:** `700d2cb` - *ci: adiciona jobs de deploy no ghcr para imagens de producao*

## 9. Validação Final
- **Comandos executados:**
  ```bash
  docker compose -f docker-compose-prod.yml up -d --build