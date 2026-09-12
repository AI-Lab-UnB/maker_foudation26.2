# Resumo de Aprendizado - Semana 1 (Ai.Lab)

**Nome:** Heitor Gomes Monteiro
**Matrícula:** 251036843

Nesta primeira semana de atividades no Ai.Lab, meu foco principal foi construir uma base sólida em controle de versão e documentação de projetos. Para garantir que o aprendizado fosse dinâmico, dividi meus estudos entre teoria, prática e plataformas oficiais:

* **Prática visual:** Utilizei a plataforma *Learn Git Branching* para treinar a lógica por trás das ramificações do código. Foi essencial para entender visualmente como a árvore de commits se comporta.
* **Trilhas oficiais:** Concluí os módulos iniciais do *GitHub Skills*, especificamente o *Introduction to GitHub* (para dominar o fluxo de colaboração) e o *Communicate using Markdown* (fundamental para escrever documentações e READMEs claros e bem formatados).
* **Base teórica:** Ao longo da semana, adotei o livro *Pro Git* como meu material de cabeceira e consulta, recorrendo a ele sempre que precisava aprofundar o funcionamento "por baixo dos panos" de algum comando.

Abaixo, consolidei um resumo dos principais conceitos e fluxos de trabalho que revisei durante a semana.

---

## O Ecossistema: Git vs. GitHub

Embora os nomes sejam parecidos, eles exercem papéis diferentes e complementares no desenvolvimento de software:

* **Git:** É o sistema de controle de versão (VCS) que roda localmente na sua máquina. Ele rastreia o histórico de alterações dos arquivos, permitindo que você reverta erros, crie linhas do tempo paralelas para testar ideias e gerencie o código base.
* **GitHub:** É a plataforma em nuvem que hospeda os repositórios Git. Ele adiciona uma camada social e de colaboração, permitindo que equipes do mundo inteiro trabalhem no mesmo código, revisem alterações e gerenciem projetos.

## Conceitos Fundamentais

Para navegar nesse ecossistema, é preciso entender a sua linguagem básica:

* **Repository (Repositório):** É o diretório central onde todos os arquivos do seu projeto e o histórico completo de alterações (do Git) ficam armazenados.
* **Commit:** Funciona como uma "fotografia" (snapshot) do estado atual do seu código. Cada commit tem um código de identificação único e uma mensagem explicando o que foi alterado.
* **Branch (Ramificação):** Uma linha do tempo paralela e independente dentro do repositório. A branch principal geralmente se chama `main`. Criamos novas branches para desenvolver funcionalidades sem quebrar o código oficial.
* **Merge (Mesclagem):** É a ação de unir o código de uma branch com outra (por exemplo, trazer a funcionalidade que você acabou de criar para a `main`).
* **Pull Request (PR):** Um conceito do GitHub. É um pedido formal para que as alterações da sua branch sejam revisadas por outras pessoas antes de fazer o *Merge* no código principal.

## Comandos Essenciais do Dia a Dia

A rotina de versionamento de código geralmente gira em torno de um ciclo de comandos muito repetido:

### 1. Iniciando o trabalho
* `git init`: Transforma uma pasta local comum em um repositório Git.
* `git clone [url]`: Baixa um repositório existente do GitHub para a sua máquina.

### 2. Salvando alterações
* `git status`: Mostra quais arquivos foram modificados, adicionados ou removidos desde o último salvamento.
* `git add [arquivo]`: Coloca as alterações no *Staging Area* (preparando o terreno para o salvamento). Para adicionar tudo de uma vez, usa-se `git add .`.
* `git commit -m "Mensagem"`: Salva definitivamente as alterações que estavam preparadas, acompanhadas de uma mensagem clara e descritiva.

### 3. Trabalhando com Ramificações (Branches)
Como pratiquei bastante no *Learn Git Branching*, estes comandos foram fundamentais para entender o fluxo de trabalho paralelo:
* `git branch`: Lista todas as branches (ramificações) locais do seu repositório. Se usar `git branch [nome-da-branch]`, você cria uma nova ramificação.
* `git checkout [nome-da-branch]`: Muda a sua área de trabalho para a branch especificada. (Dica: o comando `git checkout -b [nome]` cria a branch e já muda para ela ao mesmo tempo).
* `git merge [nome-da-branch]`: Pega o histórico e as alterações da branch especificada e as mescla na branch em que você está no momento (geralmente, voltamos para a `main` e fazemos o merge da branch da funcionalidade).

### 4. Sincronizando com a nuvem (GitHub)
* `git push`: Envia os seus commits locais para o repositório remoto no GitHub.
* `git fetch`: Baixa as informações e o histórico de atualizações do repositório remoto, mas sem mesclar ou alterar os seus arquivos locais de imediato.
* `git pull`: Puxa as atualizações que estão no GitHub e as mescla automaticamente no seu repositório local (na prática, funciona como um `fetch` seguido de um `merge`).

### 5. Explorando o Histórico
* `git log`: Exibe o histórico de commits, permitindo ver os códigos de identificação (hashes), quem fez as alterações, as datas e as mensagens de cada salvamento.
