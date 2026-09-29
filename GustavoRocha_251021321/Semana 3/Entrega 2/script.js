const pokemonNome = 'mewtwo';

fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNome}`)
  .then(resposta => resposta.json())
  .then(dados => {
    console.log(dados);
    document.body.innerHTML += `
      <h2>${dados.name}</h2>
      <img src="${dados.sprites.front_default}" alt="${dados.name}">
      <p>Altura: ${dados.height}</p>
      <p>Peso: ${dados.weight}</p>
    `;
  })
  .catch(erro => console.error('Erro ao buscar o Pokémon:', erro));