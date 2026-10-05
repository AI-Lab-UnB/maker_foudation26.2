Aqui tens o documento reescrito com uma linguagem mais pessoal, direta e natural, refletindo a tua própria jornada de desenvolvimento, os desafios encontrados e como os foste resolvendo ao longo do projeto:

---

# Semana 5 - Containerização e CI/CD

## 1. Identificação

* **Integrantes:** Luiz Felipe Mendes Cordeiro Gomes
* **Repositório:** [https://github.com/LuizFelipe81/cicd-learning.git](https://github.com/LuizFelipe81/cicd-learning.git)

---

## 2. Arquitetura

* **Stack:** Django no backend, Next.js (App Router) no frontend, PostgreSQL como base de dados e Nginx como reverse proxy (exclusivamente para o ambiente de produção).
* **Serviços:**
* `backend`: Aplicação Django que disponibiliza o endpoint REST `/api/health/` devolvendo o status em formato JSON.
* `frontend`: Aplicação Next.js que consome a API do backend e apresenta os dados na página principal.
* `db`: Base de dados PostgreSQL com persistência garantida através do volume nomeado `postgres_data`.


* **Fluxo de comunicação:**
* **Em desenvolvimento:** O frontend (porta 3000) comunica diretamente com o backend (porta 8000), que por sua vez se conecta à base de dados via `db:5432` dentro da rede interna do Docker Compose.
* **Em produção:** Apenas o Nginx fica exposto para o exterior (portas 80 e 443). Ele faz o roteamento das rotas `/api/` e `/admin/` para o backend e redireciona todo o restante tráfego para o frontend.



---

## 3. Etapa 1 - DEV

* **O que fiz:** Criei os Dockerfiles de desenvolvimento para o backend e para o frontend.
* **Backend:** Utilizei a imagem `python:3.12-slim`, instalei as dependências do `requirements.txt` e configurei o comando `python manage.py runserver 0.0.0.0:8000` com a flag `DEBUG=True`.
* **Frontend:** Optei por `node:20-alpine`, instalei os pacotes e coloquei o projeto a rodar com `npm run dev` para garantir o hot reload.


* **Validação:** Testei cada container individualmente rodando comandos `docker run` com *bind mounts* (`-v`) e mapeamento de portas (`-p`). Confirmei que qualquer alteração feita nos ficheiros da minha máquina refletia-se instantaneamente no navegador sem precisar de reconstruir a imagem.
* **Commits associados:**
* `Etapa 1: Dockerfile de desenvolvimento do backend com endpoint /api/health/`
* `Etapa 1: Dockerfile de desenvolvimento do frontend com hot reload`



---

## 4. Etapa 2 - Docker Compose

* **O que fiz:** Criei o ficheiro `docker-compose.yml` na raiz para integrar o backend, o frontend e o banco de dados na mesma rede virtual. O backend passou a apontar para a base de dados usando o nome do serviço (`db:5432`).
* **Healthcheck e Persistência:** Adicionei um *healthcheck* no PostgreSQL com `pg_isready` e ajustei a subida do backend usando `depends_on` com `condition: service_healthy`, garantindo que a aplicação só tenta conectar depois de o banco estar totalmente pronto. Para não perder dados ao reiniciar os containers, configurei o volume `postgres_data` mapeado para `/var/lib/postgresql/data`.
* **Validação:** Subi a stack inteira com `docker compose up` e confirmei que tudo iniciou na ordem correta, sem falhas de conexão.
* **Commit associado:** `Etapa 2: Docker Compose com backend, frontend e banco PostgreSQL`

---

## 5. Etapa 3 - CI

* **Jobs configurados:**
* **Backend:** Estruturei os passos `lint-backend` (`flake8`), `build-backend` (validação da construção da imagem Docker) e `test-backend` (`python manage.py test` integrado com um serviço PostgreSQL temporário no próprio runner).
* **Frontend:** Dividi em `lint-frontend` (`npm run lint`), `build-frontend` (`npm run build`) e `test-frontend` (`npm test`).


* **Encadeamento e Cache:** Ajustei as dependências (`needs`) para seguir a sequência Linter → Build → Testes. Adicionei também cache do `pip` e do `npm` para acelerar a execução das *actions*.
* **Ajustes e Correções durante os testes:**
1. **Lint do backend:** O `flake8` encontrou 8 avisos de formatação (imports não utilizados, espaçamento incorreto, etc.), os quais corrigi no código.
2. **Build do frontend:** O TypeScript reclamou dos tipos do Jest (`test` e `expect`); resolvi instalando os `@types/jest` e ajustando o `tsconfig.json`.
3. **Testes do backend:** O Django estava com o host do banco fixado em `'db'`, que não existia no runner do GitHub Actions. Mudei o `settings.py` para ler a variável `POSTGRES_HOST` do ambiente e adicionei o serviço do Postgres diretamente no job.
4. **Sintaxe do workflow:** Corrigi um erro de sintaxe onde tentei usar *secrets* no campo `options` do *healthcheck*.


* **Commits associados:**
* `Etapa 3: pipeline de CI com lint, build e testes`
* `corrige lint do backend e types do jest no frontend`
* `adiciona banco postgres no test-backend do CI`
* `corrige healthcheck do postgres no CI`
* `le POSTGRES_HOST do ambiente no settings.py`



---

## 6. Etapa 4 - Produção

* **O que fiz:**
* **Backend:** Criei o `backend/Dockerfile.prod` baseado em `python:3.12-alpine`, configurado para rodar através do servidor WSGI de produção Gunicorn (`gunicorn config.wsgi:application --bind 0.0.0.0:8000`).
* **Frontend:** Criei o `frontend/Dockerfile.prod` utilizando *multi-stage build* (estágios `deps`, `builder` e `runner`) e ativei o `output: "standalone"` no `next.config.ts`. No estágio final, passei a copiar apenas o estritamente necessário (`.next/standalone`, `.next/static` e `public`).
* **Segurança:** Defini utilizadores sem privilégios de root (`appuser` no Python e `nextjs` no Node) para rodar as aplicações.


* **Otimização de Tamanho:** Consegui reduzir significativamente o tamanho das imagens de produção: a do backend ficou com apenas **34.3 MB** e a do frontend com **64.2 MB** (muito abaixo do limite de 150 MB estabelecido e bem menor que a versão de dev).
* **Integração e CORS:** Ao conectar o frontend na API, enfrentei um bloqueio de CORS. Resolvi adicionando o pacote `django-cors-headers` no backend e liberando a origem `http://localhost:3000`.
* **Commits associados:**
* `Etapa 4: Dockerfiles de producao com multi-stage e usuarios nao-root`
* `Etapa 4: Dockerfiles de producao, CORS e frontend consumindo API do backend`



---

## 7. Etapa 5 - Nginx e SSL

* **Reverse Proxy e HTTPS:** Criei o ficheiro `nginx/nginx.conf` com suporte a SSL. Configurei o redirecionamento automático da porta 80 (HTTP) para a porta 443 (HTTPS). No bloco de HTTPS, direcionei `/api/` e `/admin/` para o container do backend e a raiz `/` para o frontend.
* **Isolamento de Portas:** No arquivo `docker-compose-prod.yml`, deixei apenas o Nginx exposto diretamente para o host. O backend, o frontend e a base de dados ficaram isolados, comunicando apenas dentro da rede do Docker.
* **Certificado SSL:** Gerador de um certificado autoassinado usando a imagem `alpine/openssl`, salvando os ficheiros na pasta `nginx/certs/` e montando-os como volume de leitura no container do Nginx.
* **Ajuste na URL da API:** Como o backend deixou de expor a porta 8000 diretamente em produção, atualizei a chamada do frontend para usar a variável `NEXT_PUBLIC_API_URL` (definida como `/api` em produção e `http://localhost:8000/api` para desenvolvimento).
* **Commit associado:** `Etapa 5: Nginx com SSL, redirecionamento HTTPS e roteamento para backend e frontend`

---

## 8. Etapa 6 - Publicação no GHCR

* **Publicação de Imagens:** Configurei o workflow do GitHub Actions para publicar as imagens finais de produção no registo de containers do GitHub: `ghcr.io/luizfelipe81/cicd-learning-backend` e `ghcr.io/luizfelipe81/cicd-learning-frontend`. Os jobs de deploy foram encadeados para rodar apenas após a aprovação de todos os testes.
* **Tags e Permissões:** Cada imagem gerada recebe as tags `latest` e o hash do commit (`${{ github.sha }}`). Adicionei as permissões `contents: read` e `packages: write` utilizando a autenticação nativa do `GITHUB_TOKEN`.
* **Ajuste nos Testes:** Tive de reescrever o teste do frontend para incluir um *mock* da função `fetch`, pois a ausência do backend no ambiente isolado de testes estava a fazer o build falhar.
* **Commits associados:**
* `Etapa 6: publica imagens de producao no GHCR`
* `corrige teste do frontend com mock do fetch`



---

## 9. Validação Final

* **Testes Efetuados:**
* Build e execução manual dos containers de produção com `docker run`.
* Subida da stack completa com `docker compose -f docker-compose-prod.yml up -d`.
* Validação direta da API em `http://localhost:8000/api/health/`.
* Teste da aplicação completa navegando em `https://localhost`.
* Disparo do pipeline via `git push` confirmando a passagem de todas as etapas.


* **Resultado:** O pipeline automatizado executou com sucesso todas as 8 etapas (lint, build, testes e deploy do frontend e do backend). A stack de produção está totalmente funcional: base de dados persistente e com verificação de integridade, API a responder corretamente, frontend a consumir os dados via proxy do Nginx com SSL ativo e imagens publicadas no GHCR.

---

## 10. Histórico de Commits

| Etapa | Commit / Mensagem | Descrição da Entrega |
| --- | --- | --- |
| **1** | `Etapa 1: Dockerfile de desenvolvimento do frontend com hot reload` | Configuração do ambiente de desenvolvimento individual. |
| **2** | `Etapa 2: Docker Compose com backend, frontend e banco PostgreSQL` | Orquestração da stack de dev com Docker Compose. |
| **3** | `le POSTGRES_HOST do ambiente no settings.py` | Configuração da esteira de CI no GitHub Actions e correção dos testes. |
| **4** | `Etapa 4: Dockerfiles de producao, CORS e frontend consumindo API do backend` | Otimização das imagens de produção com multi-stage build. |
| **5** | `Etapa 5: Nginx com SSL, redirecionamento HTTPS e roteamento para backend e frontend` | Implementação do Nginx como reverse proxy com certificado SSL. |
| **6** | `corrige teste do frontend com mock do fetch` | Automação do deploy contínuo e publicação das imagens no GHCR. |
