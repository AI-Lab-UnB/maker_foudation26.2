**ID do defeito:** BUG-001

**Título:** Falha no ``test_meia_idoso``: o teste esperava 20.0 mas a função retornou 40.0 na linha 17

**Severidade:** Média

**Ambiente:** Python 3.12.3 / Função ``calcular_ingresso``

**Passos para reproduzir:**
1. Importar `calcular_ingresso` do módulo ``bilheteria``
2. Chamar a função passando o parâmetro 60
3. Analisar o valor retornado ou exceção lançada
    
**Resultado Esperado:** 20.0

**Resultado obtido:** 40.0

**Causa Provável e Sugestão de Correção:** Trocar <= por < na condição em bilheteria.py na linha 9

---------

**ID do defeito:** BUG-002

**Título:** Falha no ``test_idade_negativa``: o pytest esperava que a função disparasse um ValuError ao receber -1 mas nenhuma exceção foi lançada

**Severidade:** Média

**Ambiente:** Python 3.12.3 / Função ``calcular_ingresso``

**Passos para reproduzir:**
1. Importar `calcular_ingresso` do módulo ``bilheteria``
2. Chamar a função passando o parâmetro -1
3. Analisar o valor retornado ou exceção lançada
    
**Resultado Esperado:** ValuError(Idade inválida)

**Resultado obtido:** retorna 0.0

**Causa Provável e Sugestão de Correção:** Adicionar a verificação de idade negativa antes da gratuidade no ``bilheteria.py``
