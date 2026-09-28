// Aguarda o HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {
    
    const pokemon = "Arceus";
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;

    fetch(url)
        .then(resposta => {
            if(!resposta.ok){
                throw new Error('Erro ao buscar o pokemon');
            }
            return resposta.json();
        })
        .then(dados => {

            const imgElement = document.getElementById('pokemon-img');
            const nameElement = document.getElementById('pokemon-name');
            const idElement = document.getElementById('pokemon-id');
            const typeElement = document.getElementById('pokemon-type');

            imgElement.src = dados.sprites.other['official-artwork'].front_default;
            imgElement.style.display = 'block';

            const nomeFormatado = dados.name.charAt(0).toUpperCase() + dados.name.slice(1);
            nameElement.textContent = nomeFormatado;
            
            idElement.textContent = `Pokédex: #${dados.id}`;
            
            const tipos = dados.types.map(tipoInfo => tipoInfo.type.name).join(', ');
            typeElement.textContent = `Tipo: ${tipos}`;
        })
        .catch(erro => {
            console.error('Deu errado: ', erro);
        });

    const card = document.getElementById('pokemon-card');
    const details = document.getElementById('pokemon-details');

    card.addEventListener('click', () => {
        if (details.classList.contains('details-hidden')) {
            details.classList.remove('details-hidden');
            details.classList.add('details-visible');
        } else {
            details.classList.remove('details-visible');
            details.classList.add('details-hidden');
        }
    });
});