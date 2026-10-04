# Semana 6 - Do Container à Nuvem (GCP e Firebase)

## 1. Identificação

- Aluna: Letícia da Silva Pereira
- Repositório: https://github.com/leticiadsp/semana5-dev-ao-deploy
- URL de produção: https://leticia-semana06.web.app
- URL do canal (Versão B): https://leticia-semana06--versao-b-prym66u3.web.app (expira em 11/10/2026)
- Preview do pull request #1: https://leticia-semana06--pr1-teste-preview-itwguv6v.web.app
- Projeto Firebase: leticia-semana06 (plano Spark)

## 2. Arquitetura

```
Navegador --> Firebase Hosting (site estático)
Navegador --> Cloud Firestore (coleção items)

GitHub Actions --> Firebase Hosting (preview no PR, produção no merge)

Docker local (Semana 5): Django + PostgreSQL + Nginx, fora da nuvem
```

Fluxo: o navegador baixa o site estático do Hosting. O JavaScript da página lê a coleção `items` direto do Firestore, e as regras de segurança deixam só a leitura. O `dataSource.ts` devolve os dados no mesmo formato da API da Semana 5 (`{ "status": "ok", "items": [...] }`), então a tela não muda.

O que continua no Docker local: o backend Django, o PostgreSQL e o Nginx. O Spark não tem Cloud Run nem Cloud SQL, então o backend não foi para a nuvem. O frontend em contêiner (modo standalone) e a esteira do GHCR da Semana 5 continuam funcionando.

## 3. Etapa 1 - Projeto e CLI

- Plano Spark: aparece no console ("Plano Spark" ao lado do nome do projeto).
- Saída do `firebase projects:list`:

```
Leticia-semana06 | leticia-semana06 (current) | 712376809962 | [Not specified]
1 project(s) total.
```

- Arquivos versionados: `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`. A pasta pública é `frontend/out`.
- Git: o `.gitignore` ignora `firebase-debug.log`, `firestore-debug.log`, `ui-debug.log`, `.firebase/` e `*service-account*.json`. Conferi o `git status` antes dos commits e nenhuma credencial apareceu.
- Commit: `69cec5b`

## 4. Etapa 2 - Deploy mais rápido

- Modo de exportação: o `next.config.ts` usa `output: process.env.STATIC_EXPORT === "true" ? "export" : "standalone"`. Sem a variável continua standalone (Docker da Semana 5), com ela gera `frontend/out`.
- Erro amigável: o `page.tsx` já fazia o `fetch` no navegador e tem um tratamento de erro que mostra "Nao foi possivel carregar os dados do backend." quando a API não responde, em vez de tela em branco. Não mudei o texto para não quebrar o teste da Semana 5. Não cheguei a ver essa mensagem na tela do site publicado.
- Deploy: `STATIC_EXPORT=true npm run build` e `firebase deploy --only hosting`. O `curl.exe -I https://leticia-semana06.web.app` retornou `HTTP/1.1 200 OK`.
- Semana 5 não quebrou: `npm test` passou (1 passed) e, na esteira, os jobs de build e deploy do frontend e do backend continuaram verdes.
- Tempo (opcional): não fiz o Time Attack.
- Commit: `3632d82`

## 5. Etapa 3 - Emulator Suite

- Emuladores: Hosting (5000), Firestore (8080) e interface (4000), com o projeto de teste `demo-semana06`. Precisei instalar o Java 21 para o emulador do Firestore.
- Fonte de dados: `frontend/lib/dataSource.ts` escolhe a origem por `NEXT_PUBLIC_DATA_SOURCE` (`api` ou `firestore`) e conecta no emulador quando `NEXT_PUBLIC_USE_EMULATOR=true`. Só o `.env.example` foi versionado.
- Regras: leitura liberada e escrita negada em `items` (`allow read: if true; allow write: if false;`).
- Dados semente: cadastrei os 3 itens da Semana 5 (Configurar Docker, Automatizar CI, Publicar no GHCR) e exportei com `--export-on-exit` para a pasta `emulator-data`.
- Evidência: na aba Requests do emulador aparecem duas leituras `LIST` permitidas (verde) e uma `CREATE` negada (vermelho).
- Commit: `9842f1e`

## 6. Etapa 4 - Firestore de produção e Versão B

- Regras publicadas com `firebase deploy --only firestore:rules` (as mesmas da etapa 3).
- Dados de produção: criei a coleção `items` pelo console, com os 3 documentos (campo `name`). Registrei um app web no projeto para pegar a `apiKey` e o `projectId`, que são públicos por design. O site de produção passou a mostrar os dados do Firestore.
- Escrita negada: tentei gravar um documento pelo console do navegador no site de produção e recebi `Bloqueado: permission-denied`.
- Versão B: mudei o título para "Versao B - Status: ok" e publiquei com `firebase hosting:channel:deploy versao-b --expires 7d`. Ficaram duas URLs no ar ao mesmo tempo (produção e canal).
- Rollback: publiquei a Versão B na produção (versão `51e6f0`, 15:33) e voltei pelo histórico do Hosting para a versão anterior (`b73a17`, 15:39). Antes o site mostrava "Versao B - Status: ok", depois voltou para "Status: ok".
- Commit: `f30a672`

## 7. Etapa 5 - CD com GitHub Actions

- Workflow: rodei `firebase init hosting:github` e depois juntei os jobs de deploy no `ci.yml`, reaproveitando o lint e os testes do frontend da Semana 5. A ordem, ligada por `needs`, é `lint-frontend` → `build-frontend` → `test-frontend` → `build-static` (com `STATIC_EXPORT=true`) → `deploy-firebase`. Usei `concurrency` para não rodar dois deploys ao mesmo tempo. Apaguei os dois workflows que a CLI gerou, para não ter deploy duplicado.
- Secrets: `FIREBASE_SERVICE_ACCOUNT_LETICIA_SEMANA06` (criado pela CLI) e `NEXT_PUBLIC_FIREBASE_API_KEY`. Nenhum arquivo de credencial foi parar no repositório.
- Preview em PR: o PR #1 gerou o link de preview, que mostrava "Versao C - Status: ok", enquanto a produção seguia na versão anterior.
- Deploy no merge: o merge do PR #1 (commit `66cc499`) atualizou a produção sozinho.
- Teste de fumaça: `curl --fail` no fim do deploy. Na primeira vez falhou porque o `details_url` vem vazio no deploy da produção, então passei a usar a URL fixa da produção. No PR continua usando o `details_url`.
- Commits: `f8cca29`, `be6ebd4` (correção do teste de fumaça), `b07981e` (Versão C) e `66cc499` (merge)

### Reflexão sobre a chave JSON

Aqui acho aceitável. A chave fica criptografada no GitHub Secrets, não vai para o código, e o pipeline só publica no Hosting, com dados públicos. O problema é que ela é uma credencial de longa duração ou seja, não expira sozinha e, se vazar, dá para usá-la até alguém revogar. Com a Workload Identity Federation não existe chave guardada pois o GitHub apresenta um token temporário e o Google troca por credenciais de curta duração, com condição restrita ao repositório. Ela compensa quando o pipeline mexe em coisas mais sensíveis, quando há vários repositórios ou quando a organização proíbe chaves. Numa migração para o Cloud Run eu trocaria a chave por ela.

## 8. Desenho de produção gerenciada

| Componente | Serviço equivalente | Configuração |
|---|---|---|
| Backend Django (Gunicorn) | Cloud Run | Porta do contêiner, conta de serviço própria, escala mínima e máxima |
| Imagens no GHCR | Artifact Registry | Promoção da imagem por SHA de commit |
| PostgreSQL | Cloud SQL | Conexão segura, migrações em job separado, backups |
| Arquivo .env | Secret Manager | Papel de acesso só ao segredo necessário |
| Nginx | Firebase Hosting + rewrite para o Cloud Run | Mesma origem para o navegador, limites de cookies |
| Chaves no GitHub | Workload Identity Federation | Condição de atributo restrita ao meu repositório |

Custo mensal estimado: entre US$ 10 e US$ 25, aproximado. Quase tudo vem do Cloud SQL (instância pequena em torno de US$ 8 a 13, mais disco e backups). O Cloud Run tem cota gratuita mensal (2 milhões de requisições, 180.000 vCPU-s e 360.000 GiB-s) e fica perto de zero com escala mínima zero, ou uns US$ 10 com uma instância sempre ligada. O Artifact Registry dá 0,5 GB grátis e o Secret Manager 6 versões grátis. Os valores vêm das páginas de preço do Google e de sites de terceiros.

O Spark não permite Cloud Run, Cloud SQL, Artifact Registry e Secret Manager pois são produtos pagos e exigem conta de faturamento (plano Blaze, com cartão). O Spark é o plano sem cartão e sem cobrança possível.

## 9. Custo zero e limites

- Plano: Spark do começo ao fim. Nenhuma tela pediu cartão ou upgrade.
- Cotas usadas: muito baixas, só alguns testes de leitura no Firestore e poucos deploys.
- Não habilitei: Cloud Run, Artifact Registry, Cloud Build, Secret Manager, Cloud SQL, Functions, Storage, App Hosting, login por telefone e máquinas virtuais.

## 10. Validação final

- Comandos: `firebase projects:list`, `npm run build` com `STATIC_EXPORT=true`, `firebase deploy --only hosting`, `curl.exe -I https://leticia-semana06.web.app`, `npm test`, `firebase emulators:start --project demo-semana06 --export-on-exit=./emulator-data`, `firebase deploy --only firestore:rules`, `firebase hosting:channel:deploy versao-b --expires 7d`, `firebase init hosting:github`.
- Resultados: `curl -I` com 200 OK, esteira toda verde, `permission-denied` no emulador e em produção, rollback feito, PR com preview e merge atualizando a produção.
- Limitações: o backend e o banco da Semana 5 continuam só no Docker local; a chave da conta de serviço é de longa duração; a produção hoje mostra "Versao C" porque o PR de teste foi mesclado; o canal da Versão B expira em 11/10/2026; não fiz o Time Attack.

## 11. Histórico Git

| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `69cec5b` | Projeto Firebase, Hosting e Firestore, arquivos de configuração |
| 2 | `3632d82` | Export estático por variável e deploy no Hosting |
| 3 | `9842f1e` | Emulator Suite, fonte de dados por variável e dados semente |
| 4 | `f30a672` | Firestore de produção, Versão B em canal e rollback |
| 5 | `f8cca29`, `be6ebd4`, `b07981e`, `66cc499` | Deploy contínuo no ci.yml, correção do teste de fumaça, PR #1 e merge |
