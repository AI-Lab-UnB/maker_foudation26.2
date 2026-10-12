## Conceito

- Arquitetura em camadas = organização horizontal em níveis hierárquicos.
- Regras:
1. Cada camada depende da camada imediatamente abaixo.
2. Camadas superiores delegam trabalho para as inferiores (nunca o contrário).
3. Cada camada tem responsabilidade única e bem documentada.
4. Não há número fixo de camadas — depende do bom senso e da complexidade do domínio.

- Organização de pacotes/módulos no código é a "EAP" (estrutura analítica) dessa arquitetura.

## Mapeamento do modelo

| Camada           | Responsabilidade                                                                 |
| ----------------- | --------------------------------------------------------------------------------- |
| **Apresentação**  | Recebe requisições (REST API, Admin UI), autentica e avisa em tempo real (WebSocket) |
| **Aplicação**     | Orquestra os casos de uso (reserva, compra, pagamento, taxa, notificação)          |
| **Domínio**       | Entidades e regras de negócio (Show, Ticket, Order, Payment, Fee, Reseller)         |
| **Dados**         | Persiste e garante consistência (PostgreSQL com constraint única, Redis com lock)   |
| **Infraestrutura**| Fila de eventos, gateway de pagamento externo, banco e cache hospedados             |

## Porque a arquitetura atende aos Requisitos

A divisão em cinco camadas (Apresentação, Aplicação, Domínio, Dados, Infraestrutura) isola cada responsabilidade do sistema: quem recebe requisição não decide regra de negócio, quem decide regra de negócio não sabe como os dados são persistidos.

Isso resolve os requisitos do Ticket to Server de forma direta:
- Consistência (não vender o mesmo ingresso duas vezes) fica concentrada na camada de Dados, sem vazar para o resto do sistema.
- Escalabilidade: é possível porque cada camada pode crescer sozinha — ex.: escalar Aplicação sem tocar em Dados.
- Manutenção: melhora porque uma mudança de regra de negócio não exige mexer em Controller ou Infra.
- Confiabilidade: vem do baixo acoplamento: trocar um componente de infraestrutura (fila, banco) não quebra o Domínio.

## Links 

### para o Diagrama

https://excalidraw.com/#json=lRJ9qCgOl9WytmwtKQLkP,ao-ZfM4eD8Zu0VOD0bU1xw

### Link para o Problema Katas

https://www.architecturalkatas.com/kata.html?kata=TicketToServe.json