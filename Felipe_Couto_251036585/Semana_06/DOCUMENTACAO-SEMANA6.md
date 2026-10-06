# Semana 6 — Do Container à Nuvem (GCP e Firebase)

## 1. Identificação

- **Aluno:** Felipe Couto Duque
- **Repositório:** https://github.com/felipecduque7/semana5-docker-cicd
- **URL de produção:** https://semana6-felipe.web.app
- **URL do canal (Versão B):** https://semana6-felipe--versao-b-ft8xzgbi.web.app
- **Projeto Firebase:** `semana6-felipe` (plano Spark)

Continuação da Semana 5. O frontend Next.js e os dados foram levados para a
nuvem usando exclusivamente serviços gratuitos do plano Spark, sem cartão de
crédito e sem possibilidade de cobrança. A stack em contêineres da Semana 5
permanece íntegra e funcional.

---

## 2. Arquitetura

### Fluxo em produção

```
Navegador
    |
    | HTTPS (certificado gerenciado, CDN global)
    v
Firebase Hosting  ──────────>  arquivos estáticos (Next.js export)
    |
    | SDK do Firestore, direto do cliente
    v
Cloud Firestore  ──────────>  coleção "items" (leitura pública, escrita negada)
```

### O que continua no Docker local

A stack completa da Semana 5 segue funcionando sem alteração:

| Serviço | Onde roda | Situação |
|---|---|---|
| Django + Gunicorn | Docker local | Intacto. Não foi para a nuvem porque Cloud Run exige plano Blaze |
| PostgreSQL | Docker local | Intacto. Cloud SQL exige Blaze |
| Nginx + TLS | Docker local | Substituído pelo Firebase Hosting no ambiente de nuvem |
| Next.js (standalone) | Docker local | Mesmo código, modo de saída diferente |

### A chave da compatibilidade

O mesmo código-fonte gera dois artefatos distintos, decididos por variável de
ambiente:

```javascript
const nextConfig = {
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : 'standalone',
};
```

Sem a variável, o build produz o servidor Node que o `Dockerfile.prod` da
Semana 5 empacota. Com `STATIC_EXPORT=true`, produz HTML estático para o
Hosting. Nenhum dos dois caminhos interfere no outro.

### Resolução de dados

A camada `frontend/app/dataSource.js` abstrai a origem dos dados. As duas
implementações devolvem o mesmo formato — `{ status, items }` — de modo que a
interface não muda:

| `NEXT_PUBLIC_DATA_SOURCE` | Origem |
|---|---|
| `api` | Endpoint `/api/health/` do Django (Semana 5) |
| `firestore` | Coleção `items` do Cloud Firestore |

E `NEXT_PUBLIC_USE_EMULATOR` decide entre o Firestore real e o emulador local.

---

## 3. Etapa 1 — Projeto Firebase e CLI

**Commit:** `339350c`

### Plano Spark comprovado

Projeto `semana6-felipe` criado no plano Spark. O console exibe
"Spark — Sem custos (US$ 0/mês)" no rodapé do menu lateral.

![Plano Spark](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-etapa1-spark.png)

Saída da CLI confirmando o projeto:

```
┌──────────────────────┬────────────────┬────────────────┐
│ Project Display Name │ Project ID     │ Project Number │
├──────────────────────┼────────────────┼────────────────┤
│ semana6-felipe       │ semana6-felipe │ 524563047180   │
└──────────────────────┴────────────────┴────────────────┘
```

### Arquivos de configuração versionados

`firebase.json`, `.firebaserc`, `firestore.rules` e `firestore.indexes.json`.
O diretório público do Hosting aponta para `frontend/out`, que é a saída do
export estático.

### Higiene do Git

Adicionado ao `.gitignore`:

```
.firebase/
firebase-debug.log
firestore-debug.log
*firebase-adminsdk*.json
serviceAccountKey.json
```

As duas últimas linhas bloqueiam qualquer chave de conta de serviço. Nenhum
arquivo de credencial existe no histórico do repositório.

---

## 4. Etapa 2 — O deploy mais rápido

**Commit:** `7ec8916`

### Modo de exportação

Implementado conforme a seção de Arquitetura. O build estático é gerado com:

```powershell
$env:STATIC_EXPORT="true"
npm run build
```

Resultado em `frontend/out`: 40 arquivos, incluindo `index.html`, `404.html` e
os assets em `_next/`.

### Estado de erro amigável

Nesta etapa o backend ainda não existia na nuvem. Em vez de tela em branco ou
erro de console, a página exibe uma mensagem explicativa:

![Estado de erro amigável](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-etapa2-erro-amigavel.png)

O componente foi convertido para client-side (`"use client"`), com três estados
distintos — carregando, erro e dados — porque recursos de servidor do Next não
existem em export estático.

### Validação

```
$ curl.exe -I https://semana6-felipe.web.app
HTTP/1.1 200 OK
Cache-Control: max-age=3600
Strict-Transport-Security: max-age=31556926; includeSubDomains; preload
X-Served-By: cache-bsb500022-BSB
X-Cache: HIT
```

O cabeçalho `X-Served-By` revela que o conteúdo é servido por um nó de CDN em
Brasília. HTTPS, certificado e distribuição geográfica vieram prontos, sem
nenhuma configuração — em contraste direto com o `nginx.conf` e o certificado
autoassinado da Semana 5.

### Semana 5 não quebrou

```
$ docker build -f frontend/Dockerfile.prod -t teste-semana5 ./frontend
 => [runner 5/6] COPY --from=builder /app/.next/standalone ./
 => => naming to docker.io/library/teste-semana5:latest
[+] Building 29.7s FINISHED
```

A presença de `.next/standalone` confirma que o modo servidor continua
disponível.

---

## 5. Etapa 3 — Emulator Suite

**Commit:** `fc11795`

### Configuração dos emuladores

Bloco adicionado ao `firebase.json`:

```json
"emulators": {
  "hosting": { "port": 5000 },
  "firestore": { "port": 8080 },
  "ui": { "enabled": true, "port": 4000 }
}
```

### Fonte de dados por variável

`frontend/app/dataSource.js` expõe `buscarDados()`, que escolhe entre API e
Firestore conforme `NEXT_PUBLIC_DATA_SOURCE`, e conecta ao emulador quando
`NEXT_PUBLIC_USE_EMULATOR=true`:

```javascript
if (process.env.NEXT_PUBLIC_USE_EMULATOR === "true") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
```

Apenas `.env.example` é versionado.

### Regras aplicadas à coleção items

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

### Leitura permitida e escrita negada

A aba Requests do Emulator Suite registra seis operações LIST aprovadas e uma
operação CREATE bloqueada:

![Requests no emulador](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-etapa3-requests-emulador.png)

No console do navegador, a tentativa de escrita retorna:

```
BLOQUEADO: permission-denied
```

### Dados semente

Os três itens foram exportados com `--export-on-exit=./emulator-data` e estão
versionados em `emulator-data/firestore_export/`. Para recarregar:

```powershell
firebase emulators:start --project semana6-felipe --import=./emulator-data --export-on-exit=./emulator-data
```

---

## 6. Etapa 4 — Firestore de produção e Versão B

**Commit:** `797c4ba`

### Regras publicadas

```powershell
firebase deploy --only firestore:rules
```

As mesmas regras testadas no emulador passaram a valer no Firestore real.

### Dados de produção

Coleção `items` criada pelo console, com três documentos de campos `texto`
(string) e `ordem` (int64). A ordenação é feita no cliente, porque o Firestore
não garante ordem de retorno sem índice explícito.

![Produção lendo do Firestore](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-etapa4-producao.png)

### Canal da Versão B

```powershell
firebase hosting:channel:deploy versao-b --expires 7d
```

Duas URLs no ar simultaneamente, isoladas:

| Ambiente | URL | Conteúdo |
|---|---|---|
| Produção | https://semana6-felipe.web.app | "Status da API" |
| Canal | https://semana6-felipe--versao-b-ft8xzgbi.web.app | "Status da API — Versão B" |

![Versão B](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-etapa4-versao-b.png)

O canal expira automaticamente em 7 dias e não afeta a produção. É o mecanismo
que permite validar uma mudança em ambiente real antes de promovê-la.

### Escrita negada em produção

![Escrita negada](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-etapa4-escrita-negada.png)

Vale notar o contraste visível na captura: os três itens são exibidos
normalmente (leitura permitida) enquanto a tentativa de gravação retorna
`permission-denied`. A `apiKey` do Firebase é pública e está no código do
cliente, visível a qualquer visitante — a proteção não vem de escondê-la, e sim
das regras avaliadas no servidor.

### Rollback

Antes e depois da reversão pelo histórico de versões do Hosting:

![Rollback antes](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-etapa4-rollback-antes.png)

![Rollback depois](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-etapa4-rollback-depois.png)

O Firebase não remove a versão revertida: cria uma entrada nova reaproveitando
o conteúdo anterior. Por isso o hash `befe5b` aparece duas vezes, em horários
diferentes. O histórico permanece íntegro e auditável.

---

## 7. Etapa 5 — Deploy contínuo com GitHub Actions

**Commit:** `519d4fe`

### Workflows

Gerados por `firebase init hosting:github` e reescritos para atender aos
requisitos da etapa.

| Arquivo | Gatilho | Resultado |
|---|---|---|
| `firebase-hosting-pull-request.yml` | `pull_request` para main | Canal de pré-visualização |
| `firebase-hosting-merge.yml` | `push` para main | Produção + teste de fumaça |

Ambos seguem `qualidade` → `deploy`, com `needs` encadeando os jobs. O de
produção acrescenta `teste-de-fumaca`.

### Concurrency

```yaml
concurrency:
  group: deploy-producao
  cancel-in-progress: false
```

Impede dois deploys simultâneos em produção. No workflow de PR, o grupo é por
número do pull request e `cancel-in-progress: true`, de modo que um novo push
cancela a pré-visualização anterior em vez de enfileirar.

### Pré-visualização em PR

O pull request #1 gerou automaticamente a URL
`https://semana6-felipe--pr1-teste-preview-w89qvajl.web.app`, comentada pelo
bot no próprio PR, com 11 verificações aprovadas — incluindo toda a esteira da
Semana 5, o que comprova a não-regressão.

![Pré-visualização em PR](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-etapa5-pr-preview.png)

### Deploy no merge

O merge do PR #1 (commit `16d7f96`) disparou o workflow de produção sem
intervenção manual.

![Deploy em produção](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-etapa5-deploy-verde.png)

### Teste de fumaça

```yaml
teste-de-fumaca:
  needs: deploy
  steps:
    - run: |
        sleep 15
        curl --fail --silent --show-error https://semana6-felipe.web.app > /dev/null
```

O `--fail` faz o curl retornar código de erro em respostas HTTP 4xx ou 5xx, o
que reprova o job. Sem essa flag o curl retornaria sucesso mesmo recebendo um
404. O `sleep` dá margem para a propagação do Hosting.

### Reflexão: a chave JSON no secret é aceitável aqui?

**Sim, neste contexto.** O repositório é pessoal, o projeto é acadêmico, não há
dados sensíveis, e o custo de uma eventual exposição é baixo. O GitHub Secrets
criptografa o valor em repouso, mascara ocorrências nos logs e não o expõe em
workflows de forks.

**Mas o modelo tem fraquezas estruturais.** A chave é uma credencial de longa
duração: não expira sozinha, e se vazar — por um log mal configurado, uma ação
de terceiros comprometida, ou um colaborador mal-intencionado — continua válida
até alguém revogá-la manualmente. Além disso, ela existe fisicamente em dois
lugares, o que já é um lugar a mais do que o necessário.

**Workload Identity Federation elimina a chave.** Em vez de armazenar um
segredo, o Google Cloud passa a confiar diretamente no provedor de identidade do
GitHub: a cada execução, o Actions emite um token OIDC de curta duração
descrevendo quem está pedindo acesso, e o GCP troca esse token por credenciais
temporárias. A autorização é condicionada por atributos — repositório, branch,
ambiente — de modo que um token emitido para outro repositório é recusado,
mesmo sendo um token legítimo do GitHub.

**Quando vale a pena migrar:** quando há dados de terceiros ou de produção em
jogo; quando o repositório tem vários colaboradores ou aceita contribuições
externas; quando há exigência de conformidade que proíbe credenciais estáticas;
ou quando a rotação manual de chaves vira sobrecarga operacional. Para um
trabalho acadêmico individual, a complexidade adicional da federação não se
justifica — mas conhecer a alternativa é o que permite reconhecer o momento de
adotá-la.

---

## 8. Desenho de produção gerenciada

Nenhum recurso desta seção foi provisionado. Os serviços abaixo exigem conta de
faturamento e, portanto, estão fora do escopo da regra de custo zero. A tabela
é um exercício de projeto, baseado nas páginas oficiais de preço e documentação.

| Componente da Semana 5 | Serviço gerenciado | O que seria preciso configurar |
|---|---|---|
| Backend Django (Gunicorn) | Cloud Run | Porta do contêiner (8000), conta de serviço dedicada com permissões mínimas, `min-instances=0` para escalar a zero, `max-instances` como teto de custo, variáveis de ambiente apontando para o Cloud SQL |
| Imagens no GHCR | Artifact Registry | Repositório Docker na mesma região do Cloud Run, promoção de imagem por SHA de commit, política de limpeza de versões antigas |
| PostgreSQL | Cloud SQL | Instância PostgreSQL, conexão via Cloud SQL Auth Proxy ou IP privado, migrações em Cloud Run Job separado do serviço, backups automáticos e janela de manutenção |
| Arquivo `.env` | Secret Manager | Um segredo por credencial, papel `secretAccessor` concedido apenas à conta de serviço do Cloud Run e apenas aos segredos necessários, versionamento de segredos |
| Nginx | Firebase Hosting + rewrite | Rewrite de `/api/**` para o serviço do Cloud Run, mantendo mesma origem para o navegador e evitando CORS; atenção aos limites de cookie e cabeçalho do Hosting |
| Chaves no GitHub | Workload Identity Federation | Pool e provider OIDC, condição de atributo restrita a `repository == 'felipecduque7/semana5-docker-cicd'` e à branch main, vínculo com a conta de serviço de deploy |

### Custo mensal estimado

Valores aproximados para a região `us-central1`, considerando tráfego baixo de
aplicação acadêmica:

| Serviço | Configuração | Estimativa |
|---|---|---|
| Cloud Run | 1 vCPU, 512 MB, escala a zero, tráfego esporádico | Dentro do nível gratuito na maior parte dos meses; acima dele, poucos dólares |
| Cloud SQL | `db-f1-micro`, 10 GB SSD, zonal, sem alta disponibilidade | Entre US$ 8 e US$ 10 por mês — é o item dominante, por cobrar instância ligada 24 horas por dia |
| Artifact Registry | Poucos GB de imagens | Primeiro 0,5 GB gratuito; depois, centavos por GB |
| Secret Manager | Poucos segredos, acessos esporádicos | Fração de dólar |
| Firebase Hosting | Mesma carga atual | Gratuito no Spark |

**Total aproximado: US$ 10 a US$ 15 por mês**, dominado pelo Cloud SQL.

### Por que o Spark não permite

O plano Spark cobre apenas os serviços do Firebase que escalam a zero de forma
natural — Hosting, Firestore e Authentication. Cloud Run, Cloud SQL, Artifact
Registry e Secret Manager são produtos do Google Cloud Platform, não do Firebase,
e todos exigem uma conta de faturamento vinculada ao projeto, mesmo quando o
consumo ficaria dentro do nível gratuito.

A razão é que esses serviços podem gerar custo contínuo e imprevisível: uma
instância do Cloud SQL cobra por tempo ligado, independentemente de haver
requisições. Sem um meio de pagamento vinculado, o Google não tem como cobrir
esse risco. O Firestore, em contraste, simplesmente para de responder quando a
cota diária se esgota, e volta no ciclo seguinte — por isso pode ser oferecido
sem cartão.

---

## 9. Custo zero e limites

### Plano

**Spark**, do início ao fim. Nenhuma tela de upgrade foi aceita, nenhum cartão
foi cadastrado, nenhum crédito de teste foi ativado.

### Serviços NÃO habilitados

| Serviço | Motivo |
|---|---|
| App Hosting | Exige plano Blaze. A tela do console oferece US$ 300 em créditos mediante cadastro de cartão — recusado |
| Cloud Functions | Exige Blaze |
| Cloud Storage | Exige Blaze desde 2026 |
| Cloud Run, Cloud SQL, Artifact Registry, Secret Manager | Produtos pagos do Google Cloud |

![App Hosting exige Blaze](https://raw.githubusercontent.com/felipecduque7/semana5-docker-cicd/main/docs/img/s6-blaze-nao-habilitado.png)

### Cotas utilizadas

Dentro da faixa gratuita em todos os serviços: Hosting com 42 arquivos e
tráfego restrito a testes manuais; Firestore com 3 documentos e algumas dezenas
de leituras; GitHub Actions dentro da cota de repositório público.

A URL não foi divulgada em massa durante os testes, conforme recomendação do
enunciado, para evitar esgotar a cota diária de leituras do Firestore.

---

## 10. Validação final

### Comandos executados

```powershell
# Aquecimento (Missão Farol, ambiente fictício isolado)
firebase emulators:start --project demo-farol

# Etapa 1
firebase login
firebase projects:list
firebase init

# Etapa 2
$env:STATIC_EXPORT="true"; npm run build
firebase deploy --only hosting
curl.exe -I https://semana6-felipe.web.app
docker build -f frontend/Dockerfile.prod -t teste-semana5 ./frontend

# Etapa 3
firebase emulators:start --project semana6-felipe --export-on-exit=./emulator-data

# Etapa 4
firebase deploy --only firestore:rules
firebase hosting:channel:deploy versao-b --expires 7d

# Etapa 5
firebase init hosting:github
```

### Resultados

| Verificação | Resultado |
|---|---|
| URL de produção responde | HTTP 200, servido por CDN em Brasília |
| Dados vindos do Firestore | 3 itens, na ordem correta |
| Escrita em produção | `permission-denied` |
| Escrita no emulador | `permission-denied`, registrada na aba Requests |
| Build de contêiner da Semana 5 | Passa, com `.next/standalone` presente |
| Pipeline da Semana 5 | 11 verificações aprovadas no PR |
| PR gera pré-visualização | Sim, URL comentada automaticamente |
| Merge atualiza produção | Sim, sem intervenção manual |
| Teste de fumaça | Passa |

### Limitações conhecidas

1. **O backend Django não foi para a nuvem.** Cloud Run exige faturamento. A
   API continua disponível apenas localmente via Docker, e o frontend publicado
   lê diretamente do Firestore. O desenho de como seria a migração está na
   seção 8.

2. **A `apiKey` está no código do cliente.** É o comportamento esperado do
   Firebase — a configuração web é pública por design. A segurança efetiva vem
   das regras do Firestore, não do sigilo da chave.

3. **Credencial de longa duração no secret.** Discutido na seção 7.

4. **Ordenação feita no cliente.** O Firestore não garante ordem de retorno sem
   índice. Para três documentos isso é irrelevante; em escala maior, exigiria
   `orderBy` com índice declarado em `firestore.indexes.json`.

5. **Cobertura de testes mínima.** Herdada da Semana 5. O teste do frontend
   valida apenas a sanidade do ambiente.

6. **Encoding no Windows.** O `Set-Content -Encoding utf8` do PowerShell grava
   com BOM, que quebra parsers sensíveis. Arquivos de configuração foram
   gravados com `System.Text.UTF8Encoding $false`.

---

## 11. Histórico Git

| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `339350c` | Projeto Firebase (Spark) e configuração da CLI |
| 2 | `7ec8916` | Export estático e deploy no Firebase Hosting |
| 3 | `fc11795` | Emulator Suite, fonte de dados por variável e regras do Firestore |
| 4 | `797c4ba` | Firestore de produção, canal de pré-visualização e rollback |
| 5 | `519d4fe` | Deploy contínuo com GitHub Actions e teste de fumaça |

### Commits de apoio

| Commit | Descrição |
|---|---|
| `73b0a5e` | Remoção de diretório duplicado |
| `55ace6e` | Alteração de teste para demonstrar a pré-visualização em PR |
| `16d7f96` | Merge do PR #1, que disparou o deploy automático em produção |
