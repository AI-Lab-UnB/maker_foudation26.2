# T01 - Resumo dos Aprendizados - Semana 01 (23/08)

## Git e o GitHub

Nesta primeira semana, compreendi a diferença entre o **Git** e o **GitHub**: o Git atua como um sistema de controle de versão responsável por registrar o histórico de alterações do projeto, enquanto o GitHub é a plataforma na nuvem que hospeda esses repositórios.

O trabalho no Git é organizado em quatro subdivisões essenciais:
* **Working Directory:** Diretório de trabalho na máquina onde os arquivos são criados e modificados.
* **Staging:** Área de preparação onde são selecionadas as alterações que entrarão no próximo registro.
* **Repositório Local:** Base de dados no próprio computador onde as versões e o histórico ficam salvos.
* **Repositório Remoto:** Servidor hospedado na nuvem (GitHub) para compartilhamento e backup do projeto.

---
## Comandos Aprendidos

* `git status` — Exibe a situação atual das alterações nos arquivos.
* `git log` — Apresenta o histórico detalhado de commits efetuados.
* `git clone` — Faz o download de uma cópia completa de um repositório remoto.
* `HEAD^` / `HEAD~n` — Aponta e recua para 1 ou *n* commits anteriores na linha do tempo.
* `git merge` — Integra o histórico de uma branch à branch principal mantendo a estrutura de ramificação.
* `git rebase` — Une uma branch à main reescrevendo o histórico de alterações em uma linha contínua.
* `git checkout` — Permite navegar entre diferentes commits ou branches.
* `git checkout -b nome` — Cria uma nova branch e alterna para ela no mesmo comando.

---

## A sequência de operações do Git

A transição de informações entre as quatro subdivisões ocorre através de quatro etapas de trabalho:

### 1. Working Directory → Staging
Para preparar as alterações feitas no código, utiliza-se o comando `git add .` (para incluir todas as modificações) ou `git add nome-do-arquivo` (para salvar um arquivo pontual).

### 2. Staging → Repositório Local
Para registrar formalmente as alterações selecionadas na área de staging, executa-se o comando `git commit -m "mensagem"`. Esse processo funciona como um checkpoint (uma foto) do estado atual do código guardado localmente.

### 3. Repositório Local → Remoto
O envio dos *commits* armazenados no computador para o GitHub é feito via `git push`. Isso torna o código acessível para outros colaboradores e garante o backup na nuvem.

### 4. Repositório Remoto → Local
Para atualizar a máquina local com os commits mais recentes presentes no repositório remoto, utiliza-se o comando `git pull`.

---

## Conceitos Aprendidos

* **Repositório:** Pasta principal do projeto que armazena todos os arquivos e o histórico de versões.
* **Commit:** Ponto de restauração gravado no histórico contendo o conjunto de alterações confirmadas.
* **Branch:** Linha de desenvolvimento paralela criada para isolar modificações sem impactar a branch principal.
* **Fork:** Cópia de um repositório público para a própria conta com o intuito de sugerir contribuições.
* **Pull Request:** Solicitação enviada para incorporar as edições de uma branch em outra branch (geralmente a main).
* **Merge Conflict:** Divergência identificada pelo Git quando edições conflitantes são feitas nas mesmas linhas de um arquivo.

---

## Checklist da Semana

- [x] Estudei os materiais da semana
- [x] Criei minha branch
- [x] Fiz commits da atividade
- [ ] Abri meu PR atualizado e sem conflitos