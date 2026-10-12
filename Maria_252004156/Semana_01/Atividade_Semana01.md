# Resumo de Aprendizados - Semana 1
Aluna: Maria Júlia Sena
Matrícula: 252004156

## O que eu estudei na semana 01:

1. Conceitos Básicos 

Diferença entre Git e GitHub
 - Git: é o software/ferramenta de controle de versão, instalado e executado localmente na máquina do desenvolvedor.
 - GitHub: é uma plataforma web (nuvem) que hospeda repositórios Git remotamente, adicionando recursos sociais e de colaboração como o Pull Requests. 

2. Comandos Básicos  

*   **`git clone`:** Baixa uma cópia completa de um repositório remoto para a máquina local.
*   **`git status`:** Mostra o estado atual dos arquivos (modificados, na área de staging ou não rastreados).
*   **`git add .`:** Move as alterações do diretório de trabalho para a Staging Area (preparação).
*   **`git commit -m "mensagem"`:** Grava as alterações de forma definitiva no histórico do repositório local.
*   **`git log`:** Exibe o histórico de commits.

3. Ramificações (Branches)

*   **`git branch`:** Lista as branches locais existentes no repositório.
*   **`git checkout -b`:** Cria uma nova branch e já muda para ela imediatamente.
*   **`git merge`:** Traz as alterações de uma outra branch e as funde na branch atual.
*   **`git rebase -i`:** Permite reorganizar ou alterar os commits de forma interativa, reescrevendo o histórico.
*   **`git cherry-pick`:** Permite "pinçar" commits específicos de qualquer lugar e copiá-los para a branch atual.

4. Desfazendo Alterações

*   **`git reset`:** Move a branch para um commit anterior, reescrevendo o histórico. Deve ser usado apenas em commits locais (que ainda não foram enviados para o GitHub).
*   **`git revert`:** Cria um novo commit que desfaz as alterações de um commit anterior, sem apagar o histórico. É a forma segura de desfazer mudanças que já foram enviadas para outras pessoas.

5. Fluxo de entrega
*   **`git push`:** Envia os commits da minha máquina local para o repositório remoto no GitHub.
*   **`git pull`:** Baixa e mescla as alterações do repositório remoto para o meu computador local

6. GitHub Skills: Colaboração e Markdown
*   Usar o **Markdown** não apenas para formatar texto, mas como uma ferramenta essencial de comunicação prática. Ele é fundamental para estruturar a apresentação visual de arquivos vitais como o `README.md` (a porta de entrada de qualquer projeto) e para escrever descrições claras e organizadas na hora de abrir Pull Requests.
*   Entender o fluxo de colaboração por meio de **Pull Requests (PRs)**, que permitem revisar, discutir e aprovar alterações de código antes de integrá-las à branch principal da equipe.

5. Checklist de Entrega do Laboratório para garantir o fluxo de entrega desta semana, executei os seguintes passos práticos: 
- [x] Estudei os materiais e pratiquei no Learn Git Branching. 
- [x] Criei minha branch Maria-Julia-Sena no repositório local. 
- [x] Registrei meu resumo fazendo os commits da atividade.
- [x] Enviei a branch para o GitHub (git push) e abri meu Pull Request.
