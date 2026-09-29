const URL = "https://pokeapi.co/api/v2/pokemon/pikachu";

async function chamarPokeAPI() {
    const resp = await fetch(URL);
    if (resp.status === 200) { 
        const obj = await resp.json();
        console.log(obj);
    }
    else {
        console.log("Failed to fetch data")
    }
}

chamarPokeAPI();