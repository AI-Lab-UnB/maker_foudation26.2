# Resumo — Git

Fiz os exercícios do curso Learn Git Branching para praticar alguns comandos e conceitos do Git. <https://learngitbranching.js.org/?locale=pt_BR>

## Commits

Aprendi que os commits registram as alterações feitas no projeto e formam o histórico do código.

Comandos vistos:

```bash
git commit
git log
```

Também aprendi a usar o `HEAD` para identificar o ponto atual do histórico.

## Branches

Branches permitem criar linhas diferentes de desenvolvimento dentro do mesmo projeto.

Comandos vistos:

```bash
git branch
git checkout
git switch
```

Também pratiquei a navegação entre branches e commits.

## Cherry-pick

O `cherry-pick` serve para pegar um commit específico de uma branch e aplicar em outra.

```bash
git cherry-pick <commit>
```

## Rebase

O `rebase` permite colocar os commits de uma branch sobre outra, reorganizando o histórico.

```bash
git rebase <branch>
```

Também entendi que o rebase pode deixar o histórico mais linear.

## O que aprendi

- Criar e trocar de branches.
- Fazer commits e consultar o histórico.
- Navegar entre commits usando o `HEAD`.
- Pegar commits específicos com `cherry-pick`.
- Reorganizar commits usando `rebase`.
- Entender melhor como branches e commits se relacionam no Git.