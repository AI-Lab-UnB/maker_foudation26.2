# ARQUITETURA DE SOFTWARE e ARCHITECTURAL KATA

Your Architectural Kata is... E(xperimental) College Local college now offers unique non-credit courses in addition to the usual grad/undergrad courses, and they need a registration and payment system  

Requirements: 
- existing central student/class registry is NOT integratable--only https web form access allowed; 
- accept payments; 
- track registrations; 
- non-credit registrations must be duplicated in central registry (but not by hand!); 
- students enter the central registry if their payment succeeds; 
- updates/deletes from the central registry is okay as a manual process but preferably automated; 
- payments: credit card, 
- bank account withdrawal, 
- check or cash; 
- course prereqs; 
- students can request invoice/receipts and/or transcripts (which should be emailed); 
- multiple students register for multiple classes with one purchase; 
- admins must see course lists, payments, but not student personal info    

Bookmark or click this to save your kata choice

*Fonte: [architecturalkatas.com](https://www.architecturalkatas.com/kata.html) (gerado aleatoriamente).*

## 1. Kata Escolhido: E(xperimental) College

Uma faculdade oferece cursos livres (sem crédito acadêmico) além dos cursos regulares de graduação/pós, e precisa de um sistema de matrícula e pagamento. Requisitos do kata:
 - O registro central de alunos/turmas existente NÃO pode ser integrado via API, só é acessível por meio de um formulário web HTTPS.
 - O sistema deve aceitar pagamentos (cartão de crédito, débito em conta, cheque ou dinheiro).
- Deve rastrear as matrículas realizadas.
- Matrículas em cursos livres precisam ser duplicadas no registro central — mas não manualmente.
- Um aluno só entra no registro central se o pagamento for aprovado.
- Atualizações/exclusões no registro central podem ser manuais, mas de preferência automatizadas.
- O sistema deve considerar pré-requisitos de curso.
- Alunos podem solicitar fatura/recibo e/ou histórico (transcript), enviados por e-mail.
- Múltiplos alunos podem se matricular em múltiplos cursos em uma única compra (carrinho).
- Administradores devem ver listas de cursos e pagamentos, mas NÃO os dados pessoais dos alunos.

## 2. Camadas, componentes e tecnologias

O diagrama a seguir define como estão estruturadas as camadas de arquitetura da aplicação


![Arquitetura_em_camadas](Semana02/arquitetura.jpg)


- **Apresentação:** Portal do Aluno (React/Next.js, carrinho multi-curso), Portal Admin (visão de cursos e pagamentos, sem PII) e API Gateway (REST, TLS, autenticação JWT/OAuth2, rate limiting).
- **Aplicação:** Serviço de Matrícula (orquestra carrinho e valida pré-requisitos), 
    - Serviço de Pagamento (integra gateways de cartão/débito e registra cheque/dinheiro para conciliação manual), 
    - Serviço de Notificação (envio de recibo/histórico por e-mail) e Adaptador RPA de Sincronização, responsável por preencher automaticamente o formulário HTTPS do registro central legado (via automação de navegador headless, ex. Playwright).
- **Domínio:** entidades Student, Course (com pré-requisitos), Registration, Payment e Invoice; 
    - Regra de negócio central. O aluno só é sincronizado no registro central após o evento PaymentApproved; 
    - Eventos de domínio (PaymentApproved, RegistrationConfirmed) desacoplam o fluxo de pagamento da integração legada.
- **Dados:** PostgreSQL para os dados transacionais (alunos, cursos, matrículas, pagamentos), log de sincronização para auditoria e idempotência das tentativas de automação, Object Storage para os PDFs de recibo/histórico, e uma view mascarada (sem dados pessoais) para o painel administrativo.
- **Infraestrutura:** containers orquestrados em Kubernetes com pipeline de CI/CD (GitHub Actions) e Infraestrutura como Código (Terraform); 
    - Fila de mensageria com retry e dead-letter queue para tratar falhas da automação do formulário externo; 
    - Runtime de RPA isolado/sandboxed; 
    - Observabilidade (logs, métricas e alertas) para monitorar o ponto mais frágil do sistema, a automação do formulário legado.

## 3. Justificativa
A arquitetura em camadas foi escolhida porque isola o ponto mais frágil e não confiável do sistema, que é a integração com o registro central legado, acessível apenas por formulário web, em um Adaptador RPA assíncrono, executado via fila com retry e dead-letter queue, que evita que falhas nessa automação bloqueiem o fluxo principal de matrícula e pagamento. 

A camada de Domínio concentra as regras de negócio mais sensíveis do kata (validação de pré-requisitos, carrinho com múltiplos cursos e, principalmente, a regra de que a duplicação no registro central só ocorre após a aprovação do pagamento) de forma independente de frameworks, tornando essas regras fáceis de testar e auditar. 

A separação entre a camada de Dados (com uma view mascarada, sem dados pessoais) e a camada de Apresentação garante que o Portal Admin exiba apenas cursos e pagamentos, atendendo ao requisito de que administradores não vejam informações pessoais dos alunos. Um controle de acesso baseado em papéis reforça essa restrição na API Gateway. 

Por fim, a camada de Infraestrutura, com observabilidade e filas de retry, dá suporte à automação confiável da duplicação de registros (em vez de processos manuais) e à geração/envio automático de recibos e históricos por e-mail, atendendo aos requisitos funcionais e não funcionais de confiabilidade, segurança e auditabilidade do kata.