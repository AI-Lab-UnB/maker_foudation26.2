# **Tudo sobre git/github**
## O que aprendi no learngitbranching.js.org e em GitHub Skills

Este é um *guia informal* das informações que acumulei sobre as capacitações citadas acima.

### **Qual a diferença entre Git e GitHub?**
Fazendo uma analogia, podemos dizer que
* Git é o editor de texto no seu PC;
* GitHub é a nuvem/rede social onde você compartilha seus textos.

O **Git** é um software que roda comandos para que seja possível atualizar commits e acessar branches de um dispositivo.
Ele é instalado em sua máquina e é utilizado de forma offline.

O **GitHub** é uma plataforma online em que é possível hospedar repositórios Git. Nele, é possível fazer backups de códigos na nuvem e é uma ótima plataforma para trabalhos em equipe pelo fato de existirem funções próprias para aprendizado.

#### O que é um arquivo .md? Para que ele serve?
Em **GitHub Skills**, foi dito e demonstrado que um arquivo .md faz referência ao termo *Markdown*, que é um arquivo de texto puro que utiliza uma formatação muito leve e fácil de ler, tanto para humanos quanto para computadores (como esse arquivo feito agora :D).

Além disso, a mesma capacitação mostra que todo repositório do GitHub tem um arquivo *README.md*, que funciona como uma espécie de introução para projetos (feito uma página inicial).

* O Markdown tem sua própria "sintaxe", em que é possível formatar o texto dentro dele de algumas formas, como nos exemplos abaixo:

| O que você digita | O que vira na visualização |

| `# Título 1` | **Título Principal (H1)** |
| `## Título 2` | **Subtítulo (H2)** |
| `**texto**` | **Negrito** |
| `*texto*` ou `_texto_` | *Itálico* |
| `- item` ou `* item` | Lista com marcadores |
| `1. item` | Lista numerada |
| `[Texto](link)` | Link clicável |
| `> citação` | Bloco de citação/destaque |

## **Comandos básicos do Git**
#### Aprendizados do learngitbranching.js.org

### **Commit**
O commit é um ponto fixo na história do projeto que registra exatamente como todos os arquivos estavam naquele instante.

Para criar um commit, temos:
```bash
git commit -m mensagem-do-commit
```

Adicionando um arquivo:
```bash
git add .
```

Registrando alterações no histórico:
```bash
git commit
```

Enviando pro GitHub:
```bash
git push
```

### **Branch**
Uma branch é uma **ramificação** do projeto que permite trabalhar em uma versão independente do código, sem alterar diretamente a branch principal. Isso é muito útil quando diferentes pessoas precisam trabalhar em funcionalidades diferentes ao mesmo tempo, tudo isso estando no mesmo projeto.

Para criar uma nova branch, podemos utilizar:
```bash
git branch nome-da-branch
```

Mudando para uma branch que já existe:
```bash
git checkout branch-numero-dois
```

Criando uma branch e mudando pra ela automaticamente:
```bash
git checkout -b sua-branch
```
### **Merge**
O merge é utilizado para juntar as alterações de uma branch com outra. Ele permite incorporar o trabalho realizado em uma branch à branch em que estamos atualmente.

Por exemplo, se terminamos uma atividade na branch sua-branch e queremos adicioná-la à main, primeiro precisamos estar na main:
```bash
git checkout main
```
AGORA sim fazemos esse merge:
```bash
git merge sua-branch
```

### **HEAD**
O HEAD é um ponteiro que indica onde estamos atualmente no histórico do Git. Ele aponta para o commit mais recente da branch em que estamos trabalhando.
Quando mudamos de branch, o HEAD também muda de posição para indicar a branch em que estamos - porque ele segue sempre o commit mais recente.

#### 1. Criando e Configurando o Repositório
Hora de criar e configurar um repositório!! :D Não é tão difícil quanto parece.
Para isso, é preciso seguir os seguintes comandos:

* **`git init`** - iniciando um projeto do zero no seu computador, esse comando transforma a pasta atual do seu computador em um repositório Git (cria a pasta oculta `.git`).
* **`git clone <link-do-repositorio>`** - baixa uma cópia exata de um projeto que já existe na nuvem (GitHub) para o seu computador

#### 2. Salvando suas coisinhas
Legal, temos um repositório! Agora, como navego pelos meus arquivos?
Atente-se aos seguintes comandos:

* **`git status`** - mostra o estado atual: quais arquivos foram modificados, quais foram criados e o que já está pronto para ser salvo. Você pode usar o tempo todo se quiser, para não se perder!
* **`git add <arquivo>`** - coloca as alterações na Staging Area. É como escolher os itens que vão entrar numa caixa antes de passar fita nela.
* **`git commit -m "mensagem explicando o que fez"`** - salva a foto definitiva (*snapshot*) das alterações que estavam preparadas. Você coloca tudo que foi feito aqui, nesse texto.

#### 3. Consultando o histórico de arquivos
* **`git log`** - lista o histórico de todos os commits já feitos no projeto (com autor, data e mensagem)

#### 4. Sincronizando tudo isso com a nuvem (GitHub)
Agora é hora de upar tudo isso pro GitHub. Essa é a parte mais fácil!

* **`git push origin <nome-da-branch>`** - dá um empurrão nos commits que você fez localmente no seu computador para o GitHub
* **`git pull origin <nome-da-branch>`** - puxa tooodas as alterações novas que estão no GitHub e junta com o seu código local

#### Pull Request
Voltando para o GitHub, um PR é uma solicitação para que as alterações de uma branch sejam revisadas e incorporadas a outra branch. No GitHub, ele permite que outras pessoas analisem as alterações antes que elas sejam adicionadas à branch principal.

Minha branch
     ↓
   push
     ↓
  GitHub
     ↓
Pull Request
     ↓
   revisão
     ↓
   merge
     ↓
   main

##### Este é meu *guia informal* de Git e GitHub dos aprendizados da semana dos dias 18/08 a 23/08! Foram, no total, aproximadamente 3 horas de capacitação nos sites enviados (adorei os níveis do learngitbranching) e cerca de 3 horas no desenvolvimento deste arquivo Markdown. Não tinha familiaridade alguma com o Git/GitHub e nem com arquivos .md, mas sinto que agora tenho uma boa base do básico.