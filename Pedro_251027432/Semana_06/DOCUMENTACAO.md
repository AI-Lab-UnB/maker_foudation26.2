# Semana 6: Do Container à Nuvem (GCP e Firebase)

## 1. Identificação

**Aluno:** Pedro Oliveira Melo (usuário GitHub P3dr0-M3l0).

**Repositório:** https://github.com/P3dr0-M3l0/Makers-Semana-05

**Branch de trabalho:** semana-6, incorporada à main pelo pull request #1.

**Projeto Firebase:** Melo-Makers, plano Spark.

**URL de produção:** https://melo-makers.web.app

**URL do canal da Versão B:** https://melo-makers--versao-b-9nq48v9o.web.app (canal criado com validade de 7 dias).

**URL da visualização prévia do pull request #1:** https://melo-makers--pr1-semana-6-eu6rn1s1.web.app (expira em 12 de outubro de 2026, às 02:31 GMT).

## 2. Arquitetura

```
Semana 5 (local, Docker)                 Semana 6 (nuvem, custo zero)

   Navegador                                 Navegador
       │                                         │
       ▼                                         ▼
   Nginx (SSL, proxy)                        Firebase Hosting
       │                                     (arquivos estáticos, HTTPS)
       ▼                                         │
   Next.js (standalone)                          │ JavaScript no navegador
       │                                         ▼
       ▼                                     Firestore (coleção items)
   Django (Gunicorn)                         leitura pública, escrita negada
       │
       ▼
   PostgreSQL
```

**Fluxo de requisição:** o navegador baixa do Firebase Hosting os arquivos estáticos gerados pelo Next.js com a variável STATIC_EXPORT igual a true. O JavaScript da página usa o SDK do Firebase para ler a coleção items diretamente do Firestore, sem nenhum servidor meu no caminho. Quem decide o que pode ser lido ou escrito são as regras de segurança do Firestore.

**O que continua no Docker local:** o backend Django, o PostgreSQL, o Nginx com SSL, os Dockerfiles de produção, o docker compose e o pipeline da Semana 5 (arquivo ci.yml, com a publicação das imagens no GHCR). Nada disso foi removido. O build de contêiner de produção do frontend foi testado de novo depois das mudanças desta semana e continuou funcionando.

**Fonte de dados trocável:** a variável NEXT_PUBLIC_DATA_SOURCE escolhe de onde a página lê. Com o valor api (padrão), a página fala com o Django, como na Semana 5. Com o valor firestore, fala com o Firestore. As duas fontes devolvem o mesmo formato, com os campos status e items, então a tela não muda.

**Por que o Django não foi para a nuvem:** o plano Spark não oferece onde rodar um contêiner. Isso é detalhado na seção 8.

## 3. Etapa 1: Projeto e CLI

**Plano Spark (evidência):** o projeto Melo-Makers exibe o selo "Plano Spark" no console.

![Selo do plano Spark no console do projeto Melo-Makers](Images/plano_spark.png)

A CLI do Firebase enxerga o projeto, com ID melo-makers.

![Saída do comando firebase projects:list mostrando o projeto Melo-Makers](Images/firebase_projects_list.png)

**Arquivos de configuração versionados:** .firebaserc, firebase.json, firestore.indexes.json e firestore.rules. O firebase.json aponta o Hosting para a pasta frontend/out e registra o Firestore na localização southamerica-east1 (São Paulo), que não pode ser alterada depois que o banco existe.

**Regra aberta substituída:** o comando firebase init gerou uma regra de modo de teste que liberava leitura e escrita para qualquer pessoa até 3 de novembro de 2026. Ela foi trocada antes do commit por uma regra restrita à coleção items, com leitura pública e escrita negada, e nunca foi publicada.

**Higiene do Git:** o .gitignore passou a ignorar firebase-debug.log, a pasta .firebase, qualquer arquivo terminado em debug.log e JSONs de conta de serviço. Nenhuma chave foi colocada no repositório, e o commit foi feito listando arquivo por arquivo, sem usar git add com ponto.

**Observação:** a primeira tentativa desta etapa foi feita por engano em um clone desatualizado no WSL2 (commit 7668c42). Esse commit nunca foi enviado ao GitHub e foi descartado. A etapa foi refeita no Codespaces, onde está o repositório real.

**Commit:** 852ec2c

## 4. Etapa 2: Deploy mais rápido

**Modo de exportação:** o arquivo next.config.mjs lê a variável STATIC_EXPORT. Com o valor true, usa o modo export e gera a pasta frontend/out. Sem a variável, mantém exatamente a configuração da Semana 5: modo standalone, rewrites para o Django e allowedDevOrigins. Os rewrites ficam de fora do modo estático porque ele não os suporta.

**Estado de erro amigável:** a página confere se a resposta do servidor foi bem sucedida antes de ler o JSON. Quando a requisição falha, mostra o título "Dados indisponíveis" com uma frase explicativa, em vez de uma mensagem técnica. Na produção, como o Django não está na nuvem, esse era o comportamento esperado nesta etapa.

![Site publicado no Hosting exibindo a mensagem Dados indisponíveis](Images/site_erro_amigavel.png)

**Deploy:** o build estático (Next.js 16.3.6) compilou em cerca de 21 segundos e gerou a pasta out com index.html. O comando firebase deploy com a opção only hosting enviou 40 arquivos e terminou com "Deploy complete!". O comando curl com a opção I em https://melo-makers.web.app respondeu HTTP/2 200.

**A Semana 5 continua funcionando:** o build do Dockerfile.prod do frontend terminou com sucesso (18 de 18 etapas, cerca de 50 segundos), incluindo a cópia da pasta .next/standalone. Isso confirma que, sem a variável STATIC_EXPORT, o modo standalone permanece intacto.

**Tempo:** o build estático compilou em 20,8 segundos, e o build de contêiner de produção levou 50,1 segundos.

**Commit:** 416ceea

## 5. Etapa 3: Emulator Suite

**Configuração dos emuladores:** o firebase.json define o Hosting na porta 5000, o Firestore na 8080 e a interface na 4000. A execução usa um projeto demo, que não toca a nuvem real: firebase emulators:start com o projeto demo melo makers (ID demo-melo-makers), importando e exportando a pasta emulator-data. O emulador do Firestore exige Java, e o Codespaces já tinha o Java 21.

**Fonte de dados:** o arquivo frontend/app/lib/dataSource.js escolhe a origem dos dados pelas variáveis NEXT_PUBLIC_DATA_SOURCE e NEXT_PUBLIC_USE_EMULATOR. O modelo dessas variáveis está em frontend/.env.example, liberado no .gitignore por uma exceção. Como variáveis NEXT_PUBLIC são gravadas no código durante o build, o site estático é gerado de novo para cada ambiente. Duas decisões merecem registro:

1. Como o Codespaces foi usado pelo navegador, o endereço 127.0.0.1 aponta para o computador do aluno e não para o Codespaces. O código detecta o domínio app.github.dev e passa a falar com o emulador pela URL da porta 8080 do Codespaces.
2. Quando o Firestore não é alcançado, a biblioteca responde com dados do cache local, que aparecem como uma lista vazia. O código trata essa situação como erro, para o site mostrar "Dados indisponíveis" em vez de uma lista vazia enganosa.

**Dados semente:** os 4 itens da Semana 5 (Configurar Docker, Automatizar CI, Publicar no GHCR e Testar Hot reload), cada um com os campos titulo e ordem, foram exportados para a pasta emulator-data e versionados. Ao reiniciar o emulador com a opção de importação, os itens voltaram sem novo cadastro.

**Regras:** na coleção items, `allow read: if true;` e `allow write: if false;`.

**Leitura permitida e escrita negada (evidência):** requisições feitas ao emulador sem a credencial de administrador, portanto sujeitas às regras. A escrita foi negada com código 403 e a mensagem informa a linha da regra que barrou o pedido (a linha 6, onde está `allow write: if false;`). A leitura listou os documentos normalmente.

![Escrita negada com PERMISSION_DENIED e leitura permitida no emulador](Images/emulador_leitura_escrita_curl.png)

**Limitação da interface web:** no Codespaces aberto pelo navegador, a página Firestore da interface do emulador (porta 4000) ficou em branco, porque ela chama o endereço 127.0.0.1 do computador do aluno (o console do navegador mostrou ERR_CONNECTION_REFUSED para 127.0.0.1:8080). Por isso a prova de leitura e escrita foi feita por linha de comando, que é até mais precisa, já que o emulador cita a linha da regra.

### 5.1 Aquecimento: Missão Farol

Antes da Etapa 1, foi feita a Missão Farol completa, em uma pasta avulsa, com o projeto demo demo-farol. A visão geral do emulador mostra o Hosting na porta 5000 e o Firestore na porta 8080 ativos.

![Visão geral do Emulator Suite com Hosting e Firestore ativos](Images/farol_overview_emuladores.png)

O mural lê a coleção recados em tempo real, e os documentos aparecem tanto no painel do emulador quanto na página.

![Painel de dados do emulador ao lado do mural da Farol FM](Images/farol_dados_e_mural.png)

Com a regra reescrita para leitura pública e escrita negada, o envio pelo formulário foi bloqueado. A aba Requests do emulador registra a criação negada (marcada em vermelho), e a página exibe "Bloqueado: permission-denied".

![Aba Requests do emulador com a criação negada e o mural exibindo o bloqueio](Images/farol_requests_negada.png)

O bônus Platina (escrita permitida apenas a usuários autenticados, usando o emulador de Authentication) também foi concluído.

**Commit da Etapa 3:** 5c2ea2a

## 6. Etapa 4: Firestore de produção e Versão B

**Regras publicadas:** o comando firebase deploy com a opção only firestore:rules publicou as regras da coleção items. A aba Regras do console mostra o conteúdo publicado, com leitura permitida e escrita negada.

![Aba Regras do Firestore em produção mostrando as regras publicadas](Images/producao_regras_publicadas.png)

**Dados de produção:** o banco (default) foi criado na edição Standard, em southamerica-east1, no modo produção, e os mesmos 4 itens foram cadastrados pelo console, com os campos titulo e ordem. Para o site de produção ler o Firestore real, o build foi gerado com NEXT_PUBLIC_DATA_SOURCE igual a firestore e NEXT_PUBLIC_FIREBASE_PROJECT_ID igual a melo-makers, e sem a variável do emulador. O site passou a exibir "Status: ok" e a lista dos 4 itens.

**Escrita negada em produção:** uma tentativa de gravar um documento com curl direto na API do Firestore retornou 403, PERMISSION_DENIED, com a mensagem de permissões insuficientes.

![Escrita em produção negada com curl, código 403 e PERMISSION_DENIED](Images/producao_escrita_negada_curl.png)

A mesma tentativa feita pelo console do navegador, na página publicada, retornou permission-denied. A linha vermelha logo abaixo (ERR_BLOCKED_BY_CLIENT) indica que o navegador, provavelmente por um bloqueador de anúncios, barrou uma conexão auxiliar. O resultado relevante é a linha "RESULTADO: permission-denied".

![Console do navegador mostrando RESULTADO permission-denied em produção](Images/producao_escrita_negada_console.png)

**Canal da Versão B:** a Versão B altera só o título da página, que fica azul com o texto "Versão B". Foi publicada no canal versao-b com validade de 7 dias, em uma URL separada da produção, sem substituí-la.

**Rollback:** com a Versão B publicada na produção, foi usado o histórico de lançamentos do Hosting para voltar ao lançamento anterior. A imagem abaixo mostra o resultado depois do rollback: a produção (à esquerda) voltou ao título original, enquanto o canal (à direita) continua com a Versão B. O estado anterior ao rollback, com o título azul na produção, não foi capturado em imagem.

![Produção com o título original ao lado do canal com a Versão B em azul](Images/producao_e_versao_b.png)

**Commit:** 1208db1

## 7. Etapa 5: CD com GitHub Actions

**Workflow:** o arquivo .github/workflows/firebase-hosting.yml foi criado separado do ci.yml da Semana 5, que não foi alterado. Os jobs são encadeados com a palavra needs:

1. **test:** instala as dependências, roda o lint e os testes do frontend.
2. **build:** gera o site com STATIC_EXPORT igual a true e a configuração de produção, e guarda a pasta out como artefato.
3. **deploy-preview:** roda somente em pull request e publica em um canal de visualização prévia.
4. **deploy-live:** roda somente em push na main e publica na produção.
5. **smoke-test:** roda depois do deploy-live.

O bloco concurrency agrupa as execuções por referência e cancela as antigas apenas em pull requests, para nunca interromper um deploy de produção em andamento.

**Credencial:** o comando firebase init hosting:github pediu autorização ampla ao GitHub, com acesso a todos os repositórios públicos e privados, e redirecionava para localhost, que no Codespaces pelo navegador é o computador do aluno. Por esses dois motivos o caminho automático foi recusado, e a credencial foi criada manualmente: uma conta de serviço chamada github-deploy, com apenas três funções (Administrador do Firebase Hosting, Leitor de chaves de API e Leitor do Cloud Run). A chave JSON foi cadastrada como o secret FIREBASE_SERVICE_ACCOUNT do repositório e não foi colocada em nenhuma pasta do projeto.

**Visualização prévia em pull request:** o pull request #1 ("Semana 6: Firebase Hosting e Firestore", com 5 commits) gerou automaticamente a URL de visualização prévia, comentada no próprio pull request pelo GitHub Actions, atualizada para o commit ead75ff. Todas as verificações passaram: 12 bem sucedidas e 2 ignoradas (deploy-live e smoke-test, que por desenho não rodam em pull request). Entre as 12 estão as do pipeline da Semana 5.

![Pull request com o comentário da URL de visualização prévia e as verificações aprovadas](Images/pr_previa_e_checks.png)

**Deploy no merge:** o merge do pull request na main (commit dcc73d8) disparou o workflow sozinho. Os jobs test (45 s), build (30 s), deploy-live (31 s) e smoke-test (4 s) terminaram com sucesso, em 2 minutos no total. O deploy-preview aparece como ignorado, como esperado em um push.

![Execução do workflow no merge, com test, build, deploy-live e smoke-test aprovados](Images/actions_merge_deploy_live.png)

**Teste de fumaça:** dois passos. O primeiro faz curl com a opção fail na URL de produção e falha se o site não responder. O segundo consulta a API REST do Firestore e confere se o item "Configurar Docker" é devolvido, o que prova que o site e os dados estão no ar.

**Reflexão sobre a chave JSON:** para este projeto de estudo, a chave no secret é aceitável. O GitHub Secrets guarda o valor criptografado, o mascara nos logs e não o entrega a execuções disparadas por forks. Além disso, a conta de serviço tem só três funções e alcança apenas este projeto. Mesmo assim, é uma credencial de longa duração: se vazar, vale até alguém revogá-la, e precisa ser trocada de tempos em tempos. A autenticação sem chave, a Workload Identity Federation, troca isso por um token de vida curta, emitido a cada execução, e uma condição de atributo limita quem pode obtê-lo, por exemplo apenas este repositório e esta branch. Não existe arquivo para vazar nem para rotacionar. Ela passa a valer a pena quando há dados reais de usuários, várias pessoas ou vários projetos, exigência de auditoria, ou uma política da organização que proíba a criação de chaves de conta de serviço.

**Commit:** ead75ff (workflow). O merge do pull request na main gerou o commit dcc73d8.

## 8. Desenho de produção gerenciada

Este desenho existe somente no papel: nenhum recurso foi criado, e nenhum cartão foi cadastrado.

<table>
<thead>
<tr><th>Componente da Semana 5</th><th>Serviço equivalente</th><th>O que precisaria ser configurado</th></tr>
</thead>
<tbody>
<tr><td>Backend Django (Gunicorn)</td><td>Cloud Run</td><td>Porta do contêiner, conta de serviço própria com permissões mínimas, número mínimo e máximo de instâncias, limites de CPU e memória.</td></tr>
<tr><td>Imagens no GHCR</td><td>Artifact Registry</td><td>Repositório de imagens na mesma região e promoção da imagem pelo SHA do commit, em vez da tag latest.</td></tr>
<tr><td>PostgreSQL</td><td>Cloud SQL para PostgreSQL</td><td>Conexão segura com o Cloud Run, migrações do Django em um job separado do serviço web, backups automáticos e janela de manutenção.</td></tr>
<tr><td>Arquivo .env</td><td>Secret Manager</td><td>Um segredo para cada valor sensível, com papel de acesso somente ao segredo necessário, entregue ao Cloud Run como variável de ambiente.</td></tr>
<tr><td>Nginx</td><td>Firebase Hosting com rewrite para o Cloud Run</td><td>Mesma origem para o navegador (o caminho /api encaminhado ao Cloud Run), o que evita problemas de CORS e simplifica cookies, respeitando os limites de cookies do Hosting.</td></tr>
<tr><td>Chaves no GitHub Secrets</td><td>Workload Identity Federation</td><td>Provedor de identidade OIDC do GitHub e condição de atributo restrita ao repositório P3dr0-M3l0/Makers-Semana-05, sem chave de longa duração.</td></tr>
</tbody>
</table>

**Custo mensal estimado:** tomei como base as páginas oficiais de preço, com valores em dólares da região us-central1 (a região de São Paulo custa mais), para uma carga pequena de estudo.

1. **Cloud SQL para PostgreSQL, instância db-f1-micro:** US$ 0,0105 por hora, cerca de US$ 7,67 por mês (730 horas). Mais 10 GiB de disco SSD a cerca de US$ 0,17 por GiB, ou US$ 1,70, e backups a cerca de US$ 0,08 por GiB, até US$ 0,80. Subtotal próximo de US$ 10. A db-f1-micro usa CPU compartilhada e não é coberta pelo SLA do Cloud SQL. A db-g1-small, mais folgada, custa US$ 0,035 por hora, cerca de US$ 25,55 por mês.
2. **Cloud Run:** a franquia mensal gratuita inclui 180.000 vCPU segundos, 360.000 GiB segundos e 2 milhões de requisições. Com escala até zero e tráfego baixo, o custo tende a ficar em torno de zero. Se for mantida 1 instância mínima, o tempo ocioso é cobrado a US$ 0,0000025 por vCPU segundo e por GiB segundo: cerca de US$ 6,57 para 1 vCPU e US$ 3,29 para 0,5 GiB, perto de US$ 10 por mês, sem descontar a franquia.
3. **Artifact Registry e Secret Manager:** têm custo pequeno para este volume, mas não consultei suas páginas de preço, então não entram na soma.

**Total aproximado:** de US$ 10 por mês (Cloud Run escalando a zero) até cerca de US$ 20 por mês (com uma instância mínima), sem contar rede, Artifact Registry e Secret Manager.

**Por que o plano Spark não permite:** segundo a página oficial de planos do Firebase, o Spark oferece apenas produtos sem custo e cotas gratuitas, e não dá acesso a produtos pagos do Google Cloud. Cloud Run e Cloud SQL são produtos pagos, disponíveis somente no plano Blaze, que exige uma conta de faturamento com cartão. Por isso, nesta semana o backend Django permaneceu no Docker local.

**Fontes:**

1. [Cloud Run pricing](https://cloud.google.com/run/pricing)
2. [Cloud SQL pricing](https://cloud.google.com/sql/pricing)
3. [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)

## 9. Custo zero e limites

**Plano:** Spark durante toda a semana, comprovado pelo selo "Plano Spark" no console (imagem na seção 3). O botão "Fazer upgrade" nunca foi clicado, e nenhuma tela pediu cartão.

**Cotas usadas:** as cotas gratuitas do Firestore são de 50.000 leituras e 20.000 escritas por dia. O site lê 4 documentos por carregamento de página, e as escritas foram feitas apenas pelo console durante o cadastro dos itens. Durante os testes não houve bloqueio por cota.

**Serviços NÃO habilitados:** plano Blaze, conta de faturamento, Cloud Run, Cloud SQL, Cloud Functions, Artifact Registry e Secret Manager. Authentication e Storage também não foram usados no projeto real (o Authentication apareceu apenas no emulador, no bônus Platina). A conta de serviço github-deploy é apenas uma identidade de acesso e não gera cobrança.

## 10. Validação final

**Comandos executados e resultados:**

1. Verificação do ambiente: Node v20.20.2, Git 2.43.0 e Java 21.0.12.1 (instalado no Codespaces).
2. firebase projects:list: o projeto Melo-Makers (melo-makers) aparece na tabela.
3. Build estático com STATIC_EXPORT igual a true: pasta frontend/out gerada com index.html.
4. firebase deploy com only hosting: 40 arquivos enviados, "Deploy complete!". Resultado do curl com a opção I: HTTP/2 200.
5. docker build do frontend/Dockerfile.prod: concluído sem erro, antes e depois das mudanças das etapas seguintes.
6. firebase emulators:start com o projeto demo-melo-makers, mais firebase emulators:export para a pasta emulator-data: Hosting e Firestore ativos, dados salvos e recarregados.
7. curl no emulador sem credencial de administrador: escrita com 403 PERMISSION_DENIED e leitura permitida.
8. firebase deploy com only firestore:rules: regras publicadas, conferidas na aba Regras do console.
9. curl direto na API do Firestore de produção: 403 PERMISSION_DENIED. No console do navegador: permission-denied.
10. firebase hosting:channel:deploy versao-b com validade de 7 dias: segunda URL no ar, ao lado da produção.
11. Rollback pelo histórico de lançamentos do Hosting: produção voltou ao título original.
12. Pull request #1: URL de visualização prévia comentada automaticamente e 12 verificações aprovadas.
13. Merge na main: deploy-live e smoke-test aprovados, em 2 minutos.

**Limitações conhecidas:**

1. A interface web do Emulator Suite ficou em branco no Codespaces pelo navegador, e as provas do emulador foram feitas por linha de comando.
2. O estado anterior ao rollback não foi capturado em imagem.
3. O canal da Versão B tem validade de 7 dias, depois da qual a URL deixa de funcionar. A visualização prévia do pull request também expira (12 de outubro de 2026).
4. A primeira tentativa da Etapa 1 foi feita em um clone desatualizado no WSL2 e foi descartada, sem ter sido enviada ao GitHub.
5. O comando firebase init hosting:github foi recusado por pedir acesso amplo ao GitHub, e a credencial foi criada manualmente.
6. A instalação do firebase tools e do pacote firebase mostrou avisos de pacotes obsoletos e 9 vulnerabilidades de severidade alta em dependências do frontend. Elas não foram tratadas, porque o comando de correção forçada poderia quebrar versões e comprometer o build da Semana 5.

## 11. Histórico Git

<table>
<thead>
<tr><th>Etapa</th><th>Commit</th><th>Descrição</th></tr>
</thead>
<tbody>
<tr><td>1</td><td>852ec2c</td><td>Projeto Firebase no plano Spark, Hosting e Firestore configurados, regras restritas à coleção items e .gitignore atualizado.</td></tr>
<tr><td>2</td><td>416ceea</td><td>Exportação estática controlada pela variável STATIC_EXPORT e estado de erro amigável na página.</td></tr>
<tr><td>3</td><td>5c2ea2a</td><td>Emulator Suite, fonte de dados por variável de ambiente (dataSource.js), dados semente em emulator-data e modelo de variáveis em .env.example.</td></tr>
<tr><td>4</td><td>1208db1</td><td>Firestore de produção com regras publicadas e Versão B (título azul) publicada em canal.</td></tr>
<tr><td>5</td><td>ead75ff</td><td>Workflow firebase-hosting.yml: visualização prévia em pull request, deploy na produção no merge e teste de fumaça.</td></tr>
<tr><td>Merge</td><td>dcc73d8</td><td>Merge do pull request #1 (semana-6) na main, que acionou o deploy automático.</td></tr>
</tbody>
</table>

A base das etapas é o commit d1371cb, último da Semana 5.