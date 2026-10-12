## Estudos de SQL e API

- Anotações dos estudos de SQL feitos pelo jogo Lost in SQL. E estudos sobre API feitos pelo jogo The Status Rebellio

## Registro de Prática: Lost at SQL


Durante a campanha do jogo, pratiquei os seguintes conceitos fundamentais de SQL (Structured Query Language):

1. Extração e Filtragem de Dados (Data Retrieval)
``SELECT *`` e ``SELECT [coluna]``: localização e visualização de tabelas do sistema do submarino (como relatórios de danos e inventário).
WHERE: filtragem de registros específicos (ex: isolar apenas os compartimentos que sofreram inundações ou falhas críticas).
Operadores lógicos (``AND, OR, NOT``): combinação de condições para refinar buscas complexas em situações de emergência.
Operadores de comparação (``=, >, <, LIKE``): identificação de níveis de oxigênio perigosos ou busca por termos parciais em logs textuais.
2. Modificação e Correção de Dados (Data Manipulation)
UPDATE: alteração de valores em registros existentes para corrigir erros de sistema e reverter corrupção de dados causada pela explosão.
DELETE: remoção de registros duplicados, corrompidos ou maliciosos que travavam o computador de bordo.
3. Organização e Análise Básica:
``ORDER BY (ASC/DESC)``: ordenação de prioridades (ex: listar falhas das mais graves para as menos graves).
Resolução de problemas (debug): leitura de mensagens de erro de sintaxe e aplicação de lógica de banco de dados sob pressão narrativa.


## Resumo de Estudos: Códigos de Status HTTP 

Os códigos de status HTTP são respostas padronizadas que os servidores enviam aos clientes (navegadores, aplicativos) para indicar o resultado de uma requisição. Eles são divididos em **5 categorias principais**, identificadas pelo primeiro dígito.


### 1xx: Respostas Informativas
Indicam que a requisição foi recebida e o processo continua em andamento.
*   **100 Continue:** O servidor recebeu os cabeçalhos iniciais e o cliente pode continuar enviando o restante dos dados.
*   **101 Switching Protocols:** O servidor aceitou mudar o protocolo da comunicação (ex: mudando de HTTP para WebSocket).

### 2xx: Sucesso
Indicam que a ação do cliente foi recebida, compreendida e aceita com sucesso.
*   **200 OK:** A requisição foi bem-sucedida. O resultado depende do método (GET, POST, etc.).
*   **201 Created:** A requisição foi bem-sucedida e um novo recurso foi criado no servidor (comum em POST).
*   **204 No Content:** A requisição foi bem-sucedida, mas não há conteúdo para retornar no corpo da resposta.

### 3xx: Redirecionamento
Indicam que o cliente precisa tomar uma ação adicional para completar a requisição.
*   **301 Moved Permanently:** A URL do recurso mudou permanentemente para um novo endereço.
*   **302 Found (Moved Temporarily):** O recurso mudou de endereço temporariamente.
*   **304 Not Modified:** O recurso não mudou desde a última requisição. Usado para otimizar o cache do navegador.

### 4xx: Erros do Cliente
Indicam que houve um problema com a requisição enviada pelo cliente.
*   **400 Bad Request:** A requisição está malformada ou o servidor não conseguiu entendê-la.
*   **401 Unauthorized:** O cliente precisa se autenticar (fazer login) para acessar o recurso.
*   **403 Forbidden:** O cliente está autenticado, mas não tem permissão de acesso para aquele recurso específico.
*   **404 Not Found:** O servidor não conseguiu encontrar o recurso solicitado (a URL não existe).

### 5xx: Erros do Servidor
Indicam que o cliente fez tudo certo, mas o servidor falhou ao tentar processar a requisição.
*   **500 Internal Server Error:** Um erro genérico ocorreu no servidor (geralmente uma falha no código do backend).
*   **502 Bad Gateway:** O servidor, agindo como proxy, recebeu uma resposta inválida do servidor upstream.
*   **503 Service Unavailable:** O servidor está temporariamente indisponível (geralmente por sobrecarga ou manutenção).
*   **504 Gateway Timeout:** O servidor proxy não recebeu uma resposta a tempo do servidor principal.

---
