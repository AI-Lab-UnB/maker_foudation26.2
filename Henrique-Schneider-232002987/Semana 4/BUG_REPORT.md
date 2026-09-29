**ID do Defeito:** BUG-001
**Título:** Função `calcular_ingresso` cobra tarifa inteira para idosos acima de 60 anos (inclusive).

**Severidade:** Crítica

**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `x >= 60`.
3. Analisar o valor retornado ou exceção lançada.<br>
**Resultado Esperado:** `20.0`<br>
**Resultado Obtido:** `40.0`

**Causa Provável e Sugestão de Correção:** 

**Causa do erro:**
```python
def calcular_ingresso(idade: int) -> float:
# Validação de limites gerais
    if idade > 120:
        raise ValueError("Idade inválida")
    if idade <= 5:
        return 0.0
    elif idade < 18:
        return 20.0
    elif idade <= 60: #condição errada
        return 40.0   #valor errado
    else:
        return 40.0
```
---
**Solução:**
```python
def calcular_ingresso(idade: int) -> float:
# Validação de limites gerais
    if idade > 120:
        raise ValueError("Idade inválida")
    if idade <= 5:
        return 0.0
    elif idade < 18:
        return 20.0
    elif idade >= 60: #condição alterada
        return 20.0   #valor alterado
    else:
        return 40.0 
```

---

**ID do Defeito:** BUG-002

**Título:** Função `calcular_ingresso` aceita idades negativas sem disparar exceção

**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando um parâmetro numérico negativo, por exemplo: `calcular_ingresso(-1)`.
3. Analisar o valor retornado ou a exceção lançada.

    **Resultado Esperado:** 

    `ValueError("Idade inválida")`

    **Resultado Obtido:**

    `0.0`

<br>

**Causa Provável e Sugestão de Correção:**

**Causa do erro:**

```python
def calcular_ingresso(idade: int) -> float:
    # Validação de limites gerais (ERRADO: não valida idade < 0)
    if idade > 120:
        raise ValueError("Idade inválida")
    if idade <= 5:
        return 0.0 # Valores negativos caem aqui incorretamente
    elif idade < 18:
        return 20.0
    elif idade >= 60:
        return 20.0
    else:
        return 40.0
```

---

**Solução:**

```python
def calcular_ingresso(idade: int) -> float:
    # Validação de limites gerais (CORRIGIDO: valida < 0 e > 120)
    if idade < 0 or idade > 120:
        raise ValueError("Idade inválida")
    if idade <= 5:
        return 0.0
    elif idade < 18:
        return 20.0
    elif idade >= 60:
        return 20.0
    else:
        return 40.0
```
