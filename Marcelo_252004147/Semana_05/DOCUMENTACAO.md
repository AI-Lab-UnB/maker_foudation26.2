# Semana 5 - Estudo sobre Containerização e CI/CD

## 1. Identificação
- Aluno: Marcelo Vitor Machado da Silva Filho  
- Matrícula: 252004147  
- Link do repositório do projeto no GitHub: https://github.com/marcelovitorfilho/container-dev-a-deploy.git  
- Breve descrição sobre o projeto: De forma resumida, o projeto seria containerizar e organizar uma aplicação e depois disso validar a mesma via CI/CD.

## 2. Arquitetura
- Stack: Next.js (App Router) para Front-end, Django para Back-end e API, PostgreSQL para Banco de dados, Nginx para servidor proxy, GitHub Actions para CI/CD,
GitHub Container Registry (GHCR) para publicação de imagens e Docker para containerização.   
- Serviços:
1. Front-end: Next.js
2. Back-end: Django executada com Gunicorn
3. Nginx: O proprio Nginx fazendo o servidor e sendo o único serviço exposto ao host
4. Banco de dados: PostgreSQL
5. GitHub Actions: Roda o CI e faz com que as imagens do GHCR sejam publicadas
- Fluxo de comunicação: O usuário acessa o sistema por meio do Nginx, dentro da rota, o Nginx passa a requisição que acessa o serviço necessário (backend e/ou frontend). O front-end roda no Next.js, e a API junto com o Django Admin ficam no back-end, que troca dados com o PostgreSQL. 
  
## 3. Etapa 1 - DEV
- Implementação: Criação dos Dockerfiles para Backend e Frontend, também usamos bind mounts para sincronizar os arquivos locais com os containers em tempo real, facilitando o desenvolvimento com hot reload.
- Validação: Usamos comandos como:
```
docker build
docker run
docker ps
docker exec
``` 
- Evidências: Os containers foram executados corretamente e foi possível acessar os serviços durante os testes.
- Commit: Etapa 1 - Concluida.
    
## 4. Etapa 2 - Docker Compose
- Implementação: Nessa etapa, foi criado o `docker-compose.yml` para rodar todos os serviços de forma integrada, configurando então o Frontend, o Backend e PostgreSQL todos rodando juntos na mesma rede.
- Healthcheck: Foi configurado um Healthcheck para o PostgreSQL sendo o `pg_isready`, feito para checar se o Banco de Dados está mesmo rodando. Assim, o backend depende do banco estar funcionando para ser iniciado.
- Persistência: Foi criado um volume chamado `postgres_data` para manter os dados do PostgreSQL mesmo quando o container fosse recriado.
- Validação: A etapa foi iniciada com `docker compose up` e foi usado `docker compose ps` para ir checando o status.
- Commit: Etapa 2 concluida.
  
## 5. Etapa 3 - CI
- Jobs do backend: lint-backend, build-backend, test-backend.
- Jobs do frontend: lint-frontend, build-frontend, test-frontend.
- Fail-Fast: Uso do `needs` para definição da ordem dos jobs (se a anterior falhar, a próxima nem é executada).
- Cache: Foi utilizado o cache do GitHub Actions para Front-end e Back-end, utilizando `pip` no Django e `npm` no Next.js. Isso evita downloads desnecessários a cada execução do CI.
- Evidências: workflow configurado no arquivo: .github/workflows/ci.yml.
- Commits: "ci: add backend and frontend pipelines" e "ajuste no CI para cumprir etapa 3".

## 6. Etapa 4 - Producao
- Backend: Foi trocado o servidor para Gunicorn e começou a ser rodado o projeto no usuário não-root `appuser`.
- Frontend: Foi usado o modo Standalone do Next.js para incluir apenas os arquivos essenciais e configuramos o usuário não-root `nextjs`.
- Multi-stage: Uso do multi-stage build nos Dockerfiles. A ideia é dividir o processo de criação da imagem em etapas bem definidas, enquanto os primeiros estágios são usados para instalar dependências e fazer o build da aplicação, o estágio final fica responsável apenas pela execução.
- Usuários nao-root: `appuser` no backend e `nextjs` no frontend.
- Tamanho final das imagens: Frontend: 124M e Backend: 142M.
- Commit: "Etapa 4 - Com os tamanhos das imagens acima de 150MB" e "Ajuste tornando imagens menores que 150 MB".
  
## 7. Etapa 5 - Nginx e SSL
- Reverse proxy: O Nginx atua como proxy reverso e ponto único de acesso: a rota `/` vai para o Front-end, e `/api/` junto com `/admin/` vão para o Back-end, isolando os containers do acesso direto do usuário.
- Portas expostas:  
 `80` para HTTP  
 `443` para HTTPS
- HTTPS: O HTTPS foi habilitado localmente com um certificado autoassinado (self-signed), permitindo validar a segurança do acesso sem depender de uma CA externa(que é uma autoridade certificadora).
- Redirecionamento: O Nginx foi ajustado para jogar qualquer acesso via HTTP direto para HTTPS, quando o usuário acessa a aplicação pela porta 80, o Nginx retorna um redirecionamento para a porta 443.
- Validação: Para teste do funcionamento da estrutura através no Nginx foi usado `curl -k https://localhost/api/health/` e `curl -k -I https://localhost/`, esses testes garantiram que as chamadas ao Frontend e ao Backend responderam certo sob HTTPS e com o redirecionamento ativo.
- Commit: Etapa 5 concluida.
  
## 8. Etapa 6 - GHCR
- Imagens publicadas: `Backend` e `Frontend`.
- Tags: `latest` para mostrar a versão mais recente da imagem e a tag do SHA traz rastreabilidade total, conectando a imagem diretamente ao commit exato que a gerou no Git.
- Permissões: Foi configurado como:
```
permissions:
  contents: read
  packages: write
```
O `contents:read` permite que o workflow leia o repositório.  
O `packages: write` permite que o workflow publique os pacotes no GHCR.
- Evidências: Registros das execuções do GitHub Actions e as imagens disponíveis no GHCR.
- Commit: Etapa 6 concluida.
  
## 9. Validacao Final
- Comandos executados:  
``` 
docker build
docker run
docker ps
docker exec
docker inspect
docker compose up
docker compose -f docker-compose-prod.yml up -d
docker compose -f docker-compose-prod.yml ps
docker compose -f docker-compose-prod.yml exec backend sh
wget -S -O- http://127.0.0.1:8000/api/health/
docker image inspect backend-prod --format '{{.Size}}' | numfmt --to=iec
docker image inspect frontend-prod --format '{{.Size}}' | numfmt --to=iec
curl -k https://localhost/api/health/
curl -k -I https://localhost/
```
- Resultados: No fim, colocamos a aplicação em produção via Docker Compose, usando o Nginx como porta de entrada para o front e o back-end (ligado ao PostgreSQL). O healthcheck deu OK, o HTTPS funcionou de primeira, as imagens ficaram no tamanho ideal e o pipeline do GitHub Actions já está publicando tudo automaticamente no GHCR.  
- Limitações: Usamos um certificado HTTPS autoassinado para os testes locais, então o navegador pode mostrar um alerta de segurança. Vale notar também que a arquitetura foi feita para a atividade, e não para rodar em produção de verdade.
  
## 10. Historico Git
| Etapa | Commit | Descrição |
|---|---|---|
| 1 | Etapa 1 - Concluida| Implementação do ambiente Docker voltado para desenvolvimento |
| 2 | Etapa 2 concluida| Implementação do Docker Compose, rede, banco, volume e healthchecks |
| 3 | "ci: add backend and frontend pipelines" e "ajuste no CI para cumprir etapa 3"| Implementação do workflow de CI com lint, build e testes |
| 4 | "Etapa 4 - Com os tamanhos das imagens acima de 150MB" e "Ajuste tornando imagens menores que 150 MB"| Implementação das imagens de produção, 'standalone' e Gunicorn |
| 5 | Etapa 5 concluida | Implementação do Nginx e certificado SSL|
| 6 | Etapa 6 concluida | Publicação das imagens de produção no GHCR através do GitHub Actions|
