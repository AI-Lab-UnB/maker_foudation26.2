# Fase 3 - Requisição HTTP

## Objetivo
Fazer uma requisição HTTP usando `fetch` para buscar informações de um Pokémon na PokéAPI e exibir o resultado.

## O que o código faz
- Usa `fetch()` para chamar o endpoint da PokéAPI:
  `https://pokeapi.co/api/v2/pokemon/{nome-do-pokemon}`
- Converte a resposta para JSON com `.json()`
- Exibe os dados completos no console do navegador (`console.log`)
- Mostra na página HTML o nome, imagem, altura, peso e tipo(s) do Pokémon

## Arquivos
- `index.html` — estrutura básica da página
- `script.js` — código que faz a requisição e exibe os dados

## Como executar
1. Abra o arquivo `index.html` no navegador
2. Abra o console (F12 → aba "Console") para ver os dados retornados pela API
3. As informações também aparecem diretamente na página

## Pokémon escolhido
Pikachu (pode ser trocado alterando o nome na URL do `fetch`)