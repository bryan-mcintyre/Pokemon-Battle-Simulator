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