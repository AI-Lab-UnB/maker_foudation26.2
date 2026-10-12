# Matriz de Testes — Bilheteria do Museu

Casos de teste projetados por **Particionamento de Equivalência (EP)** e **Análise de Valor Limite (BVA)**.

## Regra de negócio (especificação)

| Faixa de idade | Valor |
|---|---|
| < 0 ou > 120 | Exceção: "Idade inválida" |
| 0 a 5 (inclusive) | R$ 0,00 — gratuidade |
| 6 a 17 (inclusive) | R$ 20,00 — meia-entrada (jovem) |
| 18 a 59 (inclusive) | R$ 40,00 — tarifa cheia |
| 60 a 120 (inclusive) | R$ 20,00 — meia-entrada (idoso) |

## Casos de teste

| ID | Cenário / Descrição | Entrada (`idade`) | Saída Esperada | Técnica (EP/BVA) |
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

## Justificativa da coluna Técnica

Todos os dez casos são **BVA**, e isso não é coincidência: cada entrada da matriz é o primeiro ou o último valor de uma faixa, ou o vizinho imediato de uma fronteira. Nenhuma delas é um valor "do meio".

A razão de a matriz ser assim é que defeito de faixa quase nunca aparece no centro. Ninguém erra ao escrever `idade == 30`. Erra-se entre `<` e `<=`, entre `>` e `>=` — e é exatamente nos valores 5/6, 17/18, 59/60 e 120/121 que esse tipo de engano aparece.

**Nota sobre EP:** como as cinco partições de equivalência são
`[< 0]`, `[0–5]`, `[6–17]`, `[18–59]`, `[60–120]` e `[> 120]`, cada valor acima também serve como representante da sua partição — então a cobertura por EP fica satisfeita de carona. O que a matriz **não** contém é um caso puramente de EP, isto é, um valor central sem relação com fronteira.

Casos assim, que valeria acrescentar para completar a cobertura por EP:

| ID | Cenário | Entrada | Saída Esperada | Técnica |
|---|---|---|---|---|
| CT-11 | Representante da partição de gratuidade | 3 | R$ 0,00 | EP |
| CT-12 | Representante da partição jovem | 12 | R$ 20,00 | EP |
| CT-13 | Representante da partição adulta | 30 | R$ 40,00 | EP |
| CT-14 | Representante da partição idosa | 80 | R$ 20,00 | EP |

## Observação

As saídas esperadas acima foram derivadas **apenas da especificação de negócio**, antes da execução contra a implementação. Isso é o que permite que os testes acusem defeito: se o esperado fosse extraído do próprio código, todo teste passaria e nenhum bug seria encontrado.

A execução contra `bilheteria.py` revelou divergências nos casos **CT-01** e **CT-08** — documentadas em `BUG_REPORT.md`.