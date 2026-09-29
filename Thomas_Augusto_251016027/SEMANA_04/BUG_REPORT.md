**ID do Defeito:** BUG-001  
**Título:** calcular_ingresso com **idade 60** retorna o valor da **entrada inteira** ao invés da meia  
**Severidade:** Alta  
**Ambiente:** Python 3.12.3 | gcc 13.3.0 Linux / Função `calcular_ingresso`  

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.  
2. Chamar a função passando o parâmetro `60`.  
3. Analisar o valor retornado ou exceção lançada.  

**Resultado Esperado:** 20.0  
**Resultado Obtido:** 40.0  

**Causa Provável e Sugestão de Correção:** Na condição da entrada cheia, a linha `elif idade <= 60:` inclui a idade de 60 anos, que deveria entrar na classe da meia-entrada. A correção necessária é alterar o operador lógico para estritamente menor que 60, modificando a linha para `elif idade < 60:`.

---

**ID do Defeito:** BUG-002  
**Título:** calcular_ingresso com **idade negativa** retorna **gratuidade** em vez de exceção  
**Severidade:** Média  
**Ambiente:** Python 3.12.3 | gcc 13.3.0 Linux / Função `calcular_ingresso`  

**Passos para Reproduzir:**
1. Importar `calcular_ingresso` do módulo `bilheteria`.  
2. Chamar a função passando o parâmetro `-1`.  
3. Analisar o valor retornado ou exceção lançada.  

**Resultado Esperado:** Exceção `ValueError` contendo a mensagem "Idade inválida".  
**Resultado Obtido:** 0.0  

**Causa Provável e Sugestão de Correção:** A validação inicial no bloco `if idade > 120:` não verifica se a idade está abaixo do limite inferior (que é 0). Portanto, valores negativos são admitidos na execução e entram na cláusula `if idade <= 5:`, retornando preço 0 (grátis). A correção sugerida é alterar a validação inicial para verificar ambos os limites: `if idade < 0 or idade > 120:`.
