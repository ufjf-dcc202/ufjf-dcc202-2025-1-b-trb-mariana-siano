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

    //Setas e índices para tipos de roupa/pele/cabelo
    const customizationOptions = {
        skin: { index: 1, max: 3, element: document.getElementById('skin-index') },
        hair: { index: 1, max: 5, element: document.getElementById('hair-index') },
        shirt: { index: 1, max: 8, element: document.getElementById('shirt-index') },
        pants: { index: 1, max: 6, element: document.getElementById('pants-index') },
        shoes: { index: 1, max: 4, element: document.getElementById('shoes-index') },
        acc: { index: 1, max: 4, element: document.getElementById('acc-index') }
    };

    //Preferência de animal
    const animalIcon = document.getElementById('animal-icon');
    const prevAnimalBtn = document.getElementById('prev-animal');
    const nextAnimalBtn = document.getElementById('next-animal');
    const animalTypes = ['cat_icon.png', 'dog_icon.png', 'cow_icon.png'];
    let currentAnimalIndex = 0;

    //Seleção de gênero
    const genderMaleIcon = document.getElementById('gender-male');
    const genderFemaleIcon = document.getElementById('gender-female');
    let selectedGender = 'male';

    //--- Funções de Atualização da Prévia ---
    function updateCharacterPreview() {
        previewHead.style.setProperty('--skin-color', skinColorInput.value);
        previewHead.style.setProperty('--hair-color', hairColorInput.value);
        previewHead.style.setProperty('--eyes-color', eyesColorInput.value);
        previewBody.style.setProperty('--shirt-color', shirtColorInput.value);
        previewLegs.style.setProperty('--pants-color', pantsColorInput.value);
        previewFeet.style.setProperty('--shoes-color', shoesColorInput.value); // AGORA USA shoesColorInput!

        //Simulação de "vestido" vs "calça/camisa"
        //Supondo que 'shirt type 3' seja um vestido
        const currentShirtTypeIndex = customizationOptions.shirt.index;
        if(currentShirtTypeIndex === 3) {
            previewBody.classList.add('is-dress');
        } else {
            previewBody.classList.remove('is-dress');
        }
    }

    function updateCustomizationIndex(type, direction) {
        let current = customizationOptions[type].index;
        const max = customizationOptions[type].max;

        if(direction === 'next') {
            current = (current % max) + 1;
        } else {
            current = (current - 2 + max) % max + 1;
        }
        customizationOptions[type].index = current;
        customizationOptions[type].element.textContent = current;
        updateCharacterPreview(); //Atualiza a prévia ao mudar o índice
    }

    function updateAnimalDisplay() {
        animalIcon.src = `../images/${animalTypes[currentAnimalIndex]}`;
    }

    function selectGender(gender) {
        selectedGender = gender;

        if(gender === 'male') {
            genderMaleIcon.classList.add('active');
            genderFemaleIcon.classList.remove('active');
        } else {
            genderFemaleIcon.classList.add('active');
            genderMaleIcon.classList.remove('active');
        }
        updateCharacterPreview();
    }

    //--- Event Listeners ---
    //Listeners para os inputs de cor
    skinColorInput.addEventListener('input', updateCharacterPreview);
    hairColorInput.addEventListener('input', updateCharacterPreview);
    shirtColorInput.addEventListener('input', updateCharacterPreview);
    pantsColorInput.addEventListener('input', updateCharacterPreview);
    shoesColorInput.addEventListener('input', updateCharacterPreview);
    eyesColorInput.addEventListener('input', updateCharacterPreview);

    //Listeners para os botões de seta de customização
    document.querySelectorAll('.customization-option .arrow-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const type = event.target.dataset.type;
            const direction = event.target.dataset.direction;
            updateCustomizationIndex(type, direction);
        });
    });

    //Listeners para os botões de seta do animal
    prevAnimalBtn.addEventListener('click', () => {
        currentAnimalIndex = (currentAnimalIndex - 1 + animalTypes.length) % animalTypes.length;
        updateAnimalDisplay();
    });
    nextAnimalBtn.addEventListener('click', () => {
        currentAnimalIndex = (currentAnimalIndex + 1) % animalTypes.length;
        updateAnimalDisplay();
    });

    // Listeners para a seleção de gênero
    genderMaleIcon.addEventListener('click', () => selectGender('male'));
    genderFemaleIcon.addEventListener('click', () => selectGender('female'));


    //Listener para o botão 'OK'/'Criar Personagem'
    createCharacterBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const farmName = farmNameInput.value.trim();
        const favoriteThing = favoriteThingInput.value.trim();
        const skipIntro = skipIntroCheckbox.checked;

        if(name === '') {
            alert('Por favor, insira um nome para o personagem.');
            return;
        }

        //Salvar todos os dados do personagem no localStorage
        localStorage.setItem('playerName', name);
        localStorage.setItem('playerFarmName', farmName);
        localStorage.setItem('playerFavoriteThing', favoriteThing);
        localStorage.setItem('playerSkipIntro', skipIntro);
        localStorage.setItem('playerGender', selectedGender);

        localStorage.setItem('playerSkinIndex', customizationOptions.skin.index);
        localStorage.setItem('playerHairColorIndex', customizationOptions.hair.index);
        localStorage.setItem('playerShirtIndex', customizationOptions.shirt.index);
        localStorage.setItem('playerPantsIndex', customizationOptions.pants.index);
        localStorage.setItem('playerShoesIndex', customizationOptions.shoes.index);
        localStorage.setItem('playerAccIndex', customizationOptions.acc.index);
        localStorage.setItem('playerAnimalPreference', animalTypes[currentAnimalIndex]);

        localStorage.setItem('playerSkinColor', skinColorInput.value);
        localStorage.setItem('playerHairColor', hairColorInput.value);
        localStorage.setItem('playerShirtColor', shirtColorInput.value);
        localStorage.setItem('playerPantsColor', pantsColorInput.value);
        localStorage.setItem('playerShoesColor', shoesColorInput.value);
        localStorage.setItem('playerEyesColor', eyesColorInput.value);

        //Redirecionar para a página do jogo
        window.location.href = 'game.html';
    });

    //--- Inicialização ao carregar a página ---
    //Carregar dados salvos, se existirem
    if (localStorage.getItem('playerName')) {
        nameInput.value = localStorage.getItem('playerName');
        farmNameInput.value = localStorage.getItem('playerFarmName');
        favoriteThingInput.value = localStorage.getItem('playerFavoriteThing');
        skipIntroCheckbox.checked = localStorage.getItem('playerSkipIntro') === 'true';

        //Carregar índices e cores
        customizationOptions.skin.index = parseInt(localStorage.getItem('playerSkinIndex')) || 1;
        customizationOptions.hair.index = parseInt(localStorage.getItem('playerHairColorIndex')) || 1;
        customizationOptions.shirt.index = parseInt(localStorage.getItem('playerShirtIndex')) || 1;
        customizationOptions.pants.index = parseInt(localStorage.getItem('playerPantsIndex')) || 1;
        customizationOptions.shoes.index = parseInt(localStorage.getItem('playerShoesIndex')) || 1;
        customizationOptions.acc.index = parseInt(localStorage.getItem('playerAccIndex')) || 1;
        skinColorInput.value = localStorage.getItem('playerSkinColor') || "#F5DEB3";
        hairColorInput.value = localStorage.getItem('playerHairColor') || "#8B4513";
        shirtColorInput.value = localStorage.getItem('playerShirtColor') || "#4CAF50";
        pantsColorInput.value = localStorage.getItem('playerPantsColor') || "#354579";
        shoesColorInput.value = localStorage.getItem('playerShoesColor') || "#8B4513";
        eyesColorInput.value = localStorage.getItem('playerEyesColor') || "#000000";

        //Carregar gênero
        const savedGender = localStorage.getItem('playerGender');
        if (savedGender) {
            selectGender(savedGender);
        } else {
            selectGender('male'); //Padrão
        }

        //Carregar animal
        const savedAnimal = localStorage.getItem('playerAnimalPreference');
        const animalIdx = animalTypes.indexOf(savedAnimal);
        currentAnimalIndex = (animalIdx !== -1) ? animalIdx : 0;

    } else {
        //Valores padrão se não houver dados salvos
        selectGender('male');
    }

    //Atualizar displays iniciais
    for (const type in customizationOptions) {
        if (customizationOptions.hasOwnProperty(type)) {
            customizationOptions[type].element.textContent = customizationOptions[type].index;
        }
    }
    updateAnimalDisplay();
    updateCharacterPreview(); //Primeira atualização da prévia
});