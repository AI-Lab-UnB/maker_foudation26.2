# Relatório da Semana 6 - Projeto Firebase e Firestore

## Identificação e Repositório
* **Integrante:** Maria Luisa Oliveira Lima
* **Repositório do Código (Aplicação e Firebase):** [https://github.com/mahluoliveira/desafio-semana6](https://github.com/mahluoliveira/desafio-semana6)

Este documento descreve as etapas cumpridas durante a implementação da Semana 6, englobando a configuração do Firebase Hosting, Emulator Suite, Firestore em produção e regras de segurança.

## Etapas Realizadas

1. **Etapa 1 - Configuração Inicial:**
   - Inicialização do projeto Firebase (Spark Plan) e configuração das ferramentas CLI.
   - Configuração do Git e alinhamento do repositório remoto utilizando as boas práticas de fluxo de trabalho.

2. **Etapa 2 - Firebase Hosting:**
   - Criação e configuração de uma página estática `index.html` na pasta `public`.
   - Execução bem-sucedida do comando `firebase deploy --only hosting` para publicar a aplicação estática na nuvem.

3. **Etapa 3 - Firebase Emulator Suite:**
   - Configuração do ambiente local no `firebase.json` definindo as portas para Hosting (5000), Firestore (8080) e Emulator UI (4000).
   - Instalação dos pré-requisitos necessários (Java JDK 21) e arranque bem-sucedido com `firebase emulators:start`.
   - Criação do ficheiro `.env.example` para controle de variáveis de ambiente.

4. **Etapa 4 - Firestore em Produção e Seed de Dados:**
   - Criação do Cloud Firestore na região `southamerica-west1`.
   - Criação da coleção `items` e configuração das regras de segurança em `firestore.rules` (leitura pública permitida e escrita restrita).
   - Publicação das regras de segurança na nuvem com `firebase deploy --only firestore:rules`.

5. **Etapa 5 - Documentação e Organização da Entrega:**
   - Separação do código-fonte e regras do Firebase no repositório individual da aplicação ([desafio-semana6](https://github.com/mahluoliveira/desafio-semana6)).
   - Manutenção apenas da documentação (`documentacao.md`) no repositório central do Makers (`maker_foudation26.2`), conforme diretrizes dos tutores.