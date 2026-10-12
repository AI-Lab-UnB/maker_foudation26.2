**ID	do	Defeito:**	BUG-001 

**Título:**	[Bilheteria] Ao receber idade negativa a função retorna gratuidade ao invés de disparar erro (ValueError), linha 2; Ao receber idade exata de 60 anos a função cobra valor inteiro ao invés de aplicar meia-entrada, linha 6.

**Severidade:**	Média

**Ambiente:**	Python	3.x	/	Função	`calcular_ingresso` 

**Passos	para	Reproduzir:** 
1. Importar	`calcular_ingresso`	do	módulo	`bilheteria`.
2.	Chamar	a	função	passando	o	parâmetro	X.
3.	Analisar	o	valor	retornado	ou	exceção	lançada.

**Resultado	Esperado:** 
- Em `test_idade_negativa`: esperava que a função disparasse um erro (`ValueError`) caso alguém passasse uma idade menor que zero.
- Em `test_meia_idoso`: Esperava que ao testar com a idade de `60` anos, o valor retornado fosse `20.0` (meia-entrada).

**Resultado	Obtido:**
- Em  `test_idade_negativa`: Se alguém passasse a idade `-1`, a função caía na próxima verificação (`idade <= 5`) e dizia que a entrada seria grátis (retornava `0.0`), o que é incorreto.
- Em `test_meia_idoso`: A checagem era menor ou igual (`<= 60`), o que fazia com que uma pessoa de exatamente `60` anos pagasse a inteira (`40.0`)

**Causa	Provável	e	Sugestão	de	Correção:**
 - Em  `test_idade_negativa`: Foi adicionado `or idade < 0`, na linha `2`.
   
     **Como era:**
   
       if idade > 120:
          raise ValueError("Idade inválida")
   
     **Como Ficou:**

       if idade > 120 or idade < 0:
          raise ValueError("Idade inválida")
   
- Em `test_meia_idoso`: Foi trocado para apenas menor (`< 60`), quem tem até `59` anos paga inteira e quem tem de `60` para cima cai na regra final do else, pagando a meia de `20.0`, na linha `8`.

    **Como era:**

      elif idade <= 60:
          return 40.0
    **Como ficou:**

      elif idade < 60:
          return 40.0

  
