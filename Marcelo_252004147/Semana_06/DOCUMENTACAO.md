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
- Modo de exportacao: O frontend agora usa Static Export no Firebase Hosting, usada no código pelo comando `STATIC_EXPORT=true`. No `next.config.mjs`, o modo `standalone` continua sendo o padrão, para não quebrar a Semana 5.
- Estado de erro amigavel: O frontend mostra uma tela de carregamento e trata erros, se der algum erro ou não conseguir acessar os dados, aparece uma mensagem de erro para o usuário ao invés de quebrar a página.
- Semana 5 continua funcionando: Sim, a configuração do `next.config.mjs` contnua rodando em modo `standalone` se o `STATIC_EXPORT` for falso(`=false`).
- Commit: etapa 2 concluida - semana 06.
## 5. Etapa 3 - Emulator Suite
- Configuracao dos emuladores: Ficou configurada o Emulator Suite no firebase.json:  
Firestore: porta 8080  
Hosting: porta 5000  
Emulator UI: porta 4000
- Fonte de dados: Quando o `NEXT_PUBLIC_DATA_SOURCE` estiver como `firestore`, o frontend busca os dados direto de lá. Se tiver rodando local e o `NEXT_PUBLIC_USE_EMULATOR` tiver como `true`, ele muda a chave e aponta direto pro emulador.
- Regras: Coleção `items` possui leitura pública e escrita negada pelos comandos: `allow read: if true; allow write: if false;`
- Leitura permitida / escrita negada: A leitura funciona normalmente. Foram cadastrados documentos para Backend Django, Frontend Next.js e PostgreSQL. As tentativas de escrita foram recusadas com PERMISSION_DENIED, o que mostra que as regras estavam valendo. 
- Commit: etapa 3 concluida - semana 06.
## 6. Etapa 4 - Firestore de producao e Versao B
- Regras publicadas: As regras foram publicadas com o comando `firebase deploy --only firestore:rules`.
- Dados de producao: Foram cadastrados três documentos na coleção `items` sendo Backend Django, Frontend Next.js e PostgreSQL, o site carrega esses dados direto do firestore.
- Canal da Versao B: https://container-dev-a-deploy--versao-b-doosn1oi.web.app  
Na Versão B foi alterado o título da página. Assim se pode notar que é possível publicar uma versão diferente sem substituir a principal.
- Rollback: Foi realizado o rollback pelo histórico de versões do Firebase Hosting, voltando a produção para a versão anterior. Isso mostrou que dá para desfazer uma publicação sem refazer o build na mão.
- Commit: etapa 4 concluida - semana 06.
## 7. Etapa 5 - CD com GitHub Actions
- Workflow: Foram criados os workflows: `firebase-hosting-pull-request.yml` e `firebase-hosting-merge.yml`. O de Pull Request roda lint, testes e build, e depois publica um preview. O de merge roda quando há push na main e faz lint, testes, build, deploy e teste de fumaça. Foi usado `needs` para manter na ordem de Lint e testes, depois Build e após isso Deploy, além disso, foi usado o `concurrency` para não rodar dois deploys ao mesmo tempo.
- Preview em PR: Abri um PR para testar o fluxo. O GitHub Actions rodou o workflow e publicou uma versão de teste no Firebase Hosting.
- Deploy no merge: Depois do merge na main, o deploy de produção rodou sozinho, sem eu precisar usar `firebase deploy`.
- Teste de fumaça: Após o fim do deploy, o workflow roda um:
```
curl --fail --silent --show-error \
  https://container-dev-a-deploy.web.app/
```
Se passar, significa que a publicação estava no ar (e no caso do teste realizado, ele passou, ou seja, estava no ar).
- Reflexao sobre a chave JSON: Guardar a chave JSON da Service Account como Secret do GitHub funciona para este projeto, porque ela não fica no repositório. Mas é uma credencial de longo tempo de uso e duração e isso é um risco para projetos maiores. O ideal seria usar autenticação sem chave, como Workload Identity Federation para assim não ser preciso guardar chave privada e as credenciais são temporárias.
- Commit: etapa 5 concluida - semana 06.
## 8. Desenho de producao gerenciada
| Componente | Servico equivalente | Configuracao |
|---|---|---|
|Django (Gunicorn)| Cloud Run |  Ajusta o Gunicorn para escutar na porta `$PORT`, cria uma conta de serviço dedicada para o backend e limita o dimensionamento de 0 (custo zero quando não está sendo usado) a 3 instâncias.|
|Imagens no GHCR| Artifact Registry | Envia a imagem etiquetada com o hash do commit via GitHub Actions e faz o deploy direto dessa tag sem precisar buildar novamente|
|PostgreSQL| Cloud SQL | Conecta o Cloud Run via canal privado do Google (sem expor o banco na internet), roda as migrações em um job isolado antes do deploy e mantém backups automáticos ativos. |
|`.env`| Secret Manager |  Armazena chaves e senhas como segredos isolados e libera leitura exclusiva para a conta do backend, injetando os valores como variáveis de ambiente na aplicação. |
|Nginx| Firebase Hosting + rewrite para o Cloud Run |O Hosting serve o site e repassa `/api/**` ao Cloud Run, então o navegador enxerga uma origem só. O Hosting descarta todos os cookies, menos o `__session`. Por isso o Django precisa usar esse nome no cookie de sessão. |
|Chaves no GitHub| Workload Identity Federation | Autentica o GitHub por tokens temporários (tirando chaves fixas salvas) e restringe as permissões de acesso estritamente ao seu repositório. |

- Custo mensal estimado: Cerca de US$ 9,50. Quase tudo é o banco: o Cloud SQL cobra a instância ligada o mês inteiro, e a menor opção do exemplo oficial custa US$ 9,37. O resto cabe nos planos gratuitos(porém por exemplo se o Hosting passar da cota gratuita ai teria um valor, no geral os serviços são cobrados por uso), menos deixar uma instância do Cloud Run sempre ligada (nesse caso elevaria o preço).
- Por que o Spark nao permite: Pois produtos pagos do Google CLoud como Cloud Run, não estão disponíveis no plano Spark, por ser necessário realizar um upgrade sendo exigido colocar um metódo de pagamento. Sem o Cloud Run não há rewrite do Hosting, e o Cloud SQL cobra a instância ligada 24 horas, sem camada gratuita.
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
