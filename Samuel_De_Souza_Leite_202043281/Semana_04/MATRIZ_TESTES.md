# Matriz de Testes — Bilheteria do Museu

Regras de tarifação:
- Entrada inválida: idades `< 0` ou `> 120` disparam a exceção `"Idade inválida"`.
- Gratuidade (R$ 0,00): 0 a 5 anos (inclusive).
- Meia-entrada (R$ 20,00): 6 a 17 anos (inclusive) e a partir de 60 anos (inclusive).
- Tarifa cheia (R$ 40,00): 18 a 59 anos (inclusive).

| ID | Cenário / Descrição | Entrada (idade) | Saída Esperada | Técnica (EP/BVA) |
|----|----------------------|:----------------:|------------------------|:-----------------:|
| CT-01 | Limite inferior inválido | -1 | Erro: "Idade inválida" | BVA |
| CT-02 | Borda inferior de gratuidade | 0 | R$ 0,00 (gratuidade) | BVA |
| CT-03 | Borda superior de gratuidade | 5 | R$ 0,00 (gratuidade) | BVA |
| CT-04 | Borda inferior de meia (jovem) | 6 | R$ 20,00 (meia-entrada) | BVA |
| CT-05 | Borda superior de meia (jovem) | 17 | R$ 20,00 (meia-entrada) | BVA |
| CT-06 | Borda inferior de inteira | 18 | R$ 40,00 (tarifa cheia) | BVA |
| CT-07 | Borda superior de inteira | 59 | R$ 40,00 (tarifa cheia) | BVA |
| CT-08 | Borda inferior de meia (idoso) | 60 | R$ 20,00 (meia-entrada) | BVA |
| CT-09 | Borda superior válida | 120 | R$ 20,00 (meia-entrada) | BVA |
| CT-10 | Limite superior inválido | 121 | Erro: "Idade inválida" | BVA |

**Observação:** todos os casos testam valores exatamente na fronteira entre duas classes de equivalência (definidas via Particionamento de Equivalência — EP), por isso a técnica de projeto aplicada em cada um é a Análise de Valor Limite (BVA): para cada fronteira entre partições válidas/inválidas, testa-se o último valor de um lado e o primeiro valor do outro lado.
