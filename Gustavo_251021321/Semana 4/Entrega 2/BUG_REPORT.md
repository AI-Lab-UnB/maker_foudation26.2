**ID do Defeito:** BUG-001
**Título:** calcular_ingresso retorna tarifa cheia (R$ 40) para idade=60, deveria ser meia-entrada
**Severidade:** Média
**Ambiente:** Python 3.x / Função `calcular_ingresso`

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar `calcular_ingresso(60)`.
3. Observar o valor retornado.

**Resultado Esperado:** 20.0 (meia-entrada — a regra diz "a partir de 60 anos, inclusive")

**Resultado Obtido:** 40.0 (tarifa cheia)

**Causa Provável e Sugestão de Correção:** na linha `elif idade <= 60: return 40.0`, o `<=` inclui erroneamente a idade 60 na faixa de tarifa cheia. Trocar para `elif idade < 60:` resolve — 60 passa a cair no `else`, que já retorna 20.0 corretamente.

