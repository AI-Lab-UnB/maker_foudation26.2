def calcular_ingresso(idade: int) -> float:
    # Idades fora do intervalo permitido são inválidas.
    if idade < 0 or idade > 120:
        raise ValueError("Idade inválida")

    # Gratuidade: 0 a 5 anos.
    if idade <= 5:
        return 0.0

    # Meia-entrada jovem: 6 a 17 anos.
    if idade <= 17:
        return 20.0

    # Tarifa cheia: 18 a 59 anos.
    if idade <= 59:
        return 40.0

    # Meia-entrada idoso: 60 a 120 anos.
    return 20.0
