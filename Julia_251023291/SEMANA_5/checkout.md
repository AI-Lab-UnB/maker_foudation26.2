# Checkout — Semana 5

**## Entrega 1: Containerização de Desenvolvimento e Orquestração Local**

- Criação dos Dockerfiles de desenvolvimento para o backend (Django) e frontend (Next.js).
- Implementação do `docker-compose.yml` para orquestração local integrando o PostgreSQL, backend e frontend, com healthchecks e persistência de dados via volumes nomeados.
- Validação de bind mounts e do funcionamento do hot reload em ambos os serviços, permitindo alterações dinâmicas sem necessidade de reconstrução manual das imagens.

**## Entrega 2: Pipeline de CI, Otimização de Produção, Nginx e GHCR**

- Configuração do pipeline de CI automatizado no GitHub Actions com trilhas independentes para backend e frontend (incluindo linters, testes automatizados e estratégia de Fail-Fast com cache otimizado).
- Desenvolvimento dos Dockerfiles de produção (`Dockerfile.prod`) utilizando builds multi-stage, Gunicorn, WhiteNoise e execução com utilizadores sem privilégios (**non-root**).
- Implementação do Nginx como **reverse proxy** com suporte a HTTPS (porta 443 com certificados autoassinados), redirecionamento automático de HTTP para HTTPS e isolamento de portas internas.
- Configuração do fluxo de CD para publicação automática das imagens de produção no GitHub Container Registry (GHCR) utilizando tags `latest` e o SHA do commit.

---

**## Checklist Final**

**### Entrega 1**
- [x] Criar Dockerfile de desenvolvimento para o backend Django
- [x] Criar Dockerfile de desenvolvimento para o frontend Next.js
- [x] Configurar o `.dockerignore` em ambos os serviços
- [x] Criar e configurar o `docker-compose.yml` de desenvolvimento
- [x] Implementar healthcheck e dependência inteligente (`service_healthy`) para o PostgreSQL
- [x] Configurar persistência com volumes nomeados (`postgres_data`)
- [x] Validar bind mounts e funcionamento do hot reload

**### Entrega 2**
- [x] Configurar workflow de CI no GitHub Actions (`ci.yml`)
- [x] Implementar testes automatizados e linters (flake8, ESLint, pytest, Jest)
- [x] Configurar cache de dependências e estratégia de Fail-Fast
- [x] Desenvolver `Dockerfile.prod` otimizado para o backend (Gunicorn + WhiteNoise + **non-root**)
- [x] Desenvolver `Dockerfile.prod` otimizado para o frontend (Multi-stage + standalone + **non-root**)
- [x] Configurar o Nginx como **reverse proxy** com SSL (porta 443 e redirecionamento HTTP)
- [x] Validar isolamento de portas e acesso via proxy reverso
- [x] Configurar o deploy automatizado para o GitHub Container Registry (GHCR)
- [x] Validar imagens publicadas com tags `latest` e commit SHA