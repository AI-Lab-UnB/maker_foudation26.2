def calcular_ingresso(idade: int) -> float:
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