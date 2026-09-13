


async function chamarApi() {

    try {

        const name = document.getElementById("name").value.toLowerCase();

        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

        if (!res.ok) {
            throw new Error("Este pokémon não foi encontrado!");
        }

        const pok = await res.json();

        const img = pok.sprites.front_default;

        const imgElement = document.getElementById("imgPokemon");
        const infoElement = document.getElementById("infoPokemon");
        const pokemonElement = document.getElementById("pokemon");

        imgElement.src = img;
        imgElement.style.display = "block";

        infoElement.innerHTML = `
            <h2>${pok.name}</h2>
            <p>Altura: ${pok.height / 10} m</p>
            <p>Peso: ${pok.weight / 10} kg</p>
        `;

        pokemonElement.style.display = "flex";

    } catch (error) {

        console.error(error);

    }

}