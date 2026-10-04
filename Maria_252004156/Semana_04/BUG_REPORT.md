**ID do Defeito:** BUG-001

**Título:** Função calcular_ingresso cobra tarifa cheia (40.0) para idade de 60 anos, ao invés de meia-entrada.

**Severidade:** Alta (regra de negócio importante é calculada incorretamente em casos de uso frequentes).

**Ambiente:** Python 3.14.4 / Função calcular_ingresso

**Passos para Reproduzir:**
1. Importar **calcular_ingresso** do módulo **bilheteria**.
2. Chamar a função passando o parâmetro 60 (idade).
3. Analisar o valor retornado.

**Resultado Esperado:** O retorno deve ser 20.0, correspondente à meia-entrada para visitantes a partir de 60 anos (inclusive).

**Resultado Obtido:** O retorno foi 40.0 (tarifa cheia).

**Causa Provável e Sugestão de Correção:** 
O erro de lógica ocorre na condição que define a tarifa cheia. A linha **elif idade <= 60:** inclui a idade de 60 anos na faixa de R$ 40,00. 
Para corrigir, o operador deve ser ajustado para excluir o 60 dessa faixa, alterando a linha para: **elif idade < 60:**. Dessa forma, o valor 60 cairá no bloco else: final, retornando 20.0.

---

**ID do Defeito:** BUG-002

**Título:** Função calcular_ingresso não valida idade negativa e retorna 0.0 (gratuidade) em vez de lançar exceção.

**Severidade:** Média (falha restrita a entrada inválida, condição de contorno pouco comum).

**Ambiente:** Python 3.14.4 / Função calcular_ingresso

**Passos para Reproduzir:**
1. Importar **calcular_ingresso** do módulo **bilheteria**.
2. Chamar a função passando o parâmetro -1 (idade).
3. Analisar o valor retornado ou exceção lançada.

**Resultado Esperado:** Lançar **ValueError("Idade inválida")**, pois idades menores que 0 são inválidas.

**Resultado Obtido:** Nenhuma exceção é lançada e o retorno é 0.0 (gratuidade).

**Causa Provável e Sugestão de Correção:**
A validação de limites gerais só verifica **if idade > 120:** e não trata idades negativas, então -1 cai em **elif idade <= 5:** e retorna 0.0. Para corrigir, alterar a linha para: **if idade < 0 or idade > 120:**.