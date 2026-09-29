// Desafio: requisição HTTP para a PokéAPI
// Pokémon escolhido: bulbasaur

const meuPokemon = "bulbasaur";
const resultadoDiv = document.getElementById("resultado");

fetch(`https://pokeapi.co/api/v2/pokemon/${meuPokemon}`)
  .then((resposta) => {
    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status} ao buscar o Pokémon na PokéAPI`);
    }
    return resposta.json();
  })
  .then((dados) => {
    console.log(dados);

    resultadoDiv.innerHTML = `
      <img src="${dados.sprites.front_default}" alt="${dados.name}">
      <h1>${dados.name}</h1>
      <p>Altura: ${dados.height / 10} m | Peso: ${dados.weight / 10} kg</p>
      <p>Tipo(s): ${dados.types.map((t) => t.type.name).join(", ")}</p>
    `;
  })
  .catch((erro) => {
    console.error("Deu ruim na requisição:", erro);
    resultadoDiv.innerText = "Não consegui buscar o Pokémon agora.";
  });
