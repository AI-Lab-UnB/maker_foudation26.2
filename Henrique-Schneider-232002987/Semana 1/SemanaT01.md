# Aprendizados da Semana 1 (Ciclo 1): Git, GitHub e Fluxo de Entrega

Este documento consolida os aprendizados práticos da primeira semana (Ciclo 1) do programa **AI Lab Makers**, focando exclusivamente nos fundamentos de controle de versão com Git, colaboração no GitHub e as diretrizes oficiais de entrega do projeto.

---

## 1. O Fluxo Oficial de Entrega do Laboratório

Conforme o guia semanal, todas as entregas do laboratório devem seguir um fluxo de trabalho padronizado no repositório oficial:
* **Repositório oficial:** `github.com/AI-Lab-UnB/maker_foudation26.2` 

### Comandos Práticos Aprendidos

#### Criando minha branch
Antes de realizar qualquer alteração, criar e alternar para uma branch própria a partir da branch `main` . Isso garante o isolamento do trabalho.
```bash
# Baixa as atualizações mais recentes do repositório oficial
git fetch origin

# Cria e entra em uma nova branch local com o seu nome/identificador
git checkout -b nome-aluno
```

#### Registrar o trabalho com commits
À medida que eu for desenvolvendo as tarefas eu devo registrar commits para mostrar o meu progresso.
```bash
# Verifica os arquivos modificados
git status

# Adiciona as alterações para a área de preparação (staging area)
git add caminho/do/arquivo.ext

# Registra as alterações com uma mensagem descritiva
git commit -m "feat: implementa atividade prática do Ciclo 1"
```

#### Enviar a branch para o GitHub
Depois de registrar o trabalho localmente, publiquei a branch no repositório remoto para que ela fique disponível no GitHub.
```bash
# Envia a branch local para o repositório remoto no GitHub (origin)
git push -u origin feature/nome-aluno
```

#### Abrir próprio Pull Request (PR)
Acesse a página do repositório no GitHub para abrir um Pull Request (PR) comparando a branch com a branch principal (`main`). O PR é a ferramenta oficial utilizada para acompanhar e avaliar a entrega.

#### Manter o PR atualizado e sem conflitos
É de responsabilidade exclusiva minha manter o PR atualizado e sem conflitos de mesclagem até a sua integração final. Se outros commits forem integrados na `main` antes do meu PR, vou precisar sincronizar a branch:
```bash
# Atualiza sua main local
git checkout main
git pull origin main

# Volta para sua branch e aplica o rebase ou merge para atualizar o código
git checkout feature/nome-aluno
git rebase main
```

---

## 2. Conceitos Fundamentais de Git

Com base nos capítulos sugeridos do livro *Pro Git* (Capítulos 2 e 3) e no simulador interativo *Learn Git Branching* , os conceitos-chave de controle de versão incluem:

### A. Git Commit
Representa um instantâneo (snapshot) do estado do projeto em um determinado momento no tempo. 
* **O que faz:** Grava permanentemente na árvore de histórico local os arquivos que foram preparados via `git add` .
* **Comando:**
  ```bash
  git commit -m "Sua mensagem descritiva aqui"
  ```

### B. Git Branch
Ramificações são "ponteiros" móveis e leves que apontam para commits específicos. Elas permitem desenvolver novas funcionalidades ou correções em paralelo sem afetar a linha principal do projeto (`main`) [10, 34].
* **Comando para criar:**
  ```bash
  git branch nome-da-branch
  ```

### C. Git Checkout e a movimentação do HEAD
O ponteiro `HEAD` indica em qual commit ou branch você está trabalhando atualmente (a sua "posição atual" na árvore de código).
* **Mover-se para outra branch:**
  ```bash
  git checkout nome-da-branch
  ```
* **"Soltar" o HEAD (Detached HEAD):** Permite apontar o `HEAD` diretamente para um commit específico do histórico em vez de uma branch. Útil para inspecionar versões anteriores.
  ```bash
  git checkout <hash-do-commit>
  ```

### D. Git Merge
Combina o histórico de duas ramificações diferentes. Ele une os trabalhos integrando as alterações de uma branch de volta para a branch de destino.
* **Comando:**
  ```bash
  # Estando na branch de destino (ex: main)
  git merge nome-da-branch-recurso
  ```

### E. Git Rebase
Uma alternativa de integração que pega todos os commits registrados em uma branch e os aplica sequencialmente sobre outra branch base.
* **Benefício:** Deixa o histórico do projeto linear e limpo, facilitando a visualização lógica de commits em ordem temporal sequencial.
* **Comando:**
  ```bash
  # Estando na sua branch de recurso
  git rebase main
  ```
* **Avançado (Cherry-pick):** Permite copiar um ou mais commits específicos de qualquer lugar do repositório para a sua branch atual, organizando a árvore de código de maneira pontual.
  ```bash
  git cherry-pick <hash-do-commit>
  ```

---

## 3. GitHub e Colaboração Prática

As trilhas obrigatórias do *GitHub Skills* introduziram a infraestrutura de colaboração necessária para atuar no repositório compartilhado do projeto:

### A. Comunicação com Markdown
A formatação rápida e leve por meio de arquivos Markdown (`.md`) é amplamente utilizada no GitHub para documentar repositórios, descrever Pull Requests e comentar em revisões de código.

#### Exemplos de sintaxe Markdown práticos:
```markdown
# Título Principal (H1)
## Subtítulo Importante (H2)

Texto em **negrito** para destacar regras de conduta, ou *itálico* para conceitos.

* Lista não ordenada (tópicos)
1. Lista ordenada (passo a passo)

[Texto do Link](https://github.com)

`git status` (código inline)

javascript
// Bloco de código para trechos mais longos
console.log("Olá, AI Lab Makers!");
```

### B. Pull Requests e Revisão de Mudanças
* **Review Pull Requests:** Permite analisar as linhas de código propostas por colegas, adicionar comentários construtivos e aprovar ou solicitar alterações antes da mesclagem .
* **Resolve Merge Conflicts (Resolução de Conflitos):** Conflitos ocorrem quando duas pessoas editam a mesma linha do mesmo arquivo de maneiras diferentes em branches distintas. O Git não sabe decidir qual alteração deve prevalecer, exigindo intervenção manual para escolher qual bloco de código manter (o da branch principal ou o da branch proposta) antes de finalizar a mesclagem.

---

## 4. Regras Importantes do Laboratório

O guia estabelece uma lista de verificação rigorosa antes de você finalizar a sua semana e sair do ambiente de desenvolvimento:
1. - [X] Estudei os materiais teóricos e simuladores da semana (Git e GitHub).
2. - [X] Criei minha própria branch de desenvolvimento local e remota.
3. - [ ] Fiz os commits organizados registrando as atividades realizadas.
4. - [X] Abri o Pull Request (PR) correspondente no repositório oficial.
5. - [X] Verifiquei que meu PR está atualizado, com os testes integrados e sem conflitos de mesclagem.

> **Lembre-se:** A ausência de commits por 2 semanas consecutivas ou o descumprimento da carga horária de 4 horas sem justificativa acarretará advertências de produtividade e faltas, podendo levar ao desligamento do programa.

## 5. Ajustes para a Próxima Tarefa

A tarefa foi executada corretamente, mas algumas instruções não foram aplicadas em sua totalidade. Este espaço serve para registrar esses pontos de atenção, garantindo que eles não se repitam na próxima atividade.

* **Commitar algumas vezes ao longo da semana**
* *Opção:* Realizar commits incrementais com mais frequência ao longo da semana para documentar a evolução do trabalho.


* **Perguntar mais vezes para tutores**
* *Opção:* Buscar auxílio e tirar dúvidas com os tutores de forma mais recorrente durante o desenvolvimento.


* **Terminar com mais antecedência**
* *Opção:* Concluir as demandas com maior antecedência em relação ao prazo final de entrega.


* **Deixar para revisar apenas no dia anterior da entrega**
* *Nota:* Como essa linha tem um sentido de risco (deixar para a última hora), o ideal é invertê-la para o comportamento desejado:
* *Opção:* Evitar deixar a revisão geral apenas para a véspera, antecipando a checagem dos itens.



