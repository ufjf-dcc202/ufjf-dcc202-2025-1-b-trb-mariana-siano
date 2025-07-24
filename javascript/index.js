document.addEventListener('DOMContentLoaded', () => {
    const startGameBtn = document.getElementById('start-game-btn');
    const continueGameBtn = document.getElementById('continue-game-btn');

    //Verifica se existe um jogo salvo para mostrar o botão de "Continuar o Jogo"
    if(localStorage.getItem('playerName')) {
        continueGameBtn.style.display = 'inline-block'
    }

    startGameBtn.addEventListener('click', () => {
        //Limpa qualquer jogo salvo para começar um novo
        localStorage.clear(); //Limpa todos os dados do LocalStorage
        window.localStorage.href = 'character_creation.html';
    });

    continueGameBtn.addEventListener('click', () => {
        //Redireciona para a página do jogo com o estado salvo
        window.localStorage.href = 'game.html';
    });
});