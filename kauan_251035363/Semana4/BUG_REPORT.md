**ID do Defeito:** BUG-001
**Título:** calcular_ingresso: idade 60 retornando 40.0 (tarifa cheia) ao invés de 20.0 (meia entrada idoso) na linha 9 do bilheteria.py
**Severidade:** Alta 
**Ambiente:** Python 3.14.7 / calcular_ingresso

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`
2. Chamar a função passando o parâmetro 60.
3. Analisar o valor retornado ou exceção lançada.
**Resultado Esperado:** 20.0
**Resultado Obtido:** 40.0
**Causa Provável e Sugestão de Correção:** na linha 9 onde tem `elif idade <= 60` mudar para `elif idade < 60`

**ID do Defeito:** BUG-002
**Título:** calcular_ingresso: idade -1 não está retornando ValueError, falta de checagem de idade negativa na linha 3
**Severidade:** Crítica
**Ambiente:** Python 3.14.7 / calcular_ingresso

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`
2. Chamar a função passando o parâmetro -1.
3. Analisar o valor retornado ou exceção lançada.
**Resultado Esperado:** Idade Inválida -> ValueError
**Resultado Obtido:** Failed: DID NOT RAISE ValueError
**Causa Provável e Sugestão de Correção:** na linha 3 onde tem `if idade > 120` mudar para `elif idade > 120 or idade < 0`
