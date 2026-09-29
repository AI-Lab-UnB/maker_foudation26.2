const form = document.getElementById("pokemonForm");
const input = document.getElementById("pokemonInput");
const statusEl = document.getElementById("status");

const nameEl = document.getElementById("pokemonName");
const numberEl = document.getElementById("pokemonNumber");
const imageEl = document.getElementById("pokemonImage");
const heightEl = document.getElementById("pokemonHeight");
const weightEl = document.getElementById("pokemonWeight");
const experienceEl = document.getElementById("pokemonExperience");
const abilitiesEl = document.getElementById("pokemonAbilities");
const typesEl = document.getElementById("pokemonTypes");

async function buscarPokemon(termo) {
  const pokemon = termo.trim().toLowerCase();

  if (!pokemon) {
    statusEl.textContent = "Digite o nome ou número de um Pokémon.";
    statusEl.classList.add("error");
    return;
  }

  statusEl.textContent = "Buscando dados na PokéAPI...";
  statusEl.classList.remove("error");

  try {
    const resposta = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(pokemon)}`
    );

    if (!resposta.ok) {
      throw new Error(
        `Pokémon não encontrado. Código HTTP: ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    // Requisito da atividade: exibir o retorno também no console.
    console.log("Resultado recebido da PokéAPI:", dados);

    const artwork =
      dados.sprites?.other?.["official-artwork"]?.front_default ||
      dados.sprites?.front_default ||
      "";

    nameEl.textContent = dados.name;
    numberEl.textContent = "#" + String(dados.id).padStart(3, "0");
    imageEl.src = artwork;
    imageEl.alt = `Imagem de ${dados.name}`;

    // A PokéAPI informa altura em decímetros e peso em hectogramas.
    heightEl.textContent =
      (dados.height / 10).toFixed(1).replace(".", ",") + " m";

    weightEl.textContent =
      (dados.weight / 10).toFixed(1).replace(".", ",") + " kg";

    experienceEl.textContent =
      dados.base_experience ?? "Não informado";

    abilitiesEl.textContent = dados.abilities
      .map((item) => item.ability.name.replaceAll("-", " "))
      .join(", ");

    typesEl.innerHTML = "";

    dados.types.forEach((item) => {
      const tag = document.createElement("span");
      tag.className = "type";
      tag.textContent = item.type.name;
      typesEl.appendChild(tag);
    });

    statusEl.textContent = "Dados carregados com sucesso.";
  } catch (erro) {
    console.error("Erro ao consultar a PokéAPI:", erro);

    statusEl.textContent = erro.message;
    statusEl.classList.add("error");

    nameEl.textContent = "Não encontrado";
    numberEl.textContent = "#---";
    imageEl.removeAttribute("src");
    heightEl.textContent = "—";
    weightEl.textContent = "—";
    experienceEl.textContent = "—";
    abilitiesEl.textContent = "—";
    typesEl.innerHTML = "";
  }
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  buscarPokemon(input.value);
});

// Charizard é o Pokémon favorito e carrega automaticamente ao abrir o site.
buscarPokemon("charizard");
