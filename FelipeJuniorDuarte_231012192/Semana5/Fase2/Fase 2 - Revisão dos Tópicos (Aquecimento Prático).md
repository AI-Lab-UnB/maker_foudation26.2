# Fase 2 - Revisão dos Tópicos (Aquecimento Prático)

## docker-game (slecache/docker-game)

Jogo em formato de níveis distribuído como tags de imagem no Docker Hub
(`flood`, `server`, `memories`, `whale`, `unlockme`, `unlockmeagain`,
`last-level`, `outofmemories`). Cada tag é um desafio: você roda o
container e usa comandos de inspeção/depuração para descobrir pistas e
avançar de nível.

Comandos praticados:

- **`docker logs <container>`** — lê a saída (stdout/stderr) de um
  container em execução ou finalizado. Essencial para encontrar pistas
  ou mensagens de erro sem precisar entrar no container.
- **`docker inspect <container>`** — retorna um JSON completo com toda a
  configuração do objeto (variáveis de ambiente, mounts, rede, comando de
  entrada, labels). Usado quando a pista está "escondida" na configuração
  do container, não na saída de log.
- **`docker exec -it <container> <comando>`** — executa um comando dentro
  de um container já rodando (ex: abrir um shell com `/bin/sh`). Permite
  navegar pelo sistema de arquivos do container por dentro.
- **`docker cp <container>:<path> <destino>`** — copia arquivos entre o
  host e o container (nos dois sentidos), sem precisar de volume montado.
  Útil para extrair um arquivo de pista para fora do container.

**Por que isso importa para o desafio da Semana 5:** são exatamente os
comandos que vamos usar para depurar os containers de dev/prod (ver
por que o backend não sobe, checar variáveis de ambiente, inspecionar
por que o healthcheck do Postgres falha, etc.).

## GitHub Skills

### 1. Hello GitHub Actions
Curso introdutório . Ensina a estrutura mínima de um workflow:
- Criar o arquivo em `.github/workflows/`.
- Definir o evento que dispara o workflow (`on:`), usando `pull_request`
  como gatilho no exercício.
- Adicionar um `job` e, dentro dele, um `step` que executa uma ação.
- Ver o workflow rodar na aba **Actions** e mergear o PR criado pelo
  próprio exercício.

**Conceito-chave levado para a Semana 5:** todo workflow (`ci.yml`) é
disparado por um evento e organizado em jobs/steps — é a base de
`lint-backend`, `build-backend`, etc.

### 2. Test with Actions
Curso intermediário sobre integração contínua:
- Rodar testes já existentes em um projeto Python de exemplo.
- Criar um workflow de teste via interface web do GitHub.
- Adicionar um workflow de cobertura de testes direto no editor de código.
- Investigar e corrigir um teste que falha propositalmente.
- Configurar a branch para **exigir** que os testes passem antes de
  permitir o merge (branch protection).

**Conceito-chave levado para a Semana 5:** é a lógica por trás do
`needs:` e do Fail-Fast — um job de teste que bloqueia a integração até
passar, igual ao `test-backend`/`test-frontend` do desafio.

### 3. Publish Docker Images
Curso mais avançado, pré-requisito: familiaridade com Actions e
com Docker básico:
- Criar um workflow básico que builda e publica uma imagem Docker no
  GitHub Container Registry (GHCR).
- Evoluir o workflow usando actions especializadas do Docker
  (`docker/build-push-action`, `docker/metadata-action`,
  `docker/login-action`) para melhorar performance.
- Implementar tagueamento dinâmico (versionamento automático baseado no
  contexto do Git — branch, SHA, etc.).
- Praticar o ciclo completo: criar feature → abrir PR → gerar release →
  publicar imagem com a tag correta.

**Conceito-chave levado para a Semana 5:** é literalmente a Etapa 6 do
desafio (`deploy-backend`/`deploy-frontend` publicando no GHCR com tags
`:latest` e `:${{ github.sha }}`) — o curso é praticamente um ensaio
dessa etapa.

## Como isso se conecta ao desafio (Fase 3)

| Trilha da Fase 2 | Etapa da Fase 3 que ela prepara |
|---|---|
| docker-game (logs, inspect, exec, cp) | Depuração das Etapas 1, 2 e 4 (containers dev/prod) |
| Hello GitHub Actions | Estrutura base do `ci.yml` (Etapa 3) |
| Test with Actions | Lógica de `needs` e Fail-Fast (Etapa 3) |
| Publish Docker Images | Publicação no GHCR (Etapa 6) |