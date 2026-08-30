# Primeira entrega

## GitHub
  Basicamente o que entendi do GitHub é que ele é um abiente virtual que permite que programadores possam trabalhar juntos em um mesmo projeto, mas de diferentes 
lugares e em diferentes partes do projeto. Ao passo que sem interferir na file principal (main) podem fazer uma atualização por meio de uma branch, muda-la por 
meio de commits e após fazer o pull request, podem unir as duas para efetivar essa atualização por meio do merge.

## Git Branching
  Por meio do joguinho Learn Git branching eu entendi legal como funciona o Git por meio de linha de códigos, e entendi o funcionamento de alguns códigos como:
+ `git commit`
+ `git branch (nome da branch)`
+ `git checkout (nome da branch) ou (nome do commit)`
+ `git merge (nome da branch)`
+ `git rebase (nome da branch)`
+ `git checkout (nome da branch)^^(...)`
+ `git checkout (nome da branch)~(quantidade de commits acima)`
+ `git branch -f (nome da branch) HEAD-(quantidade de commits acima)`
+ `git reset HEAD(~ ou ^)`
+ `git revert HEAD(~ ou ^)`
+ `git cherry-pick (commit1) (commit2)`
+ `git rebase -i Head(~ou ^)`
+ `git add (branch)`

Por meios destes comandos é possível manipular:
+ commits, que são basicamente atualizações de algum arquivo, que pode ou não ser efetivado
+ branches, que podem ser cópias de uma branch main, que no futuro podem ser fundidas, para que ocorra uma atualização de software, por exemplo
+ merge, com o comando merge você pode fundir branches, para que as mudanças ocorram na main

Obs: com o mouse no jogo é possível usar o "git checkout", um clique num commit, pot exemplo, equivale a um chechout no commit, ou na branch.

## Resumo
  Basicamente é possível pessoas trabalharem no mesmo projeto por meio de uma interface gráfica pelo GitHub ou por linhas de comando pelo Git, que pode ser 
direto do seu computador, por um terminal de linux, por exemplo, ou mesmo pelo google chrome. Neste processos todos estaram trabalhando na mesma coisa por 
meios diferente, mas com um objetivo só. Além disso há um histórico de commits e PR's que pode ser acessados por quem possui os direitos de um administrador,
e assim por diante.
  
