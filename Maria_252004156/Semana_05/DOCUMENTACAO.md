# Semana 5 - Containerizacao e CI/CD 

## 1. Identificacao
- Integrantes: Maria Júlia Sena
- Repositorio: https://github.com/mariajulia-senaa/projeto-semana5

## 2. Arquitetura
- Stack: Python/Django (Backend), Node.js/Next.js (Frontend), PostgreSQL (Banco de Dados), Nginx (Proxy Reverso), Docker e GitHub Actions.
- Servicos: `db` (Postgres), `backend` (Django), `frontend` (Next.js) e `nginx`.
- Fluxo de comunicacao: O Nginx atua como ponto único de entrada (portas 80 e 443). Ele redireciona chamadas com prefixo `/api/` e `/admin/` para o backend na rede interna, e o restante do tráfego (`/`) para o frontend. O backend comunica com o PostgreSQL internamente pela porta 5432.

## 3. Etapa 1 - DEV
- Implementacao: Criação de `Dockerfile` isolado para desenvolvimento no backend (base `python:3.12-slim`) e frontend (base `node:20-alpine`).
- Validacao: Garantia de hot reload no Next.js e `DEBUG=True` no Django. 
- Evidencias: Bind mounts configurados para mapear o código local para dentro do contêiner sem necessidade de novos builds.
- Commit: `5da8c6b` - feat: conclui Etapa 1 com Dockerfiles de DEV

## 4. Etapa 2 - Docker Compose
- Implementacao: Criação de `docker-compose.yml` para unificar os serviços.
- Healthcheck: Configurado no serviço `db` usando `pg_isready` para garantir que o backend (`depends_on: condition: service_healthy`) apenas inicie quando o banco estiver aceitando conexões.
- Persistencia: Uso de volume nomeado `postgres_data` mapeado para `/var/lib/postgresql/data`.
- Validacao: Stack sobe com sucesso utilizando `docker compose up`.
- Commit: `92edc5f` - feat: Conclusão Etapa 2 com docker-compose

## 5. Etapa 3 - CI
- Jobs do backend:`lint-backend` (Flake8 ajustado com `--max-line-length=120`), `build-backend` e `test-backend`.
- Jobs do frontend: `lint-frontend` (ESLint), `build-frontend` e `test-frontend`.
- Fail-Fast: Implementado através do uso restrito da cláusula `needs`. Uma falha no lint impede o build e os testes. Falhas controladas foram validadas.
- Cache: Utilizado `actions/setup-python` com `cache: 'pip'` e `actions/setup-node` com `cache: 'npm'`.
- Evidencias: Pipeline roda automaticamente a cada push na branch `main`.
- Commit: 
  - `05b4a17` - ci:Ccria pipeline de testes e build (Etapa 3)
  - `ac8678b` - fix: Ajusta limite de caracteres do flake8

## 6. Etapa 4 - Producao
- Backend:`Dockerfile.prod` utiliza `python:3.12-alpine`, expõe o servidor Gunicorn e roda sob o usuário sem privilégios `djangouser`.
- Frontend:O `next.config.ts` foi configurado com `output: 'standalone'`.
- Multi-stage:Aplicado no frontend dividindo em fases de dependências (`deps`), construção (`builder`) e execução (`runner`), copiando apenas o essencial.
- Usuarios nao-root:Criação de usuário `nextjs` e `djangouser` por motivos de segurança.
- Tamanho final das imagens: Otimizadas agressivamente devido ao uso de multi-stage builds e bases Alpine. O impacto foi medido com sucesso: a imagem do backend foi reduzida de 270MB para 63.3MB (redução de ~76%) e a do frontend caiu de 1.31GB para 373MB (redução de ~71%).
- Commit: `bb68850` - feat: Dockerfiles de producao (Etapa 4)

## 7. Etapa 5 - Nginx e SSL
- Reverse proxy:Nginx configurado via `nginx.conf` atuando como proxy reverso para backend e frontend.
- Portas expostas:80 (HTTP) e 443 (HTTPS). O banco de dados, frontend e backend internos foram isolados (portas removidas do docker-compose).
- HTTPS:Certificados locais self-signed (`openssl`) mapeados via volumes (`ro`).
- Redirecionamento:HTTP (80) sofre redirecionamento permanente (301) para HTTPS (443).
- Validacao:Stack de produção executada localmente via `docker compose -f docker-compose-prod.yml up -d`.
- Commit: `c59105e` - feat: Nginx, HTTPS e docker-compose de producao (Etapa 5)

## 8. Etapa 6 - GHCR
- Imagens publicadas:As imagens do backend e frontend de produção são enviadas automaticamente para o GitHub Container Registry após os testes passarem.
- Tags:Implementado duplo tagueamento com `:latest` e `:${{ github.sha }}`.
- Permissoes:Ajustadas via `permissions: packages: write` no workflow.
- Evidencias: Workflow completo de 8 jobs rodando com sucesso absoluto (visto verde no GitHub Actions).
- Commit:
  - `a8c9e18` - feat: deploy continuo no GHCR (Etapa 6)
  - `1a08643` - fix: corrige caminho do Dockerfile de producao do frontend

 ## 9. Validacao Final
 - Comandos executados:`docker run`, `docker compose up`, `git push` para acionar actions, `openssl` para certificados.
 - Resultados:Fluxo CI/CD (8/8 jobs passados na Trilha CI) aprovado, garantindo qualidade antes do empacotamento das imagens de deploy.
 - Limitacoes:O uso de certificado autoassinado (self-signed) para HTTPS causará um alerta inicial em navegadores comuns (sendo aceitável apenas para ambiente de validação local).
## 10. Histórico Git

| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `5da8c6b` | feat: conclui Etapa 1 com Dockerfiles de DEV |
| 2 | `92edc5f` | feat: Conclusão Etapa 2 com docker-compose |
| 3 | `05b4a17` | ci:Ccria pipeline de testes e build (Etapa 3) |
| 3.1 | `ac8678b` | fix: Ajusta limite de caracteres do flake8 |
| 4 | `bb68850` | feat: Dockerfiles de producao (Etapa 4) |
| 5 | `c59105e` | feat: Nginx, HTTPS e docker-compose de producao (Etapa 5) |
| 6 | `a8c9e18` | feat: deploy continuo no GHCR (Etapa 6) |
| 6.1 | `1a08643` | fix: corrige caminho do Dockerfile de producao do frontend |

