/* =========================================================================
   Entrega 2 - Semana 3: Dados e APIs
   Busca dados do Pokemon favorito na PokeAPI usando fetch.
   ========================================================================= */

const POKEMON_FAVORITO = "bulbasaur";

const NOME_DOS_STATUS = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Ataque Especial",
  "special-defense": "Defesa Especial",
  speed: "Velocidade",
};

async function buscarPokemon(nome) {
  const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);

  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}: nao foi possivel buscar "${nome}" na PokeAPI.`);
  }

  return resposta.json();
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function renderizarPokemon(pokemon) {
  const sprite =
    pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default;

  const spriteEl = document.getElementById("pokemon-sprite");
  spriteEl.src = sprite;
  spriteEl.alt = `Sprite de ${pokemon.name}`;

  document.getElementById("pokemon-name").textContent =
    `#${String(pokemon.id).padStart(3, "0")} ${capitalizar(pokemon.name)}`;

  document.getElementById("pokemon-types").textContent = pokemon.types
    .map((t) => capitalizar(t.type.name))
    .join(" / ");

  document.getElementById("pokemon-medidas").textContent =
    `${(pokemon.height / 10).toFixed(1)}m · ${(pokemon.weight / 10).toFixed(1)}kg`;

  const lista = document.getElementById("pokemon-stats");
  lista.innerHTML = "";

  pokemon.stats.forEach((stat) => {
    const nome = NOME_DOS_STATUS[stat.stat.name] ?? capitalizar(stat.stat.name);
    const porcentagem = Math.min(100, Math.round((stat.base_stat / 150) * 100));

    const item = document.createElement("li");
    item.className = "skill";
    item.innerHTML = `
      <div class="skill__text stat">
        <div class="stat__row">
          <h3 class="skill__name">${nome}</h3>
          <span class="skill__desc">${stat.base_stat}</span>
        </div>
        <div class="stat__bar"><span style="width:${porcentagem}%"></span></div>
      </div>
    `;
    lista.appendChild(item);
  });
}

buscarPokemon(POKEMON_FAVORITO)
  .then((pokemon) => {
    console.log("Dados do Pokemon (PokeAPI):", pokemon);
    renderizarPokemon(pokemon);
  })
  .catch((erro) => {
    console.error(erro);
    document.getElementById("pokemon-name").textContent = "Erro ao buscar Pokemon";
  });
