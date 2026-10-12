**ID do Defeito:** BUG-001

**Título:** `Bilheteria`: idade negativa não gera erro de valor inválido, linha 3

**Severidade:** Média

**Ambiente:** Python 3.12.3 / Função `calcular_ingresso`

**Passos para Reproduzir:**

1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro -1.
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** `ValueError("Idade inválida")`

**Resultado Obtido:** retorna `0.0` (nenhuma exceção é lançada)

**Causa Provável e Sugestão de Correção:** 

A validação só verifica o limite superior (idade > 120). Por isso -1 cai na condição `idade <= 5` e retorna gratuidade.

```python
if idade > 120:
    raise ValueError("Idade inválida")
```

Sugestão:

```python
if idade > 120 or idade < 0:
    raise ValueError("Idade inválida")
```

------

**ID do Defeito:** BUG-002

**Título:** `Bilheteria`: idade 60 retorna tarifa inteira ao invez de meia-entrada, linha 10

**Severidade:** Alta

**Ambiente:** Python 3.12.3 / Função `calcular_ingresso`

**Passos para Reproduzir:**

1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro 60.
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** idade igual a 60 anos retorna tarifa 20.0

**Resultado Obtido:** retorna tarifa 40.0

**Causa Provável e Sugestão de Correção:** 

O operador `<=` inclui a idade 60 na faixa de tarifa inteira, 
mas a especificação diz que a meia-entrada de idoso vale a partir de 60 anos (inclusive.

```python
elif idade <= 60:
    return 40.0
```

Sugestão:

```python
elif idade < 60:
    return 40.0
```
