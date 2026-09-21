# Bug Report — `bilheteria.py`

Executado com `pytest test_bilheteria.py -v`. Resultado: **2 failed, 4 passed**.

---

## BUG-001

**ID do Defeito:** BUG-001
**Título:** `calcular_ingresso` aceita idade negativa e retorna gratuidade em vez de lançar erro
**Severidade:** Média
**Ambiente:** Python 3.14 / Função `calcular_ingresso` (`bilheteria.py`)

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `-1`.
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** a função deve lançar `ValueError("Idade inválida")`, pois a especificação define que idades `< 0` ou `> 120` são inválidas.

**Resultado Obtido:** a função retorna `0.0` (gratuidade), sem lançar exceção. Saída real do pytest:
```
test_bilheteria.py::test_idade_negativa FAILED

    def test_idade_negativa():
>       with pytest.raises(ValueError):
E       Failed: DID NOT RAISE ValueError
```

**Causa Provável e Sugestão de Correção:** a validação de limites (linha 3: `if idade > 120:`) só cobre o limite superior. Não existe verificação para `idade < 0`, então qualquer valor negativo cai direto na condição `if idade <= 5: return 0.0`. Correção: trocar a validação por uma condição que cubra os dois lados do intervalo válido, por exemplo `if idade < 0 or idade > 120: raise ValueError("Idade inválida")`.

---

## BUG-002

**ID do Defeito:** BUG-002
**Título:** `calcular_ingresso` cobra tarifa cheia (R$ 40,00) para idade 60, quando deveria cobrar meia-entrada (R$ 20,00)
**Severidade:** Alta
**Ambiente:** Python 3.14 / Função `calcular_ingresso` (`bilheteria.py`)

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `60`.
3. Analisar o valor retornado.

**Resultado Esperado:** `20.0`, pois a especificação define meia-entrada "a partir de 60 anos (inclusive)".

**Resultado Obtido:** `40.0`. Saída real do pytest:
```
test_bilheteria.py::test_meia_idoso FAILED

    def test_meia_idoso():
>       assert calcular_ingresso(60) == 20.0
E       assert 40.0 == 20.0
E        +  where 40.0 = calcular_ingresso(60)
```

**Causa Provável e Sugestão de Correção:** a condição `elif idade <= 60: return 40.0` (linha 9) inclui erroneamente o valor `60` na faixa de tarifa cheia, que deveria ir só até `59`. A condição correta é `elif idade < 60: return 40.0`, deixando o `else` (que retorna `20.0`) cobrir a partir de `60`.

---

## Desafio Ninja — Correção Aplicada

Ambos os defeitos foram corrigidos em `bilheteria.py`:
- Adicionada checagem de `idade < 0` na validação de limites.
- Trocado `elif idade <= 60` por `elif idade < 60`, para que a faixa de meia-entrada do idoso comece corretamente em 60 anos (inclusive).

Após a correção, `pytest test_bilheteria.py -v` passa com **6 passed, 0 failed** (saída completa registrada no histórico do terminal do repositório).
