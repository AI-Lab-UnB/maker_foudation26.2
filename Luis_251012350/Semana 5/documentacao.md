# Semana 5 - Containerização e CI/CD

## 1. Identificação
- **Equipe:** Individual
- **Integrantes:** Luis Felipe Albuquerque Fernandes
- **Repositório:** [https://github.com/LuisFelipe311/ailab-semana5-cicd](https://github.com/LuisFelipe311/ailab-semana5-cicd)
- **Descrição:** Implementação de uma infraestrutura completa de CI/CD e orquestração de contêineres para uma aplicação full-stack (Django, Next.js, PostgreSQL e Nginx), visando um ambiente de produção seguro, automatizado e escalável[cite: 18].

## 2. Arquitetura
- **Stack:** Python 3.12 (Django), Node.js 20 (Next.js), PostgreSQL 16-alpine, Nginx alpine[cite: 18].
- **Serviços:**
  - `db`: Banco de dados PostgreSQL rodando isolado na rede interna[cite: 18].
  - `backend`: API REST em Django (Gunicorn em produção, runserver em dev) conectada ao `db`[cite: 18].
  - `frontend`: Aplicação Next.js consumindo o `backend`[cite: 18].
  - `nginx`: Proxy reverso exposto publicamente para gerir rotas e SSL[cite: 18].
- **Fluxo de comunicação:** O tráfego externo atinge o Nginx (portas 80/443). O Nginx roteia requisições de `/api/` e `/admin/` para a porta 8000 do `backend`, e `/` para a porta 3000 do `frontend`[cite: 18]. O `backend` comunica-se de forma privada com o `db` na porta 5432[cite: 18].

## 3. Etapa 1 - DEV
- **Implementação:** Criação de `Dockerfile.dev` separados para o backend (`python:3.12-alpine`) e frontend (`node:20-alpine`)[cite: 18].
- **Validação:** Uso de bind mounts (`-v`) para espelhar o código-fonte da máquina local para dentro dos contêineres, garantindo hot reload ativo (Next.js) e `DEBUG=True` (Django)[cite: 18].
- **Evidências:** Os contêineres iniciam e refletem mudanças de código imediatamente sem necessidade de novos builds[cite: 18].
- **Commit:** `Etapa 1: containeriza ambiente de dev (backend e frontend)`

## 4. Etapa 2 - Docker Compose
- **Implementação:** Arquivo `docker-compose.yml` consolidando `db`, `backend` e `frontend` em uma rede interna[cite: 18].
- **Healthcheck:** Configurado `pg_isready -U test_user -d test_db` no serviço do banco, acoplado ao `depends_on: condition: service_healthy` no backend para evitar quebra na inicialização[cite: 18].
- **Persistência:** Volume nomeado `postgres_data` mapeado para `/var/lib/postgresql/data`[cite: 18].
- **Validação:** Comando `docker compose up -d` inicializa toda a stack de forma sincronizada, permitindo o frontend consumir os dados da API[cite: 18].
- **Commit:** `Etapa 2: orquestra backend, frontend e db com Docker Compose`

## 5. Etapa 3 - CI
- **Jobs do backend:** Trilha executada via GitHub Actions (`lint-backend` com Ruff → `build-backend` → `test-backend` com banco de dados em service)[cite: 18].
- **Jobs do frontend:** Trilha paralela (`lint-frontend` com ESLint → `build-frontend` → `test-frontend` com npm test)[cite: 18].
- **Fail-Fast:** Adicionada a diretiva `needs` entre os steps. Uma quebra no linting impede imediatamente a execução de builds, economizando recursos do runner[cite: 18].
- **Cache:** Utilizado `actions/setup-python@v5` (cache: 'pip') e `actions/setup-node@v4` (cache: 'npm') para acelerar a instalação de dependências[cite: 18].
- **Evidências:** A aba Actions no GitHub demonstra a execução correta da pipeline com todas as dependências respeitadas e sucesso nas validações[cite: 19].
- **Commit:** `Etapa 3: adiciona pipeline de CI com trilhas lint-build-test para backend e frontend`

## 6. Etapa 4 - Produção
- **Backend:** `Dockerfile.prod` usando `gunicorn` em vez do servidor de desenvolvimento e criação de usuário não-root (`appuser`) para execução segura[cite: 18].
- **Frontend:** Implementação de multi-stage build (`deps`, `builder`, `runner`) copiando estritamente os artefatos necessários[cite: 18].
- **Multi-stage e Standalone:** Configurado `output: 'standalone'` no `next.config.mjs` para gerar uma build autossuficiente[cite: 18].
- **Usuários não-root:** Ambos os contêineres de produção executam com usuários restritos (`appuser` e `nextjs`)[cite: 18].
- **Tamanho final das imagens:** A imagem do Next.js reduziu drasticamente, mantendo-se abaixo dos 150 MB estipulados no desafio[cite: 18].
- **Commit:** `Etapa 4 - adicionando Dockerfiles de producao multi-stage e otimizacao standalone`

## 7. Etapa 5 - Nginx e SSL
- **Reverse proxy:** Configurado `nginx.conf` gerenciando os blocos `upstream` para o Next.js e Gunicorn[cite: 18].
- **Portas expostas:** Apenas as portas 80 e 443 do Nginx estão mapeadas para o host[cite: 18]. As portas 8000, 3000 e 5432 são internas da rede do Docker[cite: 18].
- **HTTPS:** Configuração de certificados SSL locais (`nginx.crt` e `nginx.key`) injetados via volume de leitura (`:ro`)[cite: 18].
- **Redirecionamento:** O bloco de escuta na porta 80 implementa `return 301 https://$host$request_uri;` forçando o tráfego seguro[cite: 18].
- **Validação:** Acesso a `https://localhost` carrega a interface perfeitamente; requisições dinâmicas para `/api` resolvem corretamente com status `ok` e renderização das opções (Configurar Docker, Automatizar CI, Publicar no GHCR) na tela.
- **Commit:** `Etapa 5 - Adicionando orquestracao de producao com nginx e ssl`

## 8. Etapa 6 - GHCR
- **Imagens publicadas:** Imagens de produção carregadas no GitHub Container Registry do repositório (`ghcr.io`)[cite: 18].
- **Tags:** Utilização da tag `:latest` via `docker/build-push-action`[cite: 18].
- **Permissões:** Concedida permissão de `packages: write` no arquivo `ci.yml` e realizada autenticação usando `${{ secrets.GITHUB_TOKEN }}`[cite: 18].
- **Evidências:** O log do GitHub Actions aponta execução bem-sucedida do step "Publicar Imagens no GHCR" em 1m 25s[cite: 19], ativado sequencialmente após a validação completa de todas as trilhas (lint, build, test)[cite: 18, 19].
- **Commit:** `Etapa 6 - Adicionando automacao de publicacao no GHCR`

## 9. Validação Final
- **Comandos executados:** Geração de SSL via container descartável Alpine, deploy completo utilizando `docker compose -f docker-compose.prod.yml up --build -d`.
- **Resultados:** Stack de produção ativa com frontend funcional, Nginx como barreira de segurança distribuindo o tráfego, comunicações rodando unicamente sob rede isolada e HTTPS aplicado. Pipeline de CI/CD validada em ponta-a-ponta, encerrando a execução com a imagem gravada no GHCR[cite: 18, 19].
- **Limitações:** O certificado SSL utilizado é autoassinado para validação em ambiente local, gerando um aviso natural de navegação insegura; em produção real, adotar-se-ia emissor de certificados (ex: Let's Encrypt).

## 10. Histórico Git
| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `Etapa 1: containeriza ambiente de dev (backend e frontend)` | Inicialização dos Dockerfiles com Alpine, hot reload e bind mounts. |
| 2 | `Etapa 2: orquestra backend, frontend e db com Docker Compose` | Criação do docker-compose.yml para orquestrar serviços e volume PostgreSQL. |
| 3 | `Etapa 3: adiciona pipeline de CI com trilhas lint-build-test para backend e frontend` | Implementação do GitHub Actions executando CI estruturado com fail-fast. |
| 4 | `Etapa 4 - adicionando Dockerfiles de producao multi-stage e otimizacao standalone` | Otimização das imagens, criação do usuário non-root e output standalone no Next.js. |
| 5 | `Etapa 5 - Adicionando orquestracao de producao com nginx e ssl` | Implementação do arquivo de compose focado em produção, Nginx atuando como proxy reverso e suporte TLS. |
| 6 | `Etapa 6 - Adicionando automacao de publicacao no GHCR` | Adição de job no CI para publicar imagens no Registry após validação das suítes de testes. |