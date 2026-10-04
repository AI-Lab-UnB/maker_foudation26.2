# Semana 6 - Do Container a Nuvem (GCP e Firebase)

## 1. Identificacao

- Aluno(a): Ana Clara Teixeira Guimarães
- Repositorio: https://github.com/anacllaraxy/semana5
- URL de producao: https://semana5-clara.web.app
- URL do canal (Versao B): https://semana5-clara--versao-b-mbdagrpc.web.app (expira em 2026-10-11)

## 2. Arquitetura

- Diagrama:

```
Navegador --> Firebase Hosting (site estatico, HTTPS, CDN)
Navegador --> Cloud Firestore (leitura da colecao items, regras de seguranca)

GitHub (push / pull request) --> GitHub Actions --> Firebase Hosting
```

- Fluxo de requisicao: o navegador baixa o site estatico do Firebase Hosting. O JavaScript da pagina roda no navegador e le a colecao `items` direto do Cloud Firestore. As regras permitem apenas leitura.
- O que continua no Docker local: Django, PostgreSQL e Nginx da Semana 5, o build de producao em contêiner (`standalone`) e a publicacao das imagens no GHCR pelo CI da Semana 5. Na nuvem ficam apenas o frontend (Hosting) e os dados (Firestore).

## 3. Etapa 1 - Projeto e CLI

- Plano Spark (evidencia): o projeto `semana5-clara` aparece no console com o selo "Plano Spark" e "Sem custos". `firebase projects:list` lista 1 projeto. Nenhuma tela pediu cartao, faturamento ou Blaze.
- Arquivos de configuracao: `firebase.json` (Hosting com pasta publica `frontend/out` e Firestore), `.firebaserc` (projeto `semana5-clara`), `firestore.rules` e `firestore.indexes.json`.
- Higiene do Git: o `.gitignore` ignora `firebase-debug.log`, `firestore-debug.log`, `ui-debug.log`, `.firebase/`, `*-firebase-adminsdk-*.json` e `service-account*.json`. Nenhuma chave foi versionada. A verificacao `grep -rl "private_key"` nos arquivos do repositorio retornou vazio.
- Commit: `a642364`

## 4. Etapa 2 - Deploy mais rapido

- Modo de exportacao: o `next.config.mjs` escolhe a saida por variavel de ambiente. Com `STATIC_EXPORT=true` usa `output: 'export'`; sem a variavel mantem `output: 'standalone'` e o `rewrites` para o backend (so existe no modo standalone).

```
STATIC_EXPORT=true npm run build
firebase deploy --only hosting
```

- Estado de erro amigavel: se o `fetch` falhar, a pagina mostra "Dados indisponiveis no momento" em vez de tela em branco. Na Etapa 2 ainda nao havia backend na nuvem, entao essa mensagem foi o resultado esperado.
- Semana 5 continua funcionando: sem `STATIC_EXPORT` o build continua `standalone`, e o `Dockerfile.prod` do frontend nao foi alterado. O lint, o teste (`npm test`) e o CI da Semana 5 continuam verdes.
- Tempo (opcional): nao realizado.
- Resultado: `curl -I https://semana5-clara.web.app` retornou `HTTP/2 200`.
- Commit: `dd24b7f`

## 5. Etapa 3 - Emulator Suite

- Configuracao dos emuladores: bloco `emulators` no `firebase.json` com Hosting na porta 5000, Firestore na 8080 e interface na 4000. Comando que sobe tudo com os dados semente:

```
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```

- Fonte de dados: duas variaveis controlam a origem dos dados. `NEXT_PUBLIC_DATA_SOURCE` (`api` ou `firestore`) escolhe entre o Django e o Firestore, ambos devolvendo `{ "status": "ok", "items": [...] }`, entao a tela nao muda. `NEXT_PUBLIC_USE_EMULATOR=true` aponta para o emulador com `connectFirestoreEmulator`. Apenas o `frontend/.env.example` e versionado. Os 3 itens da Semana 5 foram cadastrados como documentos (`titulo` e `ordem`) e exportados para a pasta `emulator-data`.
- Regras:

```
match /items/{item} {
  allow read: if true;
  allow write: if false;
}
```

- Leitura permitida / escrita negada:
  - Leitura sem login retornou os 3 documentos:
    `curl -s "http://127.0.0.1:8080/v1/projects/semana5-clara/databases/(default)/documents/items"`
  - Escrita sem login retornou `HTTP/1.1 403 Forbidden` com `PERMISSION_DENIED` e a mensagem `false for 'create' @ L6` (linha do `allow write: if false`).
  - Na aba Requests do emulador, a requisicao `CREATE` aparece negada e a `LIST` permitida.
- Commit: `f945921`

## 6. Etapa 4 - Firestore de producao e Versao B

- Regras publicadas: `firebase deploy --only firestore:rules` (arquivo compilado e liberado no Cloud Firestore). O banco foi criado no plano Spark, edicao Standard, localizacao nam5, modo de producao.
- Dados de producao: colecao `items` com 3 documentos, cada um com `titulo` (string) e `ordem` (int64): Configurar Docker (1), Automatizar CI (2) e Publicar no GHCR (3). O site de producao foi gerado com `NEXT_PUBLIC_DATA_SOURCE=firestore` e `NEXT_PUBLIC_USE_EMULATOR=false` e passou a exibir os dados do Firestore.
- Canal da Versao B: o titulo da pagina ganhou a cor azul e o texto "(Versao B)". Publicada em um canal de pre-visualizacao, com producao e canal no ar ao mesmo tempo:

```
firebase hosting:channel:deploy versao-b --expires 7d
```

  URL do canal: https://semana5-clara--versao-b-mbdagrpc.web.app
- Rollback: a Versao B foi publicada na producao (titulo azul) e, no historico de lancamentos do Hosting, foi revertida para a versao anterior (titulo branco). Antes: titulo azul com "(Versao B)". Depois: titulo branco, sem "(Versao B)".
- Escrita negada pelo navegador/internet: o comando abaixo retornou `HTTP/2 403` com `"status": "PERMISSION_DENIED"` e `Missing or insufficient permissions`. A colecao continuou com 3 documentos.

```
curl -i -X POST "https://firestore.googleapis.com/v1/projects/semana5-clara/databases/(default)/documents/items" \
  -H "Content-Type: application/json" \
  -d '{"fields":{"titulo":{"stringValue":"invasor"},"ordem":{"integerValue":"9"}}}'
```

- Commit: `dac9491`

## 7. Etapa 5 - CD com GitHub Actions

- Workflow: `firebase init hosting:github` criou os dois workflows e guardou a chave da conta de servico como secret `FIREBASE_SERVICE_ACCOUNT_SEMANA5_CLARA` no GitHub. Os workflows foram ajustados em `.github/workflows/firebase-hosting-pull-request.yml` e `.github/workflows/firebase-hosting-merge.yml`, com a sequencia ligada por `needs`:

```
lint-test (npm run lint e npm test) -> build (STATIC_EXPORT=true) -> deploy -> smoke-test
```

  O `concurrency` evita dois deploys ao mesmo tempo (grupo `firebase-hosting-live` na producao e um grupo por pull request nas pre-visualizacoes). O build usa apenas configuracao publica do Firebase (`NEXT_PUBLIC_*`). O artefato `frontend/out` passa do job de build para o de deploy.
- Preview em PR: o pull request #1 gerou o workflow "Deploy to Firebase Hosting on PR" (verde, 1m46s) e o CI da Semana 5 (verde, 1m33s). URL de pre-visualizacao do PR #1: [colar aqui a URL do comentario do bot no PR #1]
- Deploy no merge: o merge na `main` dispara o workflow "Deploy to Firebase Hosting on merge", que atualiza a producao com `channelId: live`. Resultado do merge do PR #1: [preencher apos o merge: workflow verde e hash do commit de merge]
- Teste de fumaca: ultimo job de cada workflow. Faz `curl --fail` com repeticoes na URL publicada (producao ou pre-visualizacao) e confere que a pagina contem "Semana 5". Se a URL nao responder com sucesso, o workflow falha.
- Reflexao sobre a chave JSON: neste projeto a chave no secret e aceitavel. Ela fica criptografada no GitHub Secrets, nao esta no repositorio (verificado), a conta de servico so tem permissoes de deploy no Firebase e o projeto esta no plano Spark, sem faturamento. Os riscos sao que a chave e de longa duracao, vale ate ser revogada e precisa de rotacao manual. Se vazar, permite publicar no Hosting. A autenticacao sem chave (Workload Identity Federation) troca o token do GitHub por credenciais de curta duracao e permite restringir o acesso ao repositorio (`anacllaraxy/semana5`), sem guardar nenhuma chave. Ela valeria a pena em producao com usuarios reais ou faturamento, em equipes com varias pessoas com acesso ao repositorio, em organizacoes que proibem criar chaves de conta de servico ou quando houver exigencia de auditoria e rotacao. Exige configurar IAM e um provedor de identidade no Google Cloud, o que nao foi feito aqui.
- Commit: `9eb9e32` (branch `semana6-etapa-5`, merge via pull request #1)

## 8. Desenho de producao gerenciada

| Componente | Servico equivalente | Configuracao |
|---|---|---|
| Backend Django (Gunicorn) | Cloud Run | Porta do contêiner (8000), conta de servico propria, escala minima e maxima |
| Imagens no GHCR | Artifact Registry | Promocao da imagem por SHA de commit |
| PostgreSQL | Cloud SQL | Conexao segura, migracoes em job separado, backups |
| Arquivo .env | Secret Manager | Papel de acesso somente ao segredo necessario |
| Nginx | Firebase Hosting + rewrite para o Cloud Run | Mesma origem para o navegador, limites de cookies |
| Chaves no GitHub | Workload Identity Federation | Condicao de atributo restrita ao repositorio |

- Custo mensal estimado (paginas oficiais de preco, uso baixo, valores em dolar):
  - Cloud Run: 2 milhoes de requisicoes, 180.000 vCPU-segundos e 360.000 GiB-segundos gratis por mes (cobranca por requisicao, regioes de nivel 1). Com escala minima 0 e pouco trafego, cerca de US$ 0.
  - Cloud SQL (PostgreSQL, db-f1-micro): cerca de US$ 0,015 a 0,018 por hora ligado, ou seja, cerca de US$ 11 a 13 por mes, mais armazenamento SSD de 10 GB a US$ 0,17 por GB (cerca de US$ 1,70) e backups cobrados a parte. Os valores por hora vieram de fontes que replicam a tabela oficial e devem ser conferidos na calculadora de precos do Google Cloud.
  - Artifact Registry: 0,5 GB gratis, depois US$ 0,10 por GB por mes. As duas imagens somam cerca de 0,1 GB compactadas, entao cerca de US$ 0.
  - Secret Manager: 6 versoes ativas e 10.000 acessos gratis por mes; depois US$ 0,06 por versao ativa. Com poucos segredos, cerca de US$ 0.
  - Firebase Hosting: dentro da cota de 10 GB de armazenamento e 360 MB de transferencia por dia, cerca de US$ 0.
  - Total estimado: cerca de US$ 12 a 15 por mes, quase todo do Cloud SQL.
- Por que o Spark nao permite: Cloud Run, Artifact Registry, Secret Manager e Cloud SQL sao produtos pagos do Google Cloud que exigem uma conta de faturamento vinculada ao projeto, ou seja, o plano Blaze com cartao. O Spark nao tem faturamento. Alem disso, o Cloud SQL cobra por hora enquanto a instancia esta ligada, e nao escala a zero como o Cloud Run.

## 9. Custo zero e limites

- Plano: Spark do inicio ao fim, sem cartao e sem faturamento. Nenhuma tela pediu upgrade ou Blaze.
- Cotas usadas (limites do Spark consultados na pagina oficial de precos): Firestore com 1 GiB armazenado, 50 mil leituras por dia e 10 GiB de saida por mes. Hosting com 10 GB de armazenamento e 360 MB de transferencia por dia. O uso foi minimo: 3 documentos, leituras de teste e alguns deploys. Nenhuma cota foi esgotada.
- Servicos NAO habilitados: Cloud Run, Artifact Registry, Cloud Build, Secret Manager, Cloud SQL, Cloud Functions, Cloud Storage, App Hosting, SQL Connect, Authentication e login por telefone. A conta de servico criada pela CLI para o deploy nao tem custo.

## 10. Validacao final

- Comandos executados:
  - `firebase projects:list`, `firebase init`, `firebase deploy --only hosting`
  - `STATIC_EXPORT=true npm run build`
  - `firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data`
  - `curl` de leitura e escrita no emulador e no Firestore de producao
  - `firebase deploy --only firestore:rules`
  - `firebase hosting:channel:deploy versao-b --expires 7d`
  - `firebase init hosting:github` e `git push` abrindo o pull request #1
  - `curl -I https://semana5-clara.web.app`
- Resultados: o site esta no ar no Hosting com HTTPS (`HTTP/2 200`), exibe os dados do Firestore, a escrita e negada no emulador e em producao (`403 PERMISSION_DENIED`), producao e Versao B ficaram no ar ao mesmo tempo, o rollback foi demonstrado, e o pull request gerou pre-visualizacao e workflow verde. O CI da Semana 5 continuou verde.
- Limitacoes:
  - A pagina publicada le os dados do Firestore, e nao do Django, que continua apenas no Docker local.
  - A leitura do Firestore e publica por design. Se alguem passar da cota diaria, a leitura para ate o proximo ciclo.
  - O canal da Versao B expira em 2026-10-11.
  - A chave JSON no GitHub Secrets e de longa duracao (ver reflexao na secao 7).
  - Os avisos de Firebase Auth ao criar o canal foram ignorados, pois o projeto nao usa Authentication.
  - O hash do commit `dd24b7f` da Etapa 2 e a URL de pre-visualizacao do PR devem ser conferidos antes da entrega.

## 11. Historico Git

| Etapa | Commit | Descricao |
|---|---|---|
| 1 | `a642364` | Projeto Firebase (Spark), firebase init e higiene do Git |
| 2 | `dd24b7f` | Export estatico condicional e deploy no Firebase Hosting |
| 3 | `f945921` | Emulator Suite, fonte de dados por variavel e regras da colecao items |
| 4 | `dac9491` | Firestore de producao, Versao B em canal de pre-visualizacao e rollback |
| 5 | `9eb9e32` | Deploy continuo com GitHub Actions (preview em PR, deploy no merge e teste de fumaca) |
