# Resumo tarefa 1 - Git e Git

## Qual diferençaentre Git e GitHub ?

Git é um sistema de controle de versão usado para acompanhar e 
registrar as alterações de um projeto diretamente no computador. 
Já o GitHub é uma plataforma online que utiliza o Git para armazenar 
repositórios, compartilhar projetos e facilitar a colaboração entre pessoas.

---

## Conceitos e comandos

**Commit:** registra as alterações feitas no projeto no histórico.

```bash
git commit
```
---
**Branch:** cria uma linha de trabalho separada, permitindo desenvolver alterações sem modificar diretamente outra branch.

```bash
git checkout -b bugFix
```

Cria a branch `bugFix` e muda para ela.

```bash
git checkout bugFix
```

Muda para uma branch já existente.

```bash
git branch -b bugFix
```
---
**Merge:** junta as alterações de uma branch com a branch atual.

```bash
git merge bugFix
```
---
**Rebase:** reorganiza o histórico, reaplicando os commits da branch atual sobre outra branch.

```bash
git rebase main
```

Também pratiquei o rebase interativo:

```bash
git rebase -i HEAD~4
```

Ele permite editar e reorganizar os últimos 4 commits.

---
**HEAD:** indica a posição atual no histórico do Git.

```bash
git checkout HEAD
```

Também usei o `HEAD` como referência para voltar a commits anteriores:

```bash
git branch -f main HEAD~3
```
---
**Reset:** permite retirar alterações do staging ou voltar uma referência do histórico.

```bash
git reset HEAD
```
---
**Revert:** desfaz as alterações de um commit criando um novo commit para registrar essa reversão.

```bash
git revert HEAD^
```
---
**Staging:** área onde ficam as alterações selecionadas para o próximo commit.

```bash
git add app.js
git commit
```

```bash
git add styles.css
git commit
```

Para retirar um arquivo do staging:

```bash
git restore --staged secret.env
```

Para descartar as alterações de um arquivo:

```bash
git restore experiment.js
```
---
**Cherry-pick:** permite pegar commits específicos e aplicar suas alterações na branch atual.

```bash
git cherry-pick <Commit1> <Commit2> <...>
```
---
**Amend:** permite modificar o último commit.

```bash
git commit --amend
```

---
**Tag:** marca um commit específico para facilitar sua identificação no histórico.

```bash
git tag c1
```
---
**Describe:** mostra informações sobre a posição de um commit em relação às tags.

```bash
git describe <ref>
```
