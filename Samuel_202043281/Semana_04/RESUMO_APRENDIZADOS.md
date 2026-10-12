# Resumo de Aprendizados — Semana 4: Testes e Qualidade de Software

Notas de estudo sobre os vídeos, jogos e plataformas indicados no material da semana, e como cada um se conecta com as entregas práticas (matriz de testes e bug report).

## Vídeos

### O Guia Definitivo de Qualidade de Software para Iniciantes

- **Por que qualidade importa:** um bug que passa despercebido custa cada vez mais caro quanto mais tarde é descoberto — é muito mais barato pegar um defeito ainda no código do que depois que o usuário final já está usando o sistema em produção. Falhas de qualidade também custam confiança: usuário que apanha de bug troca de produto.
- **O que é testar, na prática:** testar é comparar o resultado **Esperado** (o que a especificação/regra de negócio diz que deveria acontecer) contra o **Obtido** (o que o sistema realmente devolve). Um teste só tem valor se alguém souber, de antemão, qual é a resposta certa — "rodar o programa e ver se não quebra" não é teste, é sorte.
- **Manual vs. Automatizado:** teste manual é bom para explorar a interface e achar problemas inesperados (exploratório), mas não escala — ninguém repete 200 cliques toda vez que uma linha de código muda. Teste automatizado (como os `assert` do pytest) roda em segundos e pode ser repetido a cada commit, o que fecha o "ciclo de reporte": escreve o teste, roda, se falhar vira um bug report, corrige, roda de novo.

### Melhores e piores tipos de teste (pirâmide de testes)

- A pirâmide de testes prioriza muitos testes **unitários** (rápidos, baratos, testam uma função isolada — como os testes de `calcular_ingresso` desta semana), menos testes de **integração**, e poucos testes de **ponta a ponta/UI** (lentos, caros, frágeis).
- Nem toda linha de código merece o mesmo esforço de teste: o foco deve ir para **regras de negócio críticas** (aqui, a tabela de preços por idade) — é onde um bug tem maior impacto financeiro ou de confiança, não em detalhes cosméticos.

## Jogos / Plataformas

### The Password Game (até a Regra 9)

- Cada nova regra do jogo invalida senhas que antes eram aceitas, forçando o jogador a lembrar de **todas** as restrições simultaneamente — é uma simulação de como requisitos de validação se acumulam e interagem de formas inesperadas num sistema real.
- Principal lição para QA: **pensar nas bordas antes de escrever o código**, não depois. Quando várias regras se sobrepõem (ex.: idade mínima E máxima, múltiplas faixas de preço), os bugs mais comuns aparecem exatamente nas transições entre regras — o que é a mesma lógica por trás da Análise de Valor Limite (BVA) usada na `MATRIZ_TESTES.md`.

### Code Defenders Puzzles (nível beginner)

- O jogo é baseado em **teste de mutação**: o sistema gera versões levemente alteradas ("mutantes") do código original (ex.: trocar `<` por `<=`), e o objetivo é ter testes fortes o bastante para "matar" esses mutantes (fazer o teste falhar quando roda contra o código defeituoso).
- Papel de **Defender**: escrever um caso de teste que passe no código correto mas falhe no mutante — expõe a diferença de comportamento.
- Papel de **Attacker**: criar um mutante (uma mudança sutil no código) que nenhum teste existente detecta — mostra pontos cegos na suíte de testes.
- Conexão direta com esta semana: o defeito do `bilheteria.py` na linha `elif idade <= 60` (deveria ser `idade < 60`) é literalmente um mutante de um caractere (`<=` em vez de `<`) que só é "morto" porque existe um teste (`test_meia_idoso`) cobrindo exatamente aquela fronteira.

## Biblioteca de Consulta

- **Software Testing Fundamentals (STF):** referência de bolso para lembrar a definição formal de Particionamento de Equivalência (agrupar entradas em classes que deveriam se comportar da mesma forma) e Análise de Valor Limite (testar os extremos de cada classe, onde bugs de "off-by-one" se escondem).
- **Documentação Oficial do Pytest:** usada nesta semana para confirmar a sintaxe de `pytest.raises(ValueError)` (testar que uma exceção é lançada) e a flag `-v` para relatório verboso por teste.
- **Gherkin Reference Guide (Dado/Quando/Então):** vocabulário para descrever cenários de teste em linguagem natural estruturada (ex.: *Dado* um visitante de 60 anos, *Quando* calcular o ingresso, *Então* o valor deve ser R$ 20,00) — útil para escrever bug reports e casos de teste que qualquer pessoa da equipe (não só quem programa) consegue entender.
