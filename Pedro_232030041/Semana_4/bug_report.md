## Defeito 1

**ID do Defeito:** BUG-001
**Título:** calcular_ingresso retorna Tarifa Cheia (R$ 40,00) para idade 60 em vez de Meia-entrada
**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `idade=60`.
3. Analisar o valor retornado.

**Resultado Esperado:** `20.0` (Meia-entrada, pois 60 anos é a borda inferior da faixa de meia-entrada para idosos, conforme regra "a partir de 60 anos (inclusive)").
**Resultado Obtido:** `40.0` (Tarifa cheia).

**Causa Provável e Sugestão de Correção:**
Na linha `elif idade <= 60: return 40.0`, a condição inclui o valor 60 na faixa de tarifa cheia. Deveria ser `elif idade < 60: return 40.0`, deixando o `else` (que retorna `20.0`) cobrir corretamente a partir dos 60 anos.

---

## Defeito 2

**ID do Defeito:** BUG-002
**Título:** calcular_ingresso não valida idades negativas, retornando Gratuidade em vez de lançar exceção
**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `idade=-1`.
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** Exceção `ValueError("Idade inválida")`, pois a especificação define que idades `< 0` são inválidas.
**Resultado Obtido:** `0.0` (a função trata -1 como se caísse na faixa de gratuidade, já que `-1 <= 5` é verdadeiro).

**Causa Provável e Sugestão de Correção:**
A validação `if idade > 120: raise ValueError(...)` verifica apenas o limite superior. Falta verificar o limite inferior. Corrigir para `if idade < 0 or idade > 120: raise ValueError("Idade inválida")`.

---

**Conquista:** Debugger Mestre — os 2 defeitos foram encontrados e documentados, e o Desafio Ninja (correção do código) foi completado (ver `bilheteria.py` corrigido).