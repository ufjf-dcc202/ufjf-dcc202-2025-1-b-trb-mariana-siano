document.addEventListener('DOMContentLoaded', () => {
    //Referências aos elementos do formulário e da prévia
    const createCharacterBtn = document.getElementById('create-character-btn');
    const nameInput = document.getElementById('name');
    const farmNameInput = document.getElementById('farm-name');
    const favoriteThingInput = document.getElementById('favorite-thing');
    const skipIntroCheckbox = document.getElementById('skip-intro');

    //Elementos da prévia do personagem
    const previewHead = document.querySelector('.preview-head');
    const previewBody = document.querySelector('.preview-body');
    const previewLegs = document.querySelector('.preview-legs');
    const previewFeet = document.querySelector('.preview-feet');

    //Inputs de cor
    const skinColorInput = document.getElementById('skin-color');
    const hairColorInput = document.getElementById('hair-color');
    const shirtColorInput = document.getElementById('shirt-color');
    const pantsColorInput = document.getElementById('pants-color');
    const shoesColorInput = document.getElementById('shoes-color');
    const eyesColorInput = document.getElementById('eyes-color');

    //Setas e índices para tipos de roupas/pele/cabelo
    const customizationOptions = {
        skin: { index: 1, max: 3, element: document.getElementById('skin-index') },
        hair: { index: 1, max: 5, element: document.getElementById('hair-index') },
        shirt: { index: 1, max: 8, element: document.getElementById('shirt-index') },
        pants: { index: 1, max: 6, element: document.getElementById('pants-index') },
        shoes: { index: 1, max: 4, element: document.getElementById('shoes-index') },
        acc: { index: 1, max: 4, element: document.getElementById('acc-index') }
    }

    //Preferência do Animal
    const animalIcon = document.getElementById('animal-icon');
    const prevAnimalBtn = document.getElementById('prev-animal');
    const nextAnimalBtn = document.getElementById('next-animal');
    const animalTypes = ['cat_icon.png', 'dog_icon.png', 'cow_icon.png'];
    let currentAnimalIndex = 0;
})