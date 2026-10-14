# Semana 6 - Do Container à Nuvem (GCP e Firebase)

## 1. Identificacao
- **Aluno(a):** Thomas Augusto Amorim de Araujo
- **Repositorio:** [https://github.com/Thomas4ugust0/PJ-AILab_SEM05](https://github.com/Thomas4ugust0/PJ-AILab_SEM05)
- **URL de producao:** https://pj-ailab-sem06-65d6f.web.app/
- **URL do canal (Versao B):** https://pj-ailab-sem06-65d6f--versao-b-ftnxwadu.web.app

## 2. Arquitetura
- **Diagrama:**
```mermaid
flowchart TD
    User([Navegador / Cliente]) --> |Acesso HTTPS / CDN| Hosting[Firebase Hosting]
    User --> |Consultas via SDK| Firestore[(Cloud Firestore)]

    subgraph Firebase Cloud (Plano Spark)
        Hosting --> |Arquivos Estáticos| Static[Next.js Export]
        Firestore --> |Regras de Segurança| Rules[firestore.rules]
    end

    subgraph Ambiente Docker Local (Semana 5 Intacta)
        Nginx[Nginx Proxy] --> Django[Django Backend]
        Django --> PG[(PostgreSQL)]
    end
    
    style Hosting fill:#ffca28,color:black
    style Firestore fill:#ffca28,color:black
```
- **Fluxo de requisicao:** O cliente acessa o Firebase Hosting que serve os arquivos estáticos gerados pelo Next.js (HTML/JS/CSS). A página frontend então realiza chamadas diretamente ao Cloud Firestore pelo navegador utilizando o SDK oficial do Firebase para exibir a lista de itens.
- **O que continua no Docker local:** O servidor Nginx, a API backend em Django e o banco de dados PostgreSQL. Essa infraestrutura da Semana 5 permanece intacta localmente para desenvolvimento e servindo a API caso não utilizássemos o Firestore.

## 3. Etapa 1 - Projeto e CLI
- **Plano Spark (evidencia):** Projeto criado no plano Spark desabilitando o Google Analytics. ID do projeto: `pj-ailab-sem06-65d6f`.
- **Arquivos de configuracao:** Inicialização feita com `firebase init`. Configurações armazenadas em `firebase.json` (apontando a public folder para `frontend/out`) e `.firebaserc`.
- **Higiene do Git:** Arquivos sensíveis e não essenciais como chaves JSON (`*.key.json`), `.firebase/`, e `firebase-debug.log` foram bloqueados através da atualização do arquivo `.gitignore`.
- **Commit:** `820b5d5`

## 4. Etapa 2 - Deploy mais rapido
- **Modo de exportacao:** O arquivo `next.config.mjs` foi configurado para gerar um build estático opcional condicionado pela variável `STATIC_EXPORT=true` (`output: process.env.STATIC_EXPORT === 'true' ? 'export' : 'standalone'`), não quebrando o container original.
- **Estado de erro amigavel:** O componente Next.js foi refatorado para `"use client"` com tratamento de falhas na chamada original do fetch para mostrar a mensagem "Erro ao conectar: dados indisponíveis" em vez de quebrar a tela branca (quando no ar).
- **Semana 5 continua funcionando:** Graças à condicional na variável de ambiente de build, o Docker de produção segue rodando perfeitamente no modo standalone.
- **Tempo:** (Deployment em poucos segundos).
- **Commit:** `cec75e1`

## 5. Etapa 3 - Emulator Suite
- **Configuracao dos emuladores:** Bloco `emulators` inserido no `firebase.json` nas portas 5000 (Hosting), 8080 (Firestore) e 4000 (UI).
- **Fonte de dados:** Código frontend mapeado para ler da variável `NEXT_PUBLIC_DATA_SOURCE`. Quando for `firestore`, o SDK utiliza o `getFirestore` do Firebase. Quando `NEXT_PUBLIC_USE_EMULATOR=true`, conecta na máquina local (127.0.0.1:8080).
- **Regras:** Regra no arquivo `firestore.rules` criada na coleção `items` para permitir leitura e bloquear a escrita.
- **Leitura permitida / escrita negada:** Testado localmente acessando o Hosting emulado.
- **Commit:** `38280b7`

## 6. Etapa 4 - Firestore de producao e Versao B
- **Regras publicadas:** Regras oficiais disparadas ao Cloud via `firebase deploy --only firestore:rules`.
- **Dados de producao:** Itens semeados cadastrados manualmente no Console Oficial do Firebase na nuvem.
- **Canal da Versao B:** Foi publicado um deploy isolado para preview channel, gerando uma URL segura temporária que vence em 7 dias sem sobrepor o ambiente de produção real.
- **Rollback:** Verificou-se pelo painel do Firebase Console na aba Hosting o histórico de deploy e a capacidade de retroceder o deploy instantaneamente pela interface gráfica caso uma subida estivesse incorreta. O botão de "Testar Invasão" confirmou que a tentativa de escrita é rejeitada por falta de autorização.
- **Commit:** `c844915`

## 7. Etapa 5 - CD com GitHub Actions
- **Workflow:** Modificado o antigo `.github/workflows/ci.yml` para absorver os processos oficiais do Firebase.
- **Preview em PR:** Um job `deploy-firebase-preview` engatilhado para os Pull Requests, isolando builds paralelos através do `concurrency`.
- **Deploy no merge:** Um job `deploy-firebase-prod` condicionado à branch principal `main`, empurrando diretamente para o Live channel após todos os testes passarem (`needs: test-frontend`).
- **Teste de fumaca:** Script bash incluído extraindo a URL de deploy nativa do script e validando com `curl --fail "$URL"`.
- **Reflexao sobre a chave JSON:** Utilizar a credencial JSON como secret para o GitHub Actions é altamente aceitável para um projeto pessoal de pequeno/médio porte por sua rapidez e facilidade de configuração em que apenas o CI tem acesso ao conteúdo. Para aplicações empresariais e ambientes rigorosos (Enterprise), o *Workload Identity Federation* deve ser padrão, visto que elimina as senhas (JSON) fixas gerando tokens temporários. Isso evita desastres permanentes em casos de vazamento.
- **Commit:** `d8921cb`

## 8. Desenho de producao gerenciada

| Componente | Servico equivalente | Configuracao |
|---|---|---|
| Imagens no GHCR | Artifact Registry | Promoção da imagem por SHA de commit. |
| PostgreSQL | Cloud SQL | Conexão segura, migrações em job separado, backups automáticos. |
| Arquivo .env | Secret Manager | Papel de acesso somente ao segredo necessário para cada serviço. |
| Backend Django | Cloud Run | Porta do contêiner configurada, conta de serviço própria conectada, escala de 0 a máxima configurada para lidar com requisições HTTP. |
| Nginx Proxy | Firebase Hosting | Rewrite configurado para o Cloud Run simulando a mesma origem para o navegador e mitigando falhas de cookies cross-domain. |

- **Custo mensal estimado:** Aproximadamente US$ 25 a 45/mês no caso de uma instância DB leve persistente, podendo subir a depender do consumo do Artifact Registry e tráfego ativo diário no Cloud Run.
- **Por que o Spark nao permite:** O plano Spark cobre exclusivamente serviços Serverless/BaaS puros fornecidos na camada Firebase (Hosting, Functions antigamente, Auth e Firestore em limites diários baixos). Qualquer produto intrinsecamente amarrado à infraestrutura Google Cloud computacional base, como Instâncias Cloud SQL ou Processamento em Cloud Run (Containers), exige ativação prévia de método de pagamento (Billing) para gerenciar excedentes de consumo computacional imprevisível.

## 9. Custo zero e limites
- **Plano:** Spark.
- **Cotas usadas:** Hosting e Cloud Firestore dentro da cota diária de leitura e armazenamento.
- **Servicos NAO habilitados:** Cloud Run, Artifact Registry, Cloud SQL, Functions (App Hosting não pôde ser ativado por exigir faturamento).

## 10. Validacao final
- **Comandos executados:**
  - `firebase init`
  - `firebase deploy --only hosting`
  - `firebase emulators:start`
  - `firebase deploy --only firestore:rules`
- **Resultados:** Arquitetura híbrida validada. Deploy do frontend via Github Actions automático na branch principal com sucesso e regras bloqueadas funcionando.
- **Limitacoes:** Limite drástico de leituras na documentação, sendo necessário muito cuidado em repetições e fetch contínuo do Firestore no plano 100% gratuito.

## 11. Historico Git
| Etapa | Commit | Descricao |
|---|---|---|
| Missão Farol | `1f30e07` | feat: concluida Missao Farol (Nivel Platina) |
| 1 | `820b5d5` | chore: setup inicial do Firebase e regras de seguranca |
| 2 | `cec75e1` | feat: implementação da etapa 2 do projeto |
| 3 | `38280b7` | feat: integracao com emulador firestore e dados semente (etapa 3) |
| 4 | `c844915` | feat: integração com a firestore |
| 5 | `d8921cb` | feat: ínicio do piipeline de automação |
