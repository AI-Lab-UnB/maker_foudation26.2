# Entrega 2: Falha clara, reproduzível e padronizada
**Aluno**: Marcelo Vitor Machado da Silva Filho  
**Matricula**: 252004147

## Falha escolhida
**ID do Defeito:** BUG-001  
**Título:** 'calcular_ingresso' permite idades negativas dando como gratuidade ao invés de erro.   
**Severidade:** Alta  
**Ambiente:** Python 3.x / Função `calcular_ingresso`  
**Passos para Reproduzir:**  
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando um número negativo, exemplificando: `calcular_ingresso(-1)`.
3. Retorna uma gratuidade.
   
**Resultado Esperado:** Lançar exceção com print "Idade Inválida"  
**Resultado Obtido:** Gratuidade
**Causa Provável e Sugestão de Correção:** Linha 7 — a parte do código `if idade <= 5:` aceita qualquer valor menor ou igual a 5 (contando também os números negativos). Adicionar estrutura de condição `if idade < 0:` no bloco de verificação inicial.
