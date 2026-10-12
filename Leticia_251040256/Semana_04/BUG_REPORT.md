# Bug Report - Bilheteria do Museu

## BUG-001

**ID do Defeito:** BUG-001

**Título:** calcular_ingresso com idade 60 retorna 40 em vez de 20

**Severidade:** Média

**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**

1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro 60
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** 20.0 (meia-entrada, a partir de 60 anos)

**Resultado Obtido:** 40.0 (tarifa cheia)

**Causa Provável e Sugestão de Correção:** linha 9 do bilheteria.py. Ajuste necessário: elif idade < 60:

## BUG-002

**ID do Defeito:** BUG-002

**Título:** calcular_ingresso com idade negativa não lança ValueError (Idade inválida)

**Severidade:** Média

**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**

1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro -1
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** ValueError "Idade inválida"

**Resultado Obtido:** DID NOT RAISE ValueError. O código entra na condição idade <= 5 tratando a idade inválida como gratuidade e retorna 0.0

**Causa Provável e Sugestão de Correção:** linha 3 do bilheteria.py. Ajuste necessário: if idade > 120 or idade < 0: