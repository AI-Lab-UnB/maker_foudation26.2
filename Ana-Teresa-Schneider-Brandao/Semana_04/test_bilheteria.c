#include <stdio.h>
#include "bilheteria.h"

static int total = 0;
static int falhas = 0;

static void checar_preco(const char *nome, int idade, double esperado) {
    double preco = -999.0;
    total++;
    StatusIngresso status = calcular_ingresso(idade, &preco);
    if (status != OK || preco != esperado) {
        falhas++;
        printf("FAIL: %-28s idade=%d  esperado=%.2f  obtido=%.2f  status=%s\n",
               nome, idade, esperado, preco, status == OK ? "OK" : "IDADE_INVALIDA");
    } else {
        printf("PASS: %-28s idade=%d  preco=%.2f\n", nome, idade, preco);
    }
}

static void checar_invalida(const char *nome, int idade) {
    double preco = -999.0;
    total++;
    StatusIngresso status = calcular_ingresso(idade, &preco);
    if (status != IDADE_INVALIDA) {
        falhas++;
        printf("FAIL: %-28s idade=%d  esperado=IDADE_INVALIDA  obtido=OK (preco=%.2f)\n",
               nome, idade, preco);
    } else {
        printf("PASS: %-28s idade=%d  -> IDADE_INVALIDA\n", nome, idade);
    }
}

int main(void) {
    checar_preco("test_gratuidade_bebe",   0,   0.0);
    checar_preco("test_gratuidade_bebe",   5,   0.0);
    checar_preco("test_meia_jovem",        6,   20.0);
    checar_preco("test_meia_jovem",        17,  20.0);
    checar_preco("test_inteira",           18,  40.0);
    checar_preco("test_inteira",           59,  40.0);
    checar_preco("test_meia_idoso",        60,  20.0);
    checar_preco("test_meia_idoso",        120, 20.0);
    checar_invalida("test_idade_negativa",     -1);
    checar_invalida("test_idade_acima_limite", 121);

    printf("\n%d/%d testes passaram (%d falharam)\n", total - falhas, total, falhas);
    return falhas == 0 ? 0 : 1;
}