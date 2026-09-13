// Mapeamento de cores para cada tipo de Pokémon
const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
};

// Elementos da Interface
const startScreen = document.getElementById('start-screen');
const searchScreen = document.getElementById('search-screen');
const btnStart = document.getElementById('btn-start');
const btnBack = document.getElementById('btn-back');

const pokeballContainer = document.getElementById('pokeball-container');
const pokeballImg = document.getElementById('pokeball-img');
const pokeballMessage = document.getElementById('pokeball-message');
const btnReopenModal = document.getElementById('btn-reopen-modal');

const modalSearch = document.getElementById('modal-search');
const btnCloseModal = document.getElementById('btn-close-modal');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const btnSearch = document.getElementById('btn-search');

const pokemonResult = document.getElementById('pokemon-result');
const pokemonImg = document.getElementById('pokemon-img');
const pokemonName = document.getElementById('pokemon-name');
const pokemonTypes = document.getElementById('pokemon-types');
const pokemonHeight = document.getElementById('pokemon-height');
const pokemonWeight = document.getElementById('pokemon-weight');
const searchStatus = document.getElementById('search-status');

// 1. Iniciar fluxo ao clicar em COMEÇAR
btnStart.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    startScreen.classList.remove('active');

    searchScreen.classList.remove('hidden');
    searchScreen.classList.add('active');

    iniciarAnimacaoPokebola();
});

// 2. Animação da Pokebola e Abertura do Modal
function iniciarAnimacaoPokebola() {
    pokeballImg.classList.add('shaking');
    pokeballMessage.textContent = 'A Pokébola está tremendo...';
    btnReopenModal.classList.add('hidden');

    // Pokebola treme por 1.5s e depois abre o modal de pesquisa
    setTimeout(() => {
        pokeballImg.classList.remove('shaking');
        pokeballMessage.textContent = 'A Pokébola se abriu!';
        btnReopenModal.classList.remove('hidden');
        abrirModal();
    }, 1600);
}

// Permitir clicar na Pokebola para tremer e abrir o modal novamente
pokeballContainer.addEventListener('click', () => {
    if (!pokeballImg.classList.contains('shaking')) {
        iniciarAnimacaoPokebola();
    }
});

btnReopenModal.addEventListener('click', () => {
    abrirModal();
});

// 3. Funções do Modal
function abrirModal() {
    modalSearch.classList.remove('hidden');
    // timeout mínimo para garantir a animação de transição CSS
    setTimeout(() => {
        modalSearch.classList.add('active');
        searchInput.focus();
    }, 10);
}

function fecharModal() {
    modalSearch.classList.remove('active');
    setTimeout(() => {
        modalSearch.classList.add('hidden');
    }, 300);
}

btnCloseModal.addEventListener('click', fecharModal);

// Fechar ao clicar fora da caixa do modal
modalSearch.addEventListener('click', (event) => {
    if (event.target === modalSearch) {
        fecharModal();
    }
});

// Fechar com tecla ESC
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalSearch.classList.contains('active')) {
        fecharModal();
    }
});

// 4. Botão Voltar ao Início
btnBack.addEventListener('click', () => {
    fecharModal();
    searchScreen.classList.add('hidden');
    searchScreen.classList.remove('active');

    startScreen.classList.remove('hidden');
    startScreen.classList.add('active');

    // Resetar campos
    searchInput.value = '';
    pokemonResult.classList.add('hidden');
    searchStatus.classList.add('hidden');
    pokeballImg.classList.remove('shaking');
    pokeballMessage.textContent = 'A Pokébola está tremendo...';
});

// 5. Pesquisar Pokémon na PokeAPI
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = searchInput.value.trim().toLowerCase();

    if (!query) return;

    exibirStatus('Procurando Pokémon...', true);
    pokemonResult.classList.add('hidden');
    btnSearch.disabled = true;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);

        if (!response.ok) {
            throw new Error('Pokémon não encontrado!');
        }

        const data = await response.json();
        exibirPokemon(data);
        ocultarStatus();
    } catch (error) {
        exibirStatus('Pokémon não encontrado! Verifique o nome ou ID digitado.', false);
    } finally {
        btnSearch.disabled = false;
    }
});

// Renderizar dados do Pokémon
function exibirPokemon(pokemon) {
    const formattedId = String(pokemon.id).padStart(3, '0');
    pokemonName.textContent = `${pokemon.name} #${formattedId}`;

    // Imagem do Pokémon (prioriza o sprite pixel art oficial)
    const spriteUrl = pokemon.sprites.front_default 
        || pokemon.sprites.other?.['official-artwork']?.front_default 
        || '';
    pokemonImg.src = spriteUrl;
    pokemonImg.alt = pokemon.name;

    // Tipos
    pokemonTypes.innerHTML = '';
    pokemon.types.forEach((item) => {
        const typeName = item.type.name;
        const badge = document.createElement('span');
        badge.classList.add('type-badge');
        badge.textContent = typeName;
        badge.style.backgroundColor = typeColors[typeName] || '#777777';
        // Se for elétrico, usar texto escuro para contraste
        if (typeName === 'electric') {
            badge.style.color = '#111111';
        }
        pokemonTypes.appendChild(badge);
    });

    // Altura (decímetros para metros) e Peso (hectogramas para kg)
    const heightInMeters = (pokemon.height / 10).toFixed(1);
    const weightInKg = (pokemon.weight / 10).toFixed(1);

    pokemonHeight.textContent = `Altura: ${heightInMeters} m`;
    pokemonWeight.textContent = `Peso: ${weightInKg} kg`;

    pokemonResult.classList.remove('hidden');
}

function exibirStatus(mensagem, isLoading) {
    searchStatus.textContent = mensagem;
    searchStatus.classList.remove('hidden');
    if (isLoading) {
        searchStatus.classList.add('loading');
    } else {
        searchStatus.classList.remove('loading');
    }
}

function ocultarStatus() {
    searchStatus.classList.add('hidden');
    searchStatus.textContent = '';
}