# Matriz de Testes — Bilheteria do Museu

Técnicas aplicadas: Particionamento de Equivalência (EP) e Análise de Valor Limite (BVA)

Regras de tarifação:
- Idade < 0 ou > 120 → erro "Idade inválida"
- 0 a 5 (inclusive) → Gratuidade (R$ 0,00)
- 6 a 17 (inclusive) → Meia-entrada (R$ 20,00)
- 18 a 59 (inclusive) → Tarifa cheia (R$ 40,00)
- 60+ (inclusive) → Meia-entrada (R$ 20,00)

| ID | Cenário / Descrição | Entrada (idade) | Saída Esperada | Técnica (EP/BVA) |
|----|----------------------|------------------|-----------------|-------------------|
| CT-01 | Limite inferior inválido | -1 | Erro: "Idade inválida" | BVA |
| CT-02 | Borda inferior de gratuidade | 0 | R$ 0,00 | BVA |
| CT-03 | Borda superior de gratuidade | 5 | | |
| CT-04 | Borda inferior de meia (jovem) | 6 | | |
| CT-05 | Borda superior de meia (jovem) | 17 | | |
| CT-06 | Borda inferior de inteira | 18 | | |
| CT-07 | Borda superior de inteira | 59 | | |
| CT-08 | Borda inferior de meia (idoso) | 60 | R$ 20,00 | BVA |
| CT-09 | Borda superior válida | 120 | | |
| CT-10 | Limite superior inválido | 121 | | |
