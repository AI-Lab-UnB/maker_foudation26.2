## Git × GitHub

### Git
O **Git** é um sistema de controle de versão utilizado localmente para acompanhar as alterações de um projeto. Permite registrar alterações, criar versões do código, trabalhar com branches, consultar o histórico e integrar linhas de desenvolvimento.

### GitHub
O **GitHub** é uma plataforma que hospeda repositórios Git e fornece ferramentas para colaboração, como Pull Requests, Issues e revisão de código.

> **Resumo:** Git é a ferramenta local; GitHub é a plataforma na nuvem.

## O Fluxo do Git

O trabalho com Git é dividido em quatro áreas distintas:

- **Working Directory:** Pasta do projeto no computador onde os arquivos são criados, modificados ou removidos.
- **Staging Area:** Área de preparação onde você seleciona quais alterações farão parte do próximo commit (`git add`).
- **Repositório Local:** Banco de dados no computador com o histórico, commits e branches (`git commit`).
- **Repositório Remoto:** Versão do projeto hospedada na nuvem no GitHub (`git push` e `git pull`).

## Principais Comandos Git

- `git init` — Inicializa um novo repositório Git local.
- `git clone <URL>` — Cria uma cópia local de um repositório remoto.
- `git status` — Mostra o estado atual do projeto (arquivos modificados, preparados ou não rastreados).
- `git add .` — Adiciona todas as alterações à Staging Area (`git add <nome>` para um arquivo específico).
- `git commit -m "mensagem"` — Registra o snapshot das alterações no histórico local.
- `git log` — Mostra o histórico de commits.
- `git push` — Envia commits locais para o repositório remoto (`git push -u origin <branch>` no primeiro envio).
- `git pull` — Busca as alterações do repositório remoto e atualiza o local.
- `git fetch` — Busca informações do remoto sem integrar automaticamente ao código local.

## Branches

Uma **branch** é uma cópia independente do código de um projeto. Permite criar funcionalidades ou correções sem alterar diretamente a branch principal (`main`).

### Comandos para branches

- `git branch` — Lista as branches do projeto.
- `git branch <nome>` — Cria uma nova branch.
- `git checkout <nome>` — Alterna para a branch informada.
- `git checkout -b <nome>` — Cria e entra na nova branch simultaneamente.
- `git switch <nome>` — Comando moderno para alternar entre branches.
- `git switch -c <nome>` — Comando moderno para criar e entrar na branch.

## Merge

O **Merge** integra o histórico de uma branch em outra, criando um commit de mesclagem.

### Exemplo

git checkout main
git merge feature/user

## Rebase

O **Rebase** reorganiza os commits de uma branch, aplicando-os diretamente no topo de outra branch base, gerando um histórico estritamente linear.

### Exemplo

git checkout feature/user
git rebase main

## Cherry-pick

O **Cherry-pick** permite escolher um commit específico de qualquer branch e aplicá-lo isoladamente na branch atual.

### Exemplo

git cherry-pick <hash-do-commit>

## Git reset X Git revert

### `git reset`

Reposiciona a branch para um commit anterior no histórico. Pode ser usado para reescrever commits locais.

### Exemplo

git reset <hash-do-commit>

### `git revert`

Cria um novo commit que anula as alterações feitas em um commit antigo, preservando todo o histórico do projeto.

### Exemplo

git revert <hash-do-commit>

## Conceitos

- **Repository:** Local onde são armazenados os arquivos, commits, branches e histórico do projeto.
- **Commit:** Registro ou snapshot das alterações salvas em um determinado momento.
- **Branch:** Linha de desenvolvimento isolada.
- **Fork:** Cópia de um repositório para a sua própria conta no GitHub.
- **Pull Request (PR):** Solicitação formal para integrar alterações de uma branch em outra, permitindo revisão de código (*code review*).
- **Merge Conflict:** Conflito ocorrido quando o Git encontra alterações na mesma linha do mesmo arquivo vindas de fontes diferentes. Exige resolução manual.