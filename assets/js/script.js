document.addEventListener('DOMContentLoaded', () => {
    const storageBoxContainer = document.getElementById('storage-box-container');
    const chooseStarterButton = document.getElementById('choose-starter-button');
    const battleButton = document.getElementById('battle-button');
    const chooseBattlePokemonButton = document.getElementById('choose-battle-pokemon-button');
    const generateOpponentButton = document.getElementById('generate-opponent-button');
    const modal = document.getElementById('pokemonModal');
    const battleModal = document.getElementById('battleModal');
    const chooseBattlePokemonModal = document.getElementById('chooseBattlePokemonModal');
    const closeBtns = document.querySelectorAll('.close');
    const starterPokemonContainer = document.getElementById('starter-pokemon-container');
    const battlePokemonContainer = document.getElementById('battle-card-container');
    const opponentCardContainer = document.getElementById('opponent-card-container');
    const battleStorageContainer = document.getElementById('battle-storage-container');
    const battleSummaryContainer = document.getElementById('battle-summary-container');
    const toggleStorageButton = document.getElementById('toggle-storage-button');
    const storageCell = document.querySelector('.storage-cell');
    const battleText = document.querySelector('.battle-text');




    const dadJokeApi = "https://icanhazdadjoke.com/"
    let dataPokemons = null;
    let userPokemonSelected = null;
    let opponentPokemonSelected = null;
    let isStorageVisible = false;

    chooseStarterButton.addEventListener('click', () => {
        fetchRandomPokemons(3);
        modal.style.display = 'block';
    });

    chooseBattlePokemonButton.addEventListener('click', () => {
        displayStoredPokemonsForBattle();
        chooseBattlePokemonModal.style.display = 'block';
    });

    generateOpponentButton.addEventListener('click', () => {
        fetchRandomPokemon(opponentCardContainer, pokemon => {
            opponentPokemonSelected = pokemon;
            checkBattleReady();
        });
    });

    battleButton.addEventListener('click', () => {
        if (userPokemonSelected && opponentPokemonSelected) {
            displayBattleSummary();
            battleModal.style.display = 'block';
            let isWin = battle(userPokemonSelected, opponentPokemonSelected);
            console.log(isWin);
            // TODO: if win then text WINNER, Congratulations you catch {name Pokemon}
            // TODO: if loose then text LOOSE, DadJoke
        }
    });

    closeBtns.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            battleModal.style.display = 'none';
            chooseBattlePokemonModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == battleModal) {
            battleModal.style.display = 'none';
        }
        if (event.target == chooseBattlePokemonModal) {
            chooseBattlePokemonModal.style.display = 'none';
        }
    });

    toggleStorageButton.addEventListener('click', () => {
        isStorageVisible = !isStorageVisible;
        if (isStorageVisible) {
            storageBoxContainer.classList.add('expanded');
            storageBoxContainer.classList.remove('collapsed');
            storageCell.classList.add('expanded');
            storageCell.classList.remove('collapsed');
        } else {
            storageBoxContainer.classList.add('collapsed');
            storageBoxContainer.classList.remove('expanded');
            storageCell.classList.add('collapsed');
            storageCell.classList.remove('expanded');
        }
    });


    const createCard = (pokemon, container, isStorage) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';

        const cardImage = document.createElement('img');
        cardImage.src = pokemon.image;
        cardElement.appendChild(cardImage);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const cardTitle = document.createElement('h3');
        cardTitle.className = 'card-title';
        cardTitle.textContent = pokemon.name;
        cardBody.appendChild(cardTitle);

        const cardText = document.createElement('p');
        cardText.className = 'card-text';
        cardText.textContent = `HP: ${pokemon.hp} | Attack: ${pokemon.attack}`;
        cardBody.appendChild(cardText);

        if (isStorage && container.id !== 'battle-card-container') {
            const releaseButton = document.createElement('button');
            releaseButton.className = 'release-button';
            releaseButton.textContent = 'Release Pokémon';
            releaseButton.addEventListener('click', () => {
                removePokemonFromStorage(pokemon);
                cardElement.remove();
            });
            cardBody.appendChild(releaseButton);
        }

        cardElement.appendChild(cardBody);
        container.appendChild(cardElement);

        if (!isStorage) {
            cardElement.addEventListener('click', () => {
                saveNewPokemonToStorage(pokemon);
                createCard(pokemon, storageBoxContainer, true);
                modal.style.display = 'none';
                isAuthorized();
            });
        } else if (container.id === 'battle-storage-container') {
            cardElement.addEventListener('click', () => {
                battlePokemonContainer.innerHTML = '';
                createCard(pokemon, battlePokemonContainer, false);
                chooseBattlePokemonModal.style.display = 'none';
                userPokemonSelected = pokemon;
                checkBattleReady();
            });
        }
    };

    const fetchRandomPokemons = (count) => {
        const randomIds = Array.from({ length: count }, () => Math.floor(Math.random() * 1302));
        const pokeApi = `https://pokeapi.co/api/v2/pokemon?limit=1500`;

        if (dataPokemons) {
            starterPokemonContainer.innerHTML = '';
            randomIds.forEach(id => {
                const pokemonName = dataPokemons.results[id].name;
                fetchPokemonByName(pokemonName, starterPokemonContainer);
            });
        } else {
            fetch(pokeApi)
                .then(response => response.json())
                .then(data => {
                    dataPokemons = data;
                    starterPokemonContainer.innerHTML = '';
                    randomIds.forEach(id => {
                        const pokemonName = data.results[id].name;
                        fetchPokemonByName(pokemonName, starterPokemonContainer);
                    });
                });
        };
    };


    const fetchRandomPokemon = (container, callback) => {
        const random = Math.floor(Math.random() * 1302);
        const randomName = dataPokemons.results[random].name;

        const pokeApi = `https://pokeapi.co/api/v2/pokemon/${randomName}`;
        fetch(pokeApi)
            .then(response => response.json())
            .then(data => {
                const pokemon = new Pokemon(data);
                container.innerHTML = '';
                createCard(pokemon, container, false);
                if (container.id === 'opponent-card-container') {
                    opponentPokemon = pokemon;
                    checkBattleReady();
                }
                if (callback) {
                    callback(pokemon);
                }
            });
    };

    const fetchPokemonByName = (name, container) => {
        const pokeApi = `https://pokeapi.co/api/v2/pokemon/${name}`;

        fetch(pokeApi)
            .then(response => response.json())
            .then(data => {
                const pokemon = new Pokemon(data);
                createCard(pokemon, container, false);
            });
    };

    class Pokemon {
        constructor(pokemon) {
            this.id = pokemon.id;
            this.name = this.capitalizeName(pokemon.name);
            this.hp = pokemon.stats[0].base_stat;
            this.attack = pokemon.stats[1].base_stat;
            this.image = pokemon.sprites.other[`official-artwork`].front_default;
        }

        capitalizeName(name) {
            if (name && name.length > 0) {
                return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            }
            return name;
        }
    }

    const getStoragePokemonsFromLocalStorage = () => {
        return JSON.parse(localStorage.getItem('storagePokemons')) || [];
    };

    const setStoragePokemonsToLocalStorage = (pokemonList) => {
        localStorage.setItem('storagePokemons', JSON.stringify(pokemonList));
    };

    const saveNewPokemonToStorage = (pokemon) => {
        const arrayStoragePokemons = getStoragePokemonsFromLocalStorage();
        arrayStoragePokemons.push(pokemon);
        setStoragePokemonsToLocalStorage(arrayStoragePokemons);
    };

    const removePokemonFromStorage = (pokemon) => {
        let arrayStoragePokemons = getStoragePokemonsFromLocalStorage();
        arrayStoragePokemons = arrayStoragePokemons.filter(p => p.id !== pokemon.id);
        setStoragePokemonsToLocalStorage(arrayStoragePokemons);
    };

    const displayStoredPokemons = () => {
        const storedPokemons = getStoragePokemonsFromLocalStorage();
        storedPokemons.forEach(pokemon => createCard(pokemon, storageBoxContainer, true));
    };

    const displayStoredPokemonsForBattle = () => {
        const storedPokemons = getStoragePokemonsFromLocalStorage();
        battleStorageContainer.innerHTML = '';
        storedPokemons.forEach(pokemon => createCard(pokemon, battleStorageContainer, true));
    };

    const checkBattleReady = () => {
        if (userPokemonSelected && opponentPokemonSelected) {
            battleButton.disabled = false;
        } else {
            battleButton.disabled = true;
        }
    };

    const displayBattleSummary = () => {
        battleSummaryContainer.innerHTML = '';
        const userPokemon = battlePokemonContainer.querySelector('.card').cloneNode(true);
        const opponentPokemon = opponentCardContainer.querySelector('.card').cloneNode(true);
        userPokemon.querySelector('.card-text').id = "user-pokemon";
        opponentPokemon.querySelector('.card-text').id = "opponent-pokemon";
        battleSummaryContainer.appendChild(userPokemon);
        const vsElement = document.createElement('div');
        vsElement.className = 'vs';
        vsElement.innerHTML = '<p>VS</p>';
        battleSummaryContainer.appendChild(vsElement);
        battleSummaryContainer.appendChild(opponentPokemon);
    };

    displayStoredPokemons();

    // take 2 objects pokemon
    function battle(userPokemon, enemyPokemon) {
        const opponentPokemonBattle = document.getElementById('opponent-pokemon');
        const userPokemonBattle = document.getElementById('user-pokemon');
        // who is win
        let isWinUser = true;
        const defaultHpEnemyPokemon = enemyPokemon.hp;
        // if true, then move userPokemon if false move enemy's
        let currentAttack = true;
        let timer = 5;

        function updateBattleUI() {
            if (userPokemon.hp < 0) {
                userPokemon.hp = 0;
            }
            if (enemyPokemon.hp < 0) {
                enemyPokemon.hp = 0;
            }
            userPokemonBattle.textContent = `HP: ${userPokemon.hp} | Attack: ${userPokemon.attack}`;
            opponentPokemonBattle.textContent = `HP: ${enemyPokemon.hp} | Attack: ${enemyPokemon.attack}`;
        }

        updateBattleUI();

        const interval = setInterval(() => {
            if (userPokemon.hp > 0 && enemyPokemon.hp > 0) {
                battleText.textContent = currentAttack ? `Your move ${timer}` : `Enemy move ${timer}`;

                if (timer === 0) {
                    if (currentAttack) {
                        battleText.textContent = `Your turn ${timer}`;
                        enemyPokemon.hp -= userPokemon.attack;
                    } else {
                        battleText.textContent = `Enemy turn ${timer}`;
                        userPokemon.hp -= enemyPokemon.attack;
                    }

                    currentAttack = !currentAttack;
                    updateBattleUI();
                    timer = 5;
                } else {
                    timer--;
                }
            } else {
                clearInterval(interval);
                battleText.textContent = userPokemon.hp > 0 ? `Congratulations you caught a ${enemyPokemon.name}` : `You lose! Have a Dad Joke:\n ${getDadJokeFromLocalStorage()}`;

                if (userPokemon.hp > 0) {
                    enemyPokemon.hp = defaultHpEnemyPokemon;
                    saveNewPokemonToStorage(enemyPokemon);
                    setNullCurrentPokemons();
                    checkBattleReady();
                    return isWinUser;
                } else {
                    setNullCurrentPokemons();
                    fetchDadJoke();
                    checkBattleReady();
                    return !isWinUser;
                }
            }
        }, 1000);
    }

    function setNullCurrentPokemons() {
        userPokemonSelected = null;
        opponentPokemonSelected = null;
    }


    function setAuthorized() {
        document.querySelector('main').classList.add('authorized');
        document.querySelector('main').classList.remove('unauthorized');
    }


    function setUnauthorized() {
        document.querySelector('main').classList.add('unauthorized');
        document.querySelector('main').classList.remove('authorized');
    }

    function isAuthorized() {
        const userPokemonsFromStorage = getStoragePokemonsFromLocalStorage();
        if (userPokemonsFromStorage.length > 0) {
            setAuthorized();
        } else {
            setUnauthorized();
        }
    }

    const fetchData = () => {
        const apiURL = 'https://pokeapi.co/api/v2/pokemon?limit=1500';

        return fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                dataPokemons = data;
                console.log('Data fetched and saved:', dataPokemons);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    function getDadJokeFromLocalStorage() {
        return JSON.parse(localStorage.getItem("DadJokes"));
    }

    function init() {
        isAuthorized();
        fetchDadJoke();
        fetchData();
    }



    function fetchDadJoke() {
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
                function saveDadJoke() {

                    let dadJoke = data.joke
                    localStorage.setItem("DadJokes", JSON.stringify(dadJoke))
                }
                saveDadJoke()


            })
    }

    init();
});
