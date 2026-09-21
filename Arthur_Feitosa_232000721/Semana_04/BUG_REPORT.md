# BUG REPORT — Bilheteria do Museu

## BUG-001

**ID do Defeito:** BUG-001  
**Título:** Validação de idade negativa aceita valor inválido e concede gratuidade  
**Severidade:** Média  
**Ambiente:** Python 3.x / Função `calcular_ingresso`

### Passos para Reproduzir

1. Importar `calcular_ingresso` do módulo `bilheteria_original`.
2. Chamar `calcular_ingresso(-1)`.
3. Analisar o valor retornado ou a exceção lançada.

### Resultado Esperado

A função deve lançar:

```text
ValueError("Idade inválida")
```

porque idades menores que 0 estão fora do intervalo permitido.

### Resultado Obtido

A implementação original retorna:

```text
0.0
```

porque `-1 <= 5` é verdadeiro e não existe uma validação para `idade < 0`.

### Causa Provável e Sugestão de Correção

Na validação inicial, a implementação original verifica apenas:

```python
if idade > 120:
    raise ValueError("Idade inválida")
```

A condição deve validar os dois limites:

```python
if idade < 0 or idade > 120:
    raise ValueError("Idade inválida")
```

---

## BUG-002

**ID do Defeito:** BUG-002  
**Título:** Faixa de tarifa cheia inclui indevidamente visitante de 60 anos  
**Severidade:** Média  
**Ambiente:** Python 3.x / Função `calcular_ingresso`

### Passos para Reproduzir

1. Importar `calcular_ingresso` do módulo `bilheteria_original`.
2. Chamar `calcular_ingresso(60)`.
3. Analisar o valor retornado.

### Resultado Esperado

Para 60 anos, a regra de negócio determina meia-entrada:

```text
20.0
```

### Resultado Obtido

A implementação original retorna:

```text
40.0
```

### Causa Provável e Sugestão de Correção

A implementação original usa:

```python
elif idade <= 60:
    return 40.0
```

Isso inclui a idade 60 na tarifa cheia. A condição correta é:

```python
elif idade <= 59:
    return 40.0
```

ou, de forma equivalente, separar explicitamente a faixa `18 <= idade < 60`.

---

## Situação após a correção

Os dois defeitos foram corrigidos no arquivo `bilheteria.py`.

- BUG-001: validação passou a rejeitar `idade < 0`.
- BUG-002: a tarifa cheia passou a terminar em 59 anos.
- A partir de 60 anos, o valor retornado é R$ 20,00.

A implementação original foi preservada em `bilheteria_original.py` apenas para permitir comparação e reprodução dos bugs.
