# T01 - RESUMO DOS APRENDIZADOS - SEMANA 01

## O que é GitHub?
Basicamente, entendi que o GitHub é uma plataforma de hospedagem na nuvem que detém projetos que utilizam o Git, um sistema de versionamento de código que possibilita uma maior organização de projetos, principalmente quando feitos em conjunto, o que facilita bastante a colaboração.

Tendo isso em vista, compreendi também que o ambiente de trabalho se subdivide em quatro campos:
* **Repositório remoto:** que fica na nuvem e serve para armazenar backups do trabalho e permitir o compartilhamento com a equipe.
* **Repositório local:** onde o histórico de versões fica salvo no meu próprio computador, para quando é necessário trabalhar com arquivos e códigos mesmo sem internet.
* **Staging:** onde escolho especificamente quais arquivos alterados farão parte da nova versão.
* **Working directory:** que é onde crio e altero os códigos dentro da minha máquina.

## O Workflow do Git
Com os 4 ambientes previamente definidos, consegui estabelecer uma relação entre eles, que giram em torno de 4 situações:

### 1. Working Directory para Staging
Quando é necessário preparar a submissão de arquivos que foram modificados usa-se `git add .` para adicionar todos os arquivos ou `git add nome-do-arquivo`. Com isso, conclui-se a preparação para o "empacotamento" do código.

### 2. Staging para o Repositório Local
Para consolidar a versão do passo anterior, basta executar `git commit -m "mensagem"` para que o Git "empacote" o que foi selecionado no staging e crie um pacote no histórico local. É como tirar uma print dos arquivos naquele estado e salvá-la na máquina.

### 3. Repositório Local para o Remoto
Quando for necessário enviar aquilo que foi alcançado no repositório local para o GitHub, usa-se o comando `git push`. Todos os commits armazenados no computador serão enviados para a nuvem.

### 4. Repositório Remoto para o Local
Quando deseja-se obter a versão mais recente do projeto e trazê-las para a máquina, utiliza-se `git pull`. Assim, todas as mudanças feitas no repositório remoto serão atualizadas e mescladas.

## Outros comandos relevantes
* `git log`: Exibe o histórico de commits de um repositório.
* `git status`: Mostra o estado atual dos arquivos.
* `git clone`: Faz o download de uma cópia do repositório remoto para o computador.
* `git checkout`: Abre um commit ou branch dentro do working directory.
* `HEAD^` ou `HEAD~n`: Volta para 1 ou n-commits anteriores.
* `git checkout -b nome-da-branch`: Cria uma branch e a abre no working directory.
* `git merge`: Une uma branch a main sem reescrever o histórico.
* `git rebase`: Une os commits de uma branch paralela a main reescrevendo o histórico.

## Conceitos relevantes
* **Repositório:** A pasta raiz que guarda todos os arquivos e o histórico completo do projeto.
* **Commit:** Uma porção de alterações confirmadas que deseja-se salvar ("checkpoint").
* **Branch:** Uma linha do tempo paralela de desenvolvimento.
* **Fork:** Forma de copiar um repositório de terceiros.
* **Pull Request:** Um pedido formal para que as alterações feitas numa branch sejam implementadas na branch principal.
* **Merge Conflict:** Quando o Git falha ao tentar juntar duas branches automaticamente.

## Checklist da semana
- [x] Estudei os materiais da semana (Learn Git Branching e GitHub Skills 1 e 2)
- [x] Criei minha branch
- [x] Fiz commits da atividade
- [x] Abri meu PR atualizado e sem conflitos
