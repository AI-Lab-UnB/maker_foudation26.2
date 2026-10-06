#include "bilheteria.h"

StatusIngresso calcular_ingresso(int idade, double *preco) {
    if (idade > 120) {
        return IDADE_INVALIDA;
    }
    if (idade <= 5) {
        *preco = 0.0;
    } else if (idade < 18) {
        *preco = 20.0;
    } else if (idade <= 60) {
        *preco = 40.0;
    } else {
        *preco = 20.0;
    }
    return OK;
}