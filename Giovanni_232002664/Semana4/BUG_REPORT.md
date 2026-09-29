**ID do Defeito:** BUG-001
**Título:** `calcular_ingresso` — idade 60 retorna tarifa cheia (R$ 40,00) em vez de meia-entrada (R$ 20,00)
**Severidade:** Alta
**Ambiente:** Python 3.x / Função `calcular_ingresso`
**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `60`.
3. Analisar o valor retornado ou exceção lançada.
**Resultado Esperado:** `20.0` (meia-entrada a partir de 60 anos, inclusive), conforme a especificação oficial.
**Resultado Obtido:** `40.0` (tarifa cheia). Evidência do pytest: `assert 40.0 == 20.0` em `test_meia_idoso`.
**Causa Provável e Sugestão de Correção:** A condição `elif idade <= 60: return 40.0` inclui a idade 60 na tarifa cheia. A tarifa cheia vale apenas de 18 a 59 (inclusive). Ajustar para `elif idade < 60: return 40.0` (ou `idade <= 59`), deixando 60 cair no ramo de meia-entrada (`else: return 20.0`).
