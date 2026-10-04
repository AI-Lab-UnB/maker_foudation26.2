# Relatório da Semana 6 - Projeto Firebase e Firestore

Este documento descreve as etapas cumpridas durante a implementação da Semana 6, englobando a configuração do Firebase Hosting, Emulator Suite, Firestore em produção e regras de segurança.

## Etapas Realizadas

1. **Etapa 1 - Configuração Inicial:**
   - Inicialização do projeto Firebase (Spark Plan) na pasta da semana 6.
   - Configuração do Git e alinhamento do repositório remoto utilizando as boas práticas de fluxo de trabalho.

2. **Etapa 2 - Firebase Hosting:**
   - Criação e configuração de uma página estática `index.html` na pasta `public`.
   - Execução bem-sucedida do comando `firebase deploy --only hosting` para publicar a aplicação estática na nuvem.

3. **Etapa 3 - Firebase Emulator Suite:**
   - Configuração do ambiente local no `firebase.json` definindo as portas para Hosting (5000), Firestore (8080) e Emulator UI (4000).
   - Instalação dos pré-requisitos necessários (Java JDK 21) e arranque bem-sucedido com `firebase emulators:start`.
   - Criação do ficheiro `.env.example` para controlo de variáveis de ambiente.

4. **Etapa 4 - Firestore em Produção e Seed de Dados:**
   - Criação do Cloud Firestore na região `southamerica-west1`.
   - Criação da coleção `items` e configuração das regras de segurança em `firestore.rules` (leitura pública permitida e escrita restrita).
   - Publicação das regras de segurança na nuvem com `firebase deploy --only firestore:rules`.

5. **Etapa 5 - Documentação e Entrega:**
   - Organização de todos os ficheiros dentro da estrutura exigida (`Maria_252015113/semana6`).
   - Registo de commits atômicos por cada etapa concluída e envio final (`push`) para o repositório do laboratório.