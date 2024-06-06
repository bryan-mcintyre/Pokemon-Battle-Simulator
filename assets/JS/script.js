const pokeApi = "https://pokeapi.co/api/v2/pokemon/pikachu"
const dadJokeApi = "https://icanhazdadjoke.com/"

fetch (pokeApi)
    .then(function (response) {
        return response.json()
    })
    .then(function (data) {
        console.log(data)
    })

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