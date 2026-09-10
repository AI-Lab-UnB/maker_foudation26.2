/**
 * Portfólio de João Victor Pereira Santos
 * Semana 3 - Consumo dinâmico da PokéAPI
 */

const POKEMON_FAVORITO = "blaziken";

// Dicionário de tradução e cores de tipos Pokémon
const TYPE_CONFIG = {
    normal: { name: "Normal", color: "#94a3b8" },
    fire: { name: "Fogo", color: "#f97316" },
    water: { name: "Água", color: "#38bdf8" },
    electric: { name: "Elétrico", color: "#facc15" },
    grass: { name: "Planta", color: "#4ade80" },
    ice: { name: "Gelo", color: "#67e8f9" },
    fighting: { name: "Lutador", color: "#ef4444" },
    poison: { name: "Veneno", color: "#a855f7" },
    ground: { name: "Terra", color: "#d97706" },
    flying: { name: "Voador", color: "#818cf8" },
    psychic: { name: "Psíquico", color: "#f43f5e" },
    bug: { name: "Inseto", color: "#84cc16" },
    rock: { name: "Pedra", color: "#78716c" },
    ghost: { name: "Fantasma", color: "#6366f1" },
    dragon: { name: "Dragão", color: "#7c3aed" },
    steel: { name: "Aço", color: "#64748b" },
    fairy: { name: "Fada", color: "#f472b6" },
    dark: { name: "Sombrio", color: "#334155" },
};

// Tradução amigável dos atributos base
const STAT_NAMES = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defesa",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Veloc.",
};

const pokemonContainer = document.getElementById("pokemon-info");
const btnFavorite = document.getElementById("btn-favorite");
const btnRandom = document.getElementById("btn-random");
const searchForm = document.getElementById("pokemon-search-form");
const searchInput = document.getElementById("pokemon-input");

let currentPokemon = POKEMON_FAVORITO;

/**
 * Busca os dados de um Pokémon na PokéAPI
 * @param {string|number} identifier - Nome ou ID do Pokémon
 */
async function carregarPokemon(identifier) {
    exibirCarregando();

    const query = String(identifier).trim().toLowerCase();
    if (!query) return;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) {
            throw new Error(`Pokémon "${identifier}" não encontrado.`);
        }

        const data = await response.json();
        currentPokemon = data.name;
        renderizarPokemon(data);
        atualizarBotoesControle(data.name);
    } catch (error) {
        console.error("Erro na requisição da PokéAPI:", error);
        exibirErro(error.message);
    }
}

/**
 * Exibe tela de carregamento suave
 */
function exibirCarregando() {
    pokemonContainer.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Buscando dados na PokéAPI...</p>
        </div>
    `;
}

/**
 * Renderiza o Pokémon com visual rico e estatísticas
 */
function renderizarPokemon(data) {
    const nome = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    const idFormatado = `#${String(data.id).padStart(4, "0")}`;
    const artwork =
        data.sprites.other?.["official-artwork"]?.front_default ||
        data.sprites.other?.dream_world?.front_default ||
        data.sprites.front_default;

    // Badges de tipo estilizadas
    const typesHtml = data.types
        .map((t) => {
            const typeInfo = TYPE_CONFIG[t.type.name] || {
                name: t.type.name,
                color: "#6366f1",
            };
            return `<span class="type-badge" style="background-color: ${typeInfo.color}">${typeInfo.name}</span>`;
        })
        .join("");

    // Cor principal do primeiro tipo para o brilho de fundo
    const mainType = data.types[0]?.type.name;
    const glowColor = TYPE_CONFIG[mainType]?.color || "#6366f1";

    // Métricas físicas (altura em metros e peso em kg)
    const alturaMetros = (data.height / 10).toFixed(1) + " m";
    const pesoKg = (data.weight / 10).toFixed(1) + " kg";

    // Barras de atributos
    const statsHtml = data.stats
        .map((s) => {
            const statLabel = STAT_NAMES[s.stat.name] || s.stat.name;
            // Escala percentual baseada no máximo comum de 160
            const percentage = Math.min(100, Math.round((s.base_stat / 160) * 100));
            return `
            <div class="stat-row">
                <span class="stat-name">${statLabel}</span>
                <span class="stat-val">${s.base_stat}</span>
                <div class="stat-track">
                    <div class="stat-fill" style="width: ${percentage}%;"></div>
                </div>
            </div>
        `;
        })
        .join("");

    pokemonContainer.innerHTML = `
        <div class="poke-display">
            <div class="poke-visual">
                <div class="poke-glow-bg" style="background: ${glowColor};"></div>
                <img class="poke-artwork" src="${artwork}" alt="Ilustração oficial de ${nome}">
                <div class="poke-id-badge">${idFormatado}</div>
            </div>

            <div class="poke-info">
                <div>
                    <h3 class="poke-name">${nome}</h3>
                    <div class="poke-types">${typesHtml}</div>
                </div>

                <div class="poke-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Altura</span>
                        <span class="metric-value">${alturaMetros}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Peso</span>
                        <span class="metric-value">${pesoKg}</span>
                    </div>
                </div>

                <div class="poke-stats">
                    ${statsHtml}
                </div>
            </div>
        </div>
    `;
}

/**
 * Exibe estado amigável de erro
 */
function exibirErro(mensagem) {
    pokemonContainer.innerHTML = `
        <div class="error-state">
            <p>⚠️ ${mensagem || "Não foi possível carregar o Pokémon."}</p>
            <button type="button" class="btn-retry" onclick="carregarPokemon('${POKEMON_FAVORITO}')">
                Voltar para o ${POKEMON_FAVORITO.toUpperCase()}
            </button>
        </div>
    `;
}

/**
 * Atualiza o destaque dos botões
 */
function atualizarBotoesControle(nomeAtual) {
    if (nomeAtual.toLowerCase() === POKEMON_FAVORITO) {
        btnFavorite.classList.add("active");
    } else {
        btnFavorite.classList.remove("active");
    }
}

// Event Listeners
btnFavorite.addEventListener("click", () => {
    carregarPokemon(POKEMON_FAVORITO);
    if (searchInput) searchInput.value = "";
});

btnRandom.addEventListener("click", () => {
    // Sorteia um número de 1 até 1025 (total de pokémon oficiais atuais)
    const randomId = Math.floor(Math.random() * 1025) + 1;
    carregarPokemon(randomId);
    if (searchInput) searchInput.value = "";
});

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const termo = searchInput.value.trim();
    if (termo) {
        carregarPokemon(termo);
    }
});

// Inicialização imediata com o Pokémon favorito
document.addEventListener("DOMContentLoaded", () => {
    carregarPokemon(POKEMON_FAVORITO);
});
