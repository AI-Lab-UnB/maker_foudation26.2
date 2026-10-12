**ID do Defeito:** BUG-002
**Título:** `calcular_ingresso` — idade negativa (-1) não dispara ValueError e retorna gratuidade
**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`
**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `-1`.
3. Analisar o valor retornado ou exceção lançada.
**Resultado Esperado:** Exceção `ValueError("Idade inválida")`, pois idade < 0 é entrada inválida segundo a especificação.
**Resultado Obtido:** Nenhum `ValueError` foi lançado. A chamada cai em `idade <= 5` e retorna `0.0` (gratuidade indevida). Evidência do pytest: `Failed: DID NOT RAISE <class 'ValueError'>` em `test_idade_negativa`.
**Causa Provável e Sugestão de Correção:** A validação atual só trata `idade > 120` e omite `idade < 0`. Incluir a checagem no início, por exemplo: `if idade < 0 or idade > 120: raise ValueError("Idade inválida")`.
