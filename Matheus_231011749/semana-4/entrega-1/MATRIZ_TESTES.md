# Matriz de Testes — Bilheteria do Museu

**Módulo:** Bilheteria / Tarifação por Visitante  
**Técnicas Aplicadas:** Particionamento de Equivalência (EP - *Equivalence Partitioning*) e Análise de Valor Limite (BVA - *Boundary Value Analysis*)

---

## 1. Regras de Tarifação (Cenário de Negócio)

* **Entrada Inválida:** Idades `< 0` ou `> 120` disparam exceção `ValueError("Idade inválida")`.
* **Gratuidade (R$ 0,00):** Visitantes de 0 a 5 anos (inclusive).
* **Meia-entrada (R$ 20,00):** Visitantes de 6 a 17 anos (inclusive) e a partir de 60 anos (inclusive, até 120).
* **Tarifa Cheia / Inteira (R$ 40,00):** Visitantes de 18 a 59 anos (inclusive).

---

## 2. Mapeamento das Classes de Equivalência (EP)

Antes de definir os limites, identificamos as partições de valores equivalentes:

| Partição | Faixa de Idade | Categoria | Saída Esperada |
|---|---|---|---|
| **P1 (Inválida)** | `idade < 0` | Entrada inválida (limite inferior) | Erro: "Idade inválida" |
| **P2 (Válida)** | `0 <= idade <= 5` | Gratuidade | R$ 0,00 |
| **P3 (Válida)** | `6 <= idade <= 17` | Meia-entrada (jovem) | R$ 20,00 |
| **P4 (Válida)** | `18 <= idade <= 59` | Tarifa cheia (adulto) | R$ 40,00 |
| **P5 (Válida)** | `60 <= idade <= 120` | Meia-entrada (idoso) | R$ 20,00 |
| **P6 (Inválida)** | `idade > 120` | Entrada inválida (limite superior) | Erro: "Idade inválida" |

---

## 3. Matriz de Casos de Teste (Fase 3 — O Desafio)

Casos de teste estruturados cobrindo todas as bordas e limites entre partições adjacentes:

| ID | Cenário / Descrição | Entrada (`idade`) | Saída Esperada | Técnica (EP/BVA) |
|:---:|:---|:---:|:---|:---:|
| **CT-01** | Limite inferior inválido | `-1` | Erro: "Idade inválida" | BVA |
| **CT-02** | Borda inferior de gratuidade | `0` | R$ 0,00 (Gratuidade) | BVA |
| **CT-03** | Borda superior de gratuidade | `5` | R$ 0,00 (Gratuidade) | BVA |
| **CT-04** | Borda inferior de meia (jovem) | `6` | R$ 20,00 (Meia-entrada) | BVA |
| **CT-05** | Borda superior de meia (jovem) | `17` | R$ 20,00 (Meia-entrada) | BVA |
| **CT-06** | Borda inferior de inteira | `18` | R$ 40,00 (Tarifa cheia) | BVA |
| **CT-07** | Borda superior de inteira | `59` | R$ 40,00 (Tarifa cheia) | BVA |
| **CT-08** | Borda inferior de meia (idoso) | `60` | R$ 20,00 (Meia-entrada) | BVA |
| **CT-09** | Borda superior válida | `120` | R$ 20,00 (Meia-entrada) | BVA |
| **CT-10** | Limite superior inválido | `121` | Erro: "Idade inválida" | BVA |

---

## 4. Justificativa Teórica das Técnicas

* **Particionamento de Equivalência (EP):** Divide o domínio de entrada em conjuntos de dados onde o comportamento esperado do software é idêntico. Ao testar um elemento de uma partição, assume-se que os demais da mesma partição se comportarão da mesma forma.
* **Análise de Valor Limite (BVA):** A experiência mostra que a maioria dos erros de programação ocorre nas transições de fronteira (ex.: uso incorreto de `<`, `<=`, `>`, `>=`). Todos os casos de teste da matriz acima exploram exatamente as extremidades (mínimo, máximo, imediatamente antes e imediatamente depois) de cada partição, garantindo máxima eficácia na detecção de defeitos (*off-by-one errors*).
