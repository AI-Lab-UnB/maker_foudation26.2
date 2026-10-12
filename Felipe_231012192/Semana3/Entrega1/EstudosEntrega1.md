## Estudos de HTML E JS

- Anotações sobre estudos de HTML feitos pelo jogo FlexBox Frog E dos estudos de JS Feitos pelo jogo JS Robot.


## 1. Registro de Aprendizado: Flexbox Froggy

Este documento registra os conceitos de CSS Flexbox que pratiquei e dominei ao concluir todos os 24 níveis do jogo Flexbox Froggy.

### Resumo das Propriedades Praticadas

#### 1. Alinhamento Horizontal (Eixo Principal)

- justify-content: define o alinhamento dos elementos ao longo do eixo principal (por padrão, a horizontal).
  - flex-start: alinha os itens ao início do container.
  - flex-end: alinha os itens ao final do container.
  - center: alinha os itens no centro.
  - space-between: distribui os itens uniformemente; o primeiro item fica no início e o último no final.
  - space-around: distribui os itens uniformemente com espaço igual ao redor deles.

#### 2. Alinhamento Vertical (Eixo Cruzado)

- align-items: alinha os elementos ao longo do eixo cruzado (por padrão, a vertical).
  - flex-start: alinha os itens ao topo do container.
  - flex-end: alinha os itens à base do container.
  - center: alinha os itens no centro vertical.
  - baseline: alinha os itens pela sua linha de base tipográfica.
  - stretch: estica os itens para preencher o container (padrão).

#### 3. Direção dos Elementos

- flex-direction: define a direção do eixo principal (linhas ou colunas).
  - row: elementos dispostos horizontalmente (padrão).
  - row-reverse: elementos dispostos horizontalmente, mas em ordem inversa.
  - column: elementos dispostos verticalmente (de cima para baixo).
  - column-reverse: elementos dispostos verticalmente, mas de baixo para cima.

#### 4. Ordem Individual

- order: modifica a ordem de exibição de um elemento específico em relação aos outros (aceita valores inteiros positivos ou negativos).

#### 5. Alinhamento Individual

- align-self: permite alterar o alinhamento vertical (align-items) de um elemento específico de forma isolada.

#### 6. Quebra de Linha

- flex-wrap: define se os elementos devem quebrar para uma nova linha quando não couberem no container.
  - nowrap: todos os itens ficam em uma única linha (padrão).
  - wrap: os itens quebram para várias linhas se necessário.
  - wrap-reverse: os itens quebram para várias linhas em ordem inversa.

#### 7. Agrupamento de Direção e Quebra

- flex-flow: um atalho (shorthand) para combinar flex-direction e flex-wrap em uma única linha (ex: flex-flow: column wrap).

#### 8. Alinhamento de Várias Linhas

- align-content: define o alinhamento das linhas do container quando há quebra de conteúdo (flex-wrap). Possui valores similares ao justify-content (flex-start, flex-end, center, space-between, space-around, stretch).


---

## 2. Registro de Aprendizado: Jogo JS Robot

Este documento resume os conceitos de programação em JavaScript praticados durante o gameplay de JSRobot

### Tecnologias e Conceitos Praticados

#### 1. Sintaxe Básica e Chamadas de Função

- Execução de comandos: uso da sintaxe objeto.metodo(argumento) para interagir com o ambiente (ex: robot.move()).
- Passagem de parâmetros: definição de valores numéricos e de direção para ajustar os passos e ações do robô.

#### 2. Manipulação de Propriedades e Métodos do Robô

- Movimentação: controle de locomoção básica (robot.moveX(), robot.moveY()).
- Coleta de itens: ações para interagir e coletar moedas essenciais para a progressão.
- Leitura de sensores: uso de métodos que verificam o estado atual do ambiente e a posição do robô.

#### 3. Estruturas Condicionais (if / else)

- Tomada de decisão: criação de blocos lógicos para o robô reagir de forma autônoma a obstáculos e caminhos.
- Exemplo lógico: se houver um obstáculo à frente, desviar; caso contrário, continuar movendo.

#### 4. Laços de Repetição (Loops)

- Estrutura while: automação de movimentos repetitivos até que uma condição de parada (como alcançar a bandeira ou colidir com uma parede) seja atingida.

#### 5. Expressões Regulares (RegEx) e Manipulação de Strings

- Validação de padrões: uso de expressões regulares em JavaScript para decifrar e validar códigos de segurança de portas e computadores dentro do jogo.
- Filtragem de dados: extração e correspondência de padrões de strings específicas para desbloquear caminhos.


### Conclusão

A conclusão do JS Robot consolidou a base do pensamento computacional e da lógica de programação utilizando JavaScript nativo, evoluindo do controle imperativo de ações básicas até a automação completa com lógica condicional e tratamento de dados textuais.