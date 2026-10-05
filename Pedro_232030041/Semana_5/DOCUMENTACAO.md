# Semana 5 - Containerizacao e CI/CD

## 1. Identificacao
- Equipe: Individual
- Integrantes: Pedro Henrique Gomes
- Repositorio: https://github.com/phenric26/Semana_5_Makers

## 2. Arquitetura
- Stack: Django (Backend), Next.js (Frontend), PostgreSQL (Banco de Dados), Nginx (Proxy Reverso/Servidor Web).
- Servicos: `frontend` (porta 3000 interna), `backend` (porta 8000 interna), `db` (porta 5432 interna) e `nginx` (portas 80 e 443 expostas).
- Fluxo de comunicacao: Nginx atua como proxy reverso, recebendo tráfego na porta 443 (HTTPS). Requisições para `/api/` ou `/admin/` são roteadas para o backend (Django). Requisições para a raiz `/` são roteadas para o frontend (Next.js). O backend se comunica com o PostgreSQL internamente na rede do Docker.

## 3. Etapa 1 - DEV
- Implementacao: Criação dos arquivos `Dockerfile` de desenvolvimento para o backend (`python:3.12-slim`) e para o frontend (`node:20-alpine`).
- Validacao: Execução individual de cada container com `docker run` e mapeamento de portas (`-p 8000:8000` e `-p 3000:3000`). Utilização de bind mounts (`-v`) para garantir o hot reload tanto no Django (com `DEBUG=True`) quanto no Next.js sem a necessidade de rebuild.
- Evidencias: Acesso ao navegador nas portas mapeadas respondendo adequadamente e evidências salvas no repositório.
- Commit: [3937f70](https://github.com/phenric26/Semana_5_Makers/commit/3937f70) (feat: conclui etapa 1 - containeriza ambiente de DEV)

## 4. Etapa 2 - Docker Compose
- Implementacao: Criação do arquivo `docker-compose.yml` na raiz do projeto, orquestrando os serviços `frontend`, `backend` e `db`. O backend foi configurado para ler credenciais do PostgreSQL a partir de variáveis de ambiente.
- Healthcheck: Implementado no serviço `db` utilizando `pg_isready`, com o backend usando `depends_on` e `condition: service_healthy` para aguardar a prontidão do banco antes de iniciar.
- Persistencia: Configurado um volume nomeado `postgres_data` mapeado para `/var/lib/postgresql/data` no container do banco.
- Validacao: O comando `docker compose up` iniciou a stack perfeitamente. O frontend conseguiu consumir a API através do endpoint de healthcheck corretamente.
- Commit: [44a4665](https://github.com/phenric26/Semana_5_Makers/commit/44a4665) (feat: adiciona docker compose, integrando front, back e db)

## 5. Etapa 3 - CI
- Jobs do backend: `lint-backend` (Ruff), `build-backend` (validação de build do container sem push) e `test-backend` (Django tests).
- Jobs do frontend: `lint-frontend` (ESLint), `build-frontend` e `test-frontend` (Jest).
- Fail-Fast: Implementado o uso de `needs` em ambos os fluxos, garantindo que o build só ocorre se o lint passar, e os testes só rodam se o build passar. Três falhas induzidas foram testadas antes da correção e aprovação final.
- Cache: Configurado `cache: 'pip'` na setup do Python e `cache: 'npm'` na setup do Node.js.
- Evidencias: Histórico de execuções na aba "Actions" no GitHub mostrando o pipeline falhando nos testes controlados e o posterior sucesso.
- Commit: [8beb480](https://github.com/phenric26/Semana_5_Makers/commit/8beb480) (fix: corrige os caminhos das pastas no ci.yml)

## 6. Etapa 4 - Producao
- Backend: Criado `Dockerfile.prod` utilizando `python:3.12-alpine`, servidor Gunicorn configurado para a porta 8000 via bind.
- Frontend: `Dockerfile.prod` utilizando multi-stage build (`deps`, `builder` e `runner`) e Next.js em modo `standalone`.
- Multi-stage: Apenas as pastas `.next/standalone`, `.next/static` e `public` foram copiadas para o estágio final de produção do frontend.
- Usuarios nao-root: Usuário `nextjs` (UID 1001) configurado no frontend e usuário desprivilegiado no backend para maior segurança.
- Tamanho final das imagens: Imagem do frontend otimizada resultando em tamanho abaixo dos 150 MB exigidos (~129 MB).
- Commit: [aaca499](https://github.com/phenric26/Semana_5_Makers/commit/aaca499) (feat: adiciona docker para producao)

## 7. Etapa 5 - Nginx e SSL
- Reverse proxy: Nginx configurado para mascarar os serviços internos, com roteamento condicional no `nginx.conf`.
- Portas expostas: Apenas as portas 80 e 443 foram mapeadas para o host (`docker-compose-prod.yml`), isolando as portas 3000 e 8000.
- HTTPS: Porta 443 configurada com certificado autoassinado (TLS) gerado via OpenSSL na pasta `nginx/certs`.
- Redirecionamento: Bloco de servidor HTTP no Nginx configurado para redirecionar permanentemente o tráfego da porta 80 para a 443.
- Validacao: `docker compose -f docker-compose-prod.yml up -d` acessível via `https://localhost` com comunicação fluida entre front e back usando URL relativa (`/api/health/`).
- Commit: [168310c](https://github.com/phenric26/Semana_5_Makers/commit/168310c) (feat: implementa compose e nginx para prod)

## 8. Etapa 6 - GHCR
- Imagens publicadas: `ghcr.io/phenric26/semana_5_makers-backend` e `ghcr.io/phenric26/semana_5_makers-frontend`.
- Tags: Cada imagem é publicada simultaneamente com as tags `latest` e a hash do commit (`${{ github.sha }}`).
- Permissoes: Configurado `permissions: packages: write, contents: read` no workflow, autenticando no GHCR com `${{ secrets.GITHUB_TOKEN }}`.
- Evidencias: Pacotes visíveis na página inicial do repositório no GitHub.
- Commit: [54f9d9b](https://github.com/phenric26/Semana_5_Makers/commit/54f9d9b) (feat: implementa pipeline de deploy no GHCR)

## 9. Validacao Final
- Comandos executados: `docker compose -f docker-compose-prod.yml up -d --build`
- Resultados: Stack inicializou com sucesso utilizando SSL; pipelines de CI/CD reportaram todas as trilhas aprovadas e imagens foram empurradas para o Registry.
- Limitacoes: O certificado de SSL é autoassinado, o que causa um alerta de "conexão não segura" no navegador durante o desenvolvimento local.

## 10. Historico Git
| Etapa | Commit | Descricao |
|---|---|---|
| 1 | [3937f70](https://github.com/phenric26/Semana_5_Makers/commit/3937f70) | feat: conclui etapa 1 - containeriza ambiente de DEV |
| 2 | [44a4665](https://github.com/phenric26/Semana_5_Makers/commit/44a4665) | feat: adiciona docker compose, integrando front, back e db |
| 3 | [8beb480](https://github.com/phenric26/Semana_5_Makers/commit/8beb480) | fix: corrige os caminhos das pastas no ci.yml |
| 4 | [aaca499](https://github.com/phenric26/Semana_5_Makers/commit/aaca499) | feat: adiciona docker para producao |
| 5 | [168310c](https://github.com/phenric26/Semana_5_Makers/commit/168310c) | feat: implementa compose e nginx para prod |
| 6 | [54f9d9b](https://github.com/phenric26/Semana_5_Makers/commit/54f9d9b) | feat: implementa pipeline de deploy no GHCR |
