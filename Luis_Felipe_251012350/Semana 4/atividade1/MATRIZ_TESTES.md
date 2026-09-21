
# Matriz de Testes — Caçador de Bugs na Bilheteria

**Aluno:** Luís Felipe A. Fernandes  
**Matrícula:** 251012350  


## Regras de Tarifação (por visitante)

| Faixa de idade | Resultado |
|---|---|
| < 0 ou > 120 | Exceção `"Idade inválida"` |
| 0 a 5 (inclusive) | Gratuidade (R$ 0,00) |
| 6 a 17 (inclusive) e a partir de 60 (inclusive) | Meia-entrada (R$ 20,00) |
| 18 a 59 (inclusive) | Tarifa cheia (R$ 40,00) |

## Casos de Teste (BVA / EP)

### Análise de Valor Limite (BVA)

| ID | Cenário / Descrição | Entrada (`idade`) | Saída Esperada | Técnica (EP/BVA) |
|---|---|---|---|---|
| **CT-01** | Limite inferior inválido | -1 | `ValueError`: "Idade inválida" | BVA |
| **CT-02** | Borda inferior de gratuidade | 0 | R$ 0,00 | BVA |
| **CT-03** | Borda superior de gratuidade | 5 | R$ 0,00 | BVA |
| **CT-04** | Borda inferior de meia (jovem) | 6 | R$ 20,00 | BVA |
| **CT-05** | Borda superior de meia (jovem) | 17 | R$ 20,00 | BVA |
| **CT-06** | Borda inferior de inteira | 18 | R$ 40,00 | BVA |
| **CT-07** | Borda superior de inteira | 59 | R$ 40,00 | BVA |
| **CT-08** | Borda inferior de meia (idoso) | 60 | R$ 20,00 | BVA |
| **CT-09** | Borda superior válida | 120 | R$ 20,00 | BVA |
| **CT-10** | Limite superior inválido | 121 | `ValueError`: "Idade inválida" | BVA |

### Particionamento de Equivalência (EP)

| ID | Cenário / Descrição | Entrada (`idade`) | Saída Esperada | Técnica (EP/BVA) |
|---|---|---|---|---|
| **CT-11** | Valor representativo da gratuidade | 3 | R$ 0,00 | EP |
| **CT-12** | Valor representativo da meia (jovem) | 12 | R$ 20,00 | EP |
| **CT-13** | Valor representativo da inteira | 35 | R$ 40,00 | EP |
| **CT-14** | Valor representativo da meia (idoso) | 80 | R$ 20,00 | EP |
| **CT-15** | Partição inválida abaixo do limite | -50 | `ValueError`: "Idade inválida" | EP |
| **CT-16** | Partição inválida acima do limite | 200 | `ValueError`: "Idade inválida" | EP |

