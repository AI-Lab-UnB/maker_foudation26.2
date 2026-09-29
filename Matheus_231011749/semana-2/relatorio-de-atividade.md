# Semana 2

## Relatório de Atividades - Tarefas 1 e 2: Elicitação de requisitos e arquitetura de software

**Nome:** Matheus Ribeiro Szervinsk | **Matrícula:** 231011749 | **Ciclo:** 1 | **Semana:** 2

**Repositório Oficial:** `AI-Lab-UnB/maker_foudation26.2`

---

### Resumo da Atividade

Durante esta semana, elaborei o documento de elicitação de requisitos e a visão do produto para a **ConectaONG**. A solução consiste em uma plataforma de software voltada ao Terceiro Setor que visa a interação voluntária entre pessoas qualificadas em habilidades técnicas e profissionalmente com Organizações Não Governamentais. O aplicativo atua como uma rede social cívica, incentivando o ingresso de voluntários e facilitando a alocação de mão de obra para resolução de problemas específicos das ONGs.

Além disso, implementei a modelagem de um diagrama de arquitetura em camadas com base em um problema do *Architectural Katas*, focado em um sistema de gerenciamento escolar elementar (SaaS).

O pronunciado dos requisitos analisados e o diagrama resultante podem ser vistos abaixo:

Esse diagrama atende aos requisitos do Kata pois contempla a idealização do campo de frontend composto pela aplicação Web e Mobile (garantindo o requisito de acesso via dispositivos móveis), conectando-se de forma segura por meio de um API Gateway e um Identity Provider. No backend, a estrutura segue o padrão de Arquitetura em Camadas, isolando as regras de negócio em módulos específicos (Frequência, Acadêmico, Fóruns de Pais/Professores e Gerador de Relatórios) hospedados em um *Hosting Center* na nuvem (SaaS). A persistência de dados utiliza um banco de dados relacional e armazenamento em nuvem para anexos, garantindo a separação de responsabilidades e a escalabilidade exigida pela escola.

---

### Atividades Práticas Realizadas

Durante a semana, cumpri as seguintes diretrizes de estudo e entregas práticas:

* **Elicitação de Requisitos (Tarefa 1):** Preenchimento do template de Visão do Produto e Projeto para a plataforma ConectaONG, abordando contexto de negócio, diagrama de Ishikawa (6M), desafios, segmentação de clientes e viabilidade técnica.

* **Modelagem Arquitetural (Tarefa 2):** Resolução de um *Architectural Kata* projetando uma arquitetura em camadas (Apresentação, Aplicação, Domínio, Dados e Infraestrutura).

---

### Checklist de Finalização da Task

| Requisito / Etapa | Status | Descrição / Evidência |
| --- | --- | --- |
| **Conhecimento Prévio Alinhado** | Concluído | Alinhamento com o fluxo oficial de desenvolvimento do laboratório. |
| **Branch Individual Criada** | Concluído | Criação e publicação da *branch* própria no repositório remoto. |
| **Pull Request (PR) Aberto** | Concluído | PR enviado, mantido atualizado e sem conflitos. |
| **Documento de Visão Entregue** | Concluído | Template de requisitos do produto (ConectaONG) finalizado.|
| **Diagrama de Arquitetura Entregue** | Concluído | Diagrama em camadas com justificativa técnica elaborado a partir do Kata.|