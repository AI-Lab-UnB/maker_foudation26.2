# Semana 5 - Containerização e CI/CD

## 1. Identificação
* **Equipa/Integrante:** Maria Luisa Lima
* **Repositório do Projeto:** [COLOQUE O LINK DO SEU GITHUB AQUI]
* **Descrição:** Aplicação conteinerizada com Frontend (Next.js), Backend (Django) e Base de Dados (PostgreSQL), orquestrada via Docker Compose, com proxy reverso (Nginx) e pipeline de CI/CD automatizado no GitHub Actions para o GHCR.

## 2. Arquitetura
* **Stack:** Django (Backend), Next.js App Router (Frontend), PostgreSQL (Base de Dados), Nginx (Proxy Reverso/SSL).
* **Serviços e Portas:** 
  * Backend: Interno na porta 8000.
  * Frontend: Interno na porta 3000.
  * DB: Interno na porta 5432.
  * Nginx: Exposto no host nas portas 80 (HTTP) e 443 (HTTPS).
* **Fluxo de comunicação:** O Nginx recebe o tráfego externo e encaminha as rotas `/api/` e `/admin/` para o Backend, e a rota `/` para o Frontend. O Backend comunica com a Base de Dados através da rede interna do Docker.

## 3. Etapa 1 - DEV
* **Implementação:** Criados `Dockerfiles` de desenvolvimento utilizando `python:3.12-slim` para o backend e `node:20-alpine` para o frontend.
* **Validação:** Containers executados com `docker run` utilizando *bind mounts* (`-v`) para mapear os ficheiros locais. O *hot reload* foi testado alterando o ficheiro `page.tsx` no frontend e validando a atualização automática no browser sem reconstruir a imagem.

## 4. Etapa 2 - Docker Compose
* **Implementação:** Orquestração com `docker-compose.yml`. Configuração da rede interna e variáveis de ambiente via `.env`.
* **Healthcheck:** O backend configurado com `depends_on: db: condition: service_healthy`, utilizando o comando `pg_isready` para garantir que o Django só inicia quando o PostgreSQL está pronto a receber conexões.
* **Persistência:** Criado o volume nomeado `postgres_data` mapeado para `/var/lib/postgresql/data`.

## 5. Etapa 3 - CI
* **Implementação:** Workflow de CI criado no GitHub Actions (`.github/workflows/pipeline.yml`) com jobs independentes para Backend e Frontend.
* **Fail-Fast:** A diretiva `needs` foi utilizada para garantir a sequência `lint -> build -> test`. Se o lint falhar, o build e os testes não são executados.
* **Cache:** Configurado `cache: 'pip'` no setup do Python e `cache: 'npm'` no setup do Node.js.

## 6. Etapa 4 - Produção
* **Backend:** `Dockerfile.prod` utilizando `python:3.12-alpine`, servidor Gunicorn e utilizador não-root (`appuser`).
* **Frontend:** Implementado "Multi-stage build" (deps, builder, runner). Configurado o `output: 'standalone'` no Next.js para reduzir a imagem final. Executado com utilizador não-root (`nextjs`).
* **Tamanho final:** Imagens reduzidas drasticamente, contendo apenas os ficheiros de runtime e dependências de produção.

## 7. Etapa 5 - Nginx e SSL
* **Reverse proxy:** Nginx configurado para isolar as portas do frontend, backend e db. Apenas as portas 80 e 443 do Nginx estão expostas no `docker-compose-prod.yml`.
* **HTTPS e Redirecionamento:** Certificado autoassinado gerado localmente. O Nginx força o redirecionamento de tráfego HTTP (porta 80) para HTTPS (porta 443) com o comando `return 301`.

## 8. Etapa 6 - GHCR
* **Imagens publicadas:** Após a validação dos testes, as imagens são construídas e enviadas para o GitHub Container Registry.
* **Tags:** Utilizadas as tags `:latest` e a hash do commit `${{ github.sha }}`.
* **Permissões:** Workflow configurado com `permissions: packages: write` para permitir a autenticação com o `GITHUB_TOKEN`.

## 9. Validação Final
* **Comandos executados:** `docker compose -f docker-compose-prod.yml up -d --build` para subir a infraestrutura completa de produção. O *push* no GitHub disparou a Action que publicou as imagens.
* **Resultados:** Acesso HTTPS validado localmente, roteamento a funcionar perfeitamente e imagens de produção disponíveis publicamente no GHCR do repositório.

## 10. Histórico Git

| Etapa | Commit (Hash) | Descrição |
|---|---|---|
| 1 | `ef57d55` | Estrutura inicial com Dockerfiles da Etapa 1 |
| 2 | `9b8136f` | Etapa 2: Orquestracao com Docker Compose e persistencia |
| 3 | `755ce2d` | Add CI pipeline for backend and frontend workflows |
| 4 | `25a03bc` | Etapa 4: Dockerfiles otimizados para producao |
| 5 | `605d580` | Etapa 5: Infraestrutura de Producao com Nginx e SSL |
| 6 | `49018b4` | Etapa 6: Deploy continuo das imagens no GHCR |