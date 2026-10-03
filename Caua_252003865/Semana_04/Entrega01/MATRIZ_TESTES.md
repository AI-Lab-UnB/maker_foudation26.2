# Matriz de testes - Bilheteria

<h3> Regras aplicadas: Particionamento de equivalência(EP) e Análise de Valor limite (BVA)</h3>


Cenário de negócio: Bilheteria de um museu

Tarifação

- Entrada inválida: idades < 0 ou idades > 120 disparam a exceção "Idade inválida"
- Gratuidade(R$ 0,00): de 0 a 5 anos (inclusive).
- Meia-entrada(R$ 20,00): de 6 a 17 anos (inclusive) e a partir de 60 anos (inclusive).
- Tarifa cheia(R$ 40,00): de 18 a 59 anos (inclusive).

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 ID | Cenário/descrição | Entrada(idade) | Saida Esperada | Técnica (EP/BVA)|
| :--- | :--- | :--- | :--- | :--- | 
|CT-01| Limite inferior inválido | -1 | Erro: "Idade inválida" | BVA |
|CT-02| Borda inferior de gratuidade | 0 | Gratuidade: R$ 0,00 | BVA |
|CT-03| Borda superior de gratuidade | 5 | Gratuidade: R$ 0,00 | BVA |
|CT-04| Borda inferior de meia (jovem) | 6 | Meia: R$ 20,00 | BVA |
|CT-05| Borda superior de meia (jovem) | 17 | Meia: R$ 20,00 | BVA |
|CT-06| Borda inferior de inteira | 18 | Inteira: R$ 40,00 | BVA |
|CT-07| Borda superior de inteira | 59 | Inteira: R$ 40,00 | BVA |
|CT-08| Borda inferior de meia (idoso) | 60 | Meia: R$ 20,00 | BVA |
|CT-09| Borda superior válida | 120 | Meia: R$ 20,00 | BVA |
|CT-10| Limite superior inválido | 121 | Erro: "Idade inválida" | BVA  |

Nesse cenário de testes todos os testes realizados foram de Análise de valor limite (BVA) pois não houve um valor intermediário entre as classes.


