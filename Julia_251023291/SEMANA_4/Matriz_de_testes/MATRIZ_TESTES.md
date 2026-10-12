# MATRIZ DE TESTES — Bilheteria do Museu

**Regra de tarifação:**
- Idade < 0 ou > 120 → exceção `"Idade inválida"`
- 0 a 5 anos → R$ 0,00 (gratuidade)
- 6 a 17 anos e ≥ 60 anos → R$ 20,00 (meia-entrada)
- 18 a 59 anos → R$ 40,00 (tarifa cheia)

| ID | Cenário / Descrição | Entrada (`idade`) | Saída Esperada | Técnica (EP/BVA) |
|----|---------------------|:-----------------:|----------------|:----------------:|
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

## Classes de equivalência (EP) identificadas

| Classe | Faixa | Resultado | Valor representativo (opcional) |
|--------|-------|-----------|:-------------------------------:|
| Inválida inferior | idade < 0 | Erro "Idade inválida" | -10 |
| Gratuidade | 0 a 5 | R$ 0,00 | 3 |
| Meia (jovem) | 6 a 17 | R$ 20,00 | 12 |
| Inteira | 18 a 59 | R$ 40,00 | 35 |
| Meia (idoso) | 60 a 120 | R$ 20,00 | 80 |
| Inválida superior | idade > 120 | Erro "Idade inválida" | 150 |