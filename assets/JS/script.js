const dadJokeApi = "https://icanhazdadjoke.com/"
let dataPokemons;

// get pokemon array user
function getPokemonsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("userPokemons"))
}

// save pokemons array for user
function setPokemonsToLocalStorage(pokemonList) {
    localStorage.setItem(`userPokemons`, JSON.stringify(pokemonList));
}

function fetchRandomPokemon() {
    // random 1302 pokemons have in api
    const randomPokemon = Math.floor(Math.random() * 1302)
    const pokeApi = `https://pokeapi.co/api/v2/pokemon?limit=1500`

    fetch(pokeApi)
        .then(function (response) {
            // get results about all pokemons
            return response.json()
        })
        .then(function (data) {
            fetchPokemonByName(data.results[randomPokemon].name)
            dataPokemons = data;
            console.log(data)
        })
}

function fetchPokemonByName(pokemon) {
    const pokeApi = `https://pokeapi.co/api/v2/pokemon/${pokemon}`
    fetch(pokeApi)
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            console.log(`DATAPOKEMONS`)
            console.log(dataPokemons)
        })
}

fetch("https://icanhazdadjoke.com/", {
    method: 'GET', //GET is the default.
    credentials: 'same-origin', // include, *same-origin, omit
    redirect: 'follow',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }// manual, *follow, error
})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
    });


fetchRandomPokemon();

