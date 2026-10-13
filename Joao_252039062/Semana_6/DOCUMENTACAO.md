* **Evidência:** Execução de `firebase emulators:start --import=./emulator-data` comprovando dados renderizados em `http://localhost:5000` e rejeição de escrita `permission-denied` registrada no painel de Requests da UI em `http://localhost:4000`. *(Inserir print das evidências)*.
* **Commit:** `c88fb232eadbc7c44e66c6a41f8dcb5690fba480`

## 6. Etapa 4 – Firestore de Produção e Versão B
* **Regras Publicadas:** Publicação em produção através do comando `firebase deploy --only firestore:rules`.
* **Dados de Produção:** Três registros cadastrados no console web da coleção `items` ("Configurar Docker", "Automatizar CI", "Publicar no GHCR"), renderizados com sucesso na URL de produção `https://desafio-devops-a22de.web.app`.
* **Canal da Versão B:** Deploy publicado no canal temporário de preview: `https://desafio-devops-a22de--versao-b-05wlf3vr.web.app` com tempo de expiração de 7 dias.
* **Rollback:** Procedimento de rollback e histórico de versões testado e validado através do console do Firebase Hosting. *(Inserir print do histórico de releases do console)*.
* **Commit:** `8dfc07885332666a9a4b91a312282bd7006b7fc1`

## 7. Etapa 5 – CD com GitHub Actions
* **Workflow:** Workflows automatizados criados em `.github/workflows/`:
- `firebase-hosting-pull-request.yml`: Disparado na abertura de PRs, criando canais de visualização temporários para validação prévia.
- `firebase-hosting-merge.yml`: Disparado após o merge na branch principal (`main`/`master`), executando deploy automático no canal `live`.
- **Fail-Fast:** Ambos os workflows exigem dependência explícita `needs: [test-backend, test-frontend]` para que o deploy só ocorra se os testes de unidade e o linter da Semana 5 passarem 100%.
- **Concorrência:** Configurado `concurrency` com `cancel-in-progress: true` no nível do workflow para cancelar execuções antigas e impedir conflitos de deploy simultâneo.
* **Evidências:** Pull Request validado com canal de preview automático gerado via bot do Firebase e merge concluído com sucesso. *(Inserir link/print do PR #2: https://github.com/JVZerinho/desafio-devops/pull/2)*.
* **Smoke Test:** Etapa de validação pós-deploy adicionada via `curl --fail --retry 3 https://desafio-devops-a22de.web.app || exit 1`.
* **Reflexão sobre a Chave JSON:** O uso de chave estática de conta de serviço (Service Account JSON) em GitHub Secrets é aceitável em projetos acadêmicos e pipelines pontuais. Entretanto, em escala corporativa, representa vetor crítico de risco devido ao perigo de exfiltração acidental e ausência de rotação automática. O padrão de referência da indústria é o **Workload Identity Federation (WIF)**, que utiliza tokens temporários baseados em OIDC (*OpenID Connect*), eliminando completamente o armazenamento de chaves permanentes.
* **Commit:** `b9a5797d497da97b9c641e9b6b7f9759923f3ecf`

## 8. Desenho de Produção Gerenciada

### Tabela de Equivalências Arquiteturais:
| Componente / Função | Semana 5 (Docker Local / VPS) | GCP / Firebase (Produção Gerenciada) | Vantagens da Solução Nuvem |
|---|---|---|---|
| **Frontend Web** | Contêiner Docker Next.js (Node 20 Standalone) | **Firebase Hosting (Edge CDN)** | Distribuição global em borda, latência reduzida, SSL automático |
| **Backend / API** | Contêiner Docker Django (Python + Gunicorn) | **Google Cloud Run (Serverless)** | Auto-scaling até zero, sem provisionamento de VMs, alta disponibilidade |
| **Banco de Dados** | Contêiner Docker PostgreSQL 16 Alpine | **Cloud Firestore** / **Cloud SQL** | Alta escalabilidade horizontal, replicação automática, backups contínuos |
| **Reverse Proxy / SSL** | Contêiner Docker Nginx com certificados autoassinados | **Google Cloud Load Balancer / Firebase SSL** | Certificados TLS gerenciados e renovados pelo Google, HTTP/2 e HTTP/3 |
| **CI / CD & Registry** | GitHub Actions + GitHub Container Registry (GHCR) | **GitHub Actions + Firebase Hosting Deploy** | Deploy atômico, canais de preview por PR e rollback instantâneo |

### Estimativa de Custo Mensal:
* **Firebase Hosting:** R$ 0,00 (dentro do limite gratuito de 10 GB de armazenamento e 360 MB/dia de transferência de dados).
* **Cloud Firestore:** R$ 0,00 (dentro do limite diário gratuito de 50.000 leituras, 20.000 gravações e 1 GB de armazenamento).
* **Certificados SSL e Domínios `.web.app`:** R$ 0,00 (provisionamento e renovação automática 100% gratuitos).
* **GitHub Actions Runners:** R$ 0,00 (franquia gratuita de 2.000 minutos/mês).
* **Total Estimado Mensal:** **R$ 0,00 / US$ 0,00**.

### Justificativa dos Limites do Plano Spark:
O plano Spark (gratuito) atende perfeitamente ao projeto por se tratar de uma aplicação de dados estáticos com consumo de banco em baixa volumetria. Ao migrar os ativos estáticos para o Firebase Hosting e adotar o Firestore para leitura de documentos simples, eliminou-se a necessidade de manter instâncias computacionais contínuas (como Compute Engine ou Cloud SQL dedicado), atingindo alta disponibilidade e resiliência com orçamento zero.

## 9. Custo Zero e Limites
* **Plano:** Spark confirmado.
* **Cotas Usadas:** Menos de 1% da cota diária de leituras/escritas do Firestore e menos de 5% da cota mensal de transferência do Hosting.
* **Serviços NÃO Habilitados:** Cloud Run, Cloud Functions, Cloud SQL, Secret Manager, Cloud Storage (evitando qualquer cobrança acidental).

## 10. Validação Final
* **Comandos Executados:** `firebase deploy`, `firebase hosting:channel:deploy versao-b`, `curl -I https://desafio-devops-a22de.web.app`, pipelines do GitHub Actions com Smoke Test integrado.
* **Resultados:** Aplicação publicada sob protocolo HTTPS no domínio global `https://desafio-devops-a22de.web.app`, com canal de testes ativo em `https://desafio-devops-a22de--versao-b-05wlf3vr.web.app`.
* **Limitações:** O backend relacional Django/PostgreSQL original da Semana 5 é mantido no ambiente conteinerizado local para não gerar custos de instâncias no Google Cloud SQL.

## 11. Histórico Git
| Etapa | Commit | Descrição |
|---|---|---|
| 1 | `6bd6d09fa5bea5aa6f0a7df9a4d3ab57d267b085` | feat(firebase): inicializacao do hosting e firestore sob o plano spark |
| 2 | `72c7ad3ba41db7b2d7f4388ba34944b31df236bd` | feat(hosting): suporte a exportacao estatica e primeiro deploy no firebase hosting |
| 3 | `c88fb232eadbc7c44e66c6a41f8dcb5690fba480` | feat(emulators): integracao do local emulator suite e regras de acesso ao firestore |
| 4 | `8dfc07885332666a9a4b91a312282bd7006b7fc1` | feat(prod): firestore ativado em producao e publicacao da versao-b em canal |
| 5 | `b9a5797d497da97b9c641e9b6b7f9759923f3ecf` | ci(cd): pipeline automatizado com github actions preview de pr e smoke test |
