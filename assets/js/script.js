document.addEventListener('DOMContentLoaded', () => {
    // element selectors
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



    // Pokemon data so as not to make a request again every time.
    let dataPokemons = null;
    let userPokemonSelected = null;
    let opponentPokemonSelected = null;
    let isStorageVisible = false;

    chooseStarterButton.addEventListener('click', () => {
        fetchRandomPokemons(3);
        modal.style.display = 'block';
    });

    // choose first pokemon
    chooseBattlePokemonButton.addEventListener('click', () => {
        displayStoredPokemonsForBattle();
        chooseBattlePokemonModal.style.display = 'block';
    });

    // random enemy pokemon
    generateOpponentButton.addEventListener('click', () => {
        fetchRandomPokemon(opponentCardContainer, pokemon => {
            opponentPokemonSelected = pokemon;
            checkBattleReady();
        });
    });

    // start battle open modal
    battleButton.addEventListener('click', () => {
        battleText.textContent = ``;
        if (userPokemonSelected && opponentPokemonSelected) {
            displayBattleSummary();
            battleModal.style.display = 'block';
            battle(userPokemonSelected, opponentPokemonSelected, (isWin) => {
                // win congratulation
                if (isWin) {
                    saveNewPokemonToStorage(opponentPokemonSelected);
                    createCard(opponentPokemonSelected, storageBoxContainer, true);
                    battleText.textContent = `Congratulations you caught a ${opponentPokemonSelected.name}`;
                    // lost get dad joke
                } else {
                    battleText.textContent = `You lose! Have a Dad Joke:\n ${getDadJokeFromLocalStorage()}`;
                    fetchDadJoke();
                }
                clearContainers();
            });
        }
    });

    // close buttons
    closeBtns.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            battleModal.style.display = 'none';
            chooseBattlePokemonModal.style.display = 'none';
        });
    });

    // close modal window
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

    // storage box open close
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

    // create pokemon cards
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

        // add release-button  if it's not battle
        if (isValidContainer(isStorage, container.id)) {
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
                createCard(pokemon, battlePokemonContainer, true);
                chooseBattlePokemonModal.style.display = 'none';
                userPokemonSelected = pokemon;
                checkBattleReady();
            });
        }
    };

    // fetch random pokemons data
    const fetchRandomPokemons = (count) => {

        // generate random index
        const randomIds = Array.from({ length: count }, () => Math.floor(Math.random() * 1302));
        const pokeApi = `https://pokeapi.co/api/v2/pokemon?limit=1500`;

        // if data already
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

    // find opponent random pokemon
    const fetchRandomPokemon = (container, callback) => {
        // random index
        const random = Math.floor(Math.random() * 1302);
        // get name pokemon by index
        const randomName = dataPokemons.results[random].name;

        // URL with name pokemon
        const pokeApi = `https://pokeapi.co/api/v2/pokemon/${randomName}`;
        fetch(pokeApi)
            .then(response => response.json())
            .then(data => {
                // create new pokemon object
                const pokemon = new Pokemon(data);
                container.innerHTML = '';
                // create card
                createCard(pokemon, container, true);
                if (container.id === 'opponent-card-container') {
                    opponentPokemon = pokemon;
                    checkBattleReady();
                }
                if (callback) {
                    callback(pokemon);
                }
            });
    };

    // find pokemon by name
    const fetchPokemonByName = (name, container) => {
        const pokeApi = `https://pokeapi.co/api/v2/pokemon/${name}`;

        fetch(pokeApi)
            .then(response => response.json())
            .then(data => {
                const pokemon = new Pokemon(data);
                createCard(pokemon, container, false);
            });
    };

    // pokemon object
    class Pokemon {
        constructor(pokemon) {
            this.id = pokemon.id;
            this.name = this.capitalizeName(pokemon.name);
            this.hp = pokemon.stats[0].base_stat;
            this.attack = pokemon.stats[1].base_stat;
            this.image = pokemon.sprites.other[`official-artwork`].front_default;
        }

        capitalizeName(name) {
            if (!name) return '';

            return name
                .split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join('-');
        }
    }

    // get pokemons from local storage
    const getStoragePokemonsFromLocalStorage = () => {
        return JSON.parse(localStorage.getItem('storagePokemons')) || [];
    };

    // set pokemons to local storage
    const setStoragePokemonsToLocalStorage = (pokemonList) => {
        localStorage.setItem('storagePokemons', JSON.stringify(pokemonList));
    };

    // save new pokemon
    const saveNewPokemonToStorage = (pokemon) => {
        const arrayStoragePokemons = getStoragePokemonsFromLocalStorage();
        arrayStoragePokemons.push(pokemon);
        // sort array by name
        arrayStoragePokemons.sort((a, b) => a.name.localeCompare(b.name));
        setStoragePokemonsToLocalStorage(arrayStoragePokemons);
    };

    // delete pokemon from storage
    const removePokemonFromStorage = (pokemon) => {
        let arrayStoragePokemons = getStoragePokemonsFromLocalStorage();
        const index = arrayStoragePokemons.findIndex(p => p.id === pokemon.id);

        if (index !== -1) {
            arrayStoragePokemons.splice(index, 1);
            setStoragePokemonsToLocalStorage(arrayStoragePokemons);
        }
        isAuthorized();
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

    // check flags selected and start battle
    const checkBattleReady = (isStartedBattle = true) => {
        if (userPokemonSelected && opponentPokemonSelected && isStartedBattle) {
            // active button
            battleButton.disabled = false;
        } else {
            // disable button
            battleButton.disabled = true;
        }
    };

    // display modal battle
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
    function battle(userPokemon, enemyPokemon, callback) {
        checkBattleReady(false);
        const opponentPokemonBattle = document.getElementById('opponent-pokemon');
        const userPokemonBattle = document.getElementById('user-pokemon');
        // who is win
        let isWinUser = true;
        const defaultHpEnemyPokemon = enemyPokemon.hp;
        // if true, then move userPokemon if false move enemy's
        let currentAttack = true;
        let timer = 3;

        function updateBattleUI() {
            if (userPokemon.hp < 0) {
                userPokemon.hp = 0;
            }
            if (enemyPokemon.hp < 0) {
                enemyPokemon.hp = 0;
            }
            // update UI hp info for user
            userPokemonBattle.textContent = `HP: ${userPokemon.hp} | Attack: ${userPokemon.attack}`;
            opponentPokemonBattle.textContent = `HP: ${enemyPokemon.hp} | Attack: ${enemyPokemon.attack}`;
        }

        updateBattleUI();
        // interval 1 sec
        const interval = setInterval(() => {
            if (userPokemon.hp > 0 && enemyPokemon.hp > 0) {
                battleText.textContent = currentAttack ? `Your move ${timer}` : `Enemy move ${timer}`;

                // time 0 start function attack
                if (timer === 0) {
                    if (currentAttack) {
                        battleText.textContent = `Your turn ${timer}`;
                        enemyPokemon.hp -= userPokemon.attack;
                    } else {
                        battleText.textContent = `Enemy turn ${timer}`;
                        userPokemon.hp -= enemyPokemon.attack;
                    }

                    // next turn
                    currentAttack = !currentAttack;
                    updateBattleUI();
                    timer = 3;
                } else {
                    timer--;
                }
            } else {
                clearInterval(interval);

                enemyPokemon.hp = defaultHpEnemyPokemon;

                if (callback) {
                    callback(userPokemon.hp > 0);
                }
            }
        }, 1000);
    }

    // unsellect pokemons after battle
    function clearContainers() {
        battlePokemonContainer.innerHTML = '';
        opponentCardContainer.innerHTML = '';
        userPokemonSelected = null;
        opponentPokemonSelected = null;
    }

    // set authorized if user have 1 pokemon or more
    function setAuthorized() {
        document.querySelector('main').classList.add('authorized');
        document.querySelector('main').classList.remove('unauthorized');
    }

    // set unauthorized if user no have pokemons
    function setUnauthorized() {
        document.querySelector('main').classList.add('unauthorized');
        document.querySelector('main').classList.remove('authorized');
    }

    // check collection pokemons from local storage user
    function isAuthorized() {
        const userPokemonsFromStorage = getStoragePokemonsFromLocalStorage();
        if (userPokemonsFromStorage.length > 0) {
            setAuthorized();
        } else {
            setUnauthorized();
        }
    }

    // fetch data pokemons when start page
    const fetchData = () => {
        const apiURL = 'https://pokeapi.co/api/v2/pokemon?limit=1500';

        return fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                dataPokemons = data;
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    function getDadJokeFromLocalStorage() {
        return JSON.parse(localStorage.getItem("DadJokes"));
    }

    function isValidContainer(isStorage, containerId) {
        return isStorage &&
            containerId !== 'battle-card-container' &&
            containerId !== 'opponent-card-container' &&
            containerId !== 'battle-storage-container';
    }

    // init function
    function init() {
        isAuthorized();
        fetchDadJoke();
        fetchData();
    }


    // fetch dad joke
    function fetchDadJoke() {
        fetch("https://icanhazdadjoke.com/", {
            method: 'GET',
            credentials: 'same-origin',
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                function saveDadJoke() {
                    let dadJoke = data.joke
                    localStorage.setItem("DadJokes", JSON.stringify(dadJoke))
                }
                // save to local storage
                saveDadJoke();
            })
    }

    // init function
    init();
});
