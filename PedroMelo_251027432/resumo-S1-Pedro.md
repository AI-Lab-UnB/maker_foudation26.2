# Introdução

Aqui segue a documentação das minhas atividades e aprendizados da Semana 01/Ciclo 01 do projeto Makers.

## Atividade 01 - Learn Git Branching

O Learn Git Branching é uma plataforma gamificada que visa ensinar aos seus usuários os comandos e aplicações do Git de forma visual e interativa, focando principalmente nas "Branchs", artíficio do Git que costuma trazer a maior quantidade de dúvidas.

Essa plataforma divide o ensino em duas principais aplicações do git, o uso Local e uso Remoto. Para documentar o meu aprendizado, usarei essa mesma divisão

### Git Local

Na etapa de uso local aprendi conceitos básicos como "commits", "branches", formas de combinar trabalho, movimentação pela árvore de "commits" e métodos de seleção de "commits".

#### Conceitos Básicos

- **"Commit":** É a principal ferramenta do git. Atua como uma "foto" do diretório salvando o estado atual de todo o diretório em sua estrutura. Claro que salvar o diretório inteiro a cada commit é inviável, por isso o modo de salvamento é guardando as diferenças entre uma "foto" e outra.

- **"Branch":** É uma ramificação de "commits" fora da trilha principal do projeto. Possibilita alterações distintas em um mesmo trabalho de forma organizada e lógica. Basicamente um ponteiro para um commit específico da principal.

- **"Main":** Nomenclatura padrão para a "branch" principal que reune o projeto em sua integralidade;

- **"HEAD":** É o ponteiro que usamos como referência para o "commit" que estamos trabalhando.

#### Comandos principais

- **`git commit`:** É a forma de commitar o seu projeto, salvando as alterações "staged" em uma referência hash na sua árvore de commits. Pose-se adicionar uma mensagem para que seja possível identificar as alterações às quais aquele commit se refere usando `-m "<message>"`;

    ***Trabalhando com a área de "Staging"***
    - **`git add <arquivo>`:** Adiciona o arquivo escolhido para a área de "staging" para ser commitado;

    - **`git restore <arquivo>`:** O "restore" serve para desfazer alterações em um arquivo, fazendo retornar ao estado que se encontrava no commit passado, mas também pode ser usado para remover arquivos da área de staging. Para isso, é necessário adicionar `--staged` antes do nome do arquivo;

- **`git reset <referência>`**: **Reverte** mudanças retornando para commits mais antigos (escolhesse o commit a qual queremos voltar no argumento da função), não funciona em commits remotos;

- **`git revert <referência>`**: É o método para correção de commits já "pusheados". **Reverte** mudanças criando um commit baseado em um commit já existente mais acima na árvore. É como "voltar no tempo";

- **`git branch <branchName>`:** **Cria** uma branch nova no commit onde está a HEAD;

- **`git switch <branchName>`:** **Move** o HEAD do seu commit atual para a ponta da branch especificada no comando. É possível usar esse comando também para **criar** uma branch e mover a HEAD em uma única linha usando `-c` antes do nome da branch.

    O comando também possui outro uso que é para mover a HEAD pela árvore usando:
    - Hash
    - Referências relativas: 
        - ^
        - ~< num >
    
    Para isso usamos `git switch -d <referência>` (-d vem de detach)


***Juntando "Branches":***

- **`git merge`:** Com o "merge" podemos unir duas "branches" em uma só novamente, agregando as modificações que haviam sido realizadas em **um commit único** na linha da branch que você escolher, logo, isso gera um commit com dois pais;

- **`git rebase`:** O "rebase" também é um comando para unir modificações de duas "branches" em uma, no entanto, o funcionamento é diferente do "merge". esse comando copia todos os commits que estão na branch atual e joga na branch de destino.

### Git Remoto

A possibilidade de utilizar o Git de forma remota, publicando os seus arquivos na nuvem onde outros podem acessá-los, torna a ferramenta muito mais completa e libera o desenvolvimento colaborativo e também seguro. Nessa etapa aprendi as formas de lidar com repositórios remotos com adições de outros colaboradores.

#### Conceitos Básicos

- **"origin/~~~~":** Formato do nome de uma branch local criada para acompanhar suas imagens em repositórios remotos. Atuam como um ponteiro;

#### Comandos Principais

- **`git clone <link>`:** Faz o download de um repositório remoto completo a partir de um link;

- **`git fetch`:** Basicamente faz o download de novas alterações disponibilizadas no repositório remoto

- **`git pull`:** Une `git fetch` e merge/rebase para unir alterações do repositório remoto às suas alterações locais no seu repositório local. Para merge: `git pull --no-rebase` e para rebase: `git pull --rebase`

- **`git push`:** Envia para o repositório remoto as suas alterações locais. É sempre importante verificar o estado do seu repositório e do remoto para evitar falhas e garantir um push correto.

## Atividade 02 - GitHub Skills

