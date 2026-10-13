
# Semana 6 — Do Container à Nuvem (GCP & Firebase)

## 1. Identificação
- **Aluno(a):** Henrique Schneider Fernandes da Rosa
- **Repositório:** https://github.com/SchneiderCode1/Lab-Makers--Fork
- **URL de Produção:** https://entrega-6-makers.web.app
- **URL do Canal (Versão B):** https://entrega-6-makers--versao-b-71a8f9.web.app

---

## 2. Arquitetura
A arquitetura do projeto evoluiu da infraestrutura local containerizada da Semana 5 para uma solução de hospedagem serverless/cloud na Semana 6, respeitando as restrições de custo zero do plano Spark:

- **Navegador (Cliente):** Acessa a aplicação web via HTTPS através do domínio gerenciado pelo Firebase Hosting.
- **Firebase Hosting:** Distribui o build estático compilado do Next.js (`output: 'export'`) via CDN global.
- **Cloud Firestore (Nuvem):** Banco de dados NoSQL gerenciado que responde a consultas diretas enviadas pelo frontend do Next.js via SDK do Firebase na porta `443`.
- **O que permanece no Docker local:** O backend Django e o banco PostgreSQL (Semana 5) continuam operacionais exclusivamente no ambiente local de desenvolvimento para não gerar cobranças no GCP.

```text
  [ Navegador / Cliente ]
           │
           ├──────────────────────────────┐ (HTTPS / Hosting)
           │                              ▼
           │                     ┌─────────────────┐
           │                     │ Firebase Hosting│ (CDN / Build Estático Next.js)
           │                     └─────────────────┘
           │ (Consultas Firestore)
           ▼
  ┌─────────────────┐
  │ Cloud Firestore │ (Banco NoSQL na Nuvem — Plano Spark)
  └─────────────────┘

  ──────────────────────────────────────────────────────────
  [ Ambiente Local — Preservado da Semana 5 ]
  ┌───────────┐      ┌───────────┐      ┌────────────┐
  │   Nginx   │ ───► │  Backend  │ ───► │ PostgreSQL │
  │  (Docker) │      │  (Django) │      │  (Docker)  │
  └───────────┘      └───────────┘      └────────────┘

```

---

## 3. Etapa 1 — Projeto e CLI

* **Plano Spark (Evidência):** O projeto `entrega-6-makers` foi criado no Console do Firebase sob o plano **Spark (Gratuito)** sem vínculo a cartão de crédito ou faturamento.
* **Arquivos de Configuração:**
* `.firebaserc`: Mapeia o alias `default` para o ID de projeto `entrega-6-makers`.
* `firebase.json`: Define as diretivas de Hosting (`public: "frontend/my-app/out"`) e o arquivo de regras do Firestore (`firestore.rules`).


* **Higiene do Git:** O arquivo `.gitignore` foi atualizado para ignorar o diretório de dados temporários do emulador (`/emulator-data`), logs de debug (`*-debug.log`), `.next` e variáveis locais (`.env.local`).
* **Commit Atômico:** `feat(semana6): etapa 1 - inicializacao do projeto firebase e higiene do git` - [HASH_E1](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/00054030de2d73431327c12f32a42fb1608ed1b6)

---

## 4. Etapa 2 — Deploy Mais Rápido (Hosting Estático)

* **Modo de Exportação:** Adicionada a flag `output: 'export'` no `next.config.ts` do Next.js, habilitando a geração de arquivos estáticos HTML/JS/CSS na pasta `out`.
* **Estado de Erro Amigável:** Implementado tratamento com `try/catch` no React (`app/page.tsx`). Na ausência do backend local, a interface exibe a mensagem amigável: *"Dados temporariamente indisponíveis. O backend remoto não respondeu à requisição."*, evitando telas em branco.
* **Semana 5 Continua Funcionando:** A variável de ambiente `$env:STATIC_EXPORT="true"` no PowerShell é usada exclusivamente para a exportação do Firebase, preservando a imagem de produção standalone do Docker/Nginx da Semana 5.
* **Commit Atômico:** `feat(semana6): etapa 2 - exportacao estatica do nextjs e deploy no firebase hosting` - [HASH_E2NF](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/f880116c4aee3cb060a3962a7422ac4d711ad61f) e [HASH_E2F](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/f974b8fb06849043319df21a70fe17d9b55819e1)

---

## 5. Etapa 3 — Emulator Suite no Seu Projeto

* **Configuração dos Emuladores:** O `firebase.json` foi estendido declarando as portas `8080` (Firestore), `5000` (Hosting local) e `4000` (Emulator Suite UI).
* **Fonte de Dados e Regras (`firestore.rules`):**
* O frontend alterna a origem dos dados via `NEXT_PUBLIC_DATA_SOURCE=firestore` e se conecta ao emulador via `connectFirestoreEmulator(db, "127.0.0.1", 8080)`.
* A regra configurada permite leitura e nega escrita para visitantes:
```rules
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




* **Leitura Permitida / Escrita Negada (Checkpoint 3):**
* Com os emuladores rodando, a página em `http://127.0.0.1:5000` renderiza os 3 itens semente (`Configurar Docker`, `Automatizar CI` e `Publicar no GHCR`).
* Tentativas de inserção via console retornam falha de permissão (`permission-denied`), confirmando a aplicação das regras.


* **Commit Atômico:** `feat(semana6): etapa 3 - emuladores do firebase, regras de seguranca e dados semente` - [HASH_E3](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/c4c6452a1ea9b124795ef096c4730b7cc0505e51)

---

## 6. Etapa 4 — Firestore de Produção e Versão B

* **Regras e Dados Publicados:** Banco de dados provisionado no modo de produção no console do Firebase (região `southamerica-east1`). Regras enviadas via `firebase deploy --only firestore:rules` e os 3 itens semente foram cadastrados na coleção `items`.
* **Canal da Versão B:** Criada a alteração visual na página (`app/page.tsx`) com a marcação *"Painel de Itens — Entrega 6 (Versão B)"* e publicado no canal de pré-visualização temporário (válido por 7 dias):
* **URL do Canal:** `https://entrega-6-makers--versao-b-71a8f9.web.app`


* **Rollback:** Testada a reversão de versão diretamente no Console do Firebase em **Hosting > Histórico de versões**, restaurando instantaneamente o deploy anterior na URL principal sem indisponibilidade.
* **Commit Atômico:** `feat(semana6): etapa 4 - firestore de producao, canal versao-b e validacao de rollback` - [HASH_E4](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/a4b000cf92e0627bf413a3666cb43d690774681a)

---

## 7. Etapa 5 — CD com GitHub Actions

* **Workflow:** Criados os arquivos de pipeline `.github/workflows/firebase-hosting-pull-request.yml` e `.github/workflows/firebase-hosting-merge.yml`.
* **Preview em PR:** Ao abrir um Pull Request para a branch `main`, o GitHub Actions executa o linter e gera automaticamente uma URL temporária de pré-visualização nos comentários do PR.
* **Deploy no Merge & Teste de Fumaça:** Ao aceitar o PR na branch `main`, a Action faz o build estático e o deploy automatizado para a produção (`live`), seguido do teste de fumaça:
```bash
curl --fail -I [https://entrega-6-makers.web.app](https://entrega-6-makers.web.app)

```


* **Reflexão sobre a Chave JSON (`FIREBASE_SERVICE_ACCOUNT`):**
* *Comparação:* O uso de chave JSON de conta de serviço armazenada nos secrets do GitHub é aceitável para o escopo deste laboratório, porém apresenta riscos em ambientes corporativos caso a chave seja vazada ou revogada de forma indevida.
* *Workload Identity Federation (WIF):* A autenticação sem chave via WIF valeria a pena em cenários de produção corporativa, pois estabelece uma relação de confiança de curto prazo baseada em OIDC entre o GitHub e o GCP, eliminando o armazenamento e a gestão de segredos estáticos de longa duração.


* **Commit Atômico:** `feat(semana6): etapa 5 - deploy continuo com github actions, teste de fumaca e desenho gerenciado` - [HASH_E5](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/180253a7e59106561e450fa8d873e20e16ac1c97)

---

## 8. Desenho de Produção Gerenciada (Somente no Papel)

Como os serviços de computação com suporte a contêineres e banco relacional exigem vinculação de faturamento/cartão de crédito, a tabela a seguir mapeia a migração equivalente da stack da Semana 5 para serviços gerenciados do Google Cloud Platform (GCP):

| Componente da Semana 5 | Serviço Gerenciado Equivalente (GCP) | O que precisaria configurar |
| --- | --- | --- |
| **Backend Django (Gunicorn)** | **Cloud Run** | Porta do contêiner (`8000`), conta de serviço IAM, escalonamento de instâncias (0 a N), variáveis de ambiente. |
| **Imagens no GHCR** | **Artifact Registry** | Repositório privado de imagens Docker, permissões IAM e promoção de imagens por SHA de commit. |
| **PostgreSQL** | **Cloud SQL (PostgreSQL)** | Tipo de instância, conexões via Cloud SQL Auth Proxy, criação de banco, migrações automáticas e backups. |
| **Arquivo `.env` / Segredos** | **Secret Manager** | Armazenamento criptografado de chaves e senhas com permissão de leitura restrita à service account do Cloud Run. |
| **Nginx (Proxy Reverso)** | **Firebase Hosting + Rewrite** | Configuração de rewrites no `firebase.json` apontando rotas `/api/**` diretamente para o serviço do Cloud Run. |
| **Chaves no GitHub Secrets** | **Workload Identity Federation** | Provedor de identidade OIDC vinculando o repositório do GitHub a papéis e permissões IAM específicas no GCP. |

* **Custo Mensal Estimado:** Aproximadamente **$15 a $35 USD/mês** (considerando uma instância mínima do Cloud SQL db-f1-micro, instâncias sob demanda do Cloud Run com uso moderado e tráfego de saída).
* **Por que o Spark não permite:** O plano Spark do Firebase/GCP é restrito a serviços serverless estáticos e NoSQL com cotas gratuitas diárias fixas. Ele bloqueia o provisionamento de infraestrutura computacional contínua (Cloud Run) e bancos relacionais dedicados (Cloud SQL), exigindo o upgrade para o plano Blaze (pague pelo que usar).

---

## 9. Custo Zero e Limites

* **Plano Utilizado:** Firebase Spark Plan (Gratuito, sem cartão de crédito).
* **Cotas Usadas:** Leitura/Escrita no Cloud Firestore dentro dos limites gratuitos de 50.000 leituras/dia e 20.000 escritas/dia; Firebase Hosting dentro do limite de 10 GB de armazenamento e 360 MB/dia de transferência.
* **Serviços NÃO Habilitados:** Cloud Run, Cloud SQL, Compute Engine, App Engine e plano Blaze.

---

## 10. Validação Final

* **Comandos Executados:**
* `$env:STATIC_EXPORT="true"; npm run build`
* `firebase emulators:start --export-on-exit=./emulator-data`
* `firebase deploy --only firestore:rules`
* `firebase deploy --only hosting`
* `firebase hosting:channel:deploy versao-b --expires 7d`
* `curl --fail -I https://entrega-6-makers.web.app`


* **Resultados:** Aplicação pública ativa, dados integrados ao Cloud Firestore, fluxo de pré-visualização em PR validado no GitHub Actions e teste de fumaça respondendo com status HTTP `200 OK`.
* **Limitações Conhecidas:** Como o backend Django e o PostgreSQL continuam rodando localmente (devido às regras de custo zero), chamadas que dependem exclusivamente de endpoints da API do Django utilizam o fallback e o tratamento amigável de erro configurado no cliente.

---

## 11. Histórico Git

| Etapa | Commit | Descrição |
| --- | --- | --- |
| **1** | [HASH_E1](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/00054030de2d73431327c12f32a42fb1608ed1b6) | `feat(semana6): etapa 1 - inicializacao do projeto firebase e higiene do git` |
| **2** | [HASH_E2F](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/f974b8fb06849043319df21a70fe17d9b55819e1) | `feat(semana6): etapa 2 - exportacao estatica do nextjs e deploy no firebase hosting` |
| **3** | [HASH_E3](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/c4c6452a1ea9b124795ef096c4730b7cc0505e51) | `feat(semana6): etapa 3 - emuladores do firebase, regras de seguranca e dados semente` |
| **4** | [HASH_E4](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/a4b000cf92e0627bf413a3666cb43d690774681a) | `feat(semana6): etapa 4 - firestore de producao, canal versao-b e validacao de rollback` |
| **5** | [HASH_E5](https://github.com/SchneiderCode1/Lab-Makers--Fork-/commit/180253a7e59106561e450fa8d873e20e16ac1c97) | `feat(semana6): etapa 5 - deploy continuo com github actions, teste de fumaca e desenho gerenciado` |

