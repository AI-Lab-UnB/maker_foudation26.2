fetch('https://pokeapi.co/api/v2/pokemon/eevee')
  .then((response) => response.json())
  .then((data) => {
    console.log('Pokémon:', data.name);
    console.log('Número na Pokédex:', data.id);
    console.log('Altura:', data.height);
    console.log('Peso:', data.weight);
    console.log('Tipos:', data.types.map((t) => t.type.name));
    console.log('Habilidades:', data.abilities.map((a) => a.ability.name));
    console.log('Dados completos:', data);
  })
  .catch((error) => {
    console.error('Erro ao buscar o Pokémon:', error);
  });
