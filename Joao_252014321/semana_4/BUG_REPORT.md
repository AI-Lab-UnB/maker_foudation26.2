**ID do defeito** BUG-001 <br>
**Título** `Calcular_ingresso` aplica valor de ingresso inteiro quando a idade é 60 <br>
**Severidade** Alta  <br>
**Ambiente** Python 3.13 / Função `calcular_ingresso` <br>
**Passos para reproduzir**
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro (idade = 60).
3. Analisar o valor retornado. <br>

**Resultado Esperado:** 20.00 (meia entrada) <br>
**Resultado Obtido:** 40.00 (entrada inteira) <br>
**Causa Provável e Sugestão de Correção:** Linha 9 a condição `elif idade <= 60` inclui a idade de 60 anos na faixa de entrada inteira 
subistituir por `elif idade < 60` excluindo a idade de 60 anos da faixa de entrada inteira
