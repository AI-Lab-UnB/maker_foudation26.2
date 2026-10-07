# Semana 6 - Do Container à Nuvem (GCP e Firebase)

## 1. Identificação
- **Aluno(a):** Gustavo da Rocha Machado Quirino
- **Repositório:** https://github.com/Gustavormq/semana5-cicd-app
- **URL de Produção:** https://projetoogus.web.app
- **URL do Canal (Versão B):** https://projetoogus--versao-b.web.app

---

## 2. Arquitetura
- **Diagrama de Fluxo:**
  ```text
  [Navegador do Usuário]
           │
           ├──> Requests Estáticos / CDN ──> [Firebase Hosting (Spark)]
           │
           └──> Leitura / Consulta SDK ───> [Cloud Firestore (Modo Produção)]
  ```
- **Fluxo de Requisição:** O navegador acessa os arquivos estáticos do frontend servidos via CDN global com HTTPS automatizado pelo **Firebase Hosting**. Ao carregar o aplicativo no cliente, o SDK Web do Firebase consulta em tempo real a coleção no **Cloud Firestore**. As regras de segurança ativas no banco autorizam leituras públicas e bloqueiam qualquer tentativa de escrita não autenticada.
- **O que continua no Docker local:** O backend em **Django (Gunicorn)** e o banco de dados relacional **PostgreSQL** criados na Semana 5 continuam rodando inteiramente em contêineres Docker no ambiente local. A aplicação frontend foi adaptada via chave de build (`STATIC_EXPORT=true`) para gerar um export estático para o Firebase Hosting sem romper os arquivos Docker de produção originais.

---

## 3. Etapa 1 - Projeto e CLI
- **Plano Spark (evidência):** Confirmado e validado no painel do Console do Firebase (Plano Spark - Custo Zero, sem exigência de cartão de crédito).
- **Arquivos de Configuração:**
  - `firebase.json` (definição das portas do Hosting, Firestore e Emuladores)
  - `.firebaserc` (vínculo do projeto com a ID `projetoogus`)
  - `firestore.rules` (regras declarativas de segurança)
- **Higiene do Git:** Arquivos de logs (`firebase-debug.log`), diretórios temporários (`.firebase/`) e variáveis locais (`.env`, `.env.local`) foram adicionados ao `.gitignore`. Nenhuma chave JSON de conta de serviço nem credenciais privadas foram expostas no repositório.
- **Commit:** `feat(etapa-1): configuracao inicial do projeto firebase spark e cli`

---

## 4. Etapa 2 - Deploy Mais Rápido
- **Modo de Exportação:** Configurado no `next.config.mjs` utilizando a alternância por variável de ambiente:
  ```javascript
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : 'standalone'
  ```
- **Estado de Erro Amigável:** O frontend trata falhas de requisição e indisponibilidade de dados exibindo um alerta visual informativo para o usuário ao invés de quebrar a renderização.
- **Semana 5 Continua Funcionando:** Os arquivos `Dockerfile`, `Dockerfile.prod` e `docker-compose.yml` da Semana 5 permanecem 100% operacionais no modo `standalone`.
- **Tempo:** Deploy realizado via `firebase deploy --only hosting` em aproximadamente 40 segundos.
- **Commit:** `feat(etapa-2): exportacao estatica do frontend e deploy inicial no hosting`

---

## 5. Etapa 3 - Emulator Suite
- **Configuração dos Emuladores:** Bloco `emulators` estruturado no `firebase.json` ativando as portas `5000` (Hosting), `8080` (Firestore) e `4000` (UI de Gerenciamento do Emulator Suite).
- **Fonte de Dados:** Configurada no código a verificação via `NEXT_PUBLIC_USE_EMULATOR` para integrar ao Firestore local através de `connectFirestoreEmulator(db, '127.0.0.1', 8080)`.
- **Regras:**
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
- **Leitura Permitida / Escrita Negada:** Validadas com sucesso através da interface visual em `localhost:4000`, confirmando a listagem dos dados e a rejeição de gravações não autorizadas.
- **Commit:** `feat(etapa-3): integracao com firebase emulator suite e regras do firestore`

---

## 6. Etapa 4 - Firestore de Produção e Versão B
- **Regras Publicadas:** Aplicadas na nuvem via comando `firebase deploy --only firestore:rules`.
- **Dados de Produção:** Cadastrados manualmente no Console do Firebase os 3 documentos semente na coleção `items` (`item-1`, `item-2`, `item-3`).
- **Canal da Versão B:** Alteração visual publicada em canal de pré-visualização isolado executando `firebase hosting:channel:deploy versao-b --expires 7d`.
- **Teste `permission-denied`:** Disparada uma requisição de gravação via cliente e confirmada a recusa imediata pelo Firestore com a mensagem **`Bloqueado com sucesso: permission-denied`**.
- **Rollback:** Testado o recurso de gestão de lançamentos do Firebase Hosting, revertendo com sucesso a versão ativa no painel para a versão estável anterior.
- **Commit:** `feat(etapa-4): firestore de producao, canal versao-b e teste de regras`

---

## 7. Etapa 5 - CD com GitHub Actions
- **Workflow:** Dois pipelines criados na pasta `.github/workflows/`:
  - `firebase-hosting-pull-request.yml` (para geração de previews em Pull Requests)
  - `firebase-hosting-merge.yml` (para deploy automático em produção no merge para a `main`)
- **Preview em PR:** Ao abrir um PR na branch `feature/teste-cicd`, a Action executou a instalação de dependências (`npm ci --legacy-peer-deps`), efetuou o build com Node 20 e gerou um comentário automatizado no PR com o link de visualização.
- **Deploy no Merge:** A aprovação do merge disparou a pipeline da `main`, atualizando o ambiente `live` de produção.
- **Teste de Fumaça (Smoke Test):** Etapa com `curl --fail https://projetoogus.web.app` adicionada ao workflow do merge para confirmar que o site responde HTTP 200 após a publicação.
- **Reflexão sobre a Chave JSON:** A utilização de chave Service Account via GitHub Secrets é funcional e segura para repositórios individuais. No entanto, em cenários corporativos, o padrão recomendado é o **Workload Identity Federation (WIF)**, pois elimina o uso de credenciais estáticas de longa duração e utiliza autenticação temporária de curta duração baseada em tokens confiaveis emitidos pelo GitHub OIDC.
- **Commit:** `ci(etapa-5): esteira de cd com github actions, preview em pr e smoke test`

---

## 8. Desenho de Produção Gerenciada (Somente no Papel)

| Componente da Semana 5 | Serviço Gerenciado Equivalente | O que você precisaria configurar |
| :--- | :--- | :--- |
| **Backend Django (Gunicorn)** | Cloud Run | Imagem do contêiner, porta de escuta, variáveis de ambiente, conta de serviço e escala mínima (0) e máxima. |
| **Imagens no GHCR** | Artifact Registry | Repositório privado no GCP e permissão IAM de leitura de imagens para o Cloud Run. |
| **PostgreSQL** | Cloud SQL (PostgreSQL) | Instância gerenciada, VPC Peering/Connector para acesso seguro a partir do Cloud Run, usuários, bancos e rotinas de backup. |
| **Arquivo .env** | Secret Manager | Armazenamento criptografado de credenciais sensíveis e atribuição do papel `Secret Accessor` para a conta de serviço do Cloud Run. |
| **Nginx** | Firebase Hosting (com rewrites) | Configuração de rewrites em `firebase.json` direcionando rotas da API (`/api/*`) diretamente para a URL do serviço no Cloud Run. |
| **Chaves no GitHub** | Workload Identity Federation | Configuração do pool de identidade OIDC no GCP limitando o acesso estritamente à organização e repositório do GitHub. |

- **Custo Mensal Estimado:** Aproximadamente USD $10,00 a $25,00/mês (custos concentrados principalmente na instância mínima do Cloud SQL PostgreSQL).
- **Por que o Spark não permite:** O plano Spark é limitado a produtos serverless totalmente gerenciados com cotas gratuitas diárias que chegam a zero sem necessidade de reserva de infraestrutura. Serviços como Cloud Run, Cloud SQL e Secret Manager exigem conta de faturamento (Plano Blaze) devido à possibilidade de alocação de recursos dedicados ou escalonamento tarifado.

---

## 9. Custo Zero e Limites
- **Plano:** Spark (Totalmente gratuito e sem cartão cadastrado).
- **Cotas Usadas:** Firebase Hosting (armazenamento estático e transferência de dados) e Cloud Firestore (operando dentro dos limites de 50.000 leituras/dia).
- **Serviços NÃO Habilitados:** Cloud Run, Cloud Functions, Secret Manager, Cloud SQL e App Hosting.

---

## 10. Validação Final
- **Comandos Executados:**
  - `firebase emulators:start`
  - `npm run build`
  - `firebase deploy --only hosting,firestore:rules`
  - `firebase hosting:channel:deploy versao-b`
  - `curl --fail https://projetoogus.web.app`
- **Resultados:** Frontend estático publicado e servido via CDN, integração em tempo real com banco de dados NoSQL Cloud Firestore, regras de escrita negada funcionando, canais de preview operacionais e esteira de CI/CD automatizada com GitHub Actions e teste de fumaça.
- **Limitações Conhecidas:** A hospedagem no modo `export` limita o uso de funcionalidades dinâmicas do servidor Node.js/Next.js (como Server-Side Rendering e rotas de API dinâmicas em tempo de execução no frontend).

---

## 11. Histórico Git

| Etapa | Commit | Descrição |
| :---: | :---: | :--- |
| **1** | `feat(etapa-1): configuracao inicial do projeto firebase spark e cli` | Inicialização dos arquivos de configuração e estrutura do Firebase no projeto. |
| **2** | `feat(etapa-2): exportacao estatica do frontend e deploy inicial no hosting` | Configuração da chave `STATIC_EXPORT` e deploy inicial no Hosting. |
| **3** | `feat(etapa-3): integracao com firebase emulator suite e regras do firestore` | Adição dos emuladores locais e configuração do arquivo `firestore.rules`. |
| **4** | `feat(etapa-4): firestore de producao, canal versao-b e teste de regras` | Ativação do Firestore em produção, teste `permission-denied` e canal de pré-visualização. |
| **5** | `ci(etapa-5): esteira de cd com github actions, preview em pr e smoke test` | Criação das automações de CI/CD com GitHub Actions e inclusão do teste de fumaça. |