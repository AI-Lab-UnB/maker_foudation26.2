## BUG 1
**Título:** calcular_ingresso retorna tarifa cheia (40,00) em vez de meia-entrada (20,00) para idade = 60
**Severidade:** Alta — regra de negócio (faixa "idoso") calculada incorretamente em um caso de uso frequente (a borda exata dos 60 anos).
**Ambiente:** C (gcc) / Função `calcular_ingresso` em `bilheteria.c`
**Passos para Reproduzir:**
1. Incluir `bilheteria.h` e chamar `calcular_ingresso(60, &preco)`.
2. Verificar o valor de `preco` após a chamada.
**Resultado Esperado:** `preco == 20.0` (a partir de 60 anos, inclusive, é meia-entrada).
**Resultado Obtido:** `preco == 40.0`.
**Causa Provável e Sugestão de Correção:** em `bilheteria.c`, a condição `else if (idade <= 60) { *preco = 40.0; }` inclui erroneamente a idade 60 na faixa de tarifa cheia. Trocar por `else if (idade < 60)`, deixando a idade 60 cair no `else` final, que já atribui `20.0`.

## BUG 2
**Título:** calcular_ingresso não retorna IDADE_INVALIDA para idades negativas
**Severidade:** Crítica — a função aceita silenciosamente uma entrada fora do domínio (idade negativa não existe) e devolve um preço (0,00) em vez de sinalizar erro.
**Ambiente:** C (gcc) / Função `calcular_ingresso` em `bilheteria.c`
**Passos para Reproduzir:**
1. Chamar `calcular_ingresso(-1, &preco)`.
2. Verificar o valor de retorno (`StatusIngresso`).
**Resultado Esperado:** retorno `IDADE_INVALIDA`, já que idades < 0 são inválidas pela especificação.
**Resultado Obtido:** retorno `OK` com `preco == 0.0` (cai em `if (idade <= 5)`), sem sinalizar erro.
**Causa Provável e Sugestão de Correção:** em `bilheteria.c`, a validação `if (idade > 120)` só cobre o limite superior. Trocar por `if (idade < 0 || idade > 120)`.

### Desafio Ninja
```c
StatusIngresso calcular_ingresso(int idade, double *preco) {
    if (idade < 0 || idade > 120) {
        return IDADE_INVALIDA;
    }
    if (idade <= 5) {
        *preco = 0.0;
    } else if (idade < 18) {
        *preco = 20.0;
    } else if (idade < 60) {
        *preco = 40.0;
    } else {
        *preco = 20.0;
    }
    return OK;
}
```