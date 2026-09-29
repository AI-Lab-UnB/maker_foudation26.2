#ifndef BILHETERIA_H
#define BILHETERIA_H

typedef enum {
    OK,
    IDADE_INVALIDA
} StatusIngresso;
StatusIngresso calcular_ingresso(int idade, double *preco);

#endif
