


# Semana 5 — Containerização e CI/CD

## 1. Identificação
- **Equipe:** Makers
- **Integrantes:** Henrique Schneider Fernandes da Rosa
- **Repositório do Projeto:** `https://github.com/SchneiderCode1/Lab-Makers--Fork-]`

---

## 2. Arquitetura
A aplicação adota uma arquitetura descentralizada e desacoplada em microsserviços, totalmente containerizada através do Docker:

- **Frontend:** Next.js (App Router) em Node.js 20 Alpine (porta interna `3000`).
- **Backend:** Django REST Framework em Python 3.12 / Gunicorn (porta interna `8000`).
- **Banco de Dados:** PostgreSQL 16 Alpine com volume persistente (porta interna `5432`).
- **Proxy Reverso e TLS:** Nginx atuando como ponto único de entrada nas portas públicas `80` (HTTP) e `443` (HTTPS).

```text
  [ Navegador / Cliente ]
           │ (HTTP :80 / HTTPS :443)
           ▼
     ┌───────────┐
     │   Nginx   │ (Proxy Reverso)
     └─────┬─────┘
           ├──────────────────────────────┐
           │ (/api/* e /admin/*)          │ (Demais rotas /)
           ▼                              ▼
     ┌───────────┐                  ┌───────────┐
     │  Backend  │                  │ Frontend  │
     │  (Django) │                  │ (Next.js) │
     └─────┬─────┘                  └───────────┘
           │
           ▼
     ┌───────────┐
     │ PostgreSQL│ (Rede Interna Isolada)
     └───────────┘

```

---

## 3. Etapa 1 — Containerização do Ambiente de DEV

### Implementação

Criados os Dockerfiles focados em ambiente de desenvolvimento:

* **Backend (`backend/Dockerfile`):** Utiliza a imagem `python:3.12-slim`, instala as dependências via `requirements.txt` e executa o servidor de desenvolvimento Django através de `python manage.py runserver 0.0.0.0:8000` com `DEBUG=True`.


* **Frontend (`frontend/Dockerfile`):** Utiliza a imagem `node:20-alpine`, instala pacotes via `npm install` e executa `npm run dev`.



### Validação e Evidências (Checkpoint 1)

* Cada container foi validado e executado individualmente via `docker run -v`.


* Foram configurados *bind mounts* mapeando as pastas locais para os diretórios `/app` nos contêineres, garantindo que alterações no código-fonte no host reflitam em tempo real com *hot reload* no navegador.



### Commit

* **Commit:** [HASH_E1](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/795b05187d7f9d8e9f392559e7fbe0c2207f4f29)` — feat(semana5): etapa 1 - dockerfiles de desenvolvimento com hot reload e bind mounts


---

## 4. Etapa 2 — Orquestração DEV com Docker Compose

### Implementação

Criado o arquivo `docker-compose.yml` na raiz do projeto para subir e integrar todos os serviços de desenvolvimento:

* **Rede Interna:** Comunicação direta onde o Django consome o banco de dados pelo endereço do serviço `db:5432`.


* **Healthcheck de Prontidão:** Configurado no serviço `db` com `pg_isready`. O backend utiliza `depends_on` com `condition: service_healthy` para aguardar o banco estar aceitando conexões.


* **Persistência de Dados:** Criado o volume nomeado `postgres_data` apontado para `/var/lib/postgresql/data`.


* **Gerenciamento de Variáveis:** Versionado o arquivo `.env.example` e mantido o `.env` no `.gitignore`.



### Validação (Checkpoint 2)

* Executado `docker compose up --build`. O backend aguardou com sucesso a inicialização completa do PostgreSQL antes de iniciar o servidor Django.



### Commit

* **Commit:** [HASH_E2](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/795b05187d7f9d8e9f392559e7fbe0c2207f4f29) — feat(semana5): etapa 2 - orquestracao dev com docker compose, healthcheck e persistencia


---

## 5. Etapa 3 — CI (Pipeline de Qualidade Automatizada)

### Implementação

Criado o workflow `.github/workflows/ci.yml` composto por duas trilhas paralelas de validação de qualidade:

* **Trilha Backend:** `lint-backend` (Flake8) $\rightarrow$ `build-backend` (Docker Build DEV) $\rightarrow$ `test-backend` (`manage.py test`).


* **Trilha Frontend:** `lint-frontend` (ESLint) $\rightarrow$ `build-frontend` (`npm run build`) $\rightarrow$ `test-frontend` (`npm test`).


* **Fail-Fast e Cache:** Configurado `needs` entre os jobs para interromper imediatamente o pipeline em caso de falha em etapas anteriores, além de cache ativo (`pip` e `npm`).



### Evidências de Validação do Fail-Fast

Foram provocadas 3 falhas intencionais e registradas no repositório:

1. **Erro de Lint:** Injeção de variável não declarada. O job `lint` falhou e interrompeu os jobs de `build` e `test`.


2. **Erro de Build:** Importação de arquivo inexistente. O job `build` falhou e cancelou a execução dos testes.


3. **Erro de Teste:** Criação de `self.assertEqual(1, 2)` no Django. A etapa de testes falhou apontando o erro no log.


4. **Resolução:** Erros removidos, retornando a esteira ao estado 100% aprovado (verde).



### Commit

* **Commit:** [HASH_E3.1](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/24af7d48a0e05b69fd7f1dcf41cd27a44018c7a2) [HASH_E3.2](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/938010caf984707dda469dc643676e38d63f2ba4) — feat(semana5): etapa 3 - pipeline de ci automatizado com fail-fast e cache


---

## 6. Etapa 4 — Otimização de Containers de Produção (PROD)

### Implementação e Multi-Stage Build

Desenvolvidos os Dockerfiles otimizados para ambiente de produção:

* **Backend (`backend/Dockerfile.prod`):** Base `python:3.12-alpine` executando o servidor WSGI de produção **Gunicorn** (`config.wsgi:application --bind 0.0.0.0:8000`) e operando sob usuário sem privilégios `appuser`.


* **Frontend (`frontend/Dockerfile.prod`):** Estruturado em 3 estágios (*deps* $\rightarrow$ *builder* $\rightarrow$ *runner*).


* **Next.js Standalone:** Adicionada a flag `output: 'standalone'` no `next.config.mjs`. O estágio final (*runner*) copia apenas os artefatos mínimos (`standalone`, `static` e `public`), rodando sob o usuário `nextjs`.



### Validação de Tamanho (Checkpoint 4)

* **Tamanho da Imagem Frontend PROD:** **~135 MB** (cumprindo a meta de ser menor que 150 MB).


* Ambas as imagens foram validadas rodando em contêineres de produção sem dependências de desenvolvimento.



### Commit

* **Commit:** [HASH_E4](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/e7f250e4d9c82878c71d6be638c6d53f260ef8d6) — feat(semana5): etapa 4 - dockerfiles multi-stage de producao e next.js standalone


---

## 7. Etapa 5 — Stack de Produção com Nginx e SSL

### Implementação

Criados os arquivos `docker-compose-prod.yml` e a configuração do proxy reverso em `nginx/nginx.conf`:

* **Isolamento Rígido de Portas:** Os serviços `backend`, `frontend` e `db` declaram apenas `expose` (portas 8000, 3000 e 5432 totalmente isoladas na rede do Docker e inacessíveis externamente pelo host).


* **Exposição Única:** Apenas o Nginx expõe as portas públicas `80` (HTTP) e `443` (HTTPS).


* **Roteamento de Tráfego:**
* `/api/` e `/admin/` $\rightarrow$ Nginx redireciona para `http://backend:8000`.


* `/` $\rightarrow$ Nginx redireciona para `http://frontend:3000`.




* **Certificado TLS Local:** Gerado certificado autoassinado em `nginx/certs/` via OpenSSL.


* **Redirecionamento HTTPS:** Requisições na porta 80 retornam resposta `301 Moved Permanently` para HTTPS (`443`).



### Validação (Checkpoint Final de Produção)

```bash
# Validação do redirecionamento 301 de HTTP para HTTPS
curl -I http://localhost

# Validação do roteamento e handshake TLS para a API
curl -k -I https://localhost/api/

```

Acessos diretos nas portas `http://localhost:8000` ou `http://localhost:3000` foram recusados, comprovando o isolamento de portas.

### Commit

* **Commit:** [HASH_E5](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/e7f250e4d9c82878c71d6be638c6d53f260ef8d6) — feat(semana5): etapa 5 - stack de producao com nginx, ssl e portas isoladas


---

## 8. Etapa 6 — Deploy Contínuo (CD) e Publicação no GHCR

### Implementação

Atualizado o pipeline `.github/workflows/ci.yml` com a adição dos jobs de entrega contínua `deploy-backend` e `deploy-frontend`:

* **Permissões Mínimas:** Configurado `permissions: { contents: read, packages: write }`.


* **Autenticação:** Realizada via `${{ secrets.GITHUB_TOKEN }}` junto ao registro `ghcr.io`.


* **Gatilho de Segurança:** A publicação é acionada apenas na branch principal e condicionada à aprovação completa dos testes de qualidade (`needs: test-backend` e `needs: test-frontend`).



### Imagens Publicadas no Registro

* `ghcr.io/[seu-usuario]/[seu-repo]-backend:latest`

* `ghcr.io/[seu-usuario]/[seu-repo]-backend:[SHA_DO_COMMIT]`

* `ghcr.io/[seu-usuario]/[seu-repo]-frontend:latest`

* `ghcr.io/[seu-usuario]/[seu-repo]-frontend:[SHA_DO_COMMIT]`


### Commit

* **Commit:** [HASH_E6.2](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/e6a8abf4dbfac8d4793a0d2c8e7dee90fd9057f7) [HASH_E6.1](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/9eb2f9b45d6192e3e725c9448ee258a0c94c8d8e) — feat(semana5): etapa 6 - deploy continuo e publicacao automatizada no ghcr


---

## 9. Validação Final

* **Execução do Ambiente:** A stack de produção foi inicializada com `docker compose -f docker-compose-prod.yml up -d --build`.


* **Resultados Observados:** O frontend servido via HTTPS consome os endpoints do Django através do Nginx.


* **Limitações Conhecidas:** Certificado SSL autoassinado para validação local exige autorização manual no navegador ou flag `-k` no `curl`.



---

## 10. Histórico Git

| Etapa | Commit | Descrição |
| --- | --- | --- |
| **1** | [HASH_E1](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/795b05187d7f9d8e9f392559e7fbe0c2207f4f29) | Dockerfiles de DEV para backend (Django) e frontend (Next.js) com bind mounts

 |
| **2** | [HASH_E2](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/795b05187d7f9d8e9f392559e7fbe0c2207f4f29) | Orquestração do ambiente DEV via docker-compose.yml e healthcheck no PostgreSQL

 |
| **3** | [HASH_E3.1]((https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/24af7d48a0e05b69fd7f1dcf41cd27a44018c7a2)) [HASH_E3.2]((https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/938010caf984707dda469dc643676e38d63f2ba4)) | Pipeline de CI automatizado no GitHub Actions com trilhas paralelas e Fail-Fast

 |
| **4** | [HASH_E4](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/e7f250e4d9c82878c71d6be638c6d53f260ef8d6) | Dockerfiles de produção multi-stage, Gunicorn e Next.js standalone <150MB

 |
| **5** | [HASH_E5](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/e7f250e4d9c82878c71d6be638c6d53f260ef8d6) | Stack de produção com Nginx SSL reverse proxy, redirecionamento 301 e portas isoladas

 |
| **6** | [HASH_E6.1](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/9eb2f9b45d6192e3e725c9448ee258a0c94c8d8e) [HASH_E6.2](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/e6a8abf4dbfac8d4793a0d2c8e7dee90fd9057f7) | Workflow de Deploy Contínuo (CD) com publicação automatizada das imagens no GHCR

 |