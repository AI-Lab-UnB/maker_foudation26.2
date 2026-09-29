# Matriz de Testes — Tarifação da Bilheteria do Museu

Técnicas aplicadas: **Particionamento de Equivalência (EP)** e **Análise de Valor Limite (BVA)**.

| ID | Cenário / Descrição | Entrada (`idade`) | Saída Esperada | Técnica (EP/BVA) |
|----|----------------------|--------------------|------------------|--------------------|
| CT-01 | Limite inferior inválido | -1 | Erro: "Idade inválida" | BVA |
| CT-02 | Borda inferior de gratuidade | 0 | Gratuidade — R$ 0,00 | BVA |
| CT-03 | Borda superior de gratuidade | 5 | Gratuidade — R$ 0,00 | BVA |
| CT-04 | Borda inferior de meia (jovem) | 6 | Meia-entrada — R$ 20,00 | BVA |
| CT-05 | Borda superior de meia (jovem) | 17 | Meia-entrada — R$ 20,00 | BVA |
| CT-06 | Borda inferior de inteira | 18 | Tarifa cheia — R$ 40,00 | BVA |
| CT-07 | Borda superior de inteira | 59 | Tarifa cheia — R$ 40,00 | BVA |
| CT-08 | Borda inferior de meia (idoso) | 60 | Meia-entrada — R$ 20,00 | BVA |
| CT-09 | Borda superior válida | 120 | Meia-entrada — R$ 20,00 | BVA |
| CT-10 | Limite superior inválido | 121 | Erro: "Idade inválida" | BVA |

## Observações

- Todos os casos acima foram derivados por **Análise de Valor Limite (BVA)**, testando exatamente os pontos de transição entre classes de equivalência (limite inferior − 1, limite inferior, limite superior, limite superior + 1).
- Como complemento, seguem casos representativos de **Particionamento de Equivalência (EP)** — um valor "típico" no meio de cada classe válida e inválida, não presentes na tabela original mas recomendados para cobertura completa:

| ID | Cenário / Descrição | Entrada (`idade`) | Saída Esperada | Técnica (EP/BVA) |
|----|----------------------|--------------------|------------------|--------------------|
| CT-11 | Valor típico — inválido (abaixo) | -50 | Erro: "Idade inválida" | EP |
| CT-12 | Valor típico — gratuidade | 3 | Gratuidade — R$ 0,00 | EP |
| CT-13 | Valor típico — meia (jovem) | 12 | Meia-entrada — R$ 20,00 | EP |
| CT-14 | Valor típico — inteira | 35 | Tarifa cheia — R$ 40,00 | EP |
| CT-15 | Valor típico — meia (idoso) | 80 | Meia-entrada — R$ 20,00 | EP |
| CT-16 | Valor típico — inválido (acima) | 200 | Erro: "Idade inválida" | EP |

**Critério de Sucesso:** `MATRIZ_TESTES.md` salvo com todas as saídas e técnicas preenchidas. 