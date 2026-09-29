# Git, Github e versionamento de código

## Essa semana aprendi como funciona o versionamento de códigos em repositórios locais, e como utilizar o Github para criar repositórios remotos e compartilhar códigos.

Um dos principais pilares do versionamento é o conceito "commitar" ou criar um commit.

O commit é como se fosse um snapshot ou fotografia do seu código naquele momento, criando uma versão que pode ser acessada posteriormente, fazendo analogia a um jogo, é como se fosse o botão de "salvar".

O comando de commitar pode ser feito pelo bash utilizando o comando:

```bash
git commit -m mensagem-do-commit
```

Esse comando vai criar uma versão do seu código na sua branch main.

Podemos pensar no conceito de branches como uma árvore, onde a branch main é o tronco da árvore, e os galhos são versões experimentais vindas da branch main.

Isso possibilita criarmos e testarmos funcionalidades a partir do código principal sem alterar seu conteúdo na linha do tempo e mantendo uma versão segura e salva.

O comando de branch pode ser feito pelo bash através do comando:

```bash
git branch nome-da-sua-branch
```

Podemos alterar entre branches utilizando o comando:

```bash
git checkout nome-da-branch
```
Isso também altera o HEAD, que consiste num ponteiro onde indica a sua posição atual no histórico do repositório.

## Mas e se eu quiser implementar a funcionalidade de uma branch experimental na minha branch main?

No git também existe o comando de merge, ou melhor dizendo, unir duas versões de código.

O comando merge funciona através de ancestral comum, onde ele busca o último commit em que os dois compartilhavam o mesmo histórico e compara a diferença entre os dois, após isso, junta eles em um novo commit.

A sintaxe do comando merge:

```bash
git merge nome-de-outra-branch
```
Existe outra forma de também unir as branches, de uma forma mais limpa e linear, no qual reorganiza os commits e reaplica no topo de outra ramificação.

O comando para fazer isso é:

```bash
git rebase branch-ramificada
```

# Github, Markdowns e repositórios remotos

## Como compartilho os meus repositórios com meus colegas?

Existem diversos sites como GitLab, Bitbucket e entre outros. Mas hoje daremos ênfase ao GitHub.

Nele existe o conceito de repositórios remotos onde são hospedados em uma rede ou servidor.

São repositórios que podem ser copiados em qualquer máquina através do comando:

```bash
git clone url-do-repositório
```
Esse comando baixará uma versão do repositório remoto no seu computador, no qual poderá ser atualizada depois através do comando:

```bash
git pull
```

Ele atualiza seu repositório local com os commits que seus colegas fizeram no repositório remoto.

Você pode também enviar os commits do seu repositório local através do comando:
```bash
git push nome-remoto nome-da-branch
```

Após enviar a branch para o repositório remoto, você pode solicitar um merge da branch main com a sua branch enviada ao repositório remoto através de um PR (Pull request).

Nele você envia uma proposta pra outros colaboradores para realizar um merge das alterações enviadas na branch principal.

Você pode enviar descrições de problemas e correções no pull request via arquivos markdown (como esse!)

## Arquivos markdown

Markdown é uma linguagem de marcação leve criada com o intuito de formatar textos usando símbolos do teclado, e são comumentes usados para criar documentação e apresentação de projetos em códigos no Github.

Nele é possível colocar trechos de código mais conhecidos como snippets, sendo utilizado para documentar funções ou explicar algo num código.

Exemplo:

```python
print("Hello World!")
```

- [X] Estudei os materiais da semana
- [X] Criei minha branch
- [X] Fiz commits da atividade
- [X] Abri meu PR
- [X] Meu PR está atualizado e sem conflitos


