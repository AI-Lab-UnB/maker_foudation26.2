
document.addEventListener('DOMContentLoaded', () => {
    // 1. Definindo o Pokémon favorito (nome oficial na API)
    const pokemonName = 'metagross'; 
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;

    // 2. Fazendo a requisição HTTP com o comando fetch
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede ou Pokémon não encontrado.');
            }
            return response.json(); // Converte a resposta para JSON
        })
        .then(data => {
            // 3. Exibindo o resultado no console do navegador (Critério de Sucesso)
            console.log("=== Dados do meu Pokémon Favorito ===");
            console.log(data);
            console.log(`Nome: ${data.name}`);
            console.log(`Peso: ${data.weight}`);
            
            // 4. Exibindo direto na página HTML de forma elegante
            const container = document.getElementById('pokemon-container');
            
            // Extraindo dados úteis para a tela
            const name = data.name.toUpperCase();
            const spriteUrl = data.sprites.front_default;
            const types = data.types.map(t => t.type.name).join(', ');

            // Injetando o HTML dentro da div vazia criada no index.html
            container.innerHTML = `
                <img src="${spriteUrl}" alt="${name}">
                <div class="pokemon-info">
                    <h4>${name}</h4>
                    <p>Tipos: ${types}</p>
                </div>
            `;
            
            // Revela o card na tela com a animação do CSS
            container.classList.add('visible');
            container.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Falha ao buscar dados na PokéAPI:', error);
        });
});
