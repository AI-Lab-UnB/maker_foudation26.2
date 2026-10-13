# Documentação Técnica - Do Dev ao Deploy, Containerize Tudo

## 1. Identificação
* **Equipe / Integrantes:** João Victor Pereira Santos
* **Repositório:** https://github.com/JVZerinho/desafio-devops
* **Descrição do Projeto:** Operacionalização e conteinerização de stack desacoplada (Django + Next.js + PostgreSQL + Nginx) com pipeline CI/CD e deploy contínuo.

## 2. Arquitetura
* **Backend:** Django 5 + Gunicorn rodando na porta interna 8000.
* **Frontend:** Next.js 14/15 (App Router, Standalone) rodando na porta interna 3000.
* **Banco de Dados:** PostgreSQL 16 Alpine com volume persistente `postgres_data`.
* **Proxy Reverso:** Nginx Alpine expondo apenas 80 (HTTP) e 443 (HTTPS).
* **Fluxo de Rede:** O cliente acessa https://localhost via Nginx. As rotas `/api/` e `/admin/` são encaminhadas ao backend; as rotas `/` ao frontend. O banco fica isolado na rede interna Docker.

## 3. Etapa 1 – DEV
* Dockerfiles de desenvolvimento com Python 3.12-slim e Node 20-alpine.
* Bind mounts configurados via volume local permitindo hot reload imediato.
* Evidência: Execução com bind mounts e hot reload ativo no terminal sem necessidade de reconstrução da imagem:

```bash
$ docker compose up --build
[+] Running 3/3
 ✔ Container desafio-devops-db-1        Healthy
 ✔ Container desafio-devops-backend-1   Started
 ✔ Container desafio-devops-frontend-1  Started

Attaching to backend-1, db-1, frontend-1
backend-1   | Watching for file changes with StatReloader
backend-1   | Performing system checks...
backend-1   | System check identified no issues (0 silenced).
backend-1   | Django version 6.1.1, using settings 'config.settings'
backend-1   | Starting WSGI development server at http://0.0.0.0:8000/
frontend-1  | ▲ Next.js 16.3.8 (Turbopack)
frontend-1  | - Local:        http://localhost:3000
frontend-1  | ✓ Ready in 589ms

# Teste de hot reload (ao editar app/page.js no host):
frontend-1  | ✓ Compiled / in 182ms (Fast Refresh)
# Teste de hot reload (ao editar config/urls.py no host):
backend-1   | /app/config/urls.py changed, reloading.
backend-1   | Performing system checks...
backend-1   | System check identified no issues (0 silenced).
```

## 4. Etapa 2 – Compose
* Orquestração com Docker Compose contendo rede interna `bridge`.
* Implementado healthcheck do PostgreSQL com `pg_isready` e dependência com `service_healthy`.
* Variáveis de ambiente isoladas em `.env.example` versionado e `.env` local.
* Evidência: Inicialização orquestrada com checagem de saúde e validação dos containers ativos:

```bash
$ docker compose up -d
$ docker compose os
[+] Running 4/4
 ✔ Network desafio-devops_internal_network  Created
 ✔ Container desafio-devops-db-1            Healthy
 ✔ Container desafio-devops-backend-1       Started
 ✔ Container desafio-devops-frontend-1      Started

NAME                       IMAGE                     COMMAND                  SERVICE    CREATED          STATUS                    PORTS
desafio-devops-backend-1   desafio-devops-backend    "python manage.py ru…"   backend    10 seconds ago   Up 9 seconds              0.0.0.0:8000->8000/tcp
desafio-devops-db-1        postgres:16-alpine        "docker-entrypoint.s…"   db         10 seconds ago   Up 9 seconds (healthy)    5432/tcp
desafio-devops-frontend-1  desafio-devops-frontend   "docker-entrypoint.s…"   frontend   10 seconds ago   Up 8 seconds              0.0.0.0:3000->3000/tcp
```

## 5. Etapa 3 – CI
* Workflow GitHub Actions configurado com Fail-Fast usando `needs` em duas trilhas paralelas:
  * Backend: lint-backend -> build-backend -> test-backend.
  * Frontend: lint-frontend -> build-frontend -> test-frontend.
* Caches de pacotes configurados (`pip` e `npm`).
* Evidência do Fail-Fast:

	Falha 1: Erro de Lint no Backend (Sintaxe quebrada em urls.py):
  ```bash
	Run flake8 backend --count --select=E9,F63,F7,F82 --show-source --statistics
	backend/config/urls.py:33:36: E999 SyntaxError: invalid syntax
    	path('api/health/' health_check),
                                   ^
	1     E999 SyntaxError: invalid syntax
	1
	Error: Process completed with exit code 1.
  ```
	Status dos jobs no GitHub Actions:
  	- ✖ lint-backend (Failed)
  	- ⊘ build-backend (Skipped - due to 'needs: lint-backend')
  	- ⊘ test-backend (Skipped)
  	- ⊘ deploy-backend (Skipped)
  

	Falha 2: Erro de Build no Frontend (Módulo inexistente importado):
  ```bash
	Run cd frontend && npm run build
	> frontend@0.1.0 build
	> next build

	▲ Next.js 16.3.8 (Turbopack)
	Creating an optimized production build ...
	Error: Turbopack build failed with 1 error:
	Error: Module not found: Can't resolve 'pacote-que-nao-existe'
  	40 | import 'pacote-que-nao-existe';
	     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

	Error: Process completed with exit code 1.
  ```

	Status dos jobs no GitHub Actions:
  	- ✔ lint-frontend (Success)
  	- ✖ build-frontend (Failed)
  	- ⊘ test-frontend (Skipped - due to 'needs: build-frontend')
  	- ⊘ deploy-frontend (Skipped)

	Falha 3: Falha de Teste Unitário no Backend (Status 500 esperado em test_health.py):
  ```bash
	Run cd backend && python manage.py test
	Found 1 test(s).
	Creating test database for alias 'default'...
	System check identified no issues (0 silenced).
	F
	========================================	==============================
	FAIL: test_health_endpoint_status 	(config.test_health.HealthCheckTestCase.test_health_endpoint_status)
	----------------------------------------------------------------------
	Traceback (most recent call last):
  		File "/app/config/test_health.py", line 6, in test_health_endpoint_status
    			self.assertEqual(response.status_code, 500)
	AssertionError: 200 != 500

	----------------------------------------------------------------------
	Ran 1 test in 0.015s

	FAILED (failures=1)
	Destroying test database for alias 'default'...
	Error: Process completed with exit code 1.
  ```

	Status dos jobs no GitHub Actions:
  	- ✔ lint-backend (Success)
  	- ✔ build-backend (Success)
  	- ✖ test-backend (Failed)
    - ⊘ deploy-backend (Skipped)
	
	Execução Final com Pipeline 100% Verde:
	GitHub Actions Workflow: Continuous Integration
	Run: #4 - All checks passed (Commit: 6ddf0a8)

	Trilha Backend:
  	✔ lint-backend     (42s)
  	✔ build-backend    (1m 15s)
  	✔ test-backend     (56s)
  	✔ deploy-backend   (1m 02s)

	Trilha Frontend:
  	✔ lint-frontend    (35s)
  	✔ build-frontend   (1m 08s)
 	 ✔ test-frontend    (28s)
  	✔ deploy-frontend  (54s)

	Status: 8 jobs succeeded in 3m 45s.

## 6. Etapa 4 – PROD
* Dockerfile.prod do Frontend com Multi-stage build (deps, builder, runner) e modo `standalone`, gerando imagem abaixo de 150 MB.
* Dockerfile.prod do Backend baseado em Alpine com Gunicorn e usuário não-root.
* Evidência: Imagens de produção geradas localmente com build multi-stage:

```bash
$ docker images
REPOSITORY   TAG    IMAGE ID       DISK USAGE   CONTENT SIZE
backend      prod   61bf174daa79   444.29 MB    109 MB
frontend     prod   611fecbc2baa   288.18 MB    72.7 MB
```

## 7. Etapa 5 – Nginx/SSL
* Nginx atuando como único ponto de entrada nas portas 80 e 443.
* Redirecionamento 301 definitivo configurado de HTTP para HTTPS.
* Certificado SSL autoassinado gerado via OpenSSL.
* Evidência:
	1. Validação de Redirecionamento HTTP (Porta 80 -> 443):
	```bash
	$ curl.exe -I http://localhost
	HTTP/1.1 301 Moved Permanently
	Server: nginx/1.27.4
	Date: Sun, 04 Oct 2026 18:30:12 GMT
	Content-Type: text/html
	Content-Length: 169
	Connection: keep-alive
	Location: https://localhost/
	
	2. Validação de Acesso Seguro via Proxy HTTPS (Porta 443):
	```bash
	$ curl.exe -k -i https://localhost/api/health/
	HTTP/1.1 200 OK
	Server: nginx/1.27.4
	Date: Sun, 04 Oct 2026 18:30:25 GMT
	Content-Type: application/json
	Content-Length: 86
	Connection: keep-alive
	Access-Control-Allow-Origin: http://localhost:3000

	{"status": "ok", "items": ["Configurar Docker", "Automatizar CI", "Publicar no GHCR"]}

## 8. Etapa 6 – GHCR
* Jobs `deploy-backend` e `deploy-frontend` executados condicionalmente à aprovação dos testes.
* Configurada tag `:latest` e `:${{ github.sha }}` com autenticação no GHCR.
* Evidência: 
	- Link direto do repositório no GitHub Container Registry:
	- [https://github.com/JVZerinho/desafio-devops/pkgs/container/desafio-devops-backend](https://github.com/JVZerinho/desafio-devops/pkgs/container/desafio-devops-backend)
	- [https://github.com/JVZerinho/desafio-devops/pkgs/container/desafio-devops-frontend](https://github.com/JVZerinho/desafio-devops/pkgs/container/desafio-devops-frontend)

## 9. Validação Final
* Comandos executados para validação da stack completa:
  `docker compose -f docker-compose-prod.yml up -d`
* Checklist:
  - [x] Nenhuma porta além de 80 e 443 aberta no host.
  - [x] Resposta da API estruturada com sucesso no frontend.
  - [x] Containers executando com usuário seguro não-root.

## 10. Histórico Git
* `863d9958a4df6c2e9df3433150bb063c9ef3e4bc` - feat(dev): dockerfile de dev para backend e frontend com bind mounts
* `ea39240c486b850b47bb62c5b4ff9cdef3583f94` - feat: adicionar arquivo .gitkeep no diretório de certificados do nginx
* `96f1773ab8725ff36c2c1436cd4f1cead21652ab` - feat(compose): orquestracao com docker compose em dev com healthcheck e persistencia
* `b3bf10960cc0c0820c3bdd47355237affc019f1a` - ci: configuracao de pipeline fail-fast com cache e testes automatizados
* `35dcb188c0d6a8c94bc31103b009936d88c777ce` - feat(prod): dockerfiles otimizados multi-stage nao-root e standalone
* `eb3cd726a6eb64a1705d16c395a55fc7806502b4` - feat(prod): stack completa com reverse proxy nginx isolamento de portas e https ssl
* `6ddf0a834475d589beeb8275658e82519b503406` - ci(cd): automacao de deploy continuo com publicacao no ghcr
