O kata escolhido foi:

# We're Taking Requests...
A local radio station wants to connect DJs more closely to their audience, so audience members can request songs, vote on songs playing right now, vote on the DJ's daily play list, and so on

Users: unsure; whatever the local "music" community is

Requirements: near-real-time synced with the music on the air; user voting mechanism; mobile-device accessibility

## Justificativa
A aqruitetura funciona porque cada camada resolve exatamente um tipo de problema.
A camada de apresentação garante que a experiência chegue de forma consistente ao público.
A camada de aplicação separa comunicação em tempo real de comunicação pontual, o que é essencial para o requisito de sincronismo.
A camada de domínio mantém as regras de votação isoladas da tecnologia usada por baixo.
A camada de dados divide responsabilidades entre o que precisa ser durável e auditável e o que precisa ser rápido, evitando que a exigência de tempo real comprometa a integridade dos registros
e por fim a infraestrutura absorve a variação natural de tráfego de uma transmissão ao vivo, escalando quando necessário e reduzindo custo quando não há pico.
