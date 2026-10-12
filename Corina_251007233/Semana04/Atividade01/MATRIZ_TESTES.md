# Matriz de Testes — Bilheteria do Museu

Regra de negócio:
- Idade inválida (< 0 ou > 120): erro "Idade inválida"
- 0 a 5 anos: Gratuidade (R$ 0,00)
- 6 a 17 anos: Meia-entrada (R$ 20,00)
- 18 a 59 anos: Tarifa cheia (R$ 40,00)
- 60+ anos: Meia-entrada idoso (R$ 20,00)

| ID | Cenário / Descrição | Entrada (idade) | Saída Esperada | Técnica (EP/BVA) |
|----|----------------------|------------------|------------------|--------------------|
| CT-01 | Limite inferior inválido | -1 | Erro: "Idade inválida" | BVA |
| CT-02 | Borda inferior de gratuidade | 0 | R$ 0,00 | BVA |
| CT-03 | Borda superior de gratuidade | 5 | R$ 0,00 | BVA |
| CT-04 | Borda inferior de meia (jovem) | 6 | R$ 20,00 | BVA |
| CT-05 | Borda superior de meia (jovem) | 17 | R$ 20,00 | BVA |
| CT-06 | Borda inferior de inteira | 18 | R$ 40,00 | BVA |
| CT-07 | Borda superior de inteira | 59 | R$ 40,00 | BVA |
| CT-08 | Borda inferior de meia (idoso) | 60 | R$ 20,00 | BVA |
| CT-09 | Borda superior válida | 120 | R$ 20,00 | BVA |
| CT-10 | Limite superior inválido | 121 | Erro: "Idade inválida" | BVA |

> Todas as linhas usam BVA (Análise de Valor Limite) porque cada caso testa exatamente o valor onde a regra muda (a "borda"), que é onde os bugs mais aparecem.
