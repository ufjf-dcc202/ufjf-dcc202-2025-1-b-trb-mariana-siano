document.addEventListener('DOMContentLoaded', () => {
    //--- Configurações do Jogo ---
    const GRID_SIZE = 12; //Grade 12x12
    const INITIAL_MONEY = 100;
    const DAY_DURATION_MS = 30000; //Duração de um dia em milissegundos (30 segundos)
    const WATERING_GRACE_PERIOD_DAYS = 2; //Número de dias que uma planta pode ficar sem água antes de morrer

    //Definição dos tipos de sementes e suas propriedades
    const seedTypes = {
        cenoura: {
            name: 'Cenoura',
            cost: 10,
            growthPhases: 3, //0: semente, 1: broto, 2: médio, 3: maduro
            harvestValue: 30,
            iconPrefix: 'plant_cenoura_', //Prefixo para classes CSS: plant_cenoura_0, plant_cenoura_1, etc.
            seedIcon: 'seed-cenoura.png' //Nome do arquivo do ícone da semente
        },
        tomate: {
            name: 'Tomate',
            cost: 15,
            growthPhases: 4,
            harvestValue: 45,
            iconPrefix: 'plant_tomate_', //Prefixo para classes CSS: plant_tomate_0, plant_tomate_1, etc.
            seedIcon: 'tomato-seed.png' //Nome do arquivo do ícone da semente
        },
        abobora: {
            name: 'Abóbora',
            cost: 20,
            growthPhases: 5,
            harvestValue: 60,
            iconPrefix: 'plant_abobora_', //Prefixo para classes CSS: plant_abobora_0, plant_abobora_1, etc.
            seedIcon: 'abobora-seed.png' //Nome do arquivo do ícone da semente
        }
    };

    //--- Variáveis de Estado do Jogo ---
    let money = INITIAL_MONEY;
    let selectedSeed = null;
    let selectedTool = null;
    let farmGrid = [];
    let currentDay = 1;
    let gameInterval;

    //--- Referências aos Elementos HTML ---
    const farmGridElement = document.getElementById('farm-grid');
    const moneyDisplay = document.getElementById('money-display');
    const selectedSeedDisplay = document.getElementById('selected-seed-display');
    const gameMessageDisplay = document.getElementById('game-message');
    const messageBox = document.getElementById('message-box');
    const dayDisplay = document.getElementById('day-display');

    const seedButtons = document.querySelectorAll('.seed-button');
    const actionButtons = document.querySelectorAll('.action-button');

    const clearToolBtn = document.getElementById('clear-tool-btn');
    const prepareToolBtn = document.getElementById('prepare-tool-btn');
    const plantToolBtn = document.getElementById('plant-tool-btn');
    const waterToolBtn = document.getElementById('water-tool-btn');
    const harvestToolBtn = document.getElementById('harvest-tool-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const newGameBtn = document.getElementById('new-game-btn');

    //--- Funções de Salvamento e Carregamento ---
    //Salva o estado atual do jogo no localStorage.
    function saveGameState() {
        localStorage.setItem('farmMoney', money);
        localStorage.setItem('currentDay', currentDay);
        localStorage.setItem('farmGrid', JSON.stringify(farmGrid));
        showGameMessage('Jogo salvo automaticamente!', 'info');
    }

    //Carrega o estado do jogo do localStorage, se existir.
    //Retorna true se um jogo foi carregado, false caso contrário.
    function loadGameState() {
        const savedMoney = localStorage.getItem('farmMoney');
        const savedDay = localStorage.getItem('currentDay');
        const savedGrid = localStorage.getItem('farmGrid');

        if(savedMoney && savedDay && savedGrid) {
            money = parseInt(savedMoney);
            currentDay = parseInt(savedDay);
            farmGrid = JSON.parse(savedGrid);

            //Garante que novas propriedades (como daysSinceLastWatered) existam em jogos salvos antigos
            farmGrid.forEach(row => {
                row.forEach(cell => {
                    if(cell.type === 'planted' && cell.daysSinceLastWatered === undefined) {
                        cell.daysSinceLastWatered = 0;
                    }
                });
            });
            showGameMessage('Jogo carregado!', 'info');
            return true;
        }
        return false;
    }

    //--- Funções do Jogo ---

    /**
     * Exibe uma mensagem no painel de mensagens do jogo.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - Tipo de mensagem ('info', 'success', 'error').
     */
    function showGameMessage(message, type = 'info') {
        gameMessageDisplay.textContent = message;
        messageBox.className = `message-box ${type}`;
    }

    //Atualiza a exibição de dinheiro na interface.
    function updateMoneyDisplay() {
        moneyDisplay.textContent = money;
    }

    //Atualiza a exibição da semente selecionada na interface.
    function updateSelectedSeedDisplay() {
        selectedSeedDisplay.textContent = selectedSeed ? seedTypes[selectedSeed].name : 'Nenhuma';
    }

    //Atualiza a exibição do dia na interface.
    function updateDayDisplay() {
        dayDisplay.textContent = currentDay;
    }

    //Inicializa a grade da fazenda com espaços vazios, pedras e ervas daninhas.
    function initializeFarmGrid() {
        farmGrid = [];
        for(let r = 0; r < GRID_SIZE; r++) {
            farmGrid[r] = [];
            for(let c = 0; c < GRID_SIZE; c++) {
                let cellType = 'empty';
                const rand = Math.random();
                if(rand < 0.1) {
                    cellType = 'stone';
                } else if(rand < 0.2) {
                    cellType = 'weed';
                }
                farmGrid[r][c] = {
                    type: cellType,
                    seedType: null,
                    growthPhase: 0,
                    watered: false,
                    daysSinceLastWatered: 0,
                    dead: false
                };
            }
        }
        showGameMessage('Fazenda inicializada! Escolha uma ferramenta.', 'info');
    }

    //Renderiza (ou atualiza) a grade da fazenda na interface.
    function renderFarmGrid() {
        farmGridElement.innerHTML = '';

        for(let r = 0; r < GRID_SIZE; r++) {
            for(let c = 0; c < GRID_SIZE; c++) {
                const cellData = farmGrid[r][c];
                const cellElement = document.createElement('div');
                cellElement.classList.add('grid-cell');
                cellElement.dataset.row = r;
                cellElement.dataset.col = c;
                cellElement.classList.add(`cell-${cellData.type}`);
                if(cellData.type === 'planted' && cellData.daysSinceLastWatered === 0 && !cellData.dead) {
                    cellElement.classList.add('cell-watered');
                } else {
                    cellElement.classList.remove('cell-watered');
                }

                if(cellData.dead) {
                    cellElement.classList.add('cell-dead');
                }

                if(cellData.type === 'planted' && cellData.seedType) {
                    const plantIcon = document.createElement('div');
                    plantIcon.classList.add('plant-icon');
                    if(cellData.dead) {
                        plantIcon.classList.add('plant-dead');
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
        const cellElement = event.target.closest('.grid-cell');
        if(!cellElement)
            return;

        const row = parseInt(cellElement.dataset.row);
        const col = parseInt(cellElement.dataset.col);

        if(isNaN(row) || isNaN(col))
            return;

        const cell = farmGrid[row][col];

        if(!selectedTool) {
            showGameMessage('Por favor, selecione uma ferramenta ou semente primeiro.', 'info');
            return;
        }

        switch (selectedTool) {
            case 'clear':
                if(cell.type === 'stone' || cell.type === 'weed' || cell.dead) {
                    cell.type = 'empty';
                    cell.seedType = null;
                    cell.growthPhase = 0;
                    cell.watered = false;
                    cell.daysSinceLastWatered = 0;
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
                } else if(cell.type === 'prepared') {
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
                        cell.growthPhase = 0;
                        cell.watered = true; // Planta recém-plantada é considerada regada no dia 0
                        cell.daysSinceLastWatered = 0;
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
                    if(!cell.watered) {
                        cell.watered = true;
                        cell.daysSinceLastWatered = 0;
                        showGameMessage('Planta regada!', 'success');
                    } else {
                        showGameMessage('Esta planta já foi regada hoje.', 'info');
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
                    cell.type = 'empty';
                    cell.seedType = null;
                    cell.growthPhase = 0;
                    cell.watered = false;
                    cell.daysSinceLastWatered = 0;
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
        renderFarmGrid();
        saveGameState();
    }

    //Avança o tempo no jogo, fazendo as plantas crescerem ou morrerem.
    //Chamada automaticamente pelo setInterval.
    function advanceTime() {
        currentDay++;
        updateDayDisplay();
        let plantsGrown = 0;
        let plantsDied = 0;
        let plantsThirsty = 0;
        for(let r = 0; r < GRID_SIZE; r++) {
            for(let c = 0; c < GRID_SIZE; c++) {
                const cell = farmGrid[r][c];
                if(cell.type === 'planted' && !cell.dead) {
                    if(cell.watered) {
                        const seedInfo = seedTypes[cell.seedType];
                        if(cell.growthPhase < seedInfo.growthPhases) {
                            cell.growthPhase++;
                            plantsGrown++;
                        }
                        cell.daysSinceLastWatered = 0; // Reseta o contador
                    } else {
                        cell.daysSinceLastWatered++;
                        if(cell.daysSinceLastWatered >= WATERING_GRACE_PERIOD_DAYS) {
                            cell.dead = true;
                            plantsDied++;
                        } else {
                            plantsThirsty++;
                        }
                    }
                    cell.watered = false; //Reseta o estado de regado para o próximo ciclo
                }
            }
        }
        renderFarmGrid();

        let message = `Dia ${currentDay}: O tempo avançou.`;
        if(plantsGrown > 0) message += ` ${plantsGrown} plantas cresceram.`;
        if(plantsDied > 0) message += ` ${plantsDied} plantas morreram por falta de água!`;
        if(plantsThirsty > 0) message += ` ${plantsThirsty} plantas estão com sede!`;
        showGameMessage(message, 'info');
        saveGameState();
    }

    /**
     * Lida com a seleção de uma semente.
     * @param {string} seedKey - A chave da semente (ex: 'cenoura').
     */
    function selectSeed(seedKey) {
        selectedSeed = seedKey;
        selectedTool = 'plant';
        updateSelectedSeedDisplay();
        showGameMessage(`Semente de ${seedTypes[seedKey].name} selecionada! Agora clique em um solo preparado para plantar.`, 'info');
        highlightSelectedButton(seedButtons, seedKey);
        highlightSelectedButton(actionButtons, 'plant');
    }

    /**
     * Lida com a seleção de uma ferramenta.
     * @param {string} toolKey - A chave da ferramenta (ex: 'clear').
     */
    function selectTool(toolKey) {
        selectedTool = toolKey;
        selectedSeed = null;
        updateSelectedSeedDisplay();
        showGameMessage(`Ferramenta "${toolKey}" selecionada. Clique em um quadrado na fazenda.`, 'info');
        highlightSelectedButton(actionButtons, toolKey);
        highlightSelectedButton(seedButtons, null);
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

    //Inicia o loop principal do jogo (avanço de tempo automático).
    function startGameLoop() {
        stopGameLoop();
        gameInterval = setInterval(advanceTime, DAY_DURATION_MS);
    }

    //Para o loop principal do jogo.
    function stopGameLoop() {
        if(gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
    }

    //--- Inicialização do Jogo ---
    function initGame() {
        stopGameLoop();

        if(!loadGameState()) {
            money = INITIAL_MONEY;
            currentDay = 1;
            initializeFarmGrid();
            showGameMessage('Bem-vindo(a) à sua fazenda! Um novo jogo começou.', 'info');
        }

        updateMoneyDisplay();
        updateDayDisplay();
        updateSelectedSeedDisplay();
        highlightSelectedButton(seedButtons, null);
        highlightSelectedButton(actionButtons, null);

        renderFarmGrid(); //Garante que a grade é renderizada na inicialização/carregamento
        startGameLoop();
    }

    //--- Event Listeners Globais ---
    seedButtons.forEach(button => {
        button.addEventListener('click', () => selectSeed(button.dataset.seedType));
    });

    clearToolBtn.addEventListener('click', () => selectTool('clear'));
    prepareToolBtn.addEventListener('click', () => selectTool('prepare'));
    plantToolBtn.addEventListener('click', () => selectTool('plant'));
    waterToolBtn.addEventListener('click', () => selectTool('water'));
    harvestToolBtn.addEventListener('click', () => selectTool('harvest'));

    backToMenuBtn.addEventListener('click', () => {
        stopGameLoop();
        saveGameState();
        window.location.href = 'index.html';
    });

    newGameBtn.addEventListener('click', () => {
        const confirmNewGame = confirm('Tem certeza que deseja iniciar um Novo Jogo? Todo o progresso da fazenda será perdido.');
        if(confirmNewGame) {
            stopGameLoop();
            localStorage.clear();
            initGame();
            showGameMessage('Um novo jogo começou! Sua fazenda foi reiniciada.', 'info');
        }
    });

    initGame();
});