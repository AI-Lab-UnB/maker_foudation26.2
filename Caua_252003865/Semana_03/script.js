function buscarPokemon() {
   fetch('https://pokeapi.co/api/v2/pokemon/umbreon')
        .then(resposta => {
            if (!resposta.ok) {
                throw new Error('Erro ao encontrar o Pokémon.');
            }
            return resposta.json();
        })
        .then(dados =>{
            const nomePokemon = dados.name
            const imagemPokemon = dados.sprites.front_default;
        

            const elementoNome = document.getElementById('poke-nome');
            const elementoImagem = document.getElementById('poke-imagem');
        
            elementoNome.innerText = "Nome: " + nomePokemon.charAt(0).toUpperCase() + nomePokemon.slice(1);

            elementoImagem.src = imagemPokemon;
            elementoImagem.style.display = "block";
         
        })
        .catch(erro => {
                console.error("Ocorreu um erro:", erro);
                document.getElementById('poke-nome').innerText = "Não foi possível carregar o Pokémon.";
            });

}

buscarPokemon()