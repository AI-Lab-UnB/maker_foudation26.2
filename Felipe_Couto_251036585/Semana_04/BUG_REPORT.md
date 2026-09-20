# Bug Report — Bilheteria do Museu

Defeitos encontrados na execução de `test_bilheteria.py` contra `bilheteria.py`.

Resultado da suíte antes da correção: **2 failed, 4 passed**.

```
test_bilheteria.py::test_gratuidade_bebe      PASSED
test_bilheteria.py::test_meia_jovem           PASSED
test_bilheteria.py::test_inteira              PASSED
test_bilheteria.py::test_meia_idoso           FAILED
test_bilheteria.py::test_idade_negativa       FAILED
test_bilheteria.py::test_idade_acima_limite   PASSED
```

---

## BUG-001

**ID do Defeito:** BUG-001

**Título:** `calcular_ingresso` cobra tarifa cheia aos 60 anos, quando a especificação determina meia-entrada a partir dessa idade

**Severidade:** Alta

> Justificativa da severidade: regra de negócio calculada incorretamente num caso de uso frequente. Todo visitante que faz 60 anos é cobrado R$ 40,00 em vez de R$ 20,00 — o dobro do devido. Não interrompe o fluxo, mas gera cobrança indevida ao público idoso, que tem direito legal ao benefício.

**Ambiente:** Python 3.x / função `calcular_ingresso` do módulo `bilheteria`

**Passos para Reproduzir:**

1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `60`.
3. Analisar o valor retornado.

**Resultado Esperado:** `20.0` — a especificação define meia-entrada "a partir de 60 anos (inclusive)".

**Resultado Obtido:** `40.0`

```
>       assert calcular_ingresso(60) == 20.0
E       assert 40.0 == 20.0
E        +  where 40.0 = calcular_ingresso(60)
```

**Causa Provável e Sugestão de Correção:**

Erro de operador relacional na linha `elif idade <= 60:`. O uso de `<=` inclui o valor 60 na faixa de tarifa cheia, quando ele deveria pertencer à faixa de meia-entrada.

```python
# atual
elif idade <= 60:
    return 40.0

# correção
elif idade < 60:
    return 40.0
```

É o defeito clássico de fronteira (*off-by-one*), e foi detectado justamente porque a matriz de testes cobriu o valor limite 60 (CT-08).

---

## BUG-002

**ID do Defeito:** BUG-002

**Título:** `calcular_ingresso` aceita idades negativas e as tarifa como gratuidade, em vez de lançar a exceção "Idade inválida"

**Severidade:** Alta

> Justificativa da severidade: a validação de entrada é assimétrica — o limite superior é verificado, o inferior não. Qualquer valor negativo atravessa a validação e cai na faixa de gratuidade, permitindo registro de venda com dado inconsistente. Tratei como Alta por ser falha de validação de entrada num caminho de uso normal; um revisor poderia argumentar por Crítica, dado o potencial de corromper o registro de vendas.

**Ambiente:** Python 3.x / função `calcular_ingresso` do módulo `bilheteria`

**Passos para Reproduzir:**

1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `-1`.
3. Verificar se a exceção `ValueError` é lançada.

**Resultado Esperado:** `ValueError("Idade inválida")` — a especificação determina que idades menores que 0 são entrada inválida.

**Resultado Obtido:** nenhuma exceção. A função retorna `0.0`.

```
>       with pytest.raises(ValueError):
E       Failed: DID NOT RAISE ValueError
```

**Causa Provável e Sugestão de Correção:**

A validação de limites cobre apenas o extremo superior. Falta a verificação do limite inferior, e por isso `-1` satisfaz a condição `idade <= 5` e é tarifado como gratuidade.

```python
# atual
if idade > 120:
    raise ValueError("Idade inválida")

# correção
if idade < 0 or idade > 120:
    raise ValueError("Idade inválida")
```

---

## Desafio Ninja — correção aplicada

Versão corrigida de `bilheteria.py`:

```python
def calcular_ingresso(idade: int) -> float:
    # Validação de limites gerais
    if idade < 0 or idade > 120:
        raise ValueError("Idade inválida")
    if idade <= 5:
        return 0.0
    elif idade < 18:
        return 20.0
    elif idade < 60:
        return 40.0
    else:
        return 20.0
```

Resultado da suíte após a correção:

```
test_bilheteria.py::test_gratuidade_bebe      PASSED
test_bilheteria.py::test_meia_jovem           PASSED
test_bilheteria.py::test_inteira              PASSED
test_bilheteria.py::test_meia_idoso           PASSED
test_bilheteria.py::test_idade_negativa       PASSED
test_bilheteria.py::test_idade_acima_limite   PASSED

============================== 6 passed ==============================
```

Verificação adicional das dez entradas da matriz contra a versão corrigida:

| Entrada | Saída |
|---|---|
| -1 | ValueError: Idade inválida |
| 0 | R$ 0,00 |
| 5 | R$ 0,00 |
| 6 | R$ 20,00 |
| 17 | R$ 20,00 |
| 18 | R$ 40,00 |
| 59 | R$ 40,00 |
| 60 | R$ 20,00 |
| 120 | R$ 20,00 |
| 121 | ValueError: Idade inválida |

Todas as saídas conferem com a coluna "Saída Esperada" de `MATRIZ_TESTES.md`.