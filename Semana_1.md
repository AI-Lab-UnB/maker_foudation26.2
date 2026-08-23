## Git × GitHub

### Git
O **Git** é um sistema de controle de versão utilizado localmente para acompanhar as alterações de um projeto. Permite registrar alterações, criar versões do código, trabalhar com branches, consultar o histórico e integrar linhas de desenvolvimento.

### GitHub
O **GitHub** é uma plataforma que hospeda repositórios Git e fornece ferramentas para colaboração, como Pull Requests, Issues e revisão de código.

> **Resumo:** Git é a ferramenta local; GitHub é a plataforma na nuvem.

## O Fluxo do Git

O trabalho com Git é dividido em quatro áreas distintas:

- **Working Directory:** Pasta do projeto no computador onde os arquivos são criados, modificados ou removidos.
- **Staging Area:** Área de preparação onde você seleciona quais alterações farão parte do próximo commit (`git add`).
- **Repositório Local:** Banco de dados no computador com o histórico, commits e branches (`git commit`).
- **Repositório Remoto:** Versão do projeto hospedada na nuvem no GitHub (`git push` e `git pull`).

## Principais Comandos Git

- `git init` — Inicializa um novo repositório Git local.
- `git clone <URL>` — Cria uma cópia local de um repositório remoto.
- `git status` — Mostra o estado atual do projeto (arquivos modificados, preparados ou não rastreados).
- `git add .` — Adiciona todas as alterações à Staging Area (`git add <nome>` para um arquivo específico).
- `git commit -m "mensagem"` — Registra o snapshot das alterações no histórico local.
- `git log` — Mostra o histórico de commits.
- `git push` — Envia commits locais para o repositório remoto (`git push -u origin <branch>` no primeiro envio).
- `git pull` — Busca as alterações do repositório remoto e atualiza o local.
- `git fetch` — Busca informações do remoto sem integrar automaticamente ao código local.