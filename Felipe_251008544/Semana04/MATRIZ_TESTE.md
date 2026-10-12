# Matriz de Testes - Bilheteria

| **ID** | **Cenário / Descrição** | **Entrada (idade)** | **Saída Esperada** | **Saída Obtida (Testes)** | **Técnica** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| CT-01 | Limite inferior inválido | -1 | Erro: "Idade inválida" | `0.0` (Errado) | BVA |
| CT-02 | Borda inferior de gratuidade | 0 | `0.0` | `0.0` | BVA |
| CT-03 | Borda superior de gratuidade | 5 | `0.0` | `0.0` | BVA |
| CT-04 | Borda inferior de meia (jovem) | 6 | `20.0` | `20.0` | BVA |
| CT-05 | Borda superior de meia (jovem) | 17 | `20.0` | `20.0` | BVA |
| CT-06 | Borda inferior de inteira | 18 | `40.0` | `40.0` | BVA |
| CT-07 | Borda superior de inteira | 59 | `40.0` | `40.0` | BVA |
| CT-08 | Borda inferior de meia (idoso) | 60 | `20.0` | `40.0` (Errado) | BVA | 
| CT-09 | Borda superior válida | 120 | `20.0` | `20.0` | BVA |
| CT-10 | Limite superior inválido | 121 | Erro: "Idade inválida | Erro: "Idade inválida" | BVA |
