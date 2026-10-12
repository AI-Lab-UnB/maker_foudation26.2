# Relatório Consolidado — Semana 1: Git, GitHub e Fluxo de Trabalho

Este documento sintetiza os conhecimentos adquiridos durante a primeira semana de atividades, abordando os conceitos de controle de versão, comandos fundamentais, formas de integração de código e navegação pelo histórico.

---

## 1. Git vs. GitHub

* **Git:** Sistema de controle de versão atua localmente na máquina. Ele rastreia mudanças nos arquivos, gerencia ramificações e registra o histórico do projeto.
* **GitHub:** Serviço em nuvem construído sobre o Git para centralizar repositórios remotos. Oferece ferramentas adicionais voltadas para colaboração em equipe, como Pull Requests, revisão de código, automações e hospedagem de páginas estáticas (GitHub Pages).

---

## 2. A Arquitetura e os Estados do Git

O ciclo de uma alteração no Git transita por quatro partes principais:

| Área | Finalidade | Comandos |
| :--- | :--- | :--- |
| **Working Directory** | Diretório local onde os arquivos são criados, editados ou removidos. | `git status` |
| **Staging Area (Index)** | Área que seleciona e prepara as mudanças a serem incluídas no próximo ponto de salvamento. | `git add <arquivo>` / `git add .` |
| **Repositório Local** | Banco de dados interno do Git que armazena a árvore de commits e referências de branches locais. | `git commit -m "mensagem"` |
| **Repositório Remoto** | Cópia hospedada na nuvem utilizada para sincronização e colaboração com outras pessoas. | `git push` / `git pull` / `git fetch` |

---

## 3. Principais Comandos e Operações do Dia a Dia

```bash
# Inicialização de projetos
git init                         # Inicializa um repositório local 
git clone <URL>                  # Clona um repositório remoto existente

# Monitoramento e preparação
git status                       # Exibe o estado dos arquivos rastreados e não rastreados
git add <caminho>                # Adiciona modificações específicas na staging area
git commit -m "descrição"        # Salva as alterações preparadas no histórico local
git log                          # Visualiza o histórico de commits

# Gerenciamento e navegação de branches
git branch                       # Lista as branches locais
git branch <nome-da-branch>      # Cria uma nova linha de desenvolvimento
git switch <nome-da-branch>      # Alterna para a branch desejada
git switch -c <nome-da-branch>   # Cria e acessa a nova branch 
git checkout <hash-commit>       # Move o ponteiro HEAD para um commit antigo
```

---

## 4. Integração e Manipulação do Histórico


*   **Merge (`git merge`):** Une duas branches criando um commit específico de fusão. Preserva a topologia das branches, mas pode tornar o gráfico de histórico ramificado.
    ```bash
    # Estando na branch destino (ex: main), absorve a branch especificada:
    git merge <nome-da-branch-que-sera-absorvida>
    ```

*   **Rebase (`git rebase`):** Reaplica os commits da branch de trabalho no topo da branch principal, resultando em um histórico completamente linear e sequencial.
    ```bash
    # Estando na sua branch de trabalho, reaplica seus commits sobre a base:
    git rebase <branch-base>
    ```

*   **Cherry-pick (`git cherry-pick`):** Aplica as alterações de um ou mais commits de outra linha de código na branch ativa.
    ```bash
    # Aplica um único commit:
    git cherry-pick <hash>

    # Aplica múltiplos commits em sequência:
    git cherry-pick <hash1> <hash2> <hash3>
    ```

*   **Git Reset (`git reset`):** Move o ponteiro da branch para um estado anterior.
    ```bash
    # Volta 1 commit e apaga as modificações dos arquivos:
    git reset --hard HEAD~1
    ```

*   **Git Revert (`git revert`):** Gera um novo commit com o propósito de inverter as mudanças de um commit anterior, preservando o histórico.
    ```bash
    # Cria um novo commit "desfazendo" as alterações feitas pelo commit C2:
    git revert <hash-do-commit>
    ```

---

## 5. Navegação e Controle de Referências

Para explorar o histórico e corrigir:

*   **Referências Relativas (`^` e `~`):** Permitem navegar pelo histórico partindo da sua posição atual (`HEAD`) ou de uma branch, sem precisar saber o hash exato do commit.
    ```bash
    # O Acento Circunflexo (^) move exatamente UM commit para trás (vai para o "pai"):
    git checkout main^
    git checkout HEAD^

    # O Til (~) move uma quantidade específica de commits para trás de uma só vez:
    git checkout HEAD~4
    ```

*   **Movimentação Forçada de Branches (`git branch -f`):** Permite reatribuir arbitrariamente para onde uma branch aponta. É excelente para consertar erros (por exemplo, se commits foram feitos acidentalmente na `main`, você pode forçá-la de volta para o estado anterior).
    ```bash
    # Força a branch especificada a voltar para o destino desejado (ex: volta 3 commits):
    git branch -f <nome-da-branch> <destino>
    ```

*   **Rebase Interativo (`git rebase -i`):** Ferramenta para reescrever o histórico local antes do envio ao GitHub. Abre uma interface de texto permitindo reordenar commits, alterar mensagens, fundir dois commits em um só (*squash*) ou até deletá-los.
    ```bash
    # Abre a interface para editar os últimos 3 commits:
    git rebase -i HEAD~3
    ```

*   **Trabalho Incompleto (`git stash`):** Funciona como uma forma de armazenamento temporário quando é necessário trocar de branch sem perder alterações não commitadas.
    ```bash
    # Guarda as modificações e limpa o diretório de trabalho:
    git stash

    # Retira as alterações e as reaplica na branch atual:
    git stash pop
    ```