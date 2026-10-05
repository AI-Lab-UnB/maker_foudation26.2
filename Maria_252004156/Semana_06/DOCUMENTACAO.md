# Semana 6 - Do Container a Nuvem (GCP e Firebase)

## 1. Identificacao
- Aluno(a): Maria Júlia Sena
- Repositorio: https://github.com/mariajulia-senaa/projeto-semana5
- URL de producao: https://mariajuliasena.web.app
- URL do canal (Versao B): https://mariajuliasena--versao-b-1k1zcptq.web.app/

## 2. Arquitetura
- Diagrama: Conforme validação com a monitoria, a representação gráfica foi substituída pela descrição textual do fluxo de requisição abaixo.
- Fluxo de requisicao: O navegador do cliente faz a requisição ao Firebase Hosting, que serve os arquivos estáticos (HTML/CSS/JS exportados do Next.js). O frontend em execução no navegador consome os dados diretamente do banco de dados Cloud Firestore através da rede.
- O que continua no Docker local: O backend em Django (Gunicorn) e o banco de dados relacional PostgreSQL continuam operando exclusivamente no ambiente local (contêineres Docker).

## 3. Etapa 1 - Projeto e CLI
- Plano Spark (evidencia): Validado no painel de faturação do Firebase console que o projeto está ativado no plano Spark (gratuito), cumprindo estritamente a regra de custo zero.
- Arquivos de configuracao: Foram gerados e versionados os ficheiros `firebase.json`, `.firebaserc` e `firestore.rules`.
- Higiene do Git: Chaves JSON, ficheiros `.env` (contendo variáveis de ambiente sensíveis) e `firebase-debug.log` foram incluídos no `.gitignore`, garantindo que não subam para o repositório.
- Commit: df36158

## 4. Etapa 2 - Deploy mais rapido
- Modo de exportacao: Configurado no ficheiro do Next.js utilizando a variável de ambiente: `output: process.env.STATIC_EXPORT === 'true' ? 'export' : 'standalone'`.
- Estado de erro amigavel: O frontend foi ajustado para apresentar a mensagem de "Dados indisponíveis" de forma amigável ao utilizador quando não consegue comunicar com o banco de dados na nuvem.
- Semana 5 continua funcionando: A variável de ambiente permite que o build padrão continue como `standalone`, sem quebrar o pipeline de contêiner da Semana 5.
- Commit: 153f3aa

## 5. Etapa 3 - Emulator Suite
- Configuracao dos emuladores: Definidos no `firebase.json` (Hosting na porta 5000 e Firestore na porta 8080).
- Fonte de dados: Gerida via `NEXT_PUBLIC_DATA_SOURCE`, devolvendo o formato `{ "status": "ok", "items": [...] }`.
- Regras: Configuração para testes com permissão de leitura total e escrita bloqueada (`allow read: if true; allow write: if false;`).
- Leitura permitida / escrita negada: Testado no Firebase Emulator Suite: o carregamento dos itens na página funcionou corretamente (leitura permitida), mas a tentativa de gravação resultou num erro `permission-denied` (escrita negada), visível na consola.
- Commit: 8a6c4a0

## 6. Etapa 4 - Firestore de producao e Versao B
- Regras publicadas: Regras enviadas para produção utilizando o comando `firebase deploy --only firestore:rules`.
- Dados de producao: Os 3 itens iniciais foram inseridos manualmente no painel de produção do Cloud Firestore e carregaram com sucesso na página pública.
- Canal da Versao B: Deploy temporário gerado através do comando `firebase hosting:channel:deploy versao-b --expires 7d`.
- Rollback: Validado no histórico de versões do Firebase Hosting. A Versão B foi publicada e, de seguida, revertida com sucesso para o deploy anterior utilizando a interface da plataforma.
- Commit: [INSERIR O SEU HASH DA ETAPA 4 AQUI]

## 7. Etapa 5 - CD com GitHub Actions
- Workflow: O ficheiro `firebase-hosting-merge.yml` foi configurado com `needs: lint_and_test`, `concurrency` e variável de compilação `STATIC_EXPORT=true`.
- Preview em PR: Configurado com sucesso via `firebase-hosting-pull-request.yml` e Secrets do GitHub.
- Deploy no merge: Atualiza automaticamente a produção (branch main).
- Teste de fumaca: Inserido o passo `run: curl --fail https://mariajuliasena.web.app` ao final do workflow.
- Reflexao sobre a chave JSON: É aceitável para protótipos e entregas académicas usar a chave JSON gerada nos Secrets do GitHub (pois ficam encriptadas em repouso), mas em ambientes corporativos de produção, a autenticação sem chave (*Workload Identity Federation*) é superior. O WIF evita que existam chaves estáticas de longa duração gravadas e cria credenciais temporárias de curto prazo via OIDC, mitigando severamente o risco de vazamento ou roubo de credenciais.
- Commit: 8d4c5bd

## 8. Desenho de producao gerenciada
| Componente | Servico equivalente | Configuracao |
|---|---|---|
| Backend Django (Gunicorn) | Cloud Run | Porta do contêiner, conta de serviço própria, escala mínima e máxima. |
| Imagens no GHCR | Artifact Registry | Promoção da imagem por SHA de commit. |
| PostgreSQL | Cloud SQL | Conexão segura, migrações em job separado, backups. |
| Arquivo .env | Secret Manager | Papel de acesso somente ao segredo necessário. |
| Nginx | Firebase Hosting | Rewrite para o Cloud Run, mesma origem para o navegador, limites de cookies. |
| Chaves no GitHub | Workload Identity Federation | Condição de atributo restrita ao seu repositório. |

- Custo mensal estimado: Entre 15 e 30 dólares por mês, principalmente devido ao valor fixo da instância do Cloud SQL. O Cloud Run e Artifact Registry operam sob demanda com impacto marginal.
- Por que o Spark nao permite: O plano gratuito (Spark) é restrito a serviços serverless/BaaS (Hosting, Firestore, Auth). Não permite alocação de poder de computação contínuo (Cloud Run) nem bases de dados relacionais (Cloud SQL), exigindo uma conta com faturação (Blaze) para prevenir abusos de infraestrutura.

## 9. Custo zero e limites
- Plano: Spark (Totalmente sem custos e sem cartão de crédito).
- Cotas usadas: Armazenamento básico no Hosting, cota diária de leituras e escritas do Firestore, limite de tempo no GitHub Actions.
- Servicos NAO habilitados: Cloud Run, Artifact Registry, Cloud SQL, Secret Manager, Cloud Functions.

## 10. Validacao final
- Comandos executados: `firebase login`, `firebase init hosting:github`, `firebase emulators:start`, `npm run build`, `firebase deploy`, comandos Git.
- Resultados: Site estático distribuído e protegido, integração contínua implementada (falhando e impedindo deploys em caso de erros) e dados NoSQL consumidos da nuvem com sucesso.
- Limitacoes: O sistema final continua híbrido; as rotas originais da API Django não estão disponíveis na nuvem devido às restrições financeiras (plano Spark).

## 11. Historico Git
| Etapa | Commit | Descricao |
|---|---|---|
| Etapa 1 | df36158 | build: inicializa projeto firebase com hosting e firestore |
| Etapa 2 | 153f3aa | feat: exporta build estatico e publica no hosting |
| Etapa 3 | 8a6c4a0 | feat: configura emulador firestore e adiciona dados semente |
| Etapa 3 | f5d5e3c | feat: integra firestore e exibe itens na pagina principal |
| Etapa 4 | 1e2fa7f | feat: atualiza regras de seguranca em producao e cria versao B |
| Etapa 5 | dbf473e | feat: ajusta workflows CI/CD para Checkpoint 5 |
| Etapa 5 | 8d4c5bd | fix: remove comando de teste inexistente do CI |