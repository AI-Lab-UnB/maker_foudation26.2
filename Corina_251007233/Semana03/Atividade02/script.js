const meuPokemonFavorito = "gengar";

fetch(`https://pokeapi.co/api/v2/pokemon/${meuPokemonFavorito}`)
  .then((resposta) => resposta.json())
  .then((dados) => {
    console.log(dados);

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
