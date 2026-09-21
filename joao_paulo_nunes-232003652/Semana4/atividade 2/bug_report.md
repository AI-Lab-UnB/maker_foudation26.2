# Bug Report: bilheteria.py

## BUG-001

**ID do Defeito:** BUG-001
**Título:** calcular_ingresso não valida idades negativas e retorna gratuidade em vez de lançar erro
**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `idade = -1`.
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** conforme a especificação, idade < 0 deveria disparar `ValueError("Idade inválida")`.

**Resultado Obtido:** a função retorna `0.0` (gratuidade), sem lançar nenhuma exceção. O caso de teste `test_idade_negativa` falhou com "DID NOT RAISE ValueError".

**Causa Provável e Sugestão de Correção:** a validação em `bilheteria.py` (linhas 3 e 4) só cobre o limite superior:

```python
if idade > 120:
    raise ValueError("Idade inválida")
```

Como não existe nenhuma checagem para valores menores que 0, qualquer idade negativa cai direto na condição seguinte (`if idade <= 5: return 0.0`) e é tratada como bebê gratuito. A correção é trocar a validação por uma checagem de faixa completa, por exemplo:

```python
if idade < 0 or idade > 120:
    raise ValueError("Idade inválida")
```

## BUG-002 (documentado como bônus)

**ID do Defeito:** BUG-002
**Título:** calcular_ingresso cobra tarifa cheia em vez de meia entrada para idade 60 (idoso)
**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `idade = 60`.
3. Analisar o valor retornado.

**Resultado Esperado:** conforme a especificação, a partir de 60 anos (inclusive) o valor deve ser meia entrada, `R$ 20,00`.

**Resultado Obtido:** a função retorna `40.0` (tarifa cheia). O caso de teste `test_meia_idoso` falhou com `assert 40.0 == 20.0`.

**Causa Provável e Sugestão de Correção:** a condição `elif idade <= 60: return 40.0` inclui erradamente a idade 60 na faixa de tarifa cheia, que deveria ir só até 59. O limite está errado por 1 (erro de off by one). A correção é trocar o operador:

```python
elif idade < 60:
    return 40.0
```

## Desafio Ninja

Apliquei as duas correções acima em `bilheteria.py` e rodei `pytest test_bilheteria.py -v` novamente: os 6 testes passam agora (0 falhas).