# Semana 6 - Do Container à Nuvem (GCP e Firebase)

## 1. Identificação

- Aluno(a): Felipe
- Repositório: https://github.com/Felipej3ds/semana5-dev-to-deploy (branch `semana6`)
- URL de produção: https://felipe-semana6.web.app
- URL do canal (Versão B): https://felipe-semana6--versao-b-vxlglbfn.web.app

## 2. Arquitetura

- Diagrama:

```
Navegador --HTTPS--> Firebase Hosting (site estático, frontend/out)
    |
    +--SDK web--> Cloud Firestore (coleção items, leitura pública, escrita negada)

Docker local (Semana 5): Django + PostgreSQL + Nginx
```

- Fluxo de requisição: o navegador baixa a página estática do Hosting e o JavaScript lê a coleção `items` direto do Firestore. Se não houver dados, a tela mostra "Dados indisponíveis".
- O que continua no Docker local: backend Django, PostgreSQL e Nginx, mais o build de produção em contêiner e a esteira `ci.yml` da Semana 5.

## 3. Etapa 1 - Projeto e CLI

- Plano Spark (evidência): projeto `felipe-semana6` no plano Spark, sem cartão.
- Arquivos de configuração: `firebase.json`, `.firebaserc` e `firestore.rules`.
- Higiene do Git: `firebase-debug.log`, `.firebase/` e JSON de conta de serviço ignorados. Nenhuma chave versionada.
- Commit: `fbe3589`

## 4. Etapa 2 - Deploy mais rápido

- Modo de exportação: `output: process.env.STATIC_EXPORT === 'true' ? 'export' : 'standalone'` no `next.config.ts`.
- Estado de erro amigável: o fetch roda no navegador e, sem dados, a página mostra "Dados indisponíveis".
- Semana 5 continua funcionando: o `ci.yml` da Semana 5 não foi alterado e passou em todos os jobs.
- Commit: `5b8ba15`

## 5. Etapa 3 - Emulator Suite

- Configuração dos emuladores: bloco `emulators` no `firebase.json` (Hosting 5000, Firestore 8080, UI 4000).
- Fonte de dados: `NEXT_PUBLIC_DATA_SOURCE` (`api` ou `firestore`) devolve o mesmo JSON da API da Semana 5. `NEXT_PUBLIC_USE_EMULATOR=true` liga o emulador. Só o `.env.example` é versionado.
- Regras: leitura pública e escrita negada na coleção `items`.

```
match /items/{item} {
  allow read: if true;
  allow write: if false;
}
```

- Commit: `1dfa606`

## 6. Etapa 4 - Firestore de produção e Versão B

- Regras publicadas: as mesmas da Etapa 3, com `firebase deploy --only firestore:rules`.
- Dados de produção: coleção `items` cadastrada pelo console do Firestore.
- Canal da Versão B: `firebase hosting:channel:deploy versao-b --expires 7d`, com título `Status (Versão B): ok`. Produção e canal ficaram no ar ao mesmo tempo.
- Escrita negada: `addDoc` em `items` pelo navegador retornou `permission-denied`.
- Rollback: antes, a produção mostrava `Status (Versão B): ok` com os itens. Depois do rollback para a release mais antiga (`600315`), mostrou "Dados indisponíveis", porque essa release é anterior à ligação com o Firestore. Em seguida, a produção foi republicada.
- Commit: `507b940`

## 7. Etapa 5 - CD com GitHub Actions

- Workflow: `.github/workflows/firebase-hosting.yml`, com lint -> testes -> build (`STATIC_EXPORT=true`) -> deploy, encadeados por `needs`, e `concurrency` para não haver dois deploys ao mesmo tempo. A chave da conta de serviço está no secret `FIREBASE_SERVICE_ACCOUNT_FELIPE_SEMANA6` e não foi para o repositório.
- Preview em PR: o PR #1 gerou o canal de pré-visualização e todos os checks passaram.
- Deploy no merge: o job `deploy-live` publica na produção a cada push na `main`.
- Teste de fumaça: `curl --fail` na URL publicada ao final de cada deploy.
- Reflexão sobre a chave JSON: é aceitável aqui. O secret fica fora do repositório, a conta de serviço tem só o papel de administrador do Hosting e o projeto é Spark, sem faturamento, então o dano de um vazamento é limitado a publicar no site. Mesmo assim é uma credencial de longa duração que vale até ser revogada. A Workload Identity Federation troca o token OIDC do GitHub por credenciais temporárias, restritas ao repositório, sem segredo para vazar. Ela valeria a pena com vários repositórios ou ambientes, produção com dados sensíveis, exigência de conformidade ou política que proíba criar chaves de conta de serviço.
- Commit: `72023a5`

## 8. Desenho de produção gerenciada

| Componente | Serviço equivalente | Configuração |
|---|---|---|
| Backend Django (Gunicorn) | Cloud Run | Porta do contêiner, conta de serviço própria, escala mínima e máxima |
| Imagens no GHCR | Artifact Registry | Promoção da imagem por SHA de commit |
| PostgreSQL | Cloud SQL | Conexão segura, migrações em job separado, backups |
| Arquivo .env | Secret Manager | Papel de acesso somente ao segredo necessário |
| Nginx | Firebase Hosting + rewrite para o Cloud Run | Mesma origem para o navegador, limites de cookies |
| Chaves no GitHub | Workload Identity Federation | Condição de atributo restrita ao repositório |

- Custo mensal estimado: cerca de US$ 12 a 15 por mês para uma carga mínima. O Cloud SQL (db-f1-micro, cerca de US$ 11 por mês mais disco e backups) domina o custo. O Cloud Run com escala a zero cabe no nível gratuito (180.000 vCPU-segundos, 360.000 GiB-segundos e 2 milhões de requisições por mês) e o Artifact Registry dá 0,5 GB grátis e depois US$ 0,10 por GB-mês. Valores de outubro/2026, a confirmar no calculador oficial do Google Cloud.
- Por que o Spark não permite: o Spark não pede cartão, e Cloud Run, Cloud SQL, Artifact Registry e Secret Manager cobram por uso e exigem uma conta de faturamento (plano Blaze).

## 9. Custo zero e limites

- Plano: Spark do começo ao fim. Nenhuma tela pediu cartão.
- Serviços NÃO habilitados: Cloud Run, Artifact Registry, Cloud Build, Secret Manager, Cloud SQL, Cloud Functions, Cloud Storage, App Hosting, Compute Engine e login por telefone.

## 10. Validação final

- Comandos executados: `firebase projects:list`, `firebase emulators:start`, `firebase deploy --only firestore:rules`, `STATIC_EXPORT=true npm run build`, `firebase deploy --only hosting`, `firebase hosting:channel:deploy versao-b --expires 7d`, `firebase init hosting:github`.
- Resultados: produção e canal no ar ao mesmo tempo, dados lidos do Firestore, escrita negada com `permission-denied`, rollback executado e PR com todos os checks verdes.
- Limitações: a lista mostra um item `undefined` e só dois itens, porque um dos três documentos foi cadastrado com o nome do campo diferente de `nome`. O backend Django e o PostgreSQL ficam no Docker local, por restrição do Spark. O canal da Versão B expira em 13/10/2026.

## 11. Histórico Git

| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `fbe3589` | Projeto Firebase Spark e configuração da CLI |
| 2 | `5b8ba15` | Export estático via `STATIC_EXPORT` e fetch no cliente |
| 3 | `1dfa606` | Emulator Suite, fonte de dados por variável e regras |
| 4 | `507b940` | Firestore de produção, Versão B em canal e rollback |
| 5 | `72023a5` | Deploy contínuo com GitHub Actions e Firebase Hosting |