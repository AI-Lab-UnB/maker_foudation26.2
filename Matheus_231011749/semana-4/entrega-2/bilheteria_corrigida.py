def calcular_ingresso(idade: int) -> float:
    """Calcula o valor do ingresso do museu de acordo com a idade do visitante.
    
    Regras de tarifação:
    - Idade < 0 ou > 120: exceção ValueError("Idade inválida")
    - 0 a 5 anos (inclusive): R$ 0,00 (Gratuidade)
    - 6 a 17 anos (inclusive) e a partir de 60 anos (inclusive): R$ 20,00 (Meia-entrada)
    - 18 a 59 anos (inclusive): R$ 40,00 (Tarifa cheia / Inteira)
    """
    # Validação de limites gerais (Correção BUG-002: checagem de limite inferior < 0)
    if idade < 0 or idade > 120:
        raise ValueError("Idade inválida")
    
    if idade <= 5:
        return 0.0
    elif idade < 18:
        return 20.0
    # Correção BUG-001: limite estritamente inferior a 60 anos (ou <= 59)
    elif idade < 60:
        return 40.0
    else:
        return 20.0
