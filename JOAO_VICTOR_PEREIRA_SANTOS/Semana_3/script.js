
const meuPokemon = 'blaziken'; 

fetch(`https://pokeapi.co/api/v2/pokemon/${meuPokemon}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Pokémon não encontrado');
        }
        return response.json();
    })
    .then(data => {
        console.log("Dados do Pokémon:", data);

        const pokemonContainer = document.getElementById('pokemon-info');
        pokemonContainer.innerHTML = `
            <h3>${data.name.toUpperCase()}</h3>
            <img src="${data.sprites.front_default}" alt="Sprite do ${data.name}" style="width: 120px;">
            <p><strong>Número:</strong> #${data.id}</p>
        `;
    })
    .catch(error => {
        console.error("Erro na requisição:", error);
        document.getElementById('pokemon-info').innerHTML = "<p>Erro ao buscar o Pokémon.</p>";
    });