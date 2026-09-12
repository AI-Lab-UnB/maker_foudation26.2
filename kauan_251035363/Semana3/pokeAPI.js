function pokeAPI(pokemon){
    const url= `https://pokeapi.co/api/v2/pokemon/${pokemon}`
    const resultado = document.getElementById('resultado-pokemon');
    fetch(url)
        .then(resposta => resposta.json())
        .then(dados => {
            console.log(dados);

            resultado.innerHTML = `
                <h3>${dados.name}</h3>
                <img src="${dados.sprites.front_default}" alt="${dados.name}">
                <p>Altura: ${dados.height}</p>
                <p>Peso: ${dados.weight}</p>
            `;
        resultado.style.display = 'inline-block';
    })
    .catch(erro =>{
        document.getElementById(`resultado-pokemon`).innerHTML = `<p>Pokemon não encontrado</p>`
        resultado.style.display = 'inline-block';
    });

}

document.getElementById('botao-buscar').addEventListener('click', () => {
    const nomeDigitado = document.getElementById('input-pokemon').value.toLowerCase();
    pokeAPI(nomeDigitado);
});