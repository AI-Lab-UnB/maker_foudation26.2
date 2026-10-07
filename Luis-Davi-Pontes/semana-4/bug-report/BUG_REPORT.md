# Relatório de Defeitos (Bug Report)

**ID do Defeito:** BUG-001
**Título:** Bilheteria - Permite idade negativa sem lançar exceção "Idade inválida"
**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`
**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `-1`.
3. Analisar o valor retornado ou exceção lançada.
**Resultado Esperado:** O sistema deve lançar a exceção `ValueError("Idade inválida")`.
**Resultado Obtido:** A função retorna `0.0` (Gratuidade) em vez de lançar exceção.
**Causa Provável e Sugestão de Correção:** Faltou validar o limite inferior na verificação de idade. Ajustar o primeiro `if` para `if idade < 0 or idade > 120: raise ValueError("Idade inválida")`.

---

**ID do Defeito:** BUG-002
**Título:** Bilheteria - Cobra tarifa cheia (R$ 40,00) para visitantes com 60 anos
**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`
**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `60`.
3. Analisar o valor retornado.
**Resultado Esperado:** Retorno de `20.0` (Meia-entrada para idosos a partir de 60 anos inclusive).
**Resultado Obtido:** Retorno de `40.0` (Tarifa cheia).
**Causa Provável e Sugestão de Correção:** Na verificação de tarifa cheia, o operador utilizado foi `<=` (`elif idade <= 60:`). O correto seria `< 60` (`elif idade < 60:`), garantindo que 60 anos caia no bloco `else` (retornando `20.0`).
