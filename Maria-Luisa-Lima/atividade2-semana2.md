# Atividade 2 - Arquitetura de Software (Kata: Fantasy Fantasy NFL)

## Diagrama em Camadas
![Diagrama de Arquitetura em Camadas](diagrama-arquitetura.png)

## Justificativa da Arquitetura
A arquitetura em 5 camadas foi escolhida para o *Fantasy Fantasy NFL* pois garante a rigorosa separação de preocupações, isolando a interface do usuário das pesadas rotinas de edição de mídia. Essa estrutura atende aos requisitos funcionais ao centralizar as regras de ligas na camada de Domínio, enquanto satisfaz os requisitos não-funcionais ao utilizar filas assíncronas (RabbitMQ) e armazenamento em nuvem (S3) na Infraestrutura. Isso permite que o sistema escale horizontalmente para suportar milhões de usuários simultâneos, sem travar o processamento em lote e o envio dos vídeos.