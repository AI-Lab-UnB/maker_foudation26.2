// Troque "pikachu" pelo nome do seu Pokémon favorito (em minúsculo)
const meuPokemonFavorito = "pikachu";

fetch(`https://pokeapi.co/api/v2/pokemon/${meuPokemonFavorito}`)
  .then((resposta) => resposta.json())
  .then((dados) => {
    // Mostra tudo no console (F12)
    console.log(dados);

    // Mostra um resumo direto na página HTML
    const nome = dados.name;
    const altura = dados.height;
    const peso = dados.weight;
    const imagem = dados.sprites.front_default;

    document.getElementById("resultado").innerHTML = `
      <h2>${nome}</h2>
      <img src="${imagem}" alt="${nome}">
      <p>Altura: ${altura}</p>
      <p>Peso: ${peso}</p>
    `;
  })
  .catch((erro) => {
    console.log("Deu erro na requisição:", erro);
  });
