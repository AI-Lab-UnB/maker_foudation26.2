# Resumo de Aprendizados - Semana 1
Aluno: Samuel De Souza Leite
Matrícula: 202043281

## O que eu estudei na semana 01:

## 1. Conceitos Básicos 

Diferença entre Git e GitHub
 - Git: Serve para realziar controle de versão do código, instalado e executado localmente na máquina do desenvolvedor.
 - GitHub: Plataforma web para hospedar repositórios Git remotamente, adicionando para colaboração como o Pull Requests. 
 - Li o Git Pro para tirar dúvidas sobre como navegar nas branches (de forma semelhante ao que mostra no simulador do https://learngitbranching.js.org/?locale=pt_BR)

## 2. Comandos Básicos  

```
$git clone
```
Baixa uma cópia completa de um repositório remoto para a máquina local.
```
$ git status
```
Mostra o estado atual dos arquivos (modificados, na área de staging ou não rastreados).
```
$ $it add .
``` 
Move as alterações do diretório de trabalho para a Staging Area (preparação).
```
$ git commit -m "mensagem"
```
Grava as alterações de forma definitiva no histórico do repositório local.
```
$ git log 
```
Exibe o histórico de commits.

## 3. Comandos detalhados:
#### GIT COMMIT
Serve para manter o histórico de versões (quando cada commit aconteceu). o GIT pode comprimir o commit mantendo o delta dele.

O comit inicial é chamado de C0, e o comit com alguams mudanças, C1 O commit C2 é filho de C1, que por sua vez é filho de C0: C0 <--- C1 <--- C2 <--- C3.
``` 
$ git commit
```

#### GIT BRANCHES

* Criar branches cedo, criar branches sempre. É melhor ter várias branches pequenas e divididas logicamente do que ter branches grandes e complexas.

* Uma branch se refere a um commit.

* Antes de dar o commit, é necessário verificar qual é a branch ativa no momento.

* Para alterar a branch:
```
$ git checkout [nome]
```

#### GIT CHECKOUT:

* Para fazer o checkout ao mesmo tempo que cria uma nova branch, você pode simplesmente digitar:
```
$ git checkout -b [nomedasuabranch]
```

#### GIT MERGE:
Serve para combinar o trabalho de duas branches diferentes.
```
$ git merge [nomedasuabranch]
```
* Basicamente significa: "Quero incluir todo o trabalho deste pai aqui com o daquele outro pai ali, e com o do conjunto de todos os seus ancestrais."

* Como juntar dois commits e duas branches distintas numa só?
```
$ git checkout [nomedasuabranch]
$ git merge [nomedabranchalvo]
```
#### REBASE:
```
$ git Rebase.
```
A vantagem do rebase é que ele pode ser usado para construir uma sequência mais bonita e linear de commits. O registro de commits (história do repositório) ficará muito mais limpa se for utilizado apenas rebase em vez de merge.
vai parecer que esses dois recursos foram desenvolvidos sequencialmente, quando na realidade foram feitos em paralelo.


#### HEAD:

HEAD é um nome simbólico para o commit atualmente ativo (que sofreu checkout por último) -- é essencialmente o commit sobre o qual você está trabalhando no momento. Sempre apontando para o commit mais recente

Soltar o HEAD significa anexá-lo a um commit em vez de anexá-lo a uma branch. Antes do estado solto ("detached"), é assim como se parece:
```
HEAD -> main -> C1
```
Eu posso fazer o checkout para a main ou para o commit

#### REFERÊNCIAS RELATIVAS:
```
$ git log
```
* Commits relativos são poderosos, mas vamos introduzir apenas dois tipos simples aqui:

* Mover para cima um commit por vez com ^
* Mover para cima um número de vezes com ~<num>

```
$ git checkout main^
```
Podemos viajar para trás no tempo com 
```
$ git checkout HEAD^
```

#### OPERADOR ~

* Um número pode ser passado (opcionalmente) após o operador til, especificando o número de ancestrais que você deseja subir.
```
$ git checkout HEAD ~4
```
* Redefinir diretamente o commit para o qual uma branch aponta com a opção -f. Desta forma, o seguinte comando:
```
git branch -f main HEAD~3
```
* Move (à força) a branch main 3 ancestrais acima do HEAD

```
git branch
```

* Lista as branches locais existentes no repositório

```
git checkout -b
```
* Cria uma nova branch e já muda para ela imediatamente.

```
git merge
``` 
* Traz as alterações de uma outra branch e as funde na branch atual.
```
git rebase -i
```
* Permite reorganizar ou alterar os commits de forma interativa, reescrevendo o histórico.
```
git push
```
Envia os commits da minha máquina local para o repositório remoto no GitHub.
```
git pull
```
Baixa e mescla as alterações do repositório remoto para o meu computador local

## 4. Communicate using Markdown

Markdown é uma sintaxe leve usada para ser comunicar no github. Ela possui títulos, destaques em itálico, negrito, também possui tabelas, listas e outros.

Ela pode ser usada em diferetes partes do github como comnetários, issues, Pull requsets. e aceita também tags HTML.



5. Checklist de Entrega do Laboratório para garantir o fluxo de entrega desta semana, executei os seguintes passos práticos: 
- [x] Estudei os materiais e pratiquei no Learn Git Branching. 
- [x] Criei minha branch Samuel-De-Souza-Leite no repositório local. 
- [x] Registrei meu resumo fazendo os commits da atividade.
- [x] Enviei a branch para o GitHub (git push) e abri meu Pull Request.

