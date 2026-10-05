# Semana 6 - Do Container a Nuvem (GCP e Firebase)

> Continuação da Semana 5 no **mesmo repositório**: o frontend Next.js vai para o
> **Firebase Hosting** e os dados para o **Cloud Firestore**, com deploy contínuo pelo
> GitHub Actions — tudo no **plano Spark** (sem cartão, custo zero). A stack da Semana 5
> (Django + PostgreSQL + Nginx em contêineres) continua funcionando no Docker local.

| Recurso | Link |
|---|---|
| Repositório | https://github.com/GGDornelas/semana5-giovanni |
| URL de produção | https://semana6-giovanni.web.app |
| URL do canal da Versão B | https://semana6-giovanni--versao-b-4isbrgat.web.app (expira em 12/10/2026) |
| Preview do PR #1 | https://semana6-giovanni--pr1-etapa5-cd-firebase-a088fnu9.web.app (expira em 12/10/2026) |
| Pull request da Etapa 5 | https://github.com/GGDornelas/semana5-giovanni/pull/1 |
| Workflows | [`.github/workflows/`](https://github.com/GGDornelas/semana5-giovanni/tree/main/.github/workflows) |
| Execuções do Actions | https://github.com/GGDornelas/semana5-giovanni/actions |
| Evidências (capturas) | [`docs/evidencias/`](https://github.com/GGDornelas/semana5-giovanni/tree/main/docs/evidencias) |

---

## 1. Identificacao

- **Aluno:** Giovanni Dornelas Ferreira (individual)
- **Repositorio:** https://github.com/GGDornelas/semana5-giovanni
- **URL de producao:** https://semana6-giovanni.web.app
- **URL do canal (Versao B):** https://semana6-giovanni--versao-b-4isbrgat.web.app
- **Projeto Firebase:** `semana6-giovanni` (número 884961189431), plano **Spark**
- **App web registrado:** `semana6-web`

Arquivos adicionados/alterados na Semana 6:

```
semana5-giovanni/
├── firebase.json                 # hosting (frontend/out), firestore, emulators
├── .firebaserc                   # projeto padrão: semana6-giovanni
├── firestore.rules               # items: leitura pública, escrita negada
├── firestore.indexes.json
├── firebase-seed/                # dados semente exportados do emulador
├── scripts/seed-emulator.sh      # cadastra os 3 itens no emulador
├── frontend/
│   ├── next.config.mjs           # output export | standalone via STATIC_EXPORT
│   ├── .env.example              # único arquivo de variáveis versionado
│   ├── app/page.js               # fetch no cliente, erro amigável, Versão B
│   └── lib/
│       ├── data-source.js        # NEXT_PUBLIC_DATA_SOURCE = api | firestore
│       ├── firestore.js          # SDK web + connectFirestoreEmulator
│       └── items.js              # converte documentos no formato da API da Semana 5
├── docs/evidencias/              # capturas de tela
└── .github/workflows/
    ├── ci.yml                                 # CI/CD da Semana 5 (inalterado)
    ├── firebase-hosting-pull-request.yml      # preview em PR
    └── firebase-hosting-merge.yml             # produção no merge
```

## 2. Arquitetura

- **Diagrama:**

```
                         ┌──────────────── Firebase (plano Spark) ────────────────┐
Navegador ──HTTPS──────► │ Firebase Hosting (CDN, TLS, *.web.app)                  │
   │                     │   canais: live · versao-b · pr1-etapa5-cd-firebase      │
   │  HTML/JS estático ◄─│   (arquivos de frontend/out — next export)              │
   │                     │                                                         │
   └──SDK web (HTTPS)──► │ Cloud Firestore  — coleção items (item-1..3)            │
       leitura OK        │   regras: allow read: if true; allow write: if false;   │
       escrita 403       └─────────────────────────────────────────────────────────┘

GitHub ──PR──► Actions: quality → build (STATIC_EXPORT) → deploy preview → smoke
       ──merge main──► Actions: quality → build (STATIC_EXPORT) → deploy live → smoke
```

- **Fluxo de requisicao:** o navegador baixa a página estática do Hosting. O componente
  cliente (`app/page.js`) chama `loadData(DATA_SOURCE)`. Com `NEXT_PUBLIC_DATA_SOURCE=firestore`,
  o SDK web lê a coleção `items` direto do Firestore, e `toHealthPayload()` devolve o
  **mesmo JSON da API da Semana 5** (`{ "status": "ok", "database": "firestore", "items": [...] }`),
  então a tela não muda. Não há servidor no caminho: o Hosting só serve arquivos.
- **O que continua no Docker local:** a stack inteira da Semana 5 — Django (Gunicorn),
  PostgreSQL, Next.js standalone e Nginx com TLS (`docker-compose-prod.yml`). Com
  `NEXT_PUBLIC_DATA_SOURCE=api` (padrão do `.env.example`), o frontend volta a consumir
  `/api/health/` do Django. O `ci.yml` da Semana 5 segue publicando as imagens no GHCR.

| Semana 5 (local) | Semana 6 (nuvem, custo zero) |
|---|---|
| Nginx (proxy + TLS) | Firebase Hosting (CDN + HTTPS gerenciados) |
| Django + PostgreSQL | Cloud Firestore (Django continua no Docker local) |
| Testes só no computador | Firebase Emulator Suite |
| Workflow publica no GHCR | Workflow publica no Firebase Hosting (e o GHCR continua) |
| `.env` local | Config pública do Firebase em GitHub **Variables** + chave de deploy em **Secrets** |

## 3. Etapa 1 - Projeto e CLI

- **Plano Spark (evidencia):** o console mostra o projeto no plano Spark, sem conta de
  faturamento vinculada.

  ![Plano Spark](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa1-plano-spark.png)

- **CLI:** `firebase-tools` 15.32.1 instalado com `npm install -g --prefix ~/.local firebase-tools`,
  login com `firebase login` e `firebase init` (Hosting + Firestore) na raiz do repositório.

```
$ firebase projects:list
┌──────────────────────┬────────────────────────────┬────────────────┬──────────────────────┐
│ Project Display Name │ Project ID                 │ Project Number │ Resource Location ID │
├──────────────────────┼────────────────────────────┼────────────────┼──────────────────────┤
│ semana6-giovanni     │ semana6-giovanni (current) │ 884961189431   │ [Not specified]      │
└──────────────────────┴────────────────────────────┴────────────────┴──────────────────────┘
```

- **Arquivos de configuracao:** `firebase.json` (pasta pública `frontend/out`, `cleanUrls`),
  `.firebaserc` (projeto padrão) e `firestore.rules`, todos versionados.
- **Higiene do Git:** o `.gitignore` passou a ignorar `firebase-debug.log`,
  `firebase-debug.*.log`, `firestore-debug.log`, `ui-debug.log`, `.firebase/`,
  `*service-account*.json`, `*-firebase-adminsdk-*.json`, `credentials*.json` e `frontend/out/`.
  Verificação: `git log --all -p | grep -c private_key` → **0**.
- **Commit:** [`b33bb92`](https://github.com/GGDornelas/semana5-giovanni/commit/b33bb92) —
  CI da Semana 5 verde ([run 37326604680](https://github.com/GGDornelas/semana5-giovanni/actions/runs/37326604680)).

## 4. Etapa 2 - Deploy mais rapido

- **Modo de exportacao:** `next.config.mjs` escolhe a saída por variável, sem afetar a Semana 5:

```js
const isStaticExport = process.env.STATIC_EXPORT === "true";
const nextConfig = {
  output: isStaticExport ? "export" : "standalone",
  images: { unoptimized: true },
  skipTrailingSlashRedirect: true,
};
// rewrites /api/* -> Django só existem no modo standalone (não há servidor no export)
if (!isStaticExport) { nextConfig.rewrites = async () => [ /* ... */ ]; }
```

  Script `npm run build:static` (= `STATIC_EXPORT=true next build`) gera `frontend/out/`,
  publicado com `firebase deploy --only hosting`.

- **Estado de erro amigavel:** o fetch acontece no navegador. Sem backend na nuvem, a página
  mostra **"Dados indisponíveis no momento."** com uma linha de detalhe técnico, em vez de
  tela em branco.

  ![Erro amigável](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa2-erro-amigavel.png)

- **Checkpoint:** `curl -I https://semana6-giovanni.web.app` → `HTTP/2 200`.
- **Semana 5 continua funcionando:** no mesmo commit, o `ci.yml` executou `next build`
  (standalone), `docker build` do `Dockerfile.prod` do frontend (< 150 MB, usuário `nextjs`) e
  do backend, todos verdes ([run 37327107064](https://github.com/GGDornelas/semana5-giovanni/actions/runs/37327107064)).
- **Tempo (opcional):** Time Attack não cronometrado.
- **Commit:** [`a6b6640`](https://github.com/GGDornelas/semana5-giovanni/commit/a6b6640)

## 5. Etapa 3 - Emulator Suite

- **Configuracao dos emuladores:** bloco `emulators` no `firebase.json` — Hosting `:5000`,
  Firestore `:8080`, UI `:4000`, `singleProjectMode`. O emulador do Firestore exige Java;
  foi usado o JDK 21 (Temurin).
- **Fonte de dados:** `frontend/lib/data-source.js` lê `NEXT_PUBLIC_DATA_SOURCE`
  (`api` | `firestore`). Com `NEXT_PUBLIC_USE_EMULATOR=true`, `lib/firestore.js` chama
  `connectFirestoreEmulator` (host em `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST`, padrão
  `127.0.0.1:8080`). Só o `frontend/.env.example` é versionado; `.env.local` e
  `.env.production.local` ficam ignorados. Script `npm run build:emulator` gera o build
  apontando para o emulador. Testes: 9 testes Vitest em 3 arquivos (incluindo o formato do
  payload e a troca de fonte com mocks).
- **Dados semente:** `scripts/seed-emulator.sh` cadastra `item-1..3` (campos `nome` e `ordem`);
  exportados com

```bash
firebase emulators:exec --only firestore --export-on-exit=./firebase-seed "sh scripts/seed-emulator.sh"
firebase emulators:start --import=./firebase-seed
```

- **Regras** (as mesmas da Missão Farol, nível 3, aplicadas à coleção `items`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{item} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

- **Leitura permitida / escrita negada:** a página em `localhost:5000` lista os 3 itens vindos
  do emulador; a aba *Requests* da UI (`localhost:4000`) mostra o `LIST` permitido e o
  `CREATE` negado (botão "Testar escrita no Firestore").

  ![Página no emulador](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa3-pagina-emulador.png)
  ![Requests do emulador](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa3-emulator-requests.png)
  ![Visão geral do emulador](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa3-emulator-overview.png)

- **Commit:** [`1324821`](https://github.com/GGDornelas/semana5-giovanni/commit/1324821) —
  CI verde ([run 37328244598](https://github.com/GGDornelas/semana5-giovanni/actions/runs/37328244598)).

## 6. Etapa 4 - Firestore de producao e Versao B

- **Regras publicadas:** Firestore ativado em **modo de produção** (Spark) e regras publicadas
  com `firebase deploy --only firestore:rules`.
- **Dados de producao:** os 3 itens cadastrados pelo console (`item-1..3`). O build de produção
  usa a config do projeto (`.env.production.local`, ignorado no Git) e a URL de produção passou
  a exibir os dados do Firestore.

  ![Produção lendo o Firestore](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa4-producao-firestore.png)

- **Canal da Versao B:** `NEXT_PUBLIC_VARIANT=b` (script `npm run build:versao-b`) troca o título
  para "Versão B · Do Container à Nuvem", o subtítulo, a cor (laranja `#ff9100`) e inverte a
  ordem dos itens. Publicado com:

```bash
firebase hosting:channel:deploy versao-b --expires 7d
```

  ![Versão B](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa4-versao-b.png)

  Produção e canal ficaram no ar ao mesmo tempo (`curl -I` → `HTTP/2 200` nas duas URLs).

- **Escrita negada:** na URL de produção, o botão "Testar escrita no Firestore" tenta um
  `addDoc` e recebe **`Bloqueado: permission-denied`**. Pela API REST, sem autenticação:
  `POST .../documents/items` → **403**.

  ![Escrita negada no navegador](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa4-escrita-negada-navegador.png)

- **Rollback:** histórico de versões do Hosting (Hosting → Painel → Versões anteriores → ⋮ → Reverter).

| Momento | Versão | O que a produção mostrava |
|---|---|---|
| 11:41 | `2290ca` | Etapa 2: "Dados indisponíveis no momento." |
| 12:25 | `93b2f5` | Etapa 4: itens vindos do Firestore (**antes**) |
| 14:06 | `2290ca` (reversão) | volta ao estado da Etapa 2 (**depois**) |
| 14:12 | `93b2f5` (reversão) | produção restaurada com o Firestore |

  ![Histórico com rollback](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa4-historico-rollback.png)
  ![Depois do rollback](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa4-rollback-depois.png)
  ![Produção restaurada](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa4-rollforward.png)

- **Commits:** [`b3f6407`](https://github.com/GGDornelas/semana5-giovanni/commit/b3f6407)
  (código, CI verde — [run 37345026570](https://github.com/GGDornelas/semana5-giovanni/actions/runs/37345026570))
  e [`8d95d52`](https://github.com/GGDornelas/semana5-giovanni/commit/8d95d52) (evidências).

## 7. Etapa 5 - CD com GitHub Actions

- **Setup:** `firebase init hosting:github` criou a conta de serviço
  `github-action-1391599155` (papel de admin do Hosting) e gravou a chave **direto** no secret
  `FIREBASE_SERVICE_ACCOUNT_SEMANA6_GIOVANNI` do GitHub — nenhum arquivo JSON foi gravado no disco.
  Na primeira tentativa a CLI falhou com `404 ... service account does not exist`
  (propagação do IAM); a segunda execução concluiu normalmente. Conferência:
  `git log --all -p | grep -c private_key` → 0 e `git grep private_key` → nada.
- **Config pública:** apiKey, authDomain, projectId e appId ficam em **GitHub Variables**
  (`vars.NEXT_PUBLIC_FIREBASE_*`) — são públicos por design; quem protege os dados são as regras.
- **Workflow:** os dois arquivos gerados foram adaptados para a mesma cadeia de jobs com `needs`:

```
quality (npm ci, ESLint, Vitest)
   └─needs─► build (npm run build:static → artifact frontend/out)
                └─needs─► deploy (FirebaseExtended/action-hosting-deploy)
                             └─needs─► smoke (curl --fail na URL publicada)
```

| | `firebase-hosting-pull-request.yml` | `firebase-hosting-merge.yml` |
|---|---|---|
| Gatilho | `pull_request` (só PRs do próprio repo) | `push` na `main` |
| Canal | preview `pr<N>-<branch>`, `expires: 7d` | `live` |
| `concurrency` | `firebase-preview-<PR>`, `cancel-in-progress: true` | `firebase-live`, `cancel-in-progress: false` (deploy de produção nunca é interrompido; o próximo espera) |
| Smoke test | `curl --fail` na URL do preview (output `details_url`) | `curl --fail` em `semana6-giovanni.web.app` + `grep` do título |

- **Preview em PR:** o [PR #1](https://github.com/GGDornelas/semana5-giovanni/pull/1) gerou o canal
  `pr1-etapa5-cd-firebase` e o bot comentou a URL. Os 4 jobs passaram
  ([run 37348436008](https://github.com/GGDornelas/semana5-giovanni/actions/runs/37348436008)),
  e o CI/CD da Semana 5 também ([run 37348435861](https://github.com/GGDornelas/semana5-giovanni/actions/runs/37348435861)).

  ![Preview do PR](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa5-preview-pr.png)

- **Deploy no merge:** o merge (`dfbe224`) atualizou a produção sem intervenção manual
  ([run 37349119250](https://github.com/GGDornelas/semana5-giovanni/actions/runs/37349119250)),
  com os 8 jobs da Semana 5 verdes no mesmo commit, incluindo a publicação no GHCR
  ([run 37349119330](https://github.com/GGDornelas/semana5-giovanni/actions/runs/37349119330)).

  ![Produção após o merge](https://raw.githubusercontent.com/GGDornelas/semana5-giovanni/main/docs/evidencias/semana6-etapa5-producao-pos-merge.png)

- **Teste de fumaca:** job `smoke` com `curl --fail --retry 5` — passou no PR e no merge.
- **Reflexao sobre a chave JSON:**
  - *É aceitável aqui?* Sim, com ressalvas. O projeto é didático, no Spark, sem dados sensíveis;
    a conta de serviço tem só o papel de admin do Hosting (não toca no Firestore nem em IAM);
    a chave vive apenas no GitHub Secrets (cifrada, mascarada nos logs, não exposta a PRs de forks
    — o workflow de PR ainda filtra `head.repo.full_name == github.repository`).
  - *O problema:* é uma credencial **de longa duração** (não expira sozinha). Se vazar — log mal
    configurado, action de terceiro comprometida, colaborador com acesso de escrita —, vale até
    alguém revogar manualmente. Rotação também é manual.
  - *Workload Identity Federation (WIF):* o GitHub emite um token OIDC por execução; o Google
    troca esse token por uma credencial de curta duração (~1 h) **sem nenhuma chave guardada**.
    O acesso é restrito por condição de atributo (ex.: `assertion.repository == 'GGDornelas/semana5-giovanni'`
    e `assertion.ref == 'refs/heads/main'`), então nem um fork nem outra branch consegue se passar
    pelo pipeline.
  - *Quando vale a pena:* sempre que houver produção real, dados de usuários, vários
    repositórios/pessoas com acesso, ou exigência de auditoria/compliance — e é o padrão
    recomendado pelo Google para CI/CD. Aqui não foi adotado porque o `init hosting:github` só
    gera o fluxo com chave e o objetivo era o fluxo oficial do Firebase; WIF é gratuito e seria o
    primeiro passo ao levar o projeto para produção (ver seção 8).
- **Commit:** [`c094321`](https://github.com/GGDornelas/semana5-giovanni/commit/c094321)
  (workflows, via PR #1), merge [`dfbe224`](https://github.com/GGDornelas/semana5-giovanni/commit/dfbe224)
  e evidências [`d5bf8cd`](https://github.com/GGDornelas/semana5-giovanni/commit/d5bf8cd).

## 8. Desenho de producao gerenciada

> Somente no papel. **Nenhum recurso foi criado** — todos exigem conta de faturamento.

| Componente da Semana 5 | Servico equivalente | Configuracao necessaria |
|---|---|---|
| Backend Django (Gunicorn) | **Cloud Run** | Porta `8000` (`PORT`), imagem `Dockerfile.prod`, conta de serviço própria só com `roles/cloudsql.client` e acesso aos segredos dele; `min-instances=0`, `max-instances=2`; concorrência ~20; `DJANGO_ALLOWED_HOSTS` e `CSRF_TRUSTED_ORIGINS` com o domínio do Hosting. |
| Frontend Next.js | **Firebase Hosting** (export estático, já feito) | Mantém o build `STATIC_EXPORT=true`; o Next standalone deixa de ser necessário em produção. |
| Imagens no GHCR | **Artifact Registry** | Repositório Docker regional (mesma região do Cloud Run); tag = SHA do commit; promoção por SHA (o mesmo digest testado vai para produção, nunca `latest`); política de limpeza mantendo as últimas 5 versões. |
| PostgreSQL | **Cloud SQL for PostgreSQL 16** | `db-f1-micro`, 10 GiB SSD; conexão pelo conector do Cloud SQL / socket Unix (sem IP público liberado); `migrate` como **Cloud Run Job** separado, executado antes do deploy; backups automáticos diários + PITR. |
| Arquivo `.env` | **Secret Manager** | Um segredo por valor (`DJANGO_SECRET_KEY`, `POSTGRES_PASSWORD`); papel `secretmanager.secretAccessor` concedido **por segredo** à conta de serviço do backend, montado como variável no Cloud Run. |
| Nginx | **Firebase Hosting + rewrite para o Cloud Run** | `"rewrites": [{ "source": "/api/**", "run": { "serviceId": "backend", "region": "southamerica-east1" } }]` — mesma origem para o navegador (sem CORS); atenção: o Hosting só repassa o cookie chamado `__session` para o Cloud Run. |
| Chaves no GitHub | **Workload Identity Federation** | Pool + provider OIDC do GitHub com condição `assertion.repository == 'GGDornelas/semana5-giovanni'`; conta de serviço de deploy com `run.admin`, `artifactregistry.writer`, `iam.serviceAccountUser`; workflow com `google-github-actions/auth` e `permissions: id-token: write`. |

- **Custo mensal estimado** (preços de lista em USD, `us-central1`, consultados nas páginas
  oficiais em 05/10/2026; tráfego baixo de projeto acadêmico):

| Serviço | Base de cálculo | US$/mês |
|---|---|---|
| Cloud SQL `db-f1-micro` | US$ 0,0105/h × 730 h | 7,67 |
| Cloud SQL armazenamento | 10 GiB × US$ 0,000465753/GiB-h × 730 h | 3,40 |
| Cloud SQL backups | ~1 GiB × US$ 0,000109589/GiB-h × 730 h | 0,08 |
| Cloud Run | request-based, `min-instances=0`; uso dentro da cota gratuita (180 mil vCPU-s, 360 mil GiB-s, 2 milhões de requisições/mês) | 0,00 |
| Artifact Registry | 0,5 GiB grátis; ~1,2 GiB (5 versões × 2 imagens) → 0,7 GiB × US$ 0,10 | 0,07 |
| Secret Manager | 2 versões ativas (6 grátis) e < 10 mil acessos | 0,00 |
| Firebase Hosting (Blaze) | dentro da cota gratuita (10 GB armazenados, 360 MB/dia) | 0,00 |
| Workload Identity Federation | sem cobrança | 0,00 |
| **Total** | | **≈ US$ 11,22/mês** (≈ R$ 60) |

  O custo é dominado pelo **Cloud SQL**, que cobra por hora mesmo ocioso. Se o backend ficasse com
  `min-instances=1` (sem *cold start*, 1 vCPU / 512 MiB), somaria cerca de US$ 9,90/mês em tempo
  ocioso, e o total iria para ~US$ 21/mês. Em `southamerica-east1` (São Paulo, Tier 2) os preços
  são mais altos.
  Fontes: [Cloud Run](https://cloud.google.com/run/pricing),
  [Cloud SQL](https://cloud.google.com/sql/pricing),
  [Artifact Registry](https://cloud.google.com/artifact-registry/pricing),
  [Secret Manager](https://cloud.google.com/secret-manager/pricing),
  [Firebase](https://firebase.google.com/pricing).

- **Por que o Spark nao permite:** o Spark é um plano **sem conta de faturamento**. Cloud Run,
  Cloud SQL, Artifact Registry e Secret Manager são produtos do Google Cloud que só podem ser
  ativados num projeto com faturamento vinculado — mesmo quando o uso ficaria dentro das cotas
  gratuitas, a API exige o cartão. O Cloud SQL nem tem cota gratuita (cobra por hora de instância),
  e o rewrite do Hosting para o Cloud Run também exige o Blaze. Por isso, na Semana 6, o backend
  foi substituído pelo Firestore, acessado direto do navegador e protegido pelas regras.

## 9. Custo zero e limites

- **Plano:** Spark do começo ao fim. **Nenhuma tela pediu cartão, faturamento ou upgrade para
  Blaze** durante as 5 etapas (criação do projeto, Firestore em modo de produção, Hosting, canais
  e `init hosting:github`).
- **Cotas usadas (aproximado, uso de testes em 05/10/2026):**

| Recurso | Cota Spark | Uso |
|---|---|---|
| Firestore leituras | 50 mil/dia | dezenas (3 documentos por carregamento) |
| Firestore gravações | 20 mil/dia | 3 (cadastro pelo console); as tentativas pelo site são negadas pelas regras |
| Firestore armazenamento | 1 GiB | < 1 KiB |
| Hosting armazenamento | 10 GB | poucos MB (≈ 1 MB por versão; 3 canais) |
| Hosting transferência | 360 MB/dia | poucos MB |
| GitHub Actions | ilimitado em repositório público | 11 execuções na Semana 6 (8 do CI/CD da Semana 5, 3 de deploy no Firebase) |

- **Servicos NAO habilitados:** Cloud Run, Cloud SQL, Artifact Registry, Cloud Build, Secret Manager,
  Cloud Functions, App Hosting, Cloud Storage, Compute Engine, Authentication por telefone e créditos
  de teste do Google Cloud. A única conta de serviço criada é a do deploy do Hosting (gratuita).

## 10. Validacao final

- **Comandos executados:**

```bash
# Projeto e canais
firebase projects:list
firebase hosting:channel:list

# URLs no ar
curl -I https://semana6-giovanni.web.app
curl -I https://semana6-giovanni--versao-b-4isbrgat.web.app

# Regras em produção (sem autenticação)
curl "https://firestore.googleapis.com/v1/projects/semana6-giovanni/databases/(default)/documents/items"
curl -X POST -H "Content-Type: application/json" -d '{"fields":{"nome":{"stringValue":"x"}}}' \
  "https://firestore.googleapis.com/v1/projects/semana6-giovanni/databases/(default)/documents/items"

# Nenhuma chave no repositório
git log --all -p | grep -c private_key
git grep private_key

# Qualidade e builds locais (frontend)
npm run lint && npm test && npm run build:static && npm run build
```

- **Resultados:**

| Verificação | Resultado |
|---|---|
| `hosting:channel:list` | `live`, `versao-b` e `pr1-etapa5-cd-firebase` ativos |
| Produção | `HTTP/2 200`, 3 itens do Firestore |
| Versão B | `HTTP/2 200`, título/cor/ordem diferentes |
| Leitura REST | `Configurar Docker`, `Automatizar CI`, `Publicar no GHCR` |
| Escrita REST / navegador | `403` / `permission-denied` |
| Chaves no Git | `0` ocorrências |
| ESLint / Vitest | sem erros / 9 testes em 3 arquivos, todos passando |
| `build:static` e `build` | os dois compilam: export para o Hosting e standalone para o Docker da Semana 5 |
| CI/CD Semana 5 | verde em todos os commits da Semana 6 |
| Deploy Firebase | PR (preview) e merge (live) verdes, com smoke test |

- **Limitacoes:**
  - Os canais `versao-b` e `pr1-etapa5-cd-firebase` expiram em 12/10/2026 (7 dias).
  - A apiKey do Firebase aparece no JavaScript publicado — é o comportamento esperado; a proteção
    está nas regras (escrita negada). Não há Authentication, então ninguém consegue gravar pelo site.
  - O smoke test do preview só verifica `HTTP 200`; o da produção também confere o título da página,
    mas nenhum dos dois valida se os dados do Firestore carregaram (isso acontece no navegador).
  - A chave de deploy é de longa duração (ver reflexão na seção 7).
  - O Time Attack (opcional) não foi cronometrado.

## 11. Historico Git

| Etapa | Commit | Descricao |
|---|---|---|
| 1 | [`b33bb92`](https://github.com/GGDornelas/semana5-giovanni/commit/b33bb92) | Projeto Firebase (Spark): `firebase.json`, `.firebaserc`, `firestore.rules`; `.gitignore` para logs e credenciais |
| 2 | [`a6b6640`](https://github.com/GGDornelas/semana5-giovanni/commit/a6b6640) | Export estático via `STATIC_EXPORT`, fetch no cliente com estado amigável de dados indisponíveis, deploy no Hosting |
| 3 | [`1324821`](https://github.com/GGDornelas/semana5-giovanni/commit/1324821) | Emulator Suite, fonte de dados por `NEXT_PUBLIC_DATA_SOURCE`, regras de `items`, dados semente exportados, testes |
| 4 | [`b3f6407`](https://github.com/GGDornelas/semana5-giovanni/commit/b3f6407) | Firestore de produção com regras publicadas e Versão B (`NEXT_PUBLIC_VARIANT`) em canal de pré-visualização |
| 4 | [`8d95d52`](https://github.com/GGDornelas/semana5-giovanni/commit/8d95d52) | Evidências: escrita negada e rollback do Hosting |
| 5 | [`c094321`](https://github.com/GGDornelas/semana5-giovanni/commit/c094321) | Workflows de CD no Firebase Hosting: quality → build → deploy → smoke, preview em PR e live no merge |
| 5 | [`dfbe224`](https://github.com/GGDornelas/semana5-giovanni/commit/dfbe224) | Merge do [PR #1](https://github.com/GGDornelas/semana5-giovanni/pull/1), que publicou a produção automaticamente |
| 5 | [`d5bf8cd`](https://github.com/GGDornelas/semana5-giovanni/commit/d5bf8cd) | Evidências: preview do PR e produção pós-merge |
