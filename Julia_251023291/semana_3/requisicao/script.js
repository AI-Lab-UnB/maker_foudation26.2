const POKEMON_NAME = "sylveon";
 
const API_URL = `https://pokeapi.co/api/v2/pokemon/${POKEMON_NAME}`;
 
const cardEl = document.getElementById("pokemon-card");
const statusEl = document.getElementById("pokemon-status");
 
async function buscarPokemon() {
  try {
    const resposta = await fetch(API_URL);
 
    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status}: pokémon não encontrado`);
    }
 
    const dados = await resposta.json();
 
    console.log("Dados do Sylveon:", dados);
 
    exibirPokemon(dados);
 
  } catch (erro) {
    console.error("Falha ao buscar o pokémon:", erro);
    statusEl.textContent = "Não foi possível carregar os dados. Tente novamente.";
  }
}
 
function exibirPokemon(dados) {
  const nome = dados.name;
  const numero = String(dados.id).padStart(3, "0");
  const imagem = dados.sprites.other["official-artwork"].front_default;
  const tipos = dados.types.map((t) => t.type.name); 
  const stats = dados.stats.map((s) => ({
    nome: s.stat.name.replace("-", " "), 
    valor: s.base_stat,
  }));
 
  const statsHtml = stats
    .map(
      (stat) => `<li><span class="star">★</span>${stat.nome}: ${stat.valor}</li>`
    )
    .join("");
 
  cardEl.innerHTML = `
    <h1>${nome} <span class="number">#${numero}</span></h1>
    <img src="${imagem}" alt="Sprite de ${nome}">
    <p class="types">${tipos.join(" / ")}</p>
    <ul class="stats">${statsHtml}</ul>
  `;
}
 
buscarPokemon();