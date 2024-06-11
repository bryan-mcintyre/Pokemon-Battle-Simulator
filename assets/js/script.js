let dataPokemons;
let pokemonS;
const dadJokeApi = "https://icanhazdadjoke.com/"


document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('card-container');
    const createCardButton = document.getElementById('create-card-button');

    createCardButton.addEventListener('click', () => {
        createCard({
            title: 'New Card',
            text: 'This is a newly created card.',
            imageUrl: ''
        });
    });

    const createCard = (card) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';

        const cardImage = document.createElement('img');
        cardImage.src = card.imageUrl;
        cardElement.appendChild(cardImage);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const cardTitle = document.createElement('h3');
        cardTitle.className = 'card-title';
        cardTitle.textContent = card.title;
        cardBody.appendChild(cardTitle);

        const cardText = document.createElement('p');
        cardText.className = 'card-text';
        cardText.textContent = card.text;
        cardBody.appendChild(cardText);

        cardElement.appendChild(cardBody);
        cardContainer.appendChild(cardElement);
    };
});



// class pokemon for create newPokemon
class Pokemon {
    constructor(pokemon) {
        this.id = pokemon.id;
        this.name = pokemon.name;
        this.hp = pokemon.stats[0].base_stat;
        this.attack = pokemon.stats[1].base_stat;
        this.image = pokemon.sprites.other[`official-artwork`].front_default;
    }
}

// get pokemon array user
function getUserPokemonsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("userPokemons")) || [];
}

// save pokemons array for user
function setUserPokemonsToLocalStorage(pokemonList) {
    localStorage.setItem(`userPokemons`, JSON.stringify(pokemonList));
}

// get info about current pokemon computer
function getEnemyPokemonFromLocalStorage() {
    return JSON.parse(localStorage.getItem("enemyPokemon"));
}

// save info about random pokemon
function setEnemyPokemonToLocalStorage(pokemon) {
    const newPokemon = new Pokemon(pokemon)
    localStorage.setItem(`enemyPokemon`, JSON.stringify(newPokemon));
}

// get data list pokemons
async function fetchRandomPokemon() {
    // random 1302 pokemons have in api
    const randomPokemon = Math.floor(Math.random() * 1302)
    const pokeApi = `https://pokeapi.co/api/v2/pokemon?limit=1500`
    // If we have Data
    if (dataPokemons) {
        // find Pokemon by name
        const pokemon = await fetchPokemonByName(dataPokemons.results[randomPokemon].name);
        console.log(`data already`);
        console.log(pokemon);
        return pokemon;
    } else {
        // If we no have Data
        const response = await fetch(pokeApi);

        dataPokemons = await response.json();
        const pokemon = await fetchPokemonByName(dataPokemons.results[randomPokemon].name);
        console.log(`data not already`);
        console.log(pokemon);
        return pokemon;
    }
}

// request Pokemon by name
async function fetchPokemonByName(pokemon) {
    const pokeApi = `https://pokeapi.co/api/v2/pokemon/${pokemon}`
    const response = await fetch(pokeApi);
    const data = await response.json();

    // TEST
    console.log(`DATAPOKEMONS`);
    console.log(data.name);
    console.log(data);

    let pokemonS = data;
    saveNewPokemonForUser(pokemonS);
    setEnemyPokemonToLocalStorage(pokemonS);
    let newPokemonObj = new Pokemon(pokemonS);
    console.log(newPokemonObj);

    return newPokemonObj;
}

function saveNewPokemonForUser(pokemon) {
    arrayUserPokemons = getUserPokemonsFromLocalStorage();

    const newPokemon = new Pokemon(pokemon);

    const existingPokemonIndex = arrayUserPokemons.findIndex(p => p.id === newPokemon.id);
    // if we have pokemon then not save
    if (existingPokemonIndex !== -1) {
        return
        // if we no have pokemon, add new pokemon for user
    } else {
        arrayUserPokemons.push(newPokemon);
        setUserPokemonsToLocalStorage(arrayUserPokemons);
    }
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
