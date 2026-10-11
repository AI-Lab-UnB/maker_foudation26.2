# Semana 6 — Do Container à Nuvem (GCP e Firebase)

## 1. Identificação

- **Aluna:** Julia Neiva Lima
- **Repositório:** https://github.com/lianeiv/devops-semana5
- **URL de produção:** https://devops-semana6.web.app
- **URL da Versão A (canal `versao-a`):** https://devops-semana6--versao-a-58gparrp.web.app
- **URL da Versão B (canal `versao-b`):** https://devops-semana6--versao-b-mndoaaml.web.app
- **Expiração do canal da Versão B:** 30 dias.

## 2. Arquitetura

### Diagrama

```text
Navegador --HTTPS--> Firebase Hosting (CDN, domínio .web.app, site estático do Next.js)
Navegador (JavaScript) --> Cloud Firestore (coleção items; leitura pública e escrita negada)

GitHub Actions:
lint-frontend -> build-frontend -> test-frontend -> build-static -> deploy-hosting
Pull Request -> canal de preview
Merge na main -> produção

Ambiente Docker local (Semana 5):
Nginx -> Next.js standalone
      -> Django (Gunicorn) -> PostgreSQL
```

### Fluxo de requisição

O navegador baixa o site estático hospedado no Firebase Hosting. O JavaScript executado no cliente lê diretamente a coleção `items` do Cloud Firestore por meio do SDK do Firebase e renderiza os dados no formato `{ "status": "ok", "items": [...] }`, compatível com o formato da API Django da Semana 5. Se a leitura falhar, a página apresenta a mensagem `Dados indisponíveis`.

### O que continua no Docker local

O Nginx, o backend Django com Gunicorn, o frontend no modo standalone e o PostgreSQL da Semana 5 continuam no Docker local, sem alteração. O backend não foi migrado para a nuvem porque Cloud Run e Cloud SQL exigem faturamento, incompatível com a regra de custo zero desta atividade.

## 3. Etapa 1 — Projeto Firebase (Spark) e CLI

- **Plano Spark:** console do Firebase exibindo o plano Spark, sem custos (Anexo 1).
- **CLI:** saída do comando `firebase projects:list` (Anexo 2).
- **Arquivos de configuração:** `firebase.json`, `.firebaserc`, `firestore.rules` e `firestore.indexes.json`.
- **Higiene do Git:** o `.gitignore` ignora `firebase-debug.log`, `.firebase/`, `ui-debug.log` e arquivos JSON de contas de serviço, incluindo `*firebase-adminsdk*.json` e `serviceAccount*.json`.
- **Verificação do histórico:** o comando `git log --all --oneline -S"private_key"` não apresentou resultados (Anexo 3).
- **Commit:** consultar a tabela da Seção 11.

## 4. Etapa 2 — Deploy mais rápido

### Modo de exportação

O arquivo `next.config.mjs` seleciona o modo de saída por variável de ambiente:

- Com `STATIC_EXPORT=true`, utiliza `output: 'export'` para publicação no Firebase Hosting.
- Sem essa variável, mantém `output: 'standalone'`, utilizado pelo `Dockerfile.prod` da Semana 5.
- O rewrite de `/api` permanece apenas no modo standalone.
- A rota `app/api/health` declara `export const dynamic = "force-static"` para permitir o build estático.

### Estado de erro amigável

O fetch ocorre no navegador. Como o backend não foi migrado para a nuvem, a página mostra `Dados indisponíveis no momento` quando não consegue obter os dados, em vez de apresentar uma tela em branco. Há um teste Jest para esse estado.

### Comprovação de que a Semana 5 continua funcionando

Executados a partir do diretório `frontend/`:

```bash
npm run lint && npm test
docker build -f frontend/Dockerfile.prod -t app-front-prod ./frontend
docker images app-front-prod
```

A imagem `app-front-prod` deve respeitar o limite de 150 MB. A execução do CI da Semana 5 permaneceu verde na aba Actions (Anexo 4).

### Deploy e validação

```bash
STATIC_EXPORT=true npm run build
firebase deploy --only hosting
curl -I https://devops-semana6.web.app
```

A URL de produção respondeu com HTTP 200 (Anexo 5).

- **Tempo de deploy:** não medido.
- **Commit:** consultar a tabela da Seção 11.

## 5. Etapa 3 — Emulator Suite

### Configuração dos emuladores

O `firebase.json` configura Hosting na porta `5000`, Firestore na porta `8080` e a interface do Emulator Suite na porta `4000`. Foi utilizado o projeto de demonstração `demo-semana5`, sem necessidade de conta ou conexão com serviços de produção. O emulador do Firestore requer Java (JDK 21, conforme o ambiente utilizado).

### Fonte de dados

O arquivo `frontend/lib/dataSource.js` lê a variável `NEXT_PUBLIC_DATA_SOURCE`, que seleciona `api` por padrão ou `firestore`, mantendo o mesmo formato JSON da API da Semana 5. Quando `NEXT_PUBLIC_USE_EMULATOR=true`, a aplicação utiliza `connectFirestoreEmulator`.

Somente o arquivo `.env.example` é versionado. O script `scripts/build-static.sh emulator|firebase` prepara o build para cada modo.

### Regras do Firestore

```javascript
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

### Leitura permitida e escrita negada

- **Dados semente:** a pasta `emulator-data/` foi exportada com `--export-on-exit` e contém os três itens da Semana 5.
- **Leitura:** permitida pela regra `allow read: if true`.
- **Escrita:** negada pela regra `allow write: if false`.
- **Evidências:** prints da interface do emulador, na aba `Requests`, e saída `permission-denied` (Anexo 6).
- **Commit:** consultar a tabela da Seção 11.

Comando utilizado para iniciar o emulador com importação e exportação dos dados:

```bash
firebase emulators:start \
  --project demo-semana5 \
  --import=emulator-data \
  --export-on-exit
```

## 6. Etapa 4 — Firestore de produção e Versão B

### Regras publicadas

O banco foi criado no modo de produção, no plano Spark. As regras foram publicadas com:

```bash
firebase deploy --only firestore:rules
```

A saída do comando está no Anexo 7.

### Dados de produção

Foram cadastrados três documentos na coleção `items`, com os campos `titulo` e `ordem`, por meio do console do Firebase. A URL de produção exibe os dados provenientes do Firestore (Anexo 8).

### Escrita negada em produção

Foi realizada uma tentativa de executar `addDoc` pelo console do navegador na URL `.web.app`. A operação foi negada com `permission-denied` (Anexo 9).

### Canal da Versão B

A Versão B apresenta o título `Painel Semana 6 - Versão B` em rosa e os itens em ordem inversa. Foi publicada com:

```bash
firebase hosting:channel:deploy versao-b --expires 30d
```

A Versão A, com o título `Painel Semana 5` e os itens na ordem normal, permaneceu no canal `versao-a`.

| Ambiente | URL |
|---|---|
| Versão A — canal `versao-a` | https://devops-semana6--versao-a-58gparrp.web.app |
| Versão B — canal `versao-b` | https://devops-semana6--versao-b-mndoaaml.web.app |
| Produção | https://devops-semana6.web.app |

### Rollback

- **Antes:** a produção estava servindo a Versão B (Anexo 10).
- **Ação:** no Firebase Hosting, foi acessado `Histórico de lançamentos > Reverter para a versão anterior`.
- **Depois:** a produção voltou a servir a Versão A. O histórico de lançamentos comprova a reversão (Anexo 10).
- **Commit:** consultar a tabela da Seção 11.

## 7. Etapa 5 — Deploy contínuo com GitHub Actions

### Workflow

Arquivo: `.github/workflows/ci.yml`.

A sequência de jobs é:

1. `lint-frontend`
2. `build-frontend`
3. `test-frontend`
4. `build-static`, com `STATIC_EXPORT=true`
5. `deploy-hosting`

Os jobs são conectados pela propriedade `needs`. A configuração `concurrency` utiliza `hosting-${{ github.ref }}` e não cancela execuções em andamento, evitando deploys simultâneos no mesmo grupo. Os deploys no GHCR da Semana 5 permaneceram intactos.

### Credencial

O comando `firebase init hosting:github` criou o secret `FIREBASE_SERVICE_ACCOUNT_DEVOPS_SEMANA6` no GitHub. Os workflows gerados pela CLI foram substituídos pelos jobs definidos em `ci.yml`.

Nenhum JSON de credencial foi incluído no repositório. A verificação abaixo retornou saída vazia:

```bash
git log --all --oneline -S"private_key"
```

### Preview em Pull Request

A abertura de um Pull Request gera um canal de pré-visualização. O link do PR e a URL do preview estão no Anexo 11.

### Deploy no merge

Após o merge na branch `main`, a publicação em produção ocorre automaticamente, sem intervenção manual. A execução do workflow está registrada no Anexo 11.

### Teste de fumaça

A etapa final do job `deploy-hosting` verifica a URL publicada com `curl --fail --retry 5`. O print da etapa concluída com sucesso está no Anexo 11.

### Reflexão sobre a chave JSON

A chave JSON armazenada no GitHub Secrets é aceitável no contexto deste projeto individual, pois pertence a uma conta de serviço com permissões restritas ao deploy do Hosting, é armazenada como secret e não foi incluída no repositório.

Entretanto, trata-se de uma credencial de longa duração. Se for exposta por logs, forks ou máquinas comprometidas, poderá ser usada até ser revogada, e sua rotação é manual.

A **Workload Identity Federation** evita armazenar uma chave de longa duração. O GitHub emite um token OIDC de curta duração para cada execução, e o Google verifica se os atributos apresentados — por exemplo, o repositório — correspondem às condições configuradas.

Essa alternativa é especialmente útil em equipes, projetos com vários repositórios ou ambientes, sistemas de produção e cenários com exigências de conformidade ou rotação de credenciais. Neste projeto, o custo de configuração de pool, provedor e permissões foi considerado superior ao benefício imediato.

- **Commit:** consultar a tabela da Seção 11.

## 8. Desenho de produção gerenciada

**Escopo:** proposta conceitual. Nenhum recurso de produção gerenciada foi criado.

### Tabela de migração

| Componente da Semana 5 | Serviço equivalente | Configuração proposta |
|---|---|---|
| Backend Django (Gunicorn) | Cloud Run | Porta do contêiner (`8000`), conta de serviço própria e limites de escala mínima e máxima. |
| Imagens no GHCR | Artifact Registry | Promoção da imagem identificada pelo SHA do commit. |
| PostgreSQL | Cloud SQL | Conexão segura, migrações em job separado e backups. |
| Arquivo `.env` | Secret Manager | Acesso limitado aos segredos necessários. |
| Nginx | Firebase Hosting + rewrite para Cloud Run | Mesma origem para o navegador e configuração dos limites de cookies. |
| Chaves no GitHub | Workload Identity Federation | Condição de atributo restrita ao repositório. |

### Custo mensal estimado

Estimativa para um cenário pequeno, consultada em 11/10/2026. Valores em dólares americanos, sem impostos. Os preços variam por região; São Paulo costuma ser mais cara que `us-central1`.

| Serviço | Premissa | Estimativa mensal |
|---|---|---:|
| Cloud Run (backend Django) | Escala mínima zero e tráfego acadêmico dentro das cotas gratuitas indicadas: 2 milhões de requisições, 180.000 vCPU-s e 360.000 GiB-s por mês. | ≈ US$ 0 |
| Artifact Registry | Duas imagens, aproximadamente 1 GB armazenado; 0,5 GB gratuito e US$ 0,10 por GB excedente. | ≈ US$ 0,05 |
| Cloud SQL (PostgreSQL) | `db-f1-micro`, 10 GB de SSD, sem alta disponibilidade e com backups automáticos. | ≈ US$ 13 a US$ 16 |
| Secret Manager | Três segredos, uma versão ativa cada, dentro da cota gratuita considerada. | ≈ US$ 0 |
| Firebase Hosting | Mantido no plano Spark. | US$ 0 |
| **Total estimado** | **Cenário pequeno.** | **≈ US$ 13 a US$ 16 por mês** |

O custo é dominado pelo Cloud SQL, pois a instância de banco gerenciado é cobrada enquanto permanece ligada, mesmo sem tráfego. O Cloud Run pode escalar a zero quando não há requisições.

**Fontes e ressalvas:** a estimativa foi elaborada a partir dos valores de Cloud Run, Artifact Registry e Secret Manager informados para o projeto. Os valores considerados para Cloud Run foram US$ 0,000024 por vCPU-s, US$ 0,0000025 por GiB-s e US$ 0,40 por milhão de requisições excedentes à cota. Para Artifact Registry, foi considerado US$ 0,10 por GB excedente. Para Secret Manager, foram considerados US$ 0,06 por versão ativa e US$ 0,03 por 10.000 acessos excedentes às cotas gratuitas.

Os valores de Cloud SQL foram obtidos de tabelas de terceiros, com estimativa de US$ 0,015 a US$ 0,018 por hora para `db-f1-micro`. **Confirme os valores na calculadora oficial de preços do Google Cloud antes de apresentar a estimativa como definitiva.** Região, armazenamento, backups e outros encargos podem alterar o total.

### Por que o Spark não permite essa arquitetura?

Cloud Run, Cloud SQL, Artifact Registry e Secret Manager são serviços pagos do Google Cloud e exigem uma conta de faturamento vinculada. A arquitetura proposta, portanto, não atende à restrição de custo zero e de não vincular cartão estabelecida para esta atividade. O projeto permaneceu no plano Spark.

## 9. Custo zero e limites

### Plano

O projeto permaneceu no plano Spark do início ao fim. O console exibindo o plano ao final está no Anexo 12.

### Cotas utilizadas

Os prints das abas de uso do Firestore e do Hosting estão no Anexo 12.

### Serviços não habilitados

Não foram habilitados:

- Cloud Run;
- Artifact Registry;
- Cloud Build;
- Secret Manager;
- Cloud SQL;
- Cloud Functions;
- Cloud Storage;
- App Hosting;
- Compute Engine.

Nenhuma tela solicitou cartão, vinculação de faturamento ou upgrade de plano.

## 10. Validação final

### Comandos executados

```bash
# Lint e testes
npm run lint && npm test

# Build estático
STATIC_EXPORT=true npm run build

# Emulator Suite com importação e exportação dos dados
firebase emulators:start \
  --project demo-semana5 \
  --import=emulator-data \
  --export-on-exit

# Publicação das regras do Firestore
firebase deploy --only firestore:rules

# Publicação do Hosting
firebase deploy --only hosting

# Publicação da Versão B
firebase hosting:channel:deploy versao-b --expires 30d

# Verificação da resposta HTTP
curl -I https://devops-semana6.web.app

# Busca de possível chave privada no histórico
git log --all --oneline -S"private_key"
```

### Resultados

- `npm run lint` e `npm test` passaram; foi executado um teste Jest.
- O build estático gerou `frontend/out` após a rota `app/api/health` declarar `export const dynamic = "force-static"`.
- `firebase deploy --only hosting` publicou a Versão A, que exibe os três itens provenientes do Firestore.
- Os canais `versao-a` e `versao-b` foram publicados.
- Os demais resultados estão documentados nos Anexos 1 a 12.

### Limitações conhecidas

1. **Backend e banco local:** Django e PostgreSQL continuam somente no Docker local; o site publicado depende do Firestore.
2. **Leitura pública:** qualquer pessoa pode ler a coleção `items`, conforme definido intencionalmente nas regras. A escrita por clientes é negada.
3. **Cotas gratuitas:** a cota do Firestore é diária. Se for esgotada, as leituras podem parar até o próximo ciclo, e a página apresenta `Dados indisponíveis`.

## 11. Histórico Git

A atividade exige pelo menos um commit identificável e exclusivo para cada uma das cinco etapas. Preencha a tabela com os hashes reais do repositório; os hashes abaixo não devem ser considerados definitivos sem conferência.

| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `PREENCHER_HASH_REAL` | Projeto Firebase no Spark, CLI, `firebase.json`, `.firebaserc`, regras e higiene do Git. |
| 2 | `PREENCHER_HASH_REAL` | Exportação estática via `STATIC_EXPORT`, estado de erro amigável e publicação no Hosting, mantendo o build Docker da Semana 5. |
| 3 | `PREENCHER_HASH_REAL` | Emulator Suite, fonte de dados configurável, regras e dados semente. |
| 4 | `PREENCHER_HASH_REAL` | Firestore em produção, publicação da Versão B e evidências de rollback. |
| 5 | `PREENCHER_HASH_REAL` | GitHub Actions, preview em PR, deploy no merge e teste de fumaça. |

Para conferir os commits, utilize:

```bash
git log --oneline
```

Se os commits tiverem mensagens padronizadas por etapa, também é possível filtrar com:

```bash
git log --oneline --grep="etapa-"
```

## Anexos — Evidências

Inclua os prints e as saídas dos comandos em `docs/evidencias/` ou no PDF final. Mantenha a numeração e confira se cada evidência citada no texto corresponde ao anexo correto.

### Anexo 1 — Plano Spark no início

- Console do Firebase mostrando o plano Spark.

### Anexo 2 — Projetos Firebase

- Saída de `firebase projects:list`.

### Anexo 3 — Higiene do Git

- Saída vazia de `git log --all --oneline -S"private_key"`.

### Anexo 4 — Docker e CI da Semana 5

- Saída de `docker images app-front-prod`, mostrando o tamanho da imagem e o limite de 150 MB.
- Execução bem-sucedida do CI da Semana 5 na aba Actions.

### Anexo 5 — Deploy estático

- Saída de `curl -I https://devops-semana6.web.app`, mostrando HTTP 200.
- Print do estado de erro amigável `Dados indisponíveis`, conforme solicitado na Etapa 2.

### Anexo 6 — Emulator Suite

- Interface em `localhost:4000`, aba `Requests`, mostrando leitura permitida e escrita negada.
- Saída `permission-denied`.

### Anexo 7 — Publicação das regras

- Saída de `firebase deploy --only firestore:rules`.

### Anexo 8 — Dados de produção

- Print de https://devops-semana6.web.app exibindo os três itens do Firestore.

### Anexo 9 — Escrita negada em produção

- Tentativa de escrita negada, com `permission-denied` no console do navegador ou `PERMISSION_DENIED` em resposta HTTP 403.

### Anexo 10 — Rollback

- Resultado da verificação da URL antes e depois do rollback.
- Print do histórico de lançamentos do Hosting.

### Anexo 11 — GitHub Actions

- Pull Request com comentário contendo a URL de preview.
- Execução do workflow após o merge na branch `main`.
- Etapa `Teste de fumaça` concluída com sucesso.

### Anexo 12 — Plano Spark e cotas

- Console exibindo o plano Spark ao final.
- Prints das abas de utilização do Firestore e do Hosting.
