**ID do Defeito:** BUG-001

**Título:** `bilheteria` Idade 60 retorna uma tarifa de 40 ao invés de 20

**Severidade:** Alta

**Ambiente:** Python 3.12.3 / Função `calcular_ingresso`

**Passos para Reproduzir:**

1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro 60.
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** 20.0

**Resultado Obtido:** 40.0

**Causa Provável e Sugestão de Correção:** 

A linha 10 `elif idade <= 60:` inclui a idade 60 para o valor 40, e na demanda está escrito "a partir de 60 anos" portanto deve ser retirado o `=` para que funcione corretamente:
```python
elif idade < 60:
```

---

**ID do Defeito:** BUG-002

**Título:** `bilheteria` não informa um erro quando a entrada é um número negativo

**Severidade:** Média

**Ambiente:** Python 3.12.3 / Função `calcular_ingresso`

**Passos para Reproduzir:**

1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro -1.
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** `"Idade inválida"`

**Resultado Obtido:** 0.0

**Causa Provável e Sugestão de Correção:** 

A linha 3 `if idade > 120:` não cobre os números negativos para disparar um erro, portanto é necessária uma condição para os números negativos:
```python
if idade < 0 or idade > 120:
```
A condição `idade < 0` resolve o problema
