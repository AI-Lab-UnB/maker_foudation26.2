# T01 - RESUMO DOS APRENDIZADOS - SEMANA 01 (23/08)

## O que é GitHub?
Basicamente, entendi que o GitHub é uma plataforma de hospedagem na nuvem que detém projetos que utilizam o Git, um sistema de versionamento de código que possibilita uma 
maior organização de projetos, principalmente quando feitos em conjunto, o que facilita bastante a colaboração. 

Tendo isso em vista, compreendi também que o ambiente de trabalho se subdivide em quatro campos, o *repositório remoto*, que fica na nuvem e serve para armazenar backups
do trabalho e permitir o compartilhamento com a equipe, o *repositório local*, onde o histórico de versões fica salvo no meu próprio computador, para quando é necessário 
trabalhar com arquivos e códigos mesmo sem internet (o que também não impede que sejam armazenados na nuvem e versionados futuramente), o *staging*, onde escolho 
especificamente quais arquivos alterados farão parte da nova versão  e o *working directory*, que é onde crio e altero os códigos dentro da minha máquina.

## O Workflow do Git
Com os 4 ambientes previamente definidos, consegui estabelecer uma relação entre os 4 campos, que giram em torno de 4 situações diferentes:

### 1. Working Directory para Staging
Quando é necessário preparar a submissão de arquivos que foram modificados (excluídos, adicionados ou alterados) usa-se `git add .` para adicionar todos os arquivos que
sofreram modificações ou `git add nome-do-arquivo`. Com isso, conclui-se a preparação para o "empacotamento" do código para que ele seja salvo no histórico do projeto no próximo passo.

### 2. Staging para o Repositório Local
Para consolidar a versão do passo anterior, basta executar `git commit -m "mensagem-do-commit"` para que o Git "empacote" o que foi selecionado durante o staging e crie um pacote
no histórico local. É como tirar uma print dos arquivos naquele estado e salvá-la na máquina, permitindo o acesso ao backup mesmo offline. 

### 3. Repositório Local para o Remoto
Quando for necessário enviar aquilo que foi alcançado no repositório local para o GitHub, usa-se o comando `git push`. Ao usá-lo, todos os commits que estiverem armazenados no 
computador serão enviados para a nuvem, possibilitando que terceiros consigam visualizar o que foi feito.

### 4. Repositório Remoto para o Local
Quando deseja-se obter a versão mais recente do projeto e trazê-las para a máquina de trabalho, utiliza-se `git pull`. Assim, todas as mudanças feitas no repositório remoto serão
atualizadas e mescladas diretamente no repositório local e working directory.

## Outros comandos relevantes
+ `git log`: Exibe o histórico de commits de um repositório.
+ `git status`: Mostra o estado atual dos arquivos (o que foi modificado, o que está no staging).
+ `git clone`: Faz o download de uma cópia do repositório remoto para o computador.
+ `git checkout`: Abre um commit ou branch dentro do working directory. (gera uma detached HEAD quando se vai para um commit anterior)
+ `HEAD^` ou `HEAD~n`: Volta para 1 commit anterior ou para n-commits anteriores.
+ `git checkout -b nome-da-branch`: Cria uma branch e a abre no working directory.
+ `git merge`: Une uma branch a main* sem reescrever o histórico (bifurcado).
+ `git rebase`: Une os commits de uma branch paralela a main* reescrevendo o histórico (linear).

## Conceitos relevantes
+ Repositório: A pasta raiz que guarda todos os arquivos, diretórios e o histórico completo de versões do projeto.
+ Commit: Uma porção de alterações confirmadas que deseja-se salvar, funcionando como um "checkpoint".
+ Branch: Uma linha do tempo paralela de desenvolvimento que permite isolar a criação de novas funcionalidades sem afetar o código principal do sistema (main).
+ Fork: Forma de copiar um repositório de terceiros para quando deseja-se contribuir com projetos de código aberto.
+ Pull Request: Um pedido formal para que as alterações feitas numa branch sejam implementadas na branch principal.
+ Merge Conflict: Quando o Git falha ao tentar juntar duas branches automaticamente. Geralmente ocorre quando foram feitas alterações nas mesmas linhas de código.

## Checklist da semana
- [X] Estudei os materiais da semana (Learn Git Branching e GitHub Skills 1 e 2)
- [X] Criei minha branch
- [X] Fiz commits da atividade
- [ ] Abri meu PR atualizado e sem conflitos
      
