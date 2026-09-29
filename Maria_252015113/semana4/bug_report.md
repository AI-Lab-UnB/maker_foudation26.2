**ID do Defeito:** BUG-001

**Título:** calcular_ingresso com idade 60 retorna tarifa cheia em vez de meia-entrada

**Severidade:** Alta

**Ambiente:** Python 3.x / Função calcular_ingresso

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro 60: `calcular_ingresso(60)`.
3. Analisar o valor retornado.

**Resultado Esperado:** Retorno de 20.0 (meia-entrada aplicável a partir de 60 anos inclusive).

**Resultado Obtido:** Retorno de 40.0 (tarifa cheia).

**Causa Provável e Sugestão de Correção:** 
A falha ocorre na linha `elif idade <= 60: return 40.0`. A condição engloba a idade de 60 anos na tarifa cheia, quando a regra de negócios define que a partir de 60 anos o valor é meia-entrada. A correção sugerida é alterar a condição para `elif idade < 60:`.