# Entrega da Semana 01: Fundamentos de Git e GitHub

**Nome:** Gabriel Di Angellis Basílio Ferreira
**Matrícula:** 242004671

## 1. O que é o GitHub e o Git?
O **Git** é um sistema de controle de versão que organiza e rastreia o histórico de projetos. O **GitHub** é a plataforma em nuvem que hospeda esses repositórios, facilitando o trabalho em equipe, o backup e a colaboração.

O ambiente de versionamento opera em quatro estágios principais:
* **Working Directory:** A pasta local onde os arquivos são criados e editados no computador.
* **Staging Area:** A área de preparação, onde selecionamos especificamente quais modificações farão parte da próxima versão.
* **Repositório Local:** O histórico de versões consolidado e salvo na própria máquina (offline).
* **Repositório Remoto:** O histórico salvo na nuvem (GitHub), disponível para acesso e contribuição de terceiros.

## 2. O Fluxo de Trabalho (Workflow)
A transição dos códigos entre esses ambientes segue um ciclo lógico:
1. **Preparação (`git add`):** Move os arquivos modificados do *Working Directory* para o *Staging*.
2. **Consolidação (`git commit`):** Salva os arquivos do *Staging* para o *Repositório Local*, criando um "checkpoint" na linha do tempo.
3. **Envio (`git push`):** Sincroniza o *Repositório Local* com o *Repositório Remoto*, enviando as novidades para a nuvem.
4. **Atualização (`git pull`):** Traz as mudanças mais recentes do *Repositório Remoto* e as mescla no *Local*.

## 3. Comandos e Conceitos Essenciais
Durante a prática da semana, consolidei o uso de comandos fundamentais de navegação e organização:
* **Navegação:** `git status` (verifica o estado dos arquivos) e `git log` (visualiza o histórico de commits).
* **Ramificação (Branches):** Uma *branch* é uma linha do tempo paralela, útil para desenvolver funcionalidades sem afetar o código principal (main). O comando `git checkout -b` cria e acessa essa nova ramificação.
* **Unificação:** Para unir o trabalho de diferentes branches, utiliza-se o `git merge` (preserva o histórico bifurcado) ou `git rebase` (reescreve o histórico de forma linear).
* **Pull Request (PR):** É o pedido formal no GitHub para integrar o código de uma branch secundária à branch principal.

## 4. Checklist de Conclusão
- [x] Estudei os materiais da semana
- [x] Criei minha branch
- [x] Fiz commits da atividade
- [x] Abri meu PR
- [x] Meu PR está atualizado e sem conflitos
