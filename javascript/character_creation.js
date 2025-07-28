document.addEventListener('DOMContentLoaded', () => {
    //--- 1. Referências aos Elementos HTML ---

    //Elementos principais do formulário
    const createCharacterBtn = document.getElementById('create-character-btn');
    const nameInput = document.getElementById('name');
    const farmNameInput = document.getElementById('farm-name');
    const favoriteThingInput = document.getElementById('favorite-thing');
    const skipIntroCheckbox = document.getElementById('skip-intro');

    //Elementos da prévia do personagem (os blocos coloridos)
    const previewHead = document.querySelector('.preview-head');
    const previewBody = document.querySelector('.preview-body');
    const previewLegs = document.querySelector('.preview-legs');
    const previewFeet = document.querySelector('.preview-feet');

    const skinColorInput = document.getElementById('skin-color');
    const hairColorInput = document.getElementById('hair-color');
    const shirtColorInput = document.getElementById('shirt-color');
    const pantsColorInput = document.getElementById('pants-color');
    const shoesColorInput = document.getElementById('shoes-color');
    const eyesColorInput = document.getElementById('eyes-color'); //Usado para a cor dos olhos

    //--- 2. Dados e Estado do Jogo ---

    //Opções de customização e seus índices atuais
    //'max' define o número máximo de "tipos" para cada item (ex: Skin 1, Skin 2, Skin 3)
    //'element' refere-se ao <span> onde o número do tipo é exibido
    const customizationOptions = {
        skin: { index: 1, max: 3, element: document.getElementById('skin-index') },
        hair: { index: 1, max: 5, element: document.getElementById('hair-index') },
        shirt: { index: 1, max: 8, element: document.getElementById('shirt-index') },
        pants: { index: 1, max: 6, element: document.getElementById('pants-index') },
        shoes: { index: 1, max: 4, element: document.getElementById('shoes-index') },
        acc: { index: 1, max: 4, element: document.getElementById('acc-index') } //Acessório, pode ser usado para óculos, chapéus etc.
    };

    //Preferência de animal (nomes dos arquivos de imagem dos ícones)
    const animalIcon = document.getElementById('animal-icon');
    const prevAnimalBtn = document.getElementById('prev-animal');
    const nextAnimalBtn = document.getElementById('next-animal');
    const animalTypes = [
    'cat_icon.jpg',  
    'cat2_icon.jpg',  
    'cat3_icon.jpg', 
    'cat4_icon.jpg', 
    'cat5_icon.jpg',
    'dog_icon.jpg',  
    'horse_icon.jpg',
    'horse1_icon.jpg',
    'rabbit_icon.jpg',
    'rabbit1_icon.jpg'
    ];
    let currentAnimalIndex = 0; //Índice do animal atualmente selecionado

    //Seleção de gênero
    const genderMaleIcon = document.getElementById('gender-male');
    const genderFemaleIcon = document.getElementById('gender-female');
    let selectedGender = 'male'; //Gênero padrão

    //--- 3. Funções de Atualização da Interface ---

    //Atualiza as cores e o estado "is-dress" na prévia do personagem
    function updateCharacterPreview() {
        //Aplica as cores selecionadas aos elementos da prévia via variáveis CSS
        previewHead.style.setProperty('--skin-color', skinColorInput.value);
        previewHead.style.setProperty('--hair-color', hairColorInput.value);
        previewHead.style.setProperty('--eyes-color', eyesColorInput.value);
        previewBody.style.setProperty('--shirt-color', shirtColorInput.value);
        previewLegs.style.setProperty('--pants-color', pantsColorInput.value);
        previewFeet.style.setProperty('--shoes-color', shoesColorInput.value);

        //Lógica de "vestido": se o tipo de camisa for o que representa um vestido (ex: 3)
        //Adiciona/remove a classe 'is-dress' no corpo para mudar sua forma e esconder pernas/pés
        const currentShirtTypeIndex = customizationOptions.shirt.index;
        if(currentShirtTypeIndex === 3) { //Supondo que 'Shirt 3' é o estilo de vestido
            previewBody.classList.add('is-dress');
        } else {
            previewBody.classList.remove('is-dress');
        }
    }

    //Atualiza o índice de um tipo de customização (Skin, Hair, etc.)
    function updateCustomizationIndex(type, direction) {
        let current = customizationOptions[type].index;
        const max = customizationOptions[type].max;

        if (direction === 'next') {
            current = (current % max) + 1; //Avança, voltando ao 1 se passar do max
        } else {
            current = (current - 2 + max) % max + 1; //Volta, indo ao max se passar do 1
        }
        customizationOptions[type].index = current;
        customizationOptions[type].element.textContent = current; //Atualiza o texto "Skin 1", "Hair 2" etc.
        updateCharacterPreview(); //Redesenha a prévia
    }

    //Atualiza a imagem do animal exibida
    function updateAnimalDisplay() {
        animalIcon.src = `../images/${animalTypes[currentAnimalIndex]}`;
        animalIcon.alt = animalTypes[currentAnimalIndex].replace('_icon.jpg', ''); //Define o texto alt da imagem
    }

    //Gerencia a seleção visual do gênero
    function selectGender(gender) {
        selectedGender = gender;
        if(gender === 'male') {
            genderMaleIcon.classList.add('active');
            genderFemaleIcon.classList.remove('active');
        } else {
            genderFemaleIcon.classList.add('active');
            genderMaleIcon.classList.remove('active');
        }
        //Poderia ter lógica aqui para mudar a prévia do personagem baseada no gênero, se necessário.
        updateCharacterPreview();
    }

    //--- 4. Event Listeners ---

    //Listeners para os inputs de cor (atualizam a prévia em tempo real)
    skinColorInput.addEventListener('input', updateCharacterPreview);
    hairColorInput.addEventListener('input', updateCharacterPreview);
    shirtColorInput.addEventListener('input', updateCharacterPreview);
    pantsColorInput.addEventListener('input', updateCharacterPreview);
    shoesColorInput.addEventListener('input', updateCharacterPreview);
    eyesColorInput.addEventListener('input', updateCharacterPreview);

    //Listeners para os botões de seta de customização (skin, hair, shirt, etc.)
    document.querySelectorAll('.customization-option .arrow-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const type = event.target.dataset.type; //Obtém o tipo (ex: 'skin', 'hair')
            const direction = event.target.dataset.direction; //Obtém a direção ('prev', 'next')
            updateCustomizationIndex(type, direction);
        });
    });

    //Listeners para os botões de seta de preferência de animal
    prevAnimalBtn.addEventListener('click', () => {
        currentAnimalIndex = (currentAnimalIndex - 1 + animalTypes.length) % animalTypes.length;
        updateAnimalDisplay();
    });
    nextAnimalBtn.addEventListener('click', () => {
        currentAnimalIndex = (currentAnimalIndex + 1) % animalTypes.length;
        updateAnimalDisplay();
    });

    //Listeners para a seleção de gênero
    genderMaleIcon.addEventListener('click', () => selectGender('male'));
    genderFemaleIcon.addEventListener('click', () => selectGender('female'));

    //Listener para o botão 'OK' (Criar Personagem)
    createCharacterBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const farmName = farmNameInput.value.trim();
        const favoriteThing = favoriteThingInput.value.trim();
        const skipIntro = skipIntroCheckbox.checked;

        if(name === '') {
            alert('Por favor, insira um nome para o personagem.');
            return; //Impede a criação se o nome estiver vazio
        }

        //Salvar todos os dados do personagem no localStorage para acesso posterior
        localStorage.setItem('playerName', name);
        localStorage.setItem('playerFarmName', farmName);
        localStorage.setItem('playerFavoriteThing', favoriteThing);
        localStorage.setItem('playerSkipIntro', skipIntro);
        localStorage.setItem('playerGender', selectedGender);

        //Salva os índices de customização
        localStorage.setItem('playerSkinIndex', customizationOptions.skin.index);
        localStorage.setItem('playerHairColorIndex', customizationOptions.hair.index);
        localStorage.setItem('playerShirtIndex', customizationOptions.shirt.index);
        localStorage.setItem('playerPantsIndex', customizationOptions.pants.index);
        localStorage.setItem('playerShoesIndex', customizationOptions.shoes.index);
        localStorage.setItem('playerAccIndex', customizationOptions.acc.index);
        localStorage.setItem('playerAnimalPreference', animalTypes[currentAnimalIndex]); //Salva o nome do arquivo do ícone do animal

        //Salva as cores
        localStorage.setItem('playerSkinColor', skinColorInput.value);
        localStorage.setItem('playerHairColor', hairColorInput.value);
        localStorage.setItem('playerShirtColor', shirtColorInput.value);
        localStorage.setItem('playerPantsColor', pantsColorInput.value);
        localStorage.setItem('playerShoesColor', shoesColorInput.value);
        localStorage.setItem('playerEyesColor', eyesColorInput.value);

        //Redirecionar para a página principal do jogo (game_main.html)
        window.location.href = 'game_main.html';
    });

    //--- 5. Inicialização (Ao carregar a página) ---

    //Tenta carregar dados previamente salvos do localStorage
    if (localStorage.getItem('playerName')) {
        nameInput.value = localStorage.getItem('playerName');
        farmNameInput.value = localStorage.getItem('playerFarmName');
        favoriteThingInput.value = localStorage.getItem('playerFavoriteThing');
        skipIntroCheckbox.checked = localStorage.getItem('playerSkipIntro') === 'true'; // Converte string "true" para boolean true

        //Carrega índices de customização e garante que sejam números
        customizationOptions.skin.index = parseInt(localStorage.getItem('playerSkinIndex')) || 1;
        customizationOptions.hair.index = parseInt(localStorage.getItem('playerHairColorIndex')) || 1;
        customizationOptions.shirt.index = parseInt(localStorage.getItem('playerShirtIndex')) || 1;
        customizationOptions.pants.index = parseInt(localStorage.getItem('playerPantsIndex')) || 1;
        customizationOptions.shoes.index = parseInt(localStorage.getItem('playerShoesIndex')) || 1;
        customizationOptions.acc.index = parseInt(localStorage.getItem('playerAccIndex')) || 1;

        //Carrega cores
        skinColorInput.value = localStorage.getItem('playerSkinColor') || "#F5DEB3";
        hairColorInput.value = localStorage.getItem('playerHairColor') || "#8B4513";
        shirtColorInput.value = localStorage.getItem('playerShirtColor') || "#4CAF50";
        pantsColorInput.value = localStorage.getItem('playerPantsColor') || "#354579";
        shoesColorInput.value = localStorage.getItem('playerShoesColor') || "#8B4513";
        eyesColorInput.value = localStorage.getItem('playerEyesColor') || "#000000";

        //Carrega gênero
        const savedGender = localStorage.getItem('playerGender');
        if(savedGender) {
            selectGender(savedGender);
        } else {
            selectGender('male'); //Padrão se não houver salvo
        }

        //Carrega animal
        const savedAnimal = localStorage.getItem('playerAnimalPreference');
        const animalIdx = animalTypes.indexOf(savedAnimal); // Encontra o índice do animal salvo
        currentAnimalIndex = (animalIdx !== -1) ? animalIdx : 0; // Define o índice, ou 0 se não encontrar
    } else {
        //Define valores padrão se não houver dados salvos pela primeira vez
        selectGender('male');
    }

    //Atualiza os textos dos índices de customização no HTML
    for(const type in customizationOptions) {
        if(customizationOptions.hasOwnProperty(type)) {
            customizationOptions[type].element.textContent = customizationOptions[type].index;
        }
    }
    updateAnimalDisplay();      //Exibe o animal correto
    updateCharacterPreview();   //Realiza a primeira atualização da prévia
});