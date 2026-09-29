const pokemon = "pikachu";

const url = "https://pokeapi.co/api/v2/pokemon/" + pokemon;

fetch(url)
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {
        console.log(dados);

        const nome = dados.name;
        const altura = dados.height;
        const peso = dados.weight;
        const imagem = dados.sprites.front_default;

        document.getElementById("pokemon-info").innerHTML =
            "<h3>" + nome + "</h3>" +
            "<img src='" + imagem + "' width='150'>" +
            "<p>Altura: " + altura + "</p>" +
            "<p>Peso: " + peso + "</p>";
    })
    .catch(function (erro) {
        console.log("Erro ao buscar o pokemon:", erro);
    });