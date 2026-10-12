const pokemonFavorito = "sylveon";
let cliques = 0; 

async function buscarMeuPokemon() {
    try {
        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonFavorito}`);
        const dados = await resposta.json();
        
        const habilidades = dados.abilities.map(hab => hab.ability.name).join(", ");

        console.log("=== Dados do meu Pokémon favorito ===");
        console.log("Nome:", dados.name);
        console.log("ID:", dados.id);
        console.log("Peso:", dados.weight / 10, "kg");
        console.log("Habilidades:", habilidades);
        console.log("Estatísticas:", dados.stats.map(s => `${s.stat.name}: ${s.base_stat}`));
        
    } catch (erro) {
        console.error("Erro ao buscar o Pokémon:", erro);
    }
}

// Lógica do Easter Egg
const fotoPerfil = document.getElementById("foto-perfil");

if (fotoPerfil) {
    fotoPerfil.addEventListener("click", () => {
        cliques++; 
        
        if (cliques === 2) { 
            alert("EASTER EGG ENCONTRADO! 🎀\nMeu Pokémon favorito é o Sylveon!\nAbra o console (F12) para ver os dados secretos da PokéAPI.");
            
            buscarMeuPokemon(); 
            cliques = 0; 
        }
    });
}