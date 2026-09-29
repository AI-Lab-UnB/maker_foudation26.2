def	calcular_ingresso(idade: int) -> float:
#	Validacao	de	limites	gerais
    if idade > 120 or idade < 0:
        raise ValueError("Idade	invalida")
    if idade <= 5:
        return 0.0
    elif idade < 18:
        return 20.0
    elif idade < 60:
        return 40.0
    else:
        return 20.0