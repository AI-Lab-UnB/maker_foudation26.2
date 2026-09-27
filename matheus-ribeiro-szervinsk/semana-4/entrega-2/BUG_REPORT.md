# Relatório de Defeitos — Bilheteria (`bilheteria.py`)

Execução dos testes automatizados via `pytest test_bilheteria.py -v`.  
**Resultado dos testes iniciais:** 2 falhas (*FAILED*), 4 sucessos (*PASSED*).

---

## Defeito 1: Classificação incorreta na idade limite de 60 anos

**ID do Defeito:** BUG-001  
**Título:** `calcular_ingresso` cobra tarifa cheia (R$ 40,00) para idade 60 em vez de meia-entrada (R$ 20,00)  
**Severidade:** Alta  
**Ambiente:** Python 3.14.4 / Linux / Função `calcular_ingresso` (`bilheteria.py`)  

**Passos para Reproduzir:**
1. Importar a função `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o argumento `60`: `calcular_ingresso(60)`.
3. Analisar o valor numérico retornado.

**Resultado Esperado:** Retorno de `20.0` (R$ 20,00 - Meia-entrada), pois a regra de negócio estabelece meia-entrada "a partir de 60 anos (inclusive)".  
**Resultado Obtido:** Retorno de `40.0` (Tarifa cheia).  
*Evidência do Pytest:*
```text
FAILED test_bilheteria.py::test_meia_idoso - assert 40.0 == 20.0
    def test_meia_idoso():
>       assert calcular_ingresso(60) == 20.0
E       assert 40.0 == 20.0
E        +  where 40.0 = calcular_ingresso(60)
```

**Causa Provável e Sugestão de Correção:**  
Na linha 9 de `bilheteria.py`, a condição foi escrita com operador menor ou igual: `elif idade <= 60: return 40.0`. Isso inclui o valor 60 na faixa de tarifa cheia (18 a 59 anos).  
*Correção:* Alterar para `elif idade < 60:` (ou `elif idade <= 59:`). Dessa forma, a idade 60 cairá no bloco `else`, retornando corretamente `20.0`.

---

## Defeito 2: Ausência de validação para idades negativas

**ID do Defeito:** BUG-002  
**Título:** `calcular_ingresso` aceita idade negativa (-1) e retorna gratuidade em vez de disparar exceção  
**Severidade:** Alta  
**Ambiente:** Python 3.14.4 / Linux / Função `calcular_ingresso` (`bilheteria.py`)  

**Passos para Reproduzir:**
1. Importar a função `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando um valor negativo, por exemplo `-1`: `calcular_ingresso(-1)`.
3. Analisar o comportamento e retorno da função.

**Resultado Esperado:** Lançamento da exceção `ValueError("Idade inválida")`, pois idades `< 0` são entradas inválidas segundo a especificação.  
**Resultado Obtido:** Nenhuma exceção é lançada. A função avalia `if idade <= 5:` como verdadeiro e retorna indevidamente `0.0` (gratuidade).  
*Evidência do Pytest:*
```text
FAILED test_bilheteria.py::test_idade_negativa - Failed: DID NOT RAISE <class 'ValueError'>
    def test_idade_negativa():
>       with pytest.raises(ValueError):
E       Failed: DID NOT RAISE <class 'ValueError'>
```

**Causa Provável e Sugestão de Correção:**  
A validação de limites gerais no início da função verifica apenas o limite superior (`if idade > 120:`), omitindo a verificação de valores negativos.  
*Correção:* Ajustar a validação inicial para verificar ambos os extremos:
```python
if idade < 0 or idade > 120:
    raise ValueError("Idade inválida")
```

---

## Desafio Ninja — Resolução e Verificação

Ambos os defeitos foram sanados no módulo `bilheteria_corrigida.py`:
1. Validação de limite inferior e superior: `if idade < 0 or idade > 120: raise ValueError("Idade inválida")`.
2. Ajuste da faixa de tarifa inteira para `elif idade < 60: return 40.0`.

A execução da suíte `pytest test_bilheteria_corrigida.py -v` atinge **100% de sucesso (6 passed em 0.02s)**.
