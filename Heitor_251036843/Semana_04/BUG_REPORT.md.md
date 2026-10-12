**ID do Defeito:** BUG-001
**Título:** Função calcular_ingresso com idade 60 retorna tarifa cheia em vez de meia-entrada
**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar a função `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `60` (ex: `calcular_ingresso(60)`).
3. Analisar o valor retornado.

**Resultado Esperado:** `20.0` (Meia-entrada aplicável a idosos com 60 anos ou mais).
**Resultado Obtido:** `40.0` (Tarifa cheia).

**Causa Provável e Sugestão de Correção:** 
A condição `elif idade <= 60:` abrange de forma errada a idade de 60 anos na categoria de tarifa cheia (que deveria ir apenas até 59 anos). Além disso, o código original falha ao não verificar idades negativas. 
Sugestão de correção: Ajustar a linha para `elif idade <= 59:` e adicionar a validação de limite inferior `< 0` no primeiro `if`.

---

## Desafio Ninja

```python
def calcular_ingresso(idade: int) -> float:
    # Correção: Adicionada a validação para idades negativas (< 0)
    if idade < 0 or idade > 120:
        raise ValueError("Idade inválida")
        
    if idade <= 5:
        return 0.0
    elif idade < 18:
        return 20.0
    # Correção: Alterado de <= 60 para <= 59 para respeitar o limite da tarifa cheia
    elif idade <= 59:
        return 40.0
    else:
        return 20.0
```