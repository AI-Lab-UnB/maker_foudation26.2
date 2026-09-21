
# Matriz de Testes — Caçador de Bugs na Bilheteria

**Aluno:** Luís Felipe A. Fernandes  
**Matrícula:** 251012350  

## Casos de Teste (BVA / EP)

| ID | Cenário / Descrição | Entrada (`idade`) | Saída Esperada | Técnica (EP/BVA) |
|---|---|---|---|---|
| **CT-01** | Limite inferior inválido | -1 | Erro: "Idade inválida" | BVA |
| **CT-02** | Borda inferior de gratuidade | 0 | R$ 0,00 | BVA |
| **CT-03** | Borda superior de gratuidade | 5 | R$ 0,00 | BVA |
| **CT-04** | Borda inferior de meia (jovem) | 6 | R$ 20,00 | BVA |
| **CT-05** | Borda superior de meia (jovem) | 17 | R$ 20,00 | BVA |
| **CT-06** | Borda inferior de inteira | 18 | R$ 40,00 | BVA |
| **CT-07** | Borda superior de inteira | 59 | R$ 40,00 | BVA |
| **CT-08** | Borda inferior de meia (idoso) | 60 | R$ 20,00 | BVA |
| **CT-09** | Borda superior válida | 120 | R$ 20,00 | BVA |
| **CT-10** | Limite superior inválido | 121 | Erro: "Idade inválida" | BVA |

