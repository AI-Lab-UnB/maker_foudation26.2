## ID do Defeito: BUG-001
Título: Tarifa cobrada incorretamente para valor de fronteira (idade = 60)  
Severidade: Alta  
Ambiente: Python 3.x / Função calcular_ingresso  
Passos para Reproduzir:  

1. Importar calcular_ingresso do módulo bilheteria.

2. Chamar a função passando o parâmetro idade = 60.

3. Analisar o valor retornado ou exceção lançada.

Resultado Esperado: 20.0

Resultado Obtido: 40.0

Causa Provável e Sugestão de Correção:

Erro de limite ou de fronteira

```python
def calcular_ingresso(idade : int) -> float:
    # Validação de limites gerais
    if idade > 120:
        raise ValueError("Idade inválida")

    if idade <= 5:
        return 0.0
    elif idade < 18:
        return 20.0
    elif idade <= 60: # Aqui deveria ser "<" em vez de "<=".
        return 40.0
    else:
        return 20.0
```

Correção indicada: substituir por "<"




## ID do Defeito: BUG-002
Título: Validação de entrada incorreta para idades negativas  
Severidade: Média  
Ambiente: Python 3.x / Função calcular_ingresso  

Passos para Reproduzir:

1. Importar calcular_ingresso do módulo bilheteria.

2. Chamar a função passando o parâmetro idade < 0.

3. Analisar o valor retornado ou exceção lançada.

Resultado Esperado: ValueError("Idade inválida")  

Resultado Obtido: 0.00  

Causa Provável e Sugestão de Correção: 

Há a necessidade de uma claúsula de guarda (if) para tratamento de entrada.

```python
    def calcular_ingresso(idade : int) -> float:
    # Validação de limites gerais
    if idade > 120:
        raise ValueError("Idade inválida")
    if idade < 0: # Necessidade de inclusão dessa claúsula de guarda para tratar a entrada de números negativos.
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