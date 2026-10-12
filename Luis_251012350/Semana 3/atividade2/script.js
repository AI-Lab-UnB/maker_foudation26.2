
const botao = document.getElementById('buscar-btn');
const infoDiv = document.getElementById('pokemon-info');


function buscarPokemon() {

  const url = 'https://pokeapi.co/api/v2/pokemon/charmander';

  infoDiv.innerHTML = `<p>Carregando...</p>`;

  fetch(url)
    .then(resposta => {

      if (!resposta.ok) {
        throw new Error('Não foi possível encontrar o Pokémon');
      }
      return resposta.json();
    })
    .then(dados => {

      console.log('Dados do Pokémon:', dados);


      infoDiv.innerHTML = `
        <p><strong>Nome:</strong> ${dados.name.toUpperCase()}</p>
        <p><strong>ID:</strong> ${dados.id}</p>
        <p><strong>Peso:</strong> ${dados.weight}</p>
        <img src="${dados.sprites.front_default}" alt="Sprite do ${dados.name}">
      `;
    })
    .catch(erro => {
      console.error('Erro na requisição:', erro);
      infoDiv.innerHTML = `<p style="color: red;">Erro ao carregar o Pokémon.</p>`;
    });
}


if (botao) {
  botao.addEventListener('click', buscarPokemon);
}
