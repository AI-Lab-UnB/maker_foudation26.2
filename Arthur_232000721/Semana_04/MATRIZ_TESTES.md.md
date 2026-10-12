# MATRIZ DE TESTES — Bilheteria do Museu

## Regras de negócio

- Idades menores que 0 ou maiores que 120 devem lançar `ValueError("Idade inválida")`.
- De 0 a 5 anos: **R$ 0,00**.
- De 6 a 17 anos: **R$ 20,00**.
- De 18 a 59 anos: **R$ 40,00**.
- A partir de 60 até 120 anos: **R$ 20,00**.

## Casos de teste

| ID | Cenário / Descrição | Entrada (`idade`) | Saída Esperada | Técnica |
|---|---|---:|---|---|
| CT-01 | Limite inferior inválido | -1 | Erro: `Idade inválida` | BVA |
| CT-02 | Borda inferior de gratuidade | 0 | R$ 0,00 | BVA |
| CT-03 | Borda superior de gratuidade | 5 | R$ 0,00 | BVA |
| CT-04 | Borda inferior de meia (jovem) | 6 | R$ 20,00 | BVA |
| CT-05 | Borda superior de meia (jovem) | 17 | R$ 20,00 | BVA |
| CT-06 | Borda inferior de inteira | 18 | R$ 40,00 | BVA |
| CT-07 | Borda superior de inteira | 59 | R$ 40,00 | BVA |
| CT-08 | Borda inferior de meia (idoso) | 60 | R$ 20,00 | BVA |
| CT-09 | Borda superior válida | 120 | R$ 20,00 | BVA |
| CT-10 | Limite superior inválido | 121 | Erro: `Idade inválida` | BVA |

## Observação sobre a técnica

Todos os casos fornecidos no enunciado exercitam diretamente as fronteiras entre as faixas de idade.
Por isso, a técnica predominante em todas as linhas é **BVA (Boundary Value Analysis / Análise de Valor Limite)**.

O **Particionamento de Equivalência (EP)** também poderia ser usado com valores internos representativos de cada classe,
por exemplo: `3`, `10`, `30`, `70` e `130`. Esses valores não fazem parte da tabela solicitada no enunciado.
