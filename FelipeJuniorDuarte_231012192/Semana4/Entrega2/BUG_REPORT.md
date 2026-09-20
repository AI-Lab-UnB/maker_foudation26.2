ID do Defeito: BUG-001

Título: calcular_ingresso() cobra tarifa cheia (R$ 40,00) em vez de meia-entrada para idade 60

Severidade: Alta

Ambiente: Python 3.x / Função `calcular_ingresso` (módulo `bilheteria.py`)

Passos para Reproduzir:
1. Importar `calcular_ingresso` do módulo `bilheteria`.
2. Chamar a função passando o parâmetro `idade = 60`.
3. Analisar o valor retornado.

Resultado Esperado:
Conforme a especificação, visitantes a partir de 60 anos (inclusive) têm direito a meia-entrada. Logo, `calcular_ingresso(60)` deveria retornar `20.0`.

Resultado Obtido:
A função retorna `40.0` (tarifa cheia) para `idade = 60`, tratando o visitante como se estivesse na faixa de 18 a 59 anos.

Causa Provável e Sugestão de Correção:
Na linha `elif idade <= 60: return 40.0`, o operador `<=` inclui incorretamente o valor 60 na faixa de tarifa cheia. A condição deveria ser `elif idade < 60: return 40.0`, deixando a idade 60 cair na cláusula `else`, que já retorna corretamente `20.0` para idosos.