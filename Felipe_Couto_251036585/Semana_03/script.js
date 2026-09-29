const pokemon = "rayquaza";
const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;

fetch(url)
    .then(resposta => {
        console.log("Status HTTP:", resposta.status);

        if (!resposta.ok) {
            throw new Error(`Pokémon não encontrado (${resposta.status})`);
        }

        return resposta.json();
    })
    .then(dados => {
        console.log(dados);

        const card = document.getElementById("pokemon-card");
        const tipos = dados.types.map(t => t.type.name).join(" / ");
        const imagem = dados.sprites.other["official-artwork"].front_default;

        card.innerHTML = `
            <img src="${imagem}" alt="${dados.name}">
            <div class="info">
                <h3>${dados.name} <span>#${dados.id}</span></h3>
                <p>Tipo: ${tipos}</p>
                <p>Altura: ${dados.height / 10} m</p>
                <p>Peso: ${dados.weight / 10} kg</p>
            </div>
        `;
    })
    
    .catch(erro => {
        console.error("Falhou:", erro);
    });
    