// Função para buscar dados do Pokémon na PokéAPI
async function buscarPokemon(nomeOuId) {
  try {
    // Faz a requisição HTTP usando fetch
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomeOuId.toLowerCase()}`);
    
    if (!resposta.ok) {
      throw new Error('Pokémon não encontrado!');
    }

    const dados = await resposta.json();

    // 1. Exibe o resultado no console do navegador (requisito do desafio)
    console.log("Dados do Pokémon recebidos da PokéAPI:", dados);

    // 2. Renderiza os dados direto na página HTML
    exibirPokemonNaTela(dados);

  } catch (erro) {
    console.error("Erro na requisição HTTP:", erro);
    document.getElementById('pokemon-container').innerHTML = `
      <p class="error-msg">Erro ao carregar Pokémon. Verifique o nome e tente novamente.</p>
    `;
  }
}

// Função para manipular o DOM e exibir as informações na tela
function exibirPokemonNaTela(pokemon) {
  const container = document.getElementById('pokemon-container');
  
  // Pegando os tipos do pokémon
  const tipos = pokemon.types.map(t => t.type.name).join(', ');

  container.innerHTML = `
    <div class="pokemon-card">
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="pokemon-sprite">
      <h3>${pokemon.name.toUpperCase()}</h3>
      <p><strong>Nº:</strong> #${pokemon.id}</p>
      <p><strong>Tipo:</strong> ${tipos}</p>
      <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
    </div>
  `;
}

// Executa a busca assim que a página carregar (Substitua 'pikachu' pelo seu Pokémon favorito!)
document.addEventListener('DOMContentLoaded', () => {
  buscarPokemon('gengar');
});