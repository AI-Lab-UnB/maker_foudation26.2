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
- Fluxo de comunicacao: 
  
## 3. Etapa 1 - DEV
- Implementacao:
- Validacao:
- Evidencias:
- Commit:
    
## 4. Etapa 2 - Docker Compose
- Implementacao:
- Healthcheck:
- Persistencia:
- Validacao:
- Commit:
  
## 5. Etapa 3 - CI
- Jobs do backend:
- Jobs do frontend:
- Fail-Fast:
- Cache:
- Evidencias:
- Commit:

## 6. Etapa 4 - Producao
- Backend:
- Frontend:
- Multi-stage:
- Usuarios nao-root:
- Tamanho final das imagens:
- Commit:
  
## 7. Etapa 5 - Nginx e SSL
- Reverse proxy:
- Portas expostas:
- HTTPS:
- Redirecionamento:
- Validacao:
- Commit:
  
## 8. Etapa 6 - GHCR
- Imagens publicadas:
- Tags:
- Permissoes:
- Evidencias:
- Commit:
  
## 9. Validacao Final
- Comandos executados:
- Resultados:
- Limitacoes:
  
## 10. Historico Git
| Etapa | Commit | Descricao |
|---|---|---|
| 1 | Etapa 1 - Concluida| Implementação do ambiente Docker voltado para desenvolvimento |
| 2 | Etapa 2 concluida| Implementação do Docker Compose, rede, banco, volume e healthchecks |
| 3 | "ci: add backend and frontend pipelines" e "ajuste no CI para cumprir etapa 3"| Implementação do workflow de CI com lint, build e testes |
| 4 | Etapa 4 - Com os tamanhos das imagens acima de 150MB| Implementação das imagens de produção, 'standalone' e Gunicorn |
| 5 | Etapa 5 concluida | Implementação do Nginx e certificado SSL|
| 6 | Etapa 6 concluida | Publicação das imagens de produção no GHCR através do GitHub Actions|
