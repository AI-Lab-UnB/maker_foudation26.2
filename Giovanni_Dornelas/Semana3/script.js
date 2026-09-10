const pokemonFavorito = "groudon";

const area = document.getElementById("pokemon-info");

fetch("https://pokeapi.co/api/v2/pokemon/" + pokemonFavorito)
  .then(function (resposta) {
    return resposta.json();
  })
  .then(function (dados) {
    console.log(dados);

    const nome = dados.name;
    const id = dados.id;
    const imagem = dados.sprites.front_default;
    const tipos = dados.types.map(function (item) {
      return item.type.name;
    }).join(", ");
    const altura = dados.height / 10;
    const peso = dados.weight / 10;

    area.innerHTML =
      '<img src="' + imagem + '" alt="' + nome + '" class="pokemon-img">' +
      "<h3>" + nome + "</h3>" +
      "<p><strong>Número:</strong> #" + id + "</p>" +
      "<p><strong>Tipo:</strong> " + tipos + "</p>" +
      "<p><strong>Altura:</strong> " + altura + " m</p>" +
      "<p><strong>Peso:</strong> " + peso + " kg</p>";
  })
  .catch(function (erro) {
    console.log("Erro ao buscar o Pokémon:", erro);
    area.innerHTML = "<p>Não foi possível carregar o Pokémon.</p>";
  });
