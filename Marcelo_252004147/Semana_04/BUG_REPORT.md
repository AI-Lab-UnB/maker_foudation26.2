# Entrega 2: Falha clara, reproduzível e padronizada
**Aluno**: Marcelo Vitor Machado da Silva Filho  
**Matricula**: 252004147

## Falhas escolhidas  
**ID do Defeito:** BUG-001  
**Título:** 'calcular_ingresso' permite idades negativas dando como gratuidade ao invés de erro.  
**Severidade:** Alta  
**Ambiente:** Python 3.x / Função `calcular_ingresso`  
**Passos para Reproduzir:**  
1. Importar `calcular_ingresso` do módulo `bilheteria`.  
2. Chamar a função passando um número negativo, exemplificando: `calcular_ingresso(-1)`.  
3. Retorna uma gratuidade.
   
**Resultado Esperado:** Lançar exceção com print "Idade Inválida"  
**Resultado Obtido:** Gratuidade (R$0,00)  
**Causa Provável e Sugestão de Correção:** Linha 7 — a parte do código `if idade <= 5:` aceita qualquer valor menor ou igual a 5 (contando também os números negativos). Adicionar estrutura de condição `if idade < 0:` no bloco de verificação inicial.

---

**ID do Defeito:** BUG-002  
**Título:** 'calcular_ingresso' cobra tarifa inteira para clientes com exatos 60 anos.  
**Severidade:** Alta  
**Ambiente:** Python 3.x / Função `calcular_ingresso`  
**Passos para Reproduzir:**  
1. Importar `calcular_ingresso` do módulo `bilheteria`.  
2. Chamar a função passando o valor 60: `calcular_ingresso(60)`.  
3. Retorna uma tarifa inteira ('40.0').
   
**Resultado Esperado:** Retornar o valor de uma meia-entrada para idoso ('20.0')  
**Resultado Obtido:** Retorna o valor de uma tarifa inteira ('40.0')  
**Causa Provável e Sugestão de Correção:** Linha 11 — a estrutura de condição `elif idade <= 60:` inclui 60 anos na faixa de tarifa inteira('40.0'). Mudar a condição para `elif idade < 60:`.
