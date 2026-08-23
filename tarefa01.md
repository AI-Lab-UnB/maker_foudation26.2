# Atividade 01 - Semana 01 (23/08)

## Introdução

Aqui vou apresentar todo o aprendizado da semana para o AILab

---

## Prática do Learn Git Branching

Basicamente, o Learn Git Branching é uma plataforma onde é possível aprender conceitos básicos sobre a utilização do github de uma forma mais interativa e dinâmica.
Nela, foram possíveis treinar diversos comandos para um melhor entendimento e eficiência de próximos trabalhos que serão feitos.

---
##  Comandos que Aprendi

* `git commit` - Utilizado para salvar as alterações que foram feitas em algum repositório.
* `git checkout` — Entrega a possibilidade de escolher qual commit será editado.
* `git merge` — É possível "juntar" dois commits, unindo seus históricos em um só, mas mantendo a mesma estrutura/ramificação.
* `git rebase` — Quase a mesma função do merge, mas aqui ele retira as ramificações, transformando a estrutura numa linha contínua.
* `git clone` — Faz uma cópia de um repositório remoto.
* `HEAD^` / `HEAD~n` — Volta para 1 ou *n* commits anteriores na linha de commits feita.
* `git status` — Mostra as alterações atuais das edições.
* `git log` — Mostra o que já foi feito detalhadamente.

---
##  Conceitos que Aprendi

+ Repositório: Diretório principal do projeto onde ficam armazenados todos os arquivos, pastas e o registro completo de cada versão já criada.
+ Commit: Conjunto de mudanças já confirmadas e registradas no histórico, funcionando como um ponto de controle do projeto.
+ Merge Conflict: Situação em que o Git não consegue unir automaticamente duas branches, geralmente porque trechos idênticos de código foram alterados em ambas.
+ Branch: Ramo de desenvolvimento independente que permite construir novas funcionalidades separadamente, sem interferir na versão principal (main) do sistema.
+ Fork: Processo de duplicar o repositório de outra pessoa, normalmente usado para colaborar com projetos de código aberto.
+ Pull Request: Solicitação oficial para que as modificações feitas em uma branch sejam incorporadas à branch principal.

---

## Github Skills

Na parte da atividade de github skills, foi possível aprender como se cria uma branch em **Introduction to Github** e consegui aprender bastante sobre a linguagem Markdown, que é utilizada para formatar textos de uma forma mais fácil, sem a utilização de HTML,, isso tudo na atividade **Communicate using Markdown**.

---
## Workflow

### 1. Criar uma branch
Antes de iniciar um novo trabalho, cria-se uma branch separada com `git checkout -b nome-da-branch`, isolando as mudanças da branch principal (main).

### 2. Editar arquivos
As alterações são feitas no diretório de trabalho: criar, modificar ou remover arquivos do projeto.

### 3. Preparar as mudanças (Staging)
Com `git add <arquivo>` (ou `git add .`), as mudanças são movidas para a área de staging, sinalizando o que entrará no próximo commit.

### 4. Confirmar as mudanças (Commit)
`git commit -m "mensagem"` grava as alterações preparadas no histórico local, criando um checkpoint com uma mensagem descritiva.

### 5. Enviar ao repositório remoto (Push)
`git push origin nome-da-branch` envia os commits locais para o repositório remoto (GitHub, GitLab etc.), tornando-os visíveis para o time.

### 6. Abrir um Pull Request
Solicita-se formalmente que as mudanças da branch sejam revisadas antes de serem incorporadas à branch principal.

### 7. Merge
Após a aprovação — e a resolução de eventuais merge conflicts — as alterações são unidas à branch principal, finalizando o ciclo.

---

## Resumindo

- [x] Estudei o material de estudos do Ciclo 1
- [x] Criei minha branch
- [x] Fiz commits da atividade
- [x] Abri o Pull Request
