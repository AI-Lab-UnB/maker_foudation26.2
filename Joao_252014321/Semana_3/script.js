
const meuPokemonFavorito = "chandelure";
const url = `https://pokeapi.co/api/v2/pokemon/${meuPokemonFavorito}`;
const pokemonCard = document.getElementById("pokemon-card");

fetch(url)
  .then((resposta) => {
    
    if (!resposta.ok) {
      throw new Error(`Erro na requisição: ${resposta.status}`);
    }
    
    return resposta.json();
  })
  .then((dados) => {
    
    console.log("Dados recebidos da PokéAPI:", dados); 
    const nome = dados.name;
    const imagem = dados.sprites.other["official-artwork"].front_default;
    const tipos = dados.types.map((t) => t.type.name).join(", ");
    const altura = dados.height / 10; 
    const peso = dados.weight / 10;   

    pokemonCard.innerHTML = `
      <img class="pokemon-img" src="${imagem}" alt="Imagem do Pokémon ${nome}">
      <h3 class="pokemon-nome">${nome}</h3>
      <p class="pokemon-info-linha"><strong>Tipo:</strong> ${tipos}</p>
      <p class="pokemon-info-linha"><strong>Altura:</strong> ${altura} m</p>
      <p class="pokemon-info-linha"><strong>Peso:</strong> ${peso} kg</p>
    `;
  })
  .catch((erro) => {
    console.error("Não foi possível buscar o Pokémon:", erro);
    pokemonCard.innerHTML = `<p class="pokemon-status">Não foi possível carregar o Pokémon. Tente novamente.</p>`;
  });
