# Semana 2

- Anotações do meus estudos de arquitetura para fazer a atividade 2 da segunda semana do Ciclo 1 do makers

## Sobre arquitetura

- O que é arquitetura de software:
    - O conjunto de príncipios, normas e técnicas usadas a construção software. Em outras palavras, se refere a estrutura fundamental de um software
    - A arquitetura de software foca em como os componentes de um sistema interagem entre si 

### Arquiteturas mais usadas 

#### Model-view-Controller(MVC)

- Trabalha com três tipos de componentes
    1. Model: Trabalha com os dados da aplicação, onde as régras de negócio são aplicadas
    2. View: A parte que exibe os dados para os cliente e permite que ele interaja com a aplicação
    3. Controller: Quem intermedia os dois anteriores, faz o controle das informações que transitam entre o Model e views

- Esse padrão é muito útil para projetos pequenos mas problemática para escalabilidade

#### Arquitetura em camadas

- Uma arquitetura que separa as resposábilidades do sistema em camadas horizontais. 
    - Uma camada é uma abstração lógica que organiza o sistema em níveis hierárquicos onde:
        1. Cada camada depende apenas da camada inferior
        2. Camadas supeiores delegam tarefas para camadas abaixo
        3. Cada camada tem responsabilidades específicas 
    - Essas divisões de responsábilidades precisam ser bem claras e documentadas
- Algumas fontes falam que o modelo não possue um numero máximo de camadas que podem ser usadas, por isso depende do bom senso dos desenvolvedores. 

EX De camadas:
1. Controller(gerência Requisições e respostas do fluxo)
2. Service (Responsável por toda a regra de negócios)
3. Repositóry Responsável pelas operações com banco de dados
4. Entity (Representação das entidades)

- OBS: Organização de pacotes são EAPs de Projeto e na Arquitetura
 