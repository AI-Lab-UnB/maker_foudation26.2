# Matriz de Testes — Bilheteria do Museu

| ID | Cenário / Descrição | Entrada (`idade`) | Saída Esperada | Técnica (EP/BVA) |
|---|---|---|---|---|
| **CT-01** | Limite inferior inválido | `-1` | Erro: "Idade inválida" | BVA |
| **CT-02** | Borda inferior de gratuidade | `0` | `0.0` (Gratuidade) | BVA |
| **CT-03** | Borda superior de gratuidade | `5` | `0.0` (Gratuidade) | BVA |
| **CT-04** | Borda inferior de meia (jovem) | `6` | `20.0` (Meia-entrada) | BVA |
| **CT-05** | Borda superior de meia (jovem) | `17` | `20.0` (Meia-entrada) | BVA |
| **CT-06** | Borda inferior de inteira | `18` | `40.0` (Tarifa cheia) | BVA |
| **CT-07** | Borda superior de inteira | `59` | `40.0` (Tarifa cheia) | BVA |
| **CT-08** | Borda inferior de meia (idoso) | `60` | `20.0` (Meia-entrada) | BVA |
| **CT-09** | Borda superior válida | `120` | `20.0` (Meia-entrada) | BVA |
| **CT-10** | Limite superior inválido | `121` | Erro: "Idade inválida" | BVA |