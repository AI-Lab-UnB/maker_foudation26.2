# VISÃO DO PRODUTO E PROJETO
### Amazon Brasil
### Lacuna financeira frente ao Mercado Livre
##### Baseado em dados públicos reais (Amazon Brasil, imprensa especializada e análises de mercado, 2025–2026). Mediante pesquisa Deep Search do Claude.AI/Anthropic


## 1 CENÁRIO ATUAL DO CLIENTE E DO NEGÓCIO

### 1.1 Introdução ao Negócio e Contexto
A Amazon iniciou sua operação no Brasil em 2012 com a venda de livros e em 2019 expandiu para atuação no varejo brasileiro e transformou o país em uma de suas prioridades globais de investimento: já são mais de R$ 75 bilhões aportados desde sua chegada no país.

No primeiro trimestre de 2026, a empresa atingiu a marca de 300 centros logísticos com tecnologia própria, presentes em todos os estados brasileiros, gerando mais de 55mil empregos diretos e indiretos, e hoje somam mais de 100 mil vendedores parceiros no marketplace. O uso de IA e automação (otimização de rotas, previsão de demanda) reduziu em 77% o tempo de implantação de cada novo centro.

Essa expansão levou a Amazon a alcançar, em 2025, as entregas mais rápidas de sua história no país: mais de 50 milhões de itens Prime entregues no mesmo dia ou no dia seguinte, além do lançamento do Amazon Now, com entregas em até 15 minutos em áreas selecionadas.

Apesar disso, a Amazon Brasil segue como a terceira maior plataforma de e-commerce do país, com uma participação de mercado estimada entre 10% e 15% ficando atrás do Mercado Livre que lidera a posição com 34% a 42% do mercado e da Shopee com 14% a 25%. No início de 2026, a empresa reduziu duas camadas hierárquicas entre a liderança local e a global para acelerar decisões, o que já resultou em mais produtos cadastrados no marketplace no 1º trimestre de 2026 do que em todo o ano de 2025.

### 1.2 Identificação da Oportunidade ou Problema
A Amazon já conquistou, segundo análises do setor, a opção de entrega mais rápida entre os grandes e-commerces do Brasil, mas isso não tem sido suficiente para reduzir a distância em relação ao Mercado Livre. Uma das explicações apontadas por analistas (como o time de varejo do BTG Pactual) é que o Mercado Livre construiu, com o Mercado Pago, um ecossistema financeiro que a Amazon não replica no país.

A fintech do Mercado Pago encerrou 2025 com 78 milhões de usuários ativos mensais (alta de 28% no ano) e uma carteira de crédito de US$ 12,5 bilhões (crescimento de 90% na comparação anual). Esse ecossistema cria barreiras de saída para compradores e vendedores que vão muito além da experiência de compra, algo que a Amazon hoje tenta compensar apenas com subsídios pontuais a vendedores.

Isso significa que a vantagem logística da Amazon Brasil, por si só, não tem sido suficiente para reduzir a distância em participação de mercado, porque o fator decisivo de retenção no mercado brasileiro parece ter mais peso em um ecossistema financeiro no lugar da velocidade de entrega. O diagrama 1 a seguir organiza, pelos 6M's, as causas dessa dificuldade.

<captions> Diagrama1 - Diagrama Ishikawa </captions>

![diagrama1](Semana02/Diagrama de espinha de peixe.jpg)


### 1.3 Desafios do Projeto
- Construir um produto financeiro (carteira digital, crédito, meios de pagamento) competitivo com o Mercado Pago, sem a infraestrutura regulatória que o concorrente já possui no Brasil.
- Obter autorização do Banco Central para operar como instituição de pagamento e, possivelmente, de crédito.
- Manter a vantagem de velocidade de entrega já conquistada (300 centros, Amazon Now) enquanto se investe em um novo pilar de negócio.
- Reduzir a complexidade da última milha (rede híbrida de centros próprios, parceiros logísticos e motoristas autônomos), hoje fonte de falhas pontuais.
- Convencer os cerca de 100 mil vendedores independentes a adotar um novo produto financeiro Amazon em vez do Mercado Pago, já consolidado.
- Sustentar o ritmo de decisão mais ágil conquistado com a reestruturação organizacional de 2026.

### 1.4 Segmentação de Clientes 
A seguir, Descrevo os diferentes perfis de clientes atendidos pelo negócio para ajudandar a entender o público-alvo da solução.

- Consumidores Prime recorrentes: já compram na Amazon e valorizam a velocidade de entrega (Amazon Now, entrega no mesmo dia).
- Vendedores independentes do marketplace (cerca de 100 mil): precisam de crédito e capital de giro, hoje dependentes de outras fintechs ou do Mercado Pago.
- Consumidores de regiões recém-atendidas pela expansão logística (áreas ribeirinhas da Amazônia, periferias de São Paulo e Rio de Janeiro): historicamente com menor acesso a serviços financeiros tradicionais.
- Pequenos empreendedores multicanal: vendem em mais de um marketplace e buscam consolidar pagamentos e crédito em um único lugar.

## 2 SOLUÇÃO PROPOSTA

### 2.1 Objetivos do Produto 

Reduzir distância de participação de mercado entre a Amazon Brasil e o Mercado Livre, construindo um ecossistema financeiro integrado como carteira digital, crédito a vendedores e meios de pagamento capaz de gerar o mesmo efeito de retenção que o Mercado Pago proporciona, aproveitando a vantagem logística já conquistada pela Amazon como diferencial complementar.

### 2.2 Características da Solução
- Carteira digital integrada à conta Amazon, com saldo, transferências via Pix e pagamento de contas.
- Linha de crédito/capital de giro para os vendedores independentes do marketplace, com concessão baseada em dados de vendas históricas na própria plataforma.
- Parcelamento e cashback integrados ao checkout, em condições competitivas com o Mercado Pago.
- Programa de inclusão financeira para as regiões recém-atendidas pela expansão logística, aproveitando a presença física já construída pelos 300 centros.
- Painel financeiro para vendedores, unificando vendas, taxas do marketplace e fluxo de caixa em um só lugar.
- Integração com o programa Prime já existente, para reforçar a recorrência de compra.

### 2.3 Tecnologias a Serem Utilizadas
A proposta aproveita a infraestrutura já operada pela própria Amazon, seguindo boas práticas atuais de engenharia, segurança e DevOps:

- Back-end: microsserviços na infraestrutura AWS já existente (Lambda, DynamoDB, Aurora).
- Plataforma de pagamentos: integração com Pix, cartões e boleto, seguindo os padrões de Open Finance do Banco Central.
- Motor de crédito/scoring: modelos de machine learning (Amazon SageMaker) usando o histórico de vendas na própria plataforma para análise de risco de crédito a vendedores.
- Antifraude e observabilidade: monitoramento de transações em tempo real, com modelos de detecção de fraude e CloudWatch/X-Ray para métricas e rastreamento.
- Segurança: criptografia de dados financeiros, autenticação multifator, conformidade com a LGPD e com a regulamentação do Banco Central para instituições de pagamento.
- Integração logística: conexão com o sistema já existente dos 300 centros e do Amazon Now, para uma eventual oferta de saque/depósito em pontos físicos parceiros.
- DevOps: pipelines de CI/CD com testes automatizados (essenciais dado o caráter regulado da operação financeira) e Infraestrutura como Código para monitoramento de compliance.


### 2.4 Pesquisa de Mercado e Análise Competitiva
O Mercado Livre lidera o e-commerce brasileiro com folga, sustentado não apenas pela logística própria (Mercado Envios), mas principalmente pelo Mercado Pago, uma das maiores fintechs da América Latina, com 78 milhões de usuários ativos mensais e uma carteira de crédito de US$ 12,5 bilhões.

A Shopee, em segundo lugar, aposta em preço, volume e expansão de centros de distribuição próprios, mas sem ecossistema financeiro comparável. A Amazon Brasil, apesar de já oferecer a entrega mais rápida entre os grandes players, ainda não tem um produto financeiro com penetração equivalente ao Mercado Pago.

A diferenciação proposta é justamente combinar a vantagem logística já conquistada pela Amazon com um ecossistema financeiro robusto, replicando o efeito de retenção que hoje beneficia o concorrente.

### 2.5 Análise de Viabilidade 
- Técnica: alta para a infraestrutura de carteira digital e pagamentos em si pois a Amazon já opera o Amazon Pay em outros mercados globalmente; o maior desafio é a adaptação regulatória ao Brasil.
- Regulatória: exige autorização do Banco Central para operar como instituição de pagamento e, possivelmente, para conceder crédito.
- Financeira: viável, dado o investimento já comprovado da Amazon no país (R$ 55 bilhões na última década) e a prioridade declarada do Brasil nos investimentos globais da empresa.
- Prazo: uma primeira versão (carteira digital + parcelamento no checkout) poderia ser lançada em 9 a 12 meses; a linha de crédito a vendedores, por depender de licenciamento regulatório, teria um horizonte mais longo (18 a 24 meses).
- Mercado: a distância atual para o Mercado Pago é grande, mas a base já existente de vendedores e de clientes Prime na Amazon Brasil oferece um ponto de partida real para adoção.

### 2.6 Impacto da Solução
- Redução da desvantagem de participação de mercado frente ao Mercado Livre, atacando especificamente a vantagem estrutural do concorrente o ecossistema financeiro.
- Maior retenção de vendedores independentes, hoje sem alternativa de crédito integrada na própria Amazon.
- Inclusão financeira nas regiões recém-atendidas pela expansão logística (áreas ribeirinhas, periferias).
- Reforço do ciclo entre logística (já consolidada) e produto financeiro (novo), aumentando a recorrência de compra.
- Maior retorno sobre o investimento logístico já realizado, ao converter velocidade de entrega em fidelização mais duradoura.