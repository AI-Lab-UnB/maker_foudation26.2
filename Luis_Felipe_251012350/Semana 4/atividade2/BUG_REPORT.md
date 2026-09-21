# Relatório de Defeitos (Bug Report) – Bilheteria do Museu

**Aluno:** Luís Felipe A. Fernandes  
**Matrícula:** 251012350  

---

## ID do Defeito: BUG-001

* **Título:** `calcular_ingresso` — Aceita idade negativa sem disparar exceção e retorna tarifa de gratuidade
* **Severidade:** Média (o defeito só ocorre em condição de contorno: entrada inválida abaixo do limite inferior)
* **Ambiente:** Python 3.x / Função `calcular_ingresso`

### Passos para Reproduzir:
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando um valor negativo para idade: `calcular_ingresso(-1)`.
3. Analisar a resposta da função.

* **Resultado Esperado:** Disparo da exceção `ValueError("Idade inválida")`.
* **Resultado Obtido:** A função retorna `0.0` (tarifa de gratuidade), sem lançar exceção.
* **Teste que acusa a falha:** `test_idade_negativa` (`Failed: DID NOT RAISE ValueError`).
* **Causa Provável e Sugestão de Correção:** Em `bilheteria.py`, linha 3, a validação `if idade > 120:` cobre apenas o limite superior. Como `-1 <= 5`, a função cai no ramo `return 0.0`. Ajuste: validar também o limite inferior, com `if idade < 0 or idade > 120:`.

---

## ID do Defeito: BUG-002

* **Título:** `calcular_ingresso` — Cobra tarifa cheia (R$ 40,00) de visitante com 60 anos em vez de meia-entrada
* **Severidade:** Média (o defeito ocorre apenas na borda inferior da faixa de idosos, exatamente aos 60 anos)
* **Ambiente:** Python 3.x / Função `calcular_ingresso`

### Passos para Reproduzir:
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o valor 60 para idade: `calcular_ingresso(60)`.
3. Analisar o valor retornado.

* **Resultado Esperado:** Retornar `20.0` (meia-entrada para idosos a partir de 60 anos, inclusive).
* **Resultado Obtido:** Retorna `40.0` (tarifa cheia).
* **Teste que acusa a falha:** `test_meia_idoso` (`assert 40.0 == 20.0`).
* **Causa Provável e Sugestão de Correção:** Em `bilheteria.py`, linha 9, a condição `elif idade <= 60:` inclui o 60 na faixa de tarifa cheia. A ordem dos blocos está correta; o erro é só o operador. Ajuste: trocar por `elif idade < 60:` (equivalente a `idade <= 59`), para que 60 caia no `else` da meia-entrada.

---

## Verificação após a correção (Desafio Ninja)

Com as duas correções aplicadas em `bilheteria.py`, o comando `pytest test_bilheteria.py -v` passou de **2 falhas e 4 aprovados** para **6 aprovados (100% em verde)**.