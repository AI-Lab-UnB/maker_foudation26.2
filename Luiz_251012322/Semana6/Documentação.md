# Documentação Técnica - Semana 6: Do Container à Nuvem (GCP & Firebase)

## 1. Identificação do Estudante e Links do Projeto
* **Nome do Estudante:** [Luiz Felipe Mendes Cordeiro Gomes]
* **Link do Repositório (GitHub):** [https://github.com/LuizFelipe81/cicd-learning.git]
* **URL de Produção (Firebase Hosting):** [https://firebase.google.com/docs/hosting?hl=pt-br]
* **URL da Versão B (Preview Channel):** [https://semana6-c2e2c.web.app/]

---

## 2. Arquitetura da Solução
A aplicação foi migrada de um ambiente local baseado em contêineres Docker para a nuvem utilizando os serviços gerenciados do ecossistema Google Cloud / Firebase (Plano Spark).

### Fluxo de Dados e Componentes:
* **Navegador (Cliente):** Consome a aplicação estática servida pelo Firebase Hosting.
* **Firebase Hosting:** Armazena e distribui os arquivos estáticos (*assets*, HTML, JS, CSS) gerados no build estático do Next.js.
* **Cloud Firestore:** Banco de dados NoSQL totalmente gerenciado responsável por armazenar a coleção `items` e servir os dados via SDK do Firebase.
* **Docker Local (Semana 5):** Mantido intacto no repositório para execução do backend original (Django + PostgreSQL) em ambiente de desenvolvimento local.

---

## 3. Etapa 1 – Projeto Firebase & CLI
* **Status do Plano Firebase:** Confirmado e mantido no **Plano Spark (Gratuito/Zero Custo)**.
* **Arquivos de Configuração Versionados:**
  * `firebase.json`
  * `.firebaserc`
  * `firestore.rules`
* **Higiene do Git e Segurança de Credenciais:**
  O arquivo `.gitignore` foi atualizado para impedir o envio acidental de arquivos de cache do Firebase e credenciais privadas:
  ```text
  .firebase/
  *-credentials.json
  *.secret.json

## 4. Etapa 2 – o deploy mais rápido (hosting):**

 Exportação Estática do Next.js:
O arquivo next.config.mjs foi ajustado para permitir alternar dinamicamente entre o modo standalone (Semana 5) e a exportação estática (export) por variável de ambiente:

```
const isStatic = process.env.STATIC_EXPORT === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isStatic ? 'export' : 'standalone',
};

export default nextConfig;
```
Tratamento de Erro Amigável no Frontend:
Foi implementado um bloco try/catch na camada do cliente para tratar falhas de conexão de rede ou indisponibilidade de API, apresentando uma mensagem amigável de "Serviço temporariamente indisponível" sem quebrar a interface gráfica.
Manutenção da Semana 5:
A execução local via docker-compose up e o modo standalone permanecem 100% funcionais no repositório.

## 5. Etapa 3 – Emulador suite no projeto:**

Configuração do Emulator Suite:
O arquivo firebase.json foi atualizado com a porta do Firestore (8080), Hosting (5000) e UI (4000).
Regras de Segurança (firestore.rules):
Definidas para permitir leitura pública e bloquear qualquer escrita por clientes externos:

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
Evidência de Funcionamento Local:

A interface dos emuladores foi validada em http://localhost:4000.

As regras foram testadas no Rules Playground do emulador, confirmando permissão para get/list na coleção items e rejeição em operações de create/update/delete

## 6. Etapa 4 – Firestoree de produção e versão B:**

Publicação de Regras no Firestore de Produção:
Regras aplicadas com sucesso via comando firebase deploy --only firestore:rules.

Dados Iniciais:
Cadastrados 3 documentos na coleção items diretamente pelo console do Firebase.

Canal de Pré-Visualização (Versão B):
Foi criada uma variação visual no frontend e gerado o deploy no canal de preview com o comando:
firebase hosting:channel:deploy versao-b

Teste de Escrita Negada:
Tentativas de mutação/escrita diretamente via cliente do navegador foram bloqueadas e retornaram erro de permissão negada (Permission Denied).

Rollback:
Foi realizado com sucesso o teste de rollback para uma versão anterior através do painel de Histórico de Lançamentos do Firebase Hosting.

## 7. Etapa 5 – CD com Github actions:**
Integração do Pipeline:
Configurado o pipeline de Integração e Implantação Contínuas (CI/CD) com os workflows automatizados na pasta .github/workflows/.
Funcionalidades do Workflow:

Pull Requests: Gera automaticamente uma URL de pré-visualização temporária para validação das alterações.

Merge na branch main: Executa o build estático, faz o deploy automático na URL de produção e executa o teste de fumaça:

```
- name: Smoke Test
  run: curl --fail [https://seu-projeto.web.app](https://seu-projeto.web.app) || exit 1
```
Reflexão Técnica (Segurança):
Neste projeto foi utilizada a chave de conta de serviço armazenada em GITHUB_SECRETS. Em ambientes corporativos de grande escala, a melhor prática recomendada pelo GCP é utilizar a Workload Identity Federation, eliminando a necessidade de gerenciar e rotacionar chaves de longa duração (service account keys).

## 8. Desenho de produção Gerenciada (proposta teórica):**

| Componente | Servico equivalente | Configuracao |
|---|---|---|
| Backend Django (Gunicorn) | Cloud Run | Porta do contêiner (8000), conta de servico propria, escala minima e maxima |
| Imagens no GHCR | Artifact Registry | Promocao da imagem por SHA de commit |
| PostgreSQL | Cloud SQL | Conexao segura, migracoes em job separado, backups |
| Arquivo .env | Secret Manager | Papel de acesso somente ao segredo necessario |
| Nginx | Firebase Hosting + rewrite para o Cloud Run | Mesma origem para o navegador, limites de cookies |
| Chaves no GitHub | Workload Identity Federation | Condicao de atributo restrita ao repositorio |

Estimativa de Custo Mensal (Ambiente de Produção Gerenciado):
Cloud Run: ~$0,00 a $5,00/mês (dependendo do volume de requisições, coberto pelo Always Free).

Cloud SQL (db-f1-micro): ~$7,00 a $12,00/mês.

Firebase Hosting / Artifact Registry: ~$0,00/mês (dentro das cotas gratuitas).

Total Estimado: ~$10,00 a $15,00 USD / mês.

## 9. Custo zero e limites do plano shark:**

Garantia de Gratuidade: Todo o desenvolvimento e entrega desta semana foram realizados sem cadastrar cartão de crédito e utilizando apenas a cota gratuita do Plano Spark.

Limites de Cota Monitorados:

Firebase Hosting: Através do limite de 10 GB de armazenamento e 360 MB/dia de transferência.

Cloud Firestore: Dentro da cota diária de 50.000 leituras, 20.000 escritas e 1 GB de armazenamento total.

## 10. Validação Final: ##
Comandos executados para validação da solução:

npm run build (geração dos artefatos estáticos sem erros).

firebase emulators:start (validação local dos emuladores).

firebase deploy (publicação do Hosting e Regras do Firestore).

curl --fail [URL_DE_PRODUCAO] (validação de disponibilidade).

| Etapa | Commit | Descricao |
|---|---|---|
| 1 | `a642364` | Projeto Firebase (Spark), firebase init e higiene do Git |
| 2 | `dd24b7f` | Export estatico condicional e deploy no Firebase Hosting |
| 3 | `f945921` | Emulator Suite, fonte de dados por variavel e regras da colecao items |
| 4 | `dac9491` | Firestore de producao, Versao B em canal de pre-visualizacao e rollback |
| 5 | `9eb9e32` | Deploy continuo com GitHub Actions (preview em PR, deploy no merge e teste de fumaca) |
