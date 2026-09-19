**ID	do	Defeito:**	BUG-001 

**Título:**	[Componente	+	Condição	+	Comportamento	Incorreto,	em	uma	linha] 

**Severidade:**	[Crítica	|	Alta	|	Média	|	Baixa] 

**Ambiente:**	Python	3.x	/	Função	`calcular_ingresso` 

**Passos	para	Reproduzir:** 
1. Importar	`calcular_ingresso`	do	módulo	`bilheteria`.
2.	Chamar	a	função	passando	o	parâmetro	X.
3.	Analisar	o	valor	retornado	ou	exceção	lançada.

**Resultado	Esperado:** 
- Em `test_idade_negativa` : Esperava que o código desse erro se a idade fosse menor que 0, mas a validação não estava cobrindo valores negativos.

**Resultado	Obtido:**	[o	retorno	incorreto	observado]
**Causa	Provável	e	Sugestão	de	Correção:**
[linha	do	código	e	ajuste	lógico	necessário]
