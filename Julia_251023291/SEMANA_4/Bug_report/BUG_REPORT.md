# BUG REPORT

---

**ID do Defeito:** BUG-001
**Título:** `calcular_ingresso` não valida idade negativa e retorna R$ 0,00 (gratuidade) para `idade = -1`
**Severidade:** Média
**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar `calcular_ingresso(-1)`.
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** Lançar `ValueError("Idade inválida")`, pois idades < 0 são inválidas.
**Resultado Obtido:** Retorna `0.0`, sem lançar exceção (a entrada inválida cai no ramo `idade <= 5`).

**Causa Provável e Sugestão de Correção:** A validação inicial só verifica `idade > 120` e esquece o limite inferior. Corrigir para:
```python
if idade < 0 or idade > 120:
    raise ValueError("Idade inválida")
```
**Teste que acusa a falha:** `test_idade_negativa`

---

**ID do Defeito:** BUG-002
**Título:** `calcular_ingresso` cobra tarifa cheia (R$ 40,00) para idosos de 60 anos, em vez de meia-entrada
**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar `calcular_ingresso(60)`.
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** `20.0` (meia-entrada "a partir de 60 anos, inclusive").
**Resultado Obtido:** `40.0` (tarifa cheia).

**Causa Provável e Sugestão de Correção:** Na condição `elif idade <= 60:` o operador inclui o 60 na faixa da tarifa cheia (erro off-by-one). A faixa inteira vai só até 59. Corrigir para:
```python
elif idade < 60:
    return 40.0
```
**Teste que acusa a falha:** `test_meia_idoso`

---

## Resultado da execução (`pytest test_bilheteria.py -v`)

| Teste | Antes da correção | Depois da correção |
|-------|:-----------------:|:------------------:|
| test_gratuidade_bebe | PASSED | PASSED |
| test_meia_jovem | PASSED | PASSED |
| test_inteira | PASSED | PASSED |
| test_meia_idoso | **FAILED** (BUG-002) | PASSED |
| test_idade_negativa | **FAILED** (BUG-001) | PASSED |
| test_idade_acima_limite | PASSED | PASSED |

Resultado: 4 passed, 2 failed → **6 passed** após a correção em `bilheteria.py`.
