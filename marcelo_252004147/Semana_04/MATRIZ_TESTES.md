# Entrega 1: Mentalidade de Testes e Caixa-Preta
**Aluno**: Marcelo Vitor Machado da Silva Filho  
**Matricula**: 252004147

## Tabela de Testes
| ID | Cenário / Descrição | Entrada (idade) | Saída Esperada | Técnica (EP/BVA) |
|-|-|-|-|-|
| CT-01 | Limite inferior inválido | -1 | Exceção: “idade inválida” | BVA |
| CT-02 | Borda inferior de gratuidade | 0 | Gratuidade (R$ 0,00) | BVA |
| CT-03 | Borda superior de gratuidade | 5 | Gratuidade (R$ 0,00) | BVA |
| CT-04 | Borda inferior de meia (jovem) | 6 | Meia-entrada (R$ 20,00) — jovem | BVA |
| CT-05 | Borda superior de meia (jovem) | 17 | Meia-entrada (R$ 20,00) — jovem | BVA |
| CT-06 | Borda inferior de inteira | 18 | Tarifa cheia (R$ 40,00) | BVA |
| CT-07 | Borda superior de inteira | 59 | Tarifa cheia (R$ 40,00) | BVA |
| CT-08 | Borda inferior de meia (idoso) | 60 | Meia-entrada (R$ 20,00) — idoso | BVA |
| CT-09 | Borda superior válida | 120 | Meia-entrada (R$ 20,00) — idoso | BVA |
| CT-10 | Limite superior inválido | 121 | Exceção: “idade inválida” | BVA |
