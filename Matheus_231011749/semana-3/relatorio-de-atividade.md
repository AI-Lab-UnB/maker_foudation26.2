# Semana 3

## Relatório de Atividades - Tarefas 1 e 2: Criação de Portfólio Pessoal e Consulta à PokéAPI

**Nome:** Matheus Ribeiro Szervinsk | **Matrícula:** 231011749 | **Ciclo:** 1 | **Semana:** 3

**Repositório Oficial:** `AI-Lab-UnB/maker_foudation26.2`

---

### Resumo da Atividade

Durante a terceira semana, o foco das atividades práticas foi centrado no desenvolvimento web front-end, consolidando conceitos fundamentais de HTML5 semântico, CSS3 moderno e JavaScript puro (Vanilla JS), com ênfase em manipulação dinâmica do DOM e consumo assíncrono de APIs RESTful.

Diante disso, a fim de cumprir as atividades propostas, desenvolvi duas soluções completas, sendo elas:
1. **Portfólio Pessoal (`tarefa-1/portfolio-simples`):** Uma aplicação web moderna, responsiva e com foco em usabilidade (UX/UI), apresentando trajetória profissional, links de contato e, principalmente, as metas técnicas e de pesquisa a serem aprofundadas no laboratório.
2. **Pokémon Finder (`tarefa-2/pokemon-finder`):** Uma aplicação web temática em estética *pixel art* que consome dados em tempo real da [PokéAPI](https://pokeapi.co/), permitindo buscas por nome ou identificador numérico, com animações temáticas, tratamento de estados de requisição e renderização dinâmica das características de cada criatura.

---

### Atividades Práticas Realizadas

#### 1. Portfólio Pessoal Simples (Tarefa 1)
* **Arquitetura e Interface:** Construção de uma interface *single-page* com design limpo e contemporâneo, tipografia *Plus Jakarta Sans*, paleta com contraste equilibrado e componentes em formato *squircle*.
* **Seção Hero e Dock de Navegação:**
  * Apresentação profissional com foto de perfil e *headline* destacando a atuação como Desenvolvedor Full-stack & Pesquisador de IA.
  * Implementação de uma *dock* flutuante no estilo barra de aplicativos do macOS/iOS contendo *tooltips* e links diretos para seções internas e perfis profissionais externos (GitHub, LinkedIn, Email e Portfólio Vercel).
* **Seção Sobre e Objetivos Técnicos no AI Lab:**
  * Descrição da atuação no laboratório e direcionamento das áreas de interesse em Inteligência Artificial organizadas em cartões temáticos com ícones SVG dedicados:
    * *Modelos Transformers & Deep Learning:* Estudo dos mecanismos de autoatenção (*self-attention*), treinamento e *fine-tuning* com PyTorch e Hugging Face.
    * *Google Cloud Platform & MLOps:* Uso do Vertex AI, esteiras automatizadas de implantação e conteinerização escalável com Docker.
    * *RAG & Agentes Inteligentes:* Integração com bancos vetoriais para geração aumentada por recuperação e agentes autônomos orientados a tarefas.
    * *Integração Full-Stack de IA:* Exposição de modelos via APIs de alta performance (FastAPI) e integração a interfaces reativas.
* **Interatividade com JavaScript (`script.js`):**
  * Rolagem suave (*smooth scrolling*) entre seções com atualização do histórico de navegação (`history.pushState`).
  
---

#### 2. Pokémon Finder com PokéAPI (Tarefa 2)
* **Conceito Visual e Estilização:**
  * Identidade visual retrô baseada na fonte *Press Start 2P*, botões com bordas e relevo chanfrado estilo clássico de videogame (*pixel-art*) e paleta vibrante.
* **Fluxo de Usuário e Animações:**
  * **Tela Inicial:** Apresentação da aplicação com logo oficial estilizado e chamada para ação (*CTA*).
  * **Transição com Pokébola Interativa:** Ao iniciar, a aplicação aciona uma animação em CSS (`shaking`) simulando o movimento de captura de uma Pokébola selvagem, acompanhada de mensagem dinâmica e abertura automática do modal de busca após 1.5 segundos (com suporte a reabertura por clique).
* **Consumo de API e Manipulação do DOM (`fetchApi.js`):**
  * Requisições assíncronas utilizando a Fetch API com sintaxe `async/await` conectada ao endpoint oficial: `https://pokeapi.co/api/v2/pokemon/{query}`.
  * Suporte a consultas por nome (com normalização de texto em caixa baixa) ou ID da Pokédex.
  * Tratamento de estados da requisição: indicação visual de carregamento (*loading state*), bloqueio momentâneo do botão de envio contra submissões concorrentes e tratamento de exceções com `try/catch` para exibição de mensagens amigáveis em caso de Pokémon inexistente (código HTTP 404).
* **Renderização Dinâmica dos Dados:**
  * Exibição do sprite oficial do Pokémon (priorizando versão *pixel art* frontal).
  * Formatação de nome e ID no padrão de três dígitos (ex.: `Pikachu #025`).
  * Badges coloridos dinâmicos mapeados conforme os 18 tipos existentes (elétrico, fogo, água, planta, psíquico, dragão, etc.).
  * Conversão de unidades brutas da PokéAPI para o padrão métrico internacional (altura em decímetros para metros e peso em hectogramas para quilogramas).
  * Acessibilidade e usabilidade: fechamento do modal por botão dedicado, clique na área externa do *overlay* ou tecla `Escape`.

---

### Checklist de Finalização da Task

| Requisito / Etapa | Status | Descrição / Evidência |
| --- | --- | --- |
| **Conhecimento Prévio Alinhado** | Concluído | Estudo e consolidação de boas práticas em HTML5, CSS3, DOM e Fetch API assíncrono. |
| **Branch Individual Atualizada** | Concluído | Modificações organizadas na branch `matheus-ribeiro-szervinsk`. |
| **Portfólio Pessoal Entregue (Tarefa 1)** | Concluído | Código completo em `semana-3/tarefa-1/portfolio-simples/` (HTML, CSS e JS com atalhos de teclado). |
| **Pokémon Finder Entregue (Tarefa 2)** | Concluído | Aplicação interativa em `semana-3/tarefa-2/pokemon-finder/` com consumo da PokéAPI. |
| **Consumo Assíncrono e Tratamento de Erros** | Concluído | Implementação de `fetch` assíncrono, *loading states*, tratamento de erros 404 e mapeamento de tipos/unidades. |
| **Relatório de Atividades Preenchido** | Concluído | Documentação em Markdown detalhando objetivos técnicos, ferramentas e fluxos implementados. |
| **Pull Request (PR) Pronto para Submissão** | Concluído | Estrutura de pastas padronizada e arquivos prontos para merge no repositório oficial. |