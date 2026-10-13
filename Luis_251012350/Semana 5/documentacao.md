# Semana 5 - Containerização e CI/CD

## 1. Identificação
- **Equipe:** Individual
- **Integrantes:** Luis Felipe Albuquerque Fernandes
- **Repositório:** [https://github.com/LuisFelipe311/ailab-semana5-cicd](https://github.com/LuisFelipe311/ailab-semana5-cicd)
- **Descrição:** Implementação de uma infraestrutura completa de CI/CD e orquestração de contêineres para uma aplicação full-stack (Django, Next.js, PostgreSQL e Nginx), visando um ambiente de produção seguro, automatizado e escalável.

## 2. Arquitetura
- **Stack:** Python 3.12 (Django), Node.js 20 (Next.js), PostgreSQL 16-alpine, Nginx alpine.
- **Serviços:**
  - `db`: Banco de dados PostgreSQL rodando isolado na rede interna.
  - `backend`: API REST em Django (Gunicorn em produção, runserver em dev) conectada ao `db`.
  - `frontend`: Aplicação Next.js consumindo o `backend`.
  - `nginx`: Proxy reverso exposto publicamente para gerir rotas e SSL.
- **Fluxo de comunicação:** O tráfego externo atinge o Nginx (portas 80/443). O Nginx roteia requisições de `/api/` e `/admin/` para a porta 8000 do `backend`, e `/` para a porta 3000 do `frontend`. O `backend` comunica-se de forma privada com o `db` na porta 5432.
- **Arquivos de orquestração:** `docker-compose.yml` (desenvolvimento, com bind mounts e hot reload) e `docker-compose-prod.yml` (produção, com Nginx, SSL e sem credenciais fixas).

## 3. Etapa 1 - DEV
- **Implementação:** Criação de `Dockerfile.dev` separados para o backend (`python:3.12-slim`) e frontend (`node:20-alpine`). A base do backend foi trocada de `python:3.12-alpine` para `python:3.12-slim` ao final do projeto; o build local foi refeito e os contêineres subiram `healthy`.
- **Validação:** Uso de bind mounts (`-v`) para espelhar o código-fonte da máquina local para dentro dos contêineres, garantindo hot reload ativo (Next.js) e `DEBUG=True` (Django).
- **Evidências:** Os contêineres iniciam e refletem mudanças de código imediatamente sem necessidade de novos builds.
- **Commit:** `Etapa 1: containeriza ambiente de dev (backend e frontend)`

## 4. Etapa 2 - Docker Compose
- **Implementação:** Arquivo `docker-compose.yml` consolidando `db`, `backend` e `frontend` em uma rede interna.
- **Healthcheck:** Configurado `pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB` no serviço do banco, acoplado ao `depends_on: condition: service_healthy` no backend para evitar quebra na inicialização. As credenciais vêm de variáveis de ambiente (arquivo `.env`), sem valores fixos no compose.
- **Persistência:** Volume nomeado `postgres_data` mapeado para `/var/lib/postgresql/data`.
- **Ambiente de dev:** O frontend acessa a API por caminho relativo (`/api/health`). Para isso funcionar dentro do compose, o `next.config.ts` define um `rewrites()` (ativo apenas em desenvolvimento) que encaminha a rota para `http://backend:8000/api/health/`, e o serviço `backend` recebe `ALLOWED_HOSTS=localhost,127.0.0.1,backend`. Veja a seção 11.
- **Validação:** Comando `docker compose up -d` inicializa toda a stack de forma sincronizada, permitindo o frontend consumir os dados da API em `http://localhost:3000`.
- **Commit:** `Etapa 2: orquestra backend, frontend e db com Docker Compose`

## 5. Etapa 3 - CI
- **Jobs do backend:** Trilha executada via GitHub Actions (`lint-backend` com Ruff → `build-backend` → `test-backend` com banco de dados em service).
- **Jobs do frontend:** Trilha paralela (`lint-frontend` com ESLint → `build-frontend` → `test-frontend` com npm test).
- **Deploy:** Dois jobs separados, `deploy-backend` e `deploy-frontend`, executados somente após a validação das trilhas (ver seção 8). O pipeline completo tem **8 jobs**.
- **Fail-Fast:** Adicionada a diretiva `needs` entre os steps. Uma quebra no linting impede imediatamente a execução de builds, economizando recursos do runner.
- **Cache:** Utilizado `actions/setup-python@v5` (cache: 'pip') e `actions/setup-node@v4` (cache: 'npm') para acelerar a instalação de dependências.
- **Evidências:** A aba Actions no GitHub demonstra a execução correta da pipeline com todas as dependências respeitadas e sucesso nas validações.
- **Commit:** `Etapa 3: adiciona pipeline de CI com trilhas lint-build-test para backend e frontend`

### Teste de Fail-Fast (3 falhas controladas)
Para comprovar o comportamento fail-fast, foram introduzidas três falhas propositais, uma por vez, e depois revertidas:

| Falha provocada | Job que falhou | Commit | Evidência |
|---|---|---|---|
| Erro de lint proposital | `lint-backend` | `ea5764a` | Run #15: **[PREENCHER: link do run]** |
| Teste quebrado proposital | `test-backend` | `1929b58` | Run #16: **[PREENCHER: link do run]** |
| Erro de build no frontend proposital | `build-frontend` | `e803523` | Run #**[PREENCHER: número]**: **[PREENCHER: link do run]** |

Nos três casos, os jobs dependentes via `needs` não foram executados. A reversão foi feita no commit `8f74a72` (`fix: remove falhas propositais do fail-fast, pipeline volta a verde`), e o pipeline voltou a passar nos 8 jobs.

## 6. Etapa 4 - Produção
- **Backend:** `Dockerfile.prod` usando `gunicorn` em vez do servidor de desenvolvimento e criação de usuário não-root (`appuser`) para execução segura.
- **Frontend:** Implementação de multi-stage build (`deps`, `builder`, `runner`) copiando estritamente os artefatos necessários.
- **Multi-stage e Standalone:** Configurado `output: 'standalone'` no `next.config.ts` para gerar uma build autossuficiente.
- **Usuários não-root:** Ambos os contêineres de produção executam com usuários restritos (`appuser` e `nextjs`), confirmado nos testes de produção.
- **Tamanho final das imagens:** Frontend (Next.js): **64.2 MB**, abaixo dos 150 MB estipulados no desafio. Backend: **[PREENCHER: tamanho, via `docker images`]**.
- **`.dockerignore`:** Adicionado no backend e no frontend para reduzir o contexto de build.
- **Commit:** `Etapa 4 - adicionando Dockerfiles de producao multi-stage e otimizacao standalone`

## 7. Etapa 5 - Nginx e SSL
- **Reverse proxy:** Configurado `nginx.conf` gerenciando os blocos `upstream` para o Next.js e Gunicorn.
- **Portas expostas:** Apenas as portas 80 e 443 do Nginx estão mapeadas para o host. As portas 8000, 3000 e 5432 são internas da rede do Docker, e backend e frontend não ficam acessíveis diretamente.
- **HTTPS:** Configuração de certificados SSL locais (`nginx.crt` e `nginx.key`) injetados via volume de leitura (`:ro`). A chave privada foi removida do controle de versão e é gerada localmente.
- **Credenciais:** O compose de produção (`docker-compose-prod.yml`) não contém credenciais fixas; os valores vêm de variáveis de ambiente, e o banco usa PostgreSQL 16.
- **Redirecionamento:** O bloco de escuta na porta 80 implementa `return 301 https://$host$request_uri;` forçando o tráfego seguro.
- **Validação:** Acesso a `https://localhost` carrega a interface perfeitamente, e `http://` redireciona com status 301. Requisições dinâmicas para `/api` resolvem corretamente com status `ok` e renderização das opções (Configurar Docker, Automatizar CI, Publicar no GHCR) na tela.
- **Commit:** `Etapa 5 - Adicionando orquestracao de producao com nginx e ssl`

## 8. Etapa 6 - GHCR
- **Imagens publicadas:** Imagens de produção carregadas no GitHub Container Registry do repositório (`ghcr.io`), uma para o backend e outra para o frontend.
- **Tags:** Cada imagem recebe a tag `:latest` e uma tag com o SHA do commit (`:sha`), via `docker/build-push-action`.
- **Jobs separados:** A publicação é feita por `deploy-backend` e `deploy-frontend`, ativados após a validação completa de todas as trilhas (lint, build, test).
- **Permissões:** Concedida permissão de `packages: write` no arquivo `ci.yml` e realizada autenticação usando `${{ secrets.GITHUB_TOKEN }}`.
- **Evidências:** Execução bem-sucedida dos jobs de deploy no GitHub Actions: **[PREENCHER: link do run]**. Pacotes no GHCR: **[PREENCHER: link do pacote backend]** e **[PREENCHER: link do pacote frontend]**.
- **Commits:** `Etapa 6 - Adicionando automacao de publicacao no GHCR` e `Etapa 6: separando deploy-backend e deploy-frontend, adiciona tag do commit (sha)`

## 9. Validação Final
- **Comandos executados:** Geração de SSL via container descartável Alpine, deploy completo utilizando `docker compose -f docker-compose-prod.yml up --build -d`.
- **Resultados:** Stack de produção ativa com frontend funcional, Nginx como barreira de segurança distribuindo o tráfego, comunicações rodando unicamente sob rede isolada e HTTPS aplicado. Pipeline de CI/CD validada em ponta a ponta (8 jobs verdes), encerrando a execução com as imagens gravadas no GHCR.
- **Limitações:** O certificado SSL utilizado é autoassinado para validação em ambiente local, gerando um aviso natural de navegação insegura; em produção real, adotar-se-ia emissor de certificados (ex: Let's Encrypt).

## 10. Histórico Git
| Etapa | Hash | Commit | Descrição |
|---|---|---|---|
| 1 | **[PREENCHER]** | `Etapa 1: containeriza ambiente de dev (backend e frontend)` | Inicialização dos Dockerfiles, hot reload e bind mounts. |
| 1 e 2 | `fb95fe8` | `Etapa 1 e 2: restaurando docker-compose.yml de dev (bind mounts, hot reload e Dockerfile.dev)` | Restauração do compose de desenvolvimento. |
| 2 | **[PREENCHER]** | `Etapa 2: orquestra backend, frontend e db com Docker Compose` | Criação do docker-compose.yml para orquestrar serviços e volume PostgreSQL. |
| 3 | **[PREENCHER]** | `Etapa 3: adiciona pipeline de CI com trilhas lint-build-test para backend e frontend` | Implementação do GitHub Actions executando CI estruturado com fail-fast. |
| 4 | **[PREENCHER]** | `Etapa 4 - adicionando Dockerfiles de producao multi-stage e otimizacao standalone` | Otimização das imagens, criação do usuário non-root e output standalone no Next.js. |
| 4 | `85758ec` | `Adicionando .dockerignore ao backend e frontend` | `.dockerignore` nos dois serviços. |
| 5 | **[PREENCHER]** | `Etapa 5 - Adicionando orquestracao de producao com nginx e ssl` | Compose de produção, Nginx como proxy reverso e suporte TLS. |
| 5 | `0e7cdc9` | `Etapa 5: renomeando compose de producao, remove credenciais fixas e usa Postgres 16` | Renomeação do compose de produção e remoção de credenciais fixas. |
| 5 | `2f2889c` | `Removendo chave privada SSL do controle de versao` | Chave privada removida do repositório. |
| 6 | `e714082` | `Etapa 6 - Adicionando automacao de publicacao no GHCR` | Job no CI para publicar imagens no Registry após validação das suítes de testes. |
| 6 | `4abca6b` | `Etapa 6: separando deploy-backend e deploy-frontend, adiciona tag do commit (sha)` | Deploys separados e tag `:sha`. |
| Correção | `5e23b0f` | `Corrige encoding do requirements.txt para UTF-8` | Correção de encoding. |
| Correção | `909c4e3` | `Corrigindo indentacao do job deploy-backend no ci.yml` | Correção de indentação no workflow. |
| Correção | `2da859b` | `Arrumando step duplicado no job test-frontend` | Remoção de step duplicado. |
| Correção | `0afb102` | `Corrigindo formatacao dos imports em settings.py (Ruff I001)` | Ajuste exigido pelo lint. |
| Fail-Fast | `ea5764a` | `test(fail-fast): provoca erro de lint proposital` | Falha controlada 1. |
| Fail-Fast | `1929b58` | `test(fail-fast): provoca teste quebrado proposital` | Falha controlada 2. |
| Fail-Fast | `e803523` | `test(fail-fast): provoca erro de build no frontend proposital` | Falha controlada 3. |
| Fail-Fast | `8f74a72` | `fix: remove falhas propositais do fail-fast, pipeline volta a verde` | Reversão das falhas. |
| Dev | `0dbdf35` | `trocando base para slim e configura proxy /api no ambiente de dev` | Base `python:3.12-slim`, rewrite do Next e `ALLOWED_HOSTS` no compose de dev. |

## 11. Problemas encontrados e soluções
1. **Erro 404 em `http://localhost:3000` (ambiente de dev).**
   - **Sintoma:** a página exibia "Erro na API: 404" e o console mostrava `GET http://localhost:3000/api/health 404`.
   - **Causa:** o frontend chama `/api/health` por caminho relativo, e o `next.config.ts` não tinha nenhum rewrite; o Next.js na porta 3000 não possui essa rota, então a requisição nunca chegava ao Django (o `curl` direto em `localhost:8000/api/health/` já respondia `ok`).
   - **Solução:** `rewrites()` no `next.config.ts`, ativo apenas em desenvolvimento, encaminhando `/api/health` para `http://backend:8000/api/health/`.
2. **Erro 400 depois do rewrite.**
   - **Sintoma:** o erro mudou de 404 para 400.
   - **Causa:** o log do backend mostrou `DisallowedHost: Invalid HTTP_HOST header: 'backend:8000'`. O Django só aceitava `localhost` e `127.0.0.1` (padrão do `ALLOWED_HOSTS`), e o proxy do Next envia o host `backend:8000`.
   - **Solução:** variável `ALLOWED_HOSTS=localhost,127.0.0.1,backend` no serviço `backend` do `docker-compose.yml` de desenvolvimento. O compose de produção não foi alterado.
3. **Outras correções ao longo do projeto:** encoding do `requirements.txt` (UTF-8), indentação do job `deploy-backend`, step duplicado em `test-frontend`, ordem de imports exigida pelo Ruff (I001), credenciais fixas removidas do compose de produção e chave privada SSL removida do controle de versão.