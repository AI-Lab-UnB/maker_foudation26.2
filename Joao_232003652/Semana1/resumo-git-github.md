## Git no Learn Git Branching

Passei um tempo bom só brincando com o simulador, e isso ajudou muito mais do que eu esperava. A ideia de commit ficou bem mais clara: não é "salvar", é tirar uma foto do projeto inteiro naquele instante e grudar ela na anterior.

```
git commit -m "mensagem do commit"
```

Branch também fez mais sentido depois de ver visualmente. É basicamente um ponteiro que anda sozinho, então dá pra abrir uma frente nova sem mexer no que já tá pronto.

```
git branch nova-feature
git checkout nova-feature
```

Merge é juntar esses caminhos de novo. Às vezes cola liso, às vezes dá conflito e tem que resolver na mão.

```
git checkout main
git merge nova-feature
```

Checkout eu uso o tempo todo agora, é o "me leva pra lá" do Git, seja pra outra branch ou pra um commit específico.

```
git checkout nome-da-branch
git checkout <hash-do-commit>
```

Rebase foi o que mais deu trabalho de entender, mas ver os commits sendo "arrancados" e recolados em cima de outra base ajudou a tirar o medo dele.

```
git checkout nova-feature
git rebase main
```

No fim das contas, entendi que Git não é decorar comando, é entender pra onde o histórico se move a cada ação.

## GitHub Skills

Fiz as trilhas de Introduction to GitHub e Communicate using Markdown. A primeira é basicamente o ciclo que todo mundo usa no trabalho: sobe a branch, abre PR, alguém revisa, dá merge.

```
git clone https://github.com/usuario/repositorio.git
git push origin nova-feature
```

O PR mesmo eu abri direto pela interface depois do push, não tem comando pra isso.

A trilha de Markdown foi mais rápida, mas útil, porque escrever direito uma issue ou PR facilita muito a vida de quem vai revisar.

```
# Título
**negrito**, *itálico*
- item de lista
[texto do link](https://exemplo.com)
`código em linha`
```

## Pro Git como consulta

Não li corrido, só fui nos capítulos 2 e 3 quando bateu dúvida em algo que já tinha visto na prática. Foi ali que peguei alguns comandos de apoio que uso o tempo todo agora, tipo conferir o estado do repositório ou olhar o histórico.

```
git status
git log
git diff
```

Basicamente foi isso: primeiro fui no simulador pra pegar a intuição, depois nas trilhas do GitHub pra ver como isso funciona em equipe, e o livro ficou de apoio pra quando alguma coisa não fazia sentido.