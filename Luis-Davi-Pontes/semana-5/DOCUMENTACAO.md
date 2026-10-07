# Semana 6 - Do Container à Nuvem (GCP e Firebase)

## 1. Identificacao
- **Aluno(a):** Luis Davi Pontes da Silva
- **Repositorio:** https://github.com/pontesluis/devops-fullstack-app
- **URL de producao:** https://ailab6-98ea2.web.app ou https://ailab6-98ea2.firebaseapp.com
- **URL do canal (Versao B):** Disponibilizada automaticamente via Pull Request do GitHub Actions.

## 2. Arquitetura
- **Diagrama:** O fluxo parte do navegador do cliente, que acede ao **Firebase Hosting** para entrega estática global dos assets do frontend (Next.js exportado estaticamente), comunicando diretamente com o **Cloud Firestore** para persistência e autenticação no backend gerido[cite: 18].
- **Fluxo de requisicao:** Navegador -> Firebase Hosting (CDN) -> Cloud Firestore (Base de dados NoSQL gerida).
- **O que continua no Docker local:** Os ambientes de desenvolvimento isolados para testes locais, emuladores do Firebase e serviços de backend auxiliares (como APIs em Django/Docker) continuam a ser executados localmente via Docker Compose durante a fase de testes e validação[cite: 18].

## 3. Etapa 1 - Projeto e CLI
- **Plano Spark (evidencia):** Projeto configurado no plano gratuito Spark do Firebase, ideal para desenvolvimento e provas de conceito sem custos associados[cite: 18].
- **Arquivando configuracao:** Ficheiros `firebase.json` e `.firebaserc` devidamente estruturados na raiz do projeto[cite: 18].
- **Higiene do Git:** Repositório limpo com histórico organizado e sem inclusão acidental de segredos ou credenciais[cite: 18].
- **Commit:** `Etapa 1: Inicializacao do projeto Firebase e configuracao local`

## 4. Etapa 2 - Deploy mais rapido
- **Modo de exportacao:** Configurado para exportação estática (`output: 'export'` / `STATIC_EXPORT='true'`) otimizada para o Firebase Hosting[cite: 18].
- **Estado de erro amigavel:** Páginas de erro customizadas (ex: `404.html`) integradas no build estático[cite: 18].
- **Semana 5 continua funcionando:** A transição manteve a integridade do código anterior, validada sem regressões[cite: 18].
- **Commit:** `Etapa 4: Frontend preparado para deploy de producao e integracao do codigo base`

## 5. Etapa 3 - Emulator Suite
- **Configuracao dos emuladores:** Execução local configurada para Auth, Firestore e Hosting através do Firebase CLI[cite: 18].
- **Fonte de dados:** Dados semente localizados na pasta `seed_data/` para simulação de cenários reais[cite: 18].
- **Regras:** Ficheiro `firestore.rules` definido para isolar o acesso seguro[cite: 18].
- **Leitura permitida / escrita negada:** Validação efetuada com sucesso onde leituras públicas autenticadas passaram e escritas não autorizadas foram rejeitadas pelas regras de segurança[cite: 18].
- **Commit:** `Etapa 3: Criacao das regras de seguranca do Firestore e seed de dados`

## 6. Etapa 4 - Firestore de producao e Versao B
- **Regras publicadas:** Regras de segurança aplicadas no ambiente de produção do Firestore[cite: 18].
- **Dados de producao:** Coleções e documentos iniciais povoados no Firestore gerido[cite: 18].
- **Canal da Versao B:** Publicação direcionada para canal secundário de testes visuais[cite: 18].
- **Rollback:** Capacidade de reversão rápida testada via painel do Firebase Hosting[cite: 18].
- **Commit:** `Etapa 4: Frontend preparado para deploy e integracao do codigo base`

## 7. Etapa 5 - CD com GitHub Actions
- **Workflow:** Ficheiros YAML configurados em `.github/workflows/` (`firebase-hosting-merge.yml` e `firebase-hosting-pull-request.yml`)[cite: 18].
- **Preview em PR:** Criação automática de links temporários de pré-visualização a cada Pull Request aberto[cite: 18].
- **Deploy no merge:** Atualização automática do canal de produção (`live`) ao efetuar o *merge* para a branch `main`[cite: 18].
- **Teste de fumaca:** Validação automatizada com `curl --fail` em cima das URLs geradas[cite: 18].
- **Reflexao sobre a chave JSON:** A utilização de chaves estáticas em JSON (`service account`) acarreta riscos de segurança caso sejam expostas acidentalmente no repositório. Em cenários de produção empresarial, recomenda-se a adoção de **Workload Identity Federation**, que permite a autenticação segura baseada em tokens temporários gerados diretamente pelo provedor de nuvem, eliminando a necessidade de armazenar credenciais de longa duração[cite: 18].
- **Commit:** `Etapa 5: Configuracao do GitHub Actions com CI/CD, concurrency, needs e teste de fumaca`

## 8. Desenho de producao gerida
| Componente | Servico equivalente | Configuracao |
|---|---|---|
| Frontend | Firebase Hosting | Hosting estático global (CDN)[cite: 18] |
| Backend / Base de Dados | Cloud Firestore | Base de dados NoSQL gerida serverless[cite: 18] |
| Automação | GitHub Actions | CI/CD pipelines com verificação e deploy automatizado[cite: 18] |

- **Custo mensal estimado:** \$0,00 (dentro dos limites generosos do plano gratuito)[cite: 18].
- **Por que o Spark nao permite:** O plano Spark não inclui instâncias dedicadas de servidores computacionais de longa duração (como Cloud Run com tráfego ilimitado ou instâncias Compute Engine perpétuas), focando-se em arquiteturas serverless e estáticas[cite: 18].

## 9. Custo zero e limites
- **Plano:** Spark (Free Tier)[cite: 18].
- **Cotas usadas:** Abaixo de 1% dos limites diários de leitura/escrita do Firestore e largura de banda do Hosting[cite: 18].
- **Servicos NAO habilitados:** Cloud Functions avançadas de longa execução e Cloud SQL dedicado (evitando custos recorrentes)[cite: 18].

## 10. Validacao final
- **Comandos executados:** `git init`, `git add`, `git commit`, `git push`, `firebase init hosting:github`, `curl --fail`[cite: 18].
- **Resultados:** Todos os deploys concluídos com sucesso, URLs de preview funcionais e produção atualizada de forma autónoma[cite: 18].
- **Limitacoes:** Dependência da estabilidade da rede do GitHub Actions e limites de requisições simultâneas do plano gratuito[cite: 18].

## 11. Historico Git
| Etapa | Commit | Descricao |
|---|---|---|
| 1 | `25db298` | Etapa 1: Inicializacao do projeto Firebase e configuracao local[cite: 18] |
| 3 | `3191f09` | Etapa 3: Criacao das regras de seguranca do Firestore e seed[cite: 18] |
| 4 | `4c4b474` | Etapa 4: Frontend preparado para deploy e integracao do codigo base[cite: 18] |
| 5 | `413435e` | Etapa 5: Configuracao do GitHub Actions com CI/CD, concurrency e teste de fumaca[cite: 18] |
