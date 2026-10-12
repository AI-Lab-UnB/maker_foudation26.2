# Resumo: Tarefa 1 - Git e GitHub

**Git** gerencia as versões do código no seu computador. O **GitHub** é a plataforma online que hospeda os repositórios e permite colaboração.

## Comandos Essenciais

* **Navegação e Histórico:**
  * `git branch` / `git checkout`: Cria novas linhas de trabalho e navega entre elas (use `-b` para criar e já entrar na branch).
  * `HEAD`: Indica onde você está no histórico neste momento.
  * `git tag` / `git describe`: Cria e consulta marcações para commits importantes.
* **Salvando Modificações:**
  * `git add` / `git commit`: Prepara os arquivos (staging) e registra as alterações no histórico.
  * `git commit --amend`: Modifica o último commit feito.
  * `git restore`: Descarta alterações que ainda não foram "commitadas".
* **Integração e Correções:**
  * `git merge` / `git rebase`: Unem o código de branches diferentes. O merge mescla, o rebase reorganiza o histórico no topo.
  * `git cherry-pick`: Copia as mudanças de um commit específico para a branch atual.
  * `git reset` / `git revert`: Desfazem alterações (o reset volta a referência, o revert cria um commit de anulação).

---
## Checklist da Semana
- [x] Estudei os materiais da semana
- [x] Criei minha branch
- [x] Fiz commits da atividade
- [x] Abri meu PR
- [x] Meu PR está atualizado e sem conflitos