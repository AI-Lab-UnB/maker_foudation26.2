# Semana 5 - Estudo sobre Containerização e CI/CD

## 1. Identificação
- Aluno: Marcelo Vitor Machado da Silva Filho  
- Matrícula: 252004147  
- Link do repositório do projeto no GitHub: https://github.com/marcelovitorfilho/container-dev-a-deploy.git  
- Breve descrição sobre o projeto: De forma resumida, o projeto seria containerizar e organizar uma aplicação e depois disso validar a mesma via CI/CD.

## 2. Arquitetura
- Stack: Next.js (App Router) para Front-end, Django para Back-end e API, PostgreSQL para Banco de dados, Nginx para servidor proxy, GitHub Actions para CI/CD,
GitHub Container Registry (GHCR) para publicação de imagens e Docker para containerização.   
- Serviços
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
- Jobs do backend:
- Jobs do frontend:
- Fail-Fast:
- Cache:
- Evidências:
- Commits: "ci: add backend and frontend pipelines" e "ajuste no CI para cumprir etapa 3".

## 6. Etapa 4 - Producao
- Backend:
- Frontend:
- Multi-stage:
- Usuários nao-root:
- Tamanho final das imagens:
- Commit: "Etapa 4 - Com os tamanhos das imagens acima de 150MB" e "Ajuste tornando imagens menores que 150 MB".
  
## 7. Etapa 5 - Nginx e SSL
- Reverse proxy:
- Portas expostas:
- HTTPS:
- Redirecionamento:
- Validação:
- Commit: Etapa 5 concluida.
  
## 8. Etapa 6 - GHCR
- Imagens publicadas:
- Tags:
- Permissões:
- Evidências:
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
