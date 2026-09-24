# Engenharia de Requisitos e jogo Ilha dos Requisitos

Nessa semana aprendi a como elicitar requisitos para a construção de um software.

A engenharia de requisitos é um dos pilares para a construção de um software, onde nela podemos colocar metas, definir limites e adaptar objetivos a certa demanda de algum cliente.

Ela funciona através de etapas iteráveis que são:

1- Elicitação de requisitos: Coleta e descoberta de necessidades e requisitos através dos stakeholders (clientes), por meio de entrevistas, conversas, oficinas e etc.

2- Análise dos requisitos: Organização, refinamento e detalhamento dos dados obtidos. Nesse passo que resolvemos conflitos e ambiguidades, nele também definimos os requisitos funcionais e não funcionais.

3- Especificação: Aqui que realizamos a documentação de todos os requisitos, elucidando o que o sistema deverá ser capaz de fazer, gerando um guia claro para desenvolvimento.

4- Verificação: Nesse passo deverá ser verificado se os requisitos atendem a demanda do sistema e se ficou algo que esteja indefinido.

5- Validação: Ocorre a validação de que o produto atende de fato as expectativas reais do cliente e que não há nenhuma falha no sistema.

6- Gerência: Controle e registro de mudanças de requisitos ao longo do projeto.

Lembrando que esses passos são iterativos e deverão ser repetidos várias vezes ao longo de um projeto para identificação de todos os requisitos.

Existem dois tipos de requisitos:

## Requisitos funcionais

São requisitos que descrevem o comportamentos, ações e funções que o sistema deve fazer.

## Requisitos não-funcionais

São requisitos que descrevem atributos de qualidade e impõe restrições operacionais, como desempenho, segurança, escalabilidade e tempo de resposta.

# Arquitetura de software e Diagrama em camadas

A arquitetura de software é a estrutura organizacional de um sistema, definindo seus componentes e como eles interagem entre si. Define também regras que orientam seu design e evolução.

A arquitetura em camadas é uma das mais utilizadas no desenvolvimento de software. Nela, a ideia central é dividir o sistema em camadas, onde cada camada tem sua responsabilidade bem definida, e só se comunica com a camada abaixo dela.

Embora o número de camadas variam de sistema pra sistema, o mais comum são o uso de 4 camadas:

1- Camada de apresentação: É onde fica a interface do usuário, seja por uma aplicação web ou aplicativo mobile, sendo sua função receber as requisições de usuário e passar para a próxima camada.

2- Camada de aplicação: É a alma do sistema, onde armazena as regras de negócios, validações de segurança complexas e cálculos. Nela é decidido o que fazer com o que o usuário enviou.

3- Camada de acesso a dados: Essa camada é responsável por acessar e salvar dados no banco de dados. Ela gerencia as consultas SQL, conexões com os bancos de dados e chamadas a repositórios.

4- Camada de dados: Nela é armazenado o banco de dados físico, onde reside as tabelas e os registros.

Uma das principais regras desse modelo é que nenhuma camada deve pular etapas, isto é, a camada de apresentação nunca pode pular diretamente para o acesso a dados sem antes passar pelas regras de negócios.

## Exemplo de diagrama de camadas:
![Diagrama](/Semana_02/Diagrama_de_camadas.png)

Justificativa: A arquitetura em camadas projetada atende aos requisitos do "Mobile Assassins" ao distribuir as responsabilidades de forma escalável e flexível. A Camada de Apresentação, estruturada em Unity 3D, prepara o sistema para as futuras funcionalidades de realidade aumentada, suportando a alta concorrência em tempo real através do uso de Websockets conectados aos serviços de *matchmaking* e mensagens da Camada de Aplicação. Paralelamente, o motor adaptativo isolado na Camada de Domínio garante a capacidade de criar diversas variantes de regras e processar a lógica espacial pura, enquanto as camadas de Dados e Infraestrutura sustentam o elevado volume de jogadores utilizando armazenamento robusto (como MongoDB) e integrações externas vitais (como APIs do Google Maps e Firebase) para validar geograficamente as "zonas seguras" e disparar notificações diárias.
