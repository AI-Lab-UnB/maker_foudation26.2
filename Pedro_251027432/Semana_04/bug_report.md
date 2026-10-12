**ID do Defeito:** BUG-001\
**Título:** `calcular_ingresso`: idade 60 retorna tarifa cheia (40.0) em vez de meia-entrada idoso (20.0)\
- **Severidade:** Alta\
- **Ambiente:** Python 3.12.3 / Função 
`calcular_ingresso`\
- **Passos para Reproduzir:**
    1. Importar `calcular_ingresso` do módulo `bilheteria`.\
    2. Chamar a função passando o parâmetro 60.\
    3. Analisar o valor retornado.\
- **Resultado Esperado:** 20.0\
- **Resultado Obtido:** 20.0\
- **Causa Provável e Sugestão de Correção:** Erro de limitação de intervalo na linha *10* do módulo `bilheteria`. Sugiro trocar `<=` por `<`.\

---

**ID do Defeito:** BUG-002\
**Título:** `calcular_ingresso`: idade negativa retorna tarifa gratuíta em vez de levantar erro\
- **Severidade:** Alta\
- **Ambiente:** Python 3.12.3 / Função 
`calcular_ingresso`\
- **Passos para Reproduzir:**
    1. Importar `calcular_ingresso` do módulo `bilheteria`.\
    2. Chamar a função passando parâmetro negativo.\
    3. Analisar o valor retornado.\
- **Resultado Esperado:** Erro\
- **Resultado Obtido:** 0.0\
- **Causa Provável e Sugestão de Correção:** Erro de intervalo na linha *3* do módulo `bilheteria`. Sugiro adicionar condição `or idade < 0`.