# Matriz de Testes: Bilheteria do Museu

Entrega 1 da Semana 4: matriz de casos de teste para a função de cálculo de ingresso da bilheteria do museu, construída com Análise de Valor Limite (BVA), além do resultado da execução da suíte de testes contra a implementação entregue.

Regra de negócio (referência):
- Entrada inválida: idade < 0 ou > 120 (exceção "Idade inválida")
- Gratuidade (R$ 0,00): 0 a 5 anos
- Meia entrada (R$ 20,00): 6 a 17 anos e a partir de 60 anos
- Tarifa cheia (R$ 40,00): 18 a 59 anos

| ID | Cenário / Descrição | Entrada (idade) | Saída Esperada | Técnica (EP/BVA) |
|---|---|---|---|---|
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

Todas as linhas foram montadas com Análise de Valor Limite (BVA), já que o próprio desafio pede foco nas bordas de cada faixa etária. Não usei Particionamento de Equivalência isolado porque cada classe (gratuidade, meia jovem, inteira, meia idoso, inválida) só tem duas idades representativas nesta tabela, que são exatamente os limites; um valor "do meio" de cada classe (ex: idade 30 para tarifa cheia) ficaria redundante com CT-06/CT-07 e não foi pedido na tabela.

## Resultado da execução (`pytest test_bilheteria.py -v`)

Rodei a suíte de testes contra o `bilheteria.py` entregue. 2 de 6 testes falharam:

- `test_meia_idoso` falhou em `calcular_ingresso(60)`: retornou `40.0`, mas o esperado (CT-08) é `20.0`.
- `test_idade_negativa` falhou: `calcular_ingresso(-1)` não lançou `ValueError`, retornou `0.0` (CT-01 esperava erro).

Os outros 4 testes (CT-02/03, CT-04/05, CT-06/07, CT-10) passaram normalmente.