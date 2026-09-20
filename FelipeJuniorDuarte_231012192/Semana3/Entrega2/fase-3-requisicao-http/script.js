fetch('https://pokeapi.co/api/v2/pokemon/pikachu')
  .then(response => response.json())
  .then(data => {
    console.log(data); // Mostra o objeto completo no console

    // Exibindo algumas informações na página
    const info = document.getElementById('pokemon-info');
    info.innerHTML = `
      <h2>${data.name}</h2>
      <img src="${data.sprites.front_default}" alt="${data.name}">
      <p>Altura: ${data.height}</p>
      <p>Peso: ${data.weight}</p>
      <p>Tipo: ${data.types.map(t => t.type.name).join(', ')}</p>
    `;
  })
  .catch(error => console.error('Erro ao buscar o Pokémon:', error));