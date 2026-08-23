# Resumo aprendizados da semana 1
## GitHub

## Conceitos 
1. **Branch**:
   Cópia paralela do projeto onde você pode testar ideias, criar novos recursos ou corrigir bugs sem alterar a versão principal (main) que está funcionando.
2. **Merge**:
   Unir o histórico de DUAS BRANCHES e incorporar as alterações de uma na outra sem perder o rastro de onde elas vieram.
3. **Rebase**:
   Forma alternativa de juntar o trabalho de duas branches (reescreve o histórico)
   - Use o rebase: quando estiver trabalhando em uma branch local sua (que ninguém mais esta usando) e quiser manter o histórico de commits limpo e fácil de ler antes de juntar à main.
   - Evite: em branches públicas ou compartilhadas.      
4. **Referências relativas**: quando quero trocar branches de lugar (redefinir diretamente o commit para a qual uma branch aponta).
5. **Commit**: conjunto de alterações feitas nos arquivos e pastas do seu projeto.
6. **Pull request**: Mostra as alterações feitas na branch para outras pessoas e permite que elas aceitem, rejeitem ou sugiram alterações adicionais para a branch.
7. **Repositório** : É um projeto que contém arquivos e pastas. O repositório controla as versões de arquivos e pastas.
8. **README** : é uma sessão "Sobre mim" no seu perfil do GitHub, onde você compartilhar informações sobre si mesmo com a comunidade do GitHub.

## Comandos 
1. **Branches**
   - Cria uma nova branch e muda para ela: `git checkout branch -b nome-da-branch`
   - MUda para uma branch já existente: `git checkout nome-da-branch`
   - Lista todas as branches locais: `git branch`
   - Deleta uma branch local: `git branch -d nome-da-branch`
2. **Merge**
   - traz e une as alterações de outra branch para a branch em que se está no momento: `git merge nome-da-outra-branch`
3. **Rebase**
   - re-aplica os commits da sua branch atual no topo de outra branch: `git rebase nome-da-branch-base`
4. **Sortidos**
   - `git branch -f main HEAD~3`
   - `git reset`
   - `git revert`
   - `git restore --staged <arquivo>`
   - `git restore <arquivo>`
   - `git cherry-pick <commit1> <commit2> <...>`
 
