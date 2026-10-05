# Semana 6 - Do Container a Nuvem (GCP e Firebase)
## 1. Identificacao
- Aluno(a): Marcelo Vitor Machado da Silva Filho 
- Repositorio: https://github.com/marcelovitorfilho/container-dev-a-deploy.git
- URL de producao: https://container-dev-a-deploy.web.app
- URL do canal (Versao B): https://container-dev-a-deploy--versao-b-doosn1oi.web.app/
## 2. Arquitetura
- Diagrama:  
Usuário -> Firebase Hosting (Frontend feito com Next.js) -> Cloud Firestore
Desenvolvimento local: Docker Compose -> Next.js, Django, PostgreSQL.
Testes da etapa 3: Firebase Emulator -> Firestore (8000), Hosting (5000) e UI (4000)
- Fluxo de requisicao: Na prática, em produção o usuário acessa a aplicação direto pelo Firebase Hosting. O Next.js tá rodando como site estático (com `STATIC_EXPORT=true`) e o próprio frontend chama o SDK do Firebase pra buscar os dados da coleção items no Firestore. Já localmente, se mantem a mesma estrutura do Docker Compose da Semana 5 rodando Next.js, Django e Postgres. Inclusive, compilando os testes com o Emulator Suite, o frontend normalmente o Firestore local rodando na porta 8080.
- O que continua no Docker local: Ambiente completo da semana 5 (Frontend Next.js, Backend Django, PostgreSQL).
## 3. Etapa 1 - Projeto e CLI
- Plano Spark (evidencia): Projeto feito apenas no plano Spark, sendo compilado sem nenhum custo usando apenas cotas gratuitas. 
- Arquivos de configuracao:
```
firebase.json
firestore.rules
firestore.indexes.json
.firebaserc
.env.example
```
Além dos Workflows do GitHub Actions.
- Higiene do Git: Arquivo `.env` e arquivos que não podem ser divulgados ficam fora do repositório por causa do `.gitignore`.
- Commit: etapa 1 - semana 06.
## 4. Etapa 2 - Deploy mais rapido
- Modo de exportacao:
- Estado de erro amigavel:
- Semana 5 continua funcionando:
- Tempo (opcional):
- Commit: etapa 2 concluida - semana 06.
## 5. Etapa 3 - Emulator Suite
- Configuracao dos emuladores:
- Fonte de dados:
- Regras:
- Leitura permitida / escrita negada:
- Commit: etapa 3 concluida - semana 06.
## 6. Etapa 4 - Firestore de producao e Versao B
- Regras publicadas:
- Dados de producao:
- Canal da Versao B:
- Rollback:
- Commit: etapa 4 concluida - semana 06.
## 7. Etapa 5 - CD com GitHub Actions
- Workflow:
- Preview em PR:
- Deploy no merge:
- Teste de fumaca:
- Reflexao sobre a chave JSON:
- Commit: etapa 5 concluida - semana 06.
## 8. Desenho de producao gerenciada
| Componente | Servico equivalente | Configuracao |
|---|---|---|
- Custo mensal estimado: 
- Por que o Spark nao permite:
## 9. Custo zero e limites
- Plano: Firebase Spark.
- Cotas usadas: Foi usado 0,1% da cota de Leituras (sendo usado 73 leituras tendo cota máxima sem custo como 50 mil por dia). Foram usados também 2MB de downloads de 10 GB/mês do Hosting, foram feitas 6 gravações de 20 mil diárias sem custo adicional e 5 exclusões das 20 mil gratuitas dadas diariamente.
- Servicos NAO habilitados: Nenhum serviço que seja pago ou exija colocar métodos de pagamento (como cartão de crédito).
## 10. Validacao final
- Comandos executados:
```
firebase init hosting:github
firebase deploy --only firestore:rules
firebase deploy --only hosting
firebase hosting:channel:deploy versao-b --expires 7d
npm ci
STATIC_EXPORT=true npm run build
firebase emulators:start
git diff --check
git status --short
git push origin main
```
- Resultados: Firebase Hosting publicado corretamente, dados carregano no frontend, tanto a versão A e a B estão funcionando, o Rollback foi feito com sucesso, preview gerado a partir dos PR's, deploy de produção automático após merge e aplicação da semana 5 foi preservada(funciona ainda normalmente).
- Limitacoes: Limitação por cotas gratuitas do Firebase (plano Spark). Django continua rodando no docker local pelo plano Spark não incluir Cloud Run ou Cloud SQL.
## 11. Historico Git
| Etapa | Commit | Descricao |
|---|---|---|
|1| etapa 1 - semana 06 | Configuração básica do Firebase e versionamento de códigos |
|2| etapa 2 concluida - semana 06| Static Export e ajustes no frontend para o Hosting|
|3| etapa 3 concluida - semana 06| Firebase Emulator Suite e regras do Firestore |
|4| etapa 4 concluida - semana 06| Cloud Firestore no modo de produção, com versão A e B fazendo uma reversão (Rollback) e adição de tentativa de gravar documento (permission-denied) |
|5| etapa 5 concluida - semana 06| CD com GitHub Actions, preview e deploy automático|
