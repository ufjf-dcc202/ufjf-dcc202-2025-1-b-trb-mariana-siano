document.addEventListener('DOMContentLoaded', () => {
    //--- Configurações do Jogo ---
    const GRID_SIZE = 12; //Grade 12x12
    const INITIAL_MONEY = 100;
    const TIME_ADVANCE_COST = 5; //Custo para avançar o tempo (opcional)

    //Definição dos tipos de sementes e suas propriedades
    const seedTypes = {
        cenoura: {
            name: 'Cenoura',
            cost: 10,
            growthPhases: 3, //0: semente, 1: broto, 2: médio, 3: maduro
            harvestValue: 30,
            iconPrefix: 'plant_cenoura_',
            seedIcon: 'seed_cenoura.png'
        },
        tomate: {
            name: 'Tomate',
            cost: 15,
            growthPhases: 4,
            harvestValue: 45,
            iconPrefix: 'plant_tomate_',
            seedIcon: 'seed_tomate.png'
        },
        abobora: {
            name: 'Abóbora',
            cost: 20,
            growthPhases: 5,
            harvestValue: 60,
            iconPrefix: 'plant_abobora_',
            seedIcon: 'seed_abobora.png'
        }
    };

    //--- Variáveis de Estado do Jogo ---
    let money = INITIAL_MONEY;
    let selectedSeed = null; //Semente atualmente selecionada para plantar
    let selectedTool = null; //Ferramenta atualmente selecionada (limpar, preparar, regar, colher)
    let farmGrid = []; //Matriz 2D para representar o estado da fazenda

    //--- Referências aos Elementos HTML ---
    const farmGridElement = document.getElementById('farm-grid');
    const moneyDisplay = document.getElementById('money-display');
    const selectedSeedDisplay = document.getElementById('selected-seed-display');
    const gameMessageDisplay = document.getElementById('game-message');
    const messageBox = document.getElementById('message-box'); //Referência à caixa de mensagem

    const seedButtons = document.querySelectorAll('.seed-button');
    const actionButtons = document.querySelectorAll('.action-button');

    const clearToolBtn = document.getElementById('clear-tool-btn');
    const prepareToolBtn = document.getElementById('prepare-tool-btn');
    const plantToolBtn = document.getElementById('plant-tool-btn');
    const waterToolBtn = document.getElementById('water-tool-btn');
    const harvestToolBtn = document.getElementById('harvest-tool-btn');
    const advanceTimeBtn = document.getElementById('advance-time-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const newGameBtn = document.getElementById('new-game-btn');

    //--- Funções do Jogo ---

    /**
     * Exibe uma mensagem no painel de mensagens do jogo.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - Tipo de mensagem ('info', 'success', 'error').
     */
    function showGameMessage(message, type = 'info') {
        gameMessageDisplay.textContent = message;
        //Adiciona classes para diferentes tipos de mensagem para estilização
        messageBox.className = `message-box ${type}`; // Define a classe da caixa de mensagem
    }

    //Atualiza a exibição de dinheiro na interface.
    function updateMoneyDisplay() {
        moneyDisplay.textContent = money;
    }

    //Atualiza a exibição da semente selecionada na interface.
    function updateSelectedSeedDisplay() {
        selectedSeedDisplay.textContent = selectedSeed ? seedTypes[selectedSeed].name : 'Nenhuma';
    }

    //Inicializa a grade da fazenda com espaços vazios, pedras e ervas daninhas.
    function initializeFarmGrid() {
        farmGrid = [];

        for(let r = 0; r < GRID_SIZE; r++) {
            farmGrid[r] = [];

            for(let c = 0; c < GRID_SIZE; c++) {
                let cellType = 'empty';
                const rand = Math.random();
                if(rand < 0.1) { //10% de chance de pedra
                    cellType = 'stone';
                } else if(rand < 0.2) { //10% de chance de erva daninha
                    cellType = 'weed';
                }
                farmGrid[r][c] = {
                    type: cellType,       //'empty', 'stone', 'weed', 'prepared', 'planted'
                    seedType: null,       //Tipo de semente se 'planted'
                    growthPhase: 0,       //Fase de crescimento da planta
                    watered: false,       //Se a planta foi regada no ciclo atual
                    dead: false           //Se a planta morreu por falta de água
                };
            }
        }
        renderFarmGrid(); //Renderiza a grade após a inicialização
        showGameMessage('Fazenda inicializada! Escolha uma ferramenta.');
    }

    //Renderiza (ou atualiza) a grade da fazenda na interface.
    function renderFarmGrid() {
        farmGridElement.innerHTML = ''; //Limpa a grade existente

        for(let r = 0; r < GRID_SIZE; r++) {
            for(let c = 0; c < GRID_SIZE; c++) {
                const cellData = farmGrid[r][c];
                const cellElement = document.createElement('div');
                cellElement.classList.add('grid-cell');
                cellElement.dataset.row = r;
                cellElement.dataset.col = c;

                //Adiciona classes baseadas no tipo de célula
                cellElement.classList.add(`cell-${cellData.type}`);
                if(cellData.watered) {
                    cellElement.classList.add('cell-watered');
                }

                if(cellData.dead) {
                    cellElement.classList.add('cell-dead');
                }

                //Adiciona ícone da planta/semente se estiver plantado
                if(cellData.type === 'planted' && cellData.seedType) {
                    const plantIcon = document.createElement('div');
                    plantIcon.classList.add('plant-icon');

                    if(cellData.dead) {
                        plantIcon.classList.add('plant-dead'); //Ícone de planta morta
                    } else {
                        const seedInfo = seedTypes[cellData.seedType];
                        plantIcon.classList.add(`${seedInfo.iconPrefix}${cellData.growthPhase}`);
                    }
                    cellElement.appendChild(plantIcon);
                }

                cellElement.addEventListener('click', handleCellClick);
                farmGridElement.appendChild(cellElement);
            }
        }
    }

    /**
     * Lida com o clique em uma célula da grade.
     * @param {Event} event - O evento de clique.
     */
    function handleCellClick(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const cell = farmGrid[row][col];

        if(!selectedTool) {
            showGameMessage('Por favor, selecione uma ferramenta ou semente primeiro.', 'info');
            return;
        }

        switch(selectedTool) {
            case 'clear':
                if(cell.type === 'stone' || cell.type === 'weed' || cell.dead) { //Pode limpar plantas mortas também
                    cell.type = 'empty';
                    cell.seedType = null; //Garante que dados de semente sejam limpos
                    cell.growthPhase = 0;
                    cell.watered = false;
                    cell.dead = false;
                    showGameMessage('Terreno limpo!', 'success');
                } else {
                    showGameMessage('Nada para limpar aqui.', 'info');
                }
                break;

            case 'prepare':
                if(cell.type === 'empty') {
                    cell.type = 'prepared';
                    showGameMessage('Solo preparado para o plantio!', 'success');
                } else if (cell.type === 'prepared') {
                    showGameMessage('Solo já está preparado.', 'info');
                } else {
                    showGameMessage('Não é possível preparar este terreno. Limpe-o primeiro.', 'error');
                }
                break;

            case 'plant':
                if(cell.type === 'prepared' && selectedSeed) {
                    const seedInfo = seedTypes[selectedSeed];

                    if(money >= seedInfo.cost) {
                        money -= seedInfo.cost;
                        cell.type = 'planted';
                        cell.seedType = selectedSeed;
                        cell.growthPhase = 0; //Semente recém-plantada
                        cell.watered = false; //Começa não regada
                        cell.dead = false;
                        updateMoneyDisplay();
                        showGameMessage(`Semente de ${seedInfo.name} plantada!`, 'success');
                    } else {
                        showGameMessage('Dinheiro insuficiente para comprar esta semente.', 'error');
                    }
                } else if(!selectedSeed) {
                    showGameMessage('Selecione uma semente para plantar primeiro.', 'info');
                } else if(cell.type === 'planted') {
                    showGameMessage('Já há uma planta aqui. Use a ferramenta "Limpar" para removê-la.', 'info');
                } else {
                    showGameMessage('O solo precisa ser preparado antes de plantar.', 'error');
                }
                break;

            case 'water':
                if(cell.type === 'planted' && !cell.dead) {
                    if(!cell.watered) { //Só rega se não estiver já regado
                        cell.watered = true;
                        showGameMessage('Planta regada!', 'success');
                    } else {
                        showGameMessage('Esta planta já foi regada neste ciclo.', 'info');
                    }
                } else if(cell.dead) {
                    showGameMessage('Esta planta está morta e não pode ser regada. Use "Limpar".', 'error');
                } else {
                    showGameMessage('Nada para regar aqui.', 'info');
                }
                break;

            case 'harvest':
                if(cell.type === 'planted' && cell.seedType && cell.growthPhase === seedTypes[cell.seedType].growthPhases && !cell.dead) {
                    const seedInfo = seedTypes[cell.seedType];
                    money += seedInfo.harvestValue;
                    cell.type = 'empty'; //Volta a ser solo vazio
                    cell.seedType = null;
                    cell.growthPhase = 0;
                    cell.watered = false;
                    cell.dead = false;
                    updateMoneyDisplay();
                    showGameMessage(`Você colheu ${seedInfo.name} e ganhou ${seedInfo.harvestValue} ouro!`, 'success');
                } else if(cell.type === 'planted' && cell.dead) {
                    showGameMessage('Esta planta está morta. Use a ferramenta "Limpar" para removê-la.', 'error');
                } else if(cell.type === 'planted') {
                    showGameMessage('Esta planta ainda não está pronta para a colheita.', 'info');
                } else {
                    showGameMessage('Nada para colher aqui.', 'info');
                }
                break;
        }
        renderFarmGrid(); //Sempre renderiza a grade após uma ação
    }

    //Avança o tempo no jogo, fazendo as plantas crescerem ou morrerem
    function advanceTime() {
        if(money < TIME_ADVANCE_COST) {
            showGameMessage(`Você precisa de ${TIME_ADVANCE_COST} ouro para avançar o tempo!`, 'error');
            return;
        }
        money -= TIME_ADVANCE_COST;
        updateMoneyDisplay();

        let plantsGrown = 0;
        let plantsDied = 0;

        for(let r = 0; r < GRID_SIZE; r++) {
            for(let c = 0; c < GRID_SIZE; c++) {
                const cell = farmGrid[r][c];

                if(cell.type === 'planted' && !cell.dead) {
                    if(cell.watered) {
                        //Planta cresce se regada e não estiver no crescimento máximo
                        const seedInfo = seedTypes[cell.seedType];

                        if(cell.growthPhase < seedInfo.growthPhases) {
                            cell.growthPhase++;
                            plantsGrown++;
                        }
                        cell.watered = false; //Reseta o estado de regado para o próximo ciclo
                    } else {
                        //Planta morre se não for regada
                        cell.dead = true;
                        plantsDied++;
                    }
                }
            }
        }
        renderFarmGrid(); //Atualiza a grade após o avanço do tempo

        let message = 'O tempo avançou.';

        if(plantsGrown > 0) message += ` ${plantsGrown} plantas cresceram.`;
        if(plantsDied > 0) message += ` ${plantsDied} plantas morreram por falta de água!`;
        showGameMessage(message, 'info');
    }

    /**
     * Lida com a seleção de uma semente.
     * @param {string} seedKey - A chave da semente (ex: 'cenoura').
     */
    function selectSeed(seedKey) {
        selectedSeed = seedKey;
        selectedTool = 'plant'; //Selecionar semente automaticamente seleciona a ferramenta de plantio
        updateSelectedSeedDisplay();
        showGameMessage(`Semente de ${seedTypes[seedKey].name} selecionada! Agora clique em um solo preparado para plantar.`, 'info');
        highlightSelectedButton(seedButtons, seedKey);
        highlightSelectedButton(actionButtons, 'plant'); //Destaca o botão de plantar
    }

    /**
     * Lida com a seleção de uma ferramenta.
     * @param {string} toolKey - A chave da ferramenta (ex: 'clear').
     */
    function selectTool(toolKey) {
        selectedTool = toolKey;
        selectedSeed = null; //Desseleciona qualquer semente
        updateSelectedSeedDisplay();
        showGameMessage(`Ferramenta "${toolKey}" selecionada. Clique em um quadrado na fazenda.`, 'info');
        highlightSelectedButton(actionButtons, toolKey);
        highlightSelectedButton(seedButtons, null); //Desseleciona botões de semente
    }

    /**
     * Adiciona/remove a classe 'selected' aos botões para feedback visual.
     * @param {NodeList} buttons - NodeList de botões (seedButtons ou actionButtons).
     * @param {string} selectedKey - A chave do botão selecionado (data-seed-type ou id da ferramenta).
     */
    function highlightSelectedButton(buttons, selectedKey) {
        buttons.forEach(button => {
            const buttonKey = button.dataset.seedType || button.id.replace('-tool-btn', '');

            if(buttonKey === selectedKey) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    //--- Inicialização do Jogo ---
    function initGame() {
        initializeFarmGrid();
        updateMoneyDisplay();
        updateSelectedSeedDisplay();
        //Limpa seleções iniciais
        highlightSelectedButton(seedButtons, null);
        highlightSelectedButton(actionButtons, null);
    }

    //--- Event Listeners Globais ---

    //Listeners para os botões de seleção de semente
    seedButtons.forEach(button => {
        button.addEventListener('click', () => selectSeed(button.dataset.seedType));
    });

    //Listeners para os botões de ação
    clearToolBtn.addEventListener('click', () => selectTool('clear'));
    prepareToolBtn.addEventListener('click', () => selectTool('prepare'));
    plantToolBtn.addEventListener('click', () => selectTool('plant'));
    waterToolBtn.addEventListener('click', () => selectTool('water'));
    harvestToolBtn.addEventListener('click', () => selectTool('harvest'));
    advanceTimeBtn.addEventListener('click', advanceTime);

    //Listeners para os botões do rodapé
    backToMenuBtn.addEventListener('click', () => {
        //Volta para o menu principal, mantendo o estado do jogo se o usuário quiser continuar depois
        window.location.href = 'index.html';
    });

    newGameBtn.addEventListener('click', () => {
        //Reinicia o jogo completamente
        const confirmNewGame = confirm('Tem certeza que deseja iniciar um Novo Jogo? Todo o progresso da fazenda será perdido.');

        if(confirmNewGame) {
            initGame(); //Reinicializa a fazenda e o dinheiro
            money = INITIAL_MONEY; //Garante que o dinheiro resete
            updateMoneyDisplay();
            showGameMessage('Um novo jogo começou! Sua fazenda foi reiniciada.', 'info');
        }
    });

    //Inicia o jogo quando a página é carregada
    initGame();
});