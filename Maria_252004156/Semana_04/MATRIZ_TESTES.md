| ID | Cenário / Descrição | Entrada (idade) | Saída Esperada | Técnica (EP/BVA) |
|---|---|---|---|---|
| CT-01 | Limite inferior inválido | -1 | Erro: "Idade inválida" | BVA |
| CT-02 | Borda inferior de gratuidade | 0 | Gratuidade (R$0,00) | BVA |
| CT-03 | Borda superior de gratuidade | 5 | Gratuidade (R$0,00)| BVA |
| CT-04 | Borda inferior de meia (jovem) | 6 | Meia-Entrada (R$20,00)| BVA |
| CT-05 | Borda superior de meia (jovem) | 17 | Meia-Entrada (R$20,00)| BVA |
| CT-06 | Borda inferior de inteira | 18 | Tarifa Cheia (R$40,00)| BVA |
| CT-07 | Borda superior de inteira | 59 | Tarifa Cheia (R$40,00)| BVA |
| CT-08 | Borda inferior de meia (idoso) | 60 | Meia-Entrada (R$20,00)| BVA |
| CT-09 | Borda superior válida | 120 | Meia-Entrada (R$20,00) | BVA |
| CT-10 | Limite superior inválido | 121 | Erro: "Idade inválida" | BVA |