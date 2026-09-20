# Bug Report — Bilheteria do Museu

---

## BUG-001

**ID do Defeito:** BUG-001
**Título:** Idade 60 anos é cobrada como tarifa cheia (R$ 40,00) em vez de meia-entrada idoso (R$ 20,00)
**Severidade:** Média
**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `60`.
3. Analisar o valor retornado.

**Resultado Esperado:** `20.0` (meia-entrada, pois 60 anos já entra na faixa "a partir de 60 anos")
**Resultado Obtido:** `40.0` (tarifa cheia)

**Causa Provável e Sugestão de Correção:**
Na linha `elif idade <= 60: return 40.0`, o operador `<=` inclui o valor 60 na faixa de tarifa cheia. Como a regra de negócio diz que a meia-entrada de idoso começa "a partir de 60 anos (inclusive)", a condição deveria ser `elif idade < 60: return 40.0`, deixando o 60 cair no `else` (meia-entrada).