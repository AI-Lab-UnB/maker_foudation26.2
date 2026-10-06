# Semana 6 - Do Container à Nuvem (GCP e Firebase)

## 1. Identificação
- **Aluno(a):** Heitor
- **Repositório:** https://github.com/heitormontt/Semana-05-Makers-Docker.git
- **URL de produção:** https://semana-06-heitor.web.app
- **URL do canal (Versão B):** https://semana-06-heitor--versao-b-3bkohuev.web.app

## 2. Arquitetura
- **Diagrama:** 
  Navegador (Cliente) -> Firebase Hosting (Frontend Estático) -> Cloud Firestore (Base de Dados NoSQL)
- **Fluxo de requisição:** O site publicado no Firebase Hosting é carregado no navegador do utilizador. O código Next.js em React faz chamadas assíncronas diretamente ao Cloud Firestore para obter a lista de itens.
- **O que continua no Docker local:** O backend em Django (via Gunicorn), a base de dados PostgreSQL e o Nginx continuam a correr localmente em contentores, garantindo que o projeto da Semana 5 não é quebrado.

## 3. Etapa 1 - Projeto e CLI
- **Plano Spark (evidência):** Projeto criado no Firebase Console sob o ID `semana-06-heitor` no plano gratuito Spark (sem cartão associado).
- **Arquivos de configuração:** Versioned `firebase.json` e `.firebaserc`.
- **Higiene do Git:** Ficheiros sensíveis e temporários como `.env` e chaves de contas de serviço excluídos via `.gitignore`.
- **Commit:** d96f1ffa94508f3067176f3d03dddb60e55c47ea

## 4. Etapa 2 - Deploy mais rápido
- **Modo de exportação:** Frontend Next.js configurado para gerar ficheiros estáticos usando a variável de ambiente `STATIC_EXPORT="true"`.
- **Estado de erro amigável:** Implementado em `page.js` para renderizar uma mensagem de indisponibilidade caso o fetch falhe.
- **Semana 5 continua funcionando:** A diretiva `output` distingue o deploy no Firebase (estático) do Dockerfile local (`standalone`).
- **Commit:** 49bba31d21ba808ff6a50c68bebfb7b6069fecd2

## 5. Etapa 3 - Emulator Suite
- **Configuração dos emuladores:** Adicionado o bloco `emulators` ao `firebase.json` mapeando o Firestore para a porta `8080`.
- **Fonte de dados:** Variável de controlo `NEXT_PUBLIC_USE_EMULATOR=true` aplicada e dados semente exportados.
- **Regras:** Ficheiro `firestore.rules` configurado com permissão de leitura pública e escrita negada.
- **Leitura permitida / escrita negada:** Listagem verificada no emulador e testes de permissão efetuados.
- **Commit:** 26bd46249e0f07720dc2af380775ef686b6b986c

## 6. Etapa 4 - Firestore de produção e Versão B
- **Regras publicadas:** Submetidas com `firebase deploy --only firestore:rules`.
- **Dados de produção:** Coleção `items` populada com os 3 documentos via Firebase Console. Cache de ambiente resolvida e site a consumir dados reais.
- **Canal da Versão B:** Título alterado visualmente e publicado no canal temporal através de `firebase hosting:channel:deploy versao-b`.
- **Rollback:** Testado com sucesso através do painel do Firebase Hosting.
- **Commit:** 74cdca880904055059b3a4322dc71a914043daa9

## 7. Etapa 5 - CD com GitHub Actions
- **Workflow:** Configurado via `firebase init hosting:github` para automatizar o processo de CI/CD.
- **Preview em PR:** Abertura de Pull Requests gera previews automáticos.
- **Deploy no merge:** O merge para a *main* atualiza a produção de forma automática.
- **Teste de fumaça:** Implementado comando `curl -fail` no pipeline.
- **Reflexão sobre a chave JSON:** A chave estática nos Secrets funciona, mas a abordagem moderna sem chaves (*keyless*) via Workload Identity Federation é recomendada em ambientes profissionais por razões de segurança.
- **Commit:** 0d81c55563b8fc18fcd340ce75aba7df80b8c19d

## 8. Desenho de produção gerenciada

| Componente da Semana 5 | Serviço equivalente | Configuração |
|---|---|---|
| Backend Django (Gunicorn) | Cloud Run | Porta do contêiner, conta de serviço própria, escala mínima e máxima. |
| Imagens no GHCR | Artifact Registry | Promoção da imagem por SHA de commit. |
| PostgreSQL | Cloud SQL | Conexão segura, migrações em job separado, backups. |
| Arquivo .env | Secret Manager | Papel de acesso restrito ao segredo necessário. |
| Nginx | Firebase Hosting | Mesma origem para o navegador via *rewrites*. |
| Chaves no GitHub | Workload Identity Federation | Condição de atributo restrita ao repositório. |

- **Custo mensal estimado:** Utilizar os serviços reais do GCP fora da cota gratuita geraria custos operacionais devido à alocação de instâncias e bases geridas.
- **Por que o Spark não permite:** O plano Spark foca-se exclusivamente em ferramentas BaaS e Hosting estático grátis, exigindo a transição para o plano Blaze para serviços serverless ou de bases de dados relacionais na nuvem do Google.

## 9. Custo zero e limites
- **Plano:** Spark (Firebase).
- **Cotas usadas:** Transferência no Hosting e operações de leitura do Firestore dentro do teto diário gratuito.
- **Serviços NÃO habilitados:** Cloud Functions, Cloud Storage, Cloud Run, Secret Manager e faturamento do GCP.

## 10. Validação final
- **Comandos executados:** `firebase init`, `firebase deploy`, `firebase emulators:start`, `firebase hosting:channel:deploy`.
- **Resultados:** Aplicação web publicada em HTTPS de forma íntegra e conectada ao Cloud Firestore.
- **Limitações:** Uso de exportação estática em virtude da gratuidade do plano Spark, limitando renderizações dinâmicas no servidor.

## 11. Histórico Git

| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `d96f1ff` | Configuração inicial do projeto e CLI do Firebase. |
| 2 | `49bba31` | Ajuste do frontend para exportação estática e deploy no Hosting. |
| 3 | `26bd462` | Implementação do Emulator Suite e regras locais do Firestore. |
| 4 | `74cdca8` | Migração para o Firestore em produção e criação da Versão B. |
| 5 | `0d81c55` | Finalização dos canais de pré-visualização e entrega da pipeline. |