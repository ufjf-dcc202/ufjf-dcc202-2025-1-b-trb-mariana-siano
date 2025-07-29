document.addEventListener('DOMContentLoaded', () => {
    const newGameBtn = document.getElementById('new-game-btn');
    const continueGameBtn = document.getElementById('continue-game-btn');
    const optionsBtn = document.getElementById('options-btn');
    const exitBtn = document.getElementById('exit-btn');

    //Verifica se há um jogo salvo para exibir o botão "Continuar Jogo"
    if(localStorage.getItem('playerName')) {
        continueGameBtn.style.display = 'block'; //Mostra o botão
    } else {
        continueGameBtn.style.display = 'none'; //Esconde o botão (padrão, mas para garantir)
    }

    newGameBtn.addEventListener('click', () => {
    //Inicia um novo jogo e redireciona para a fazenda
    localStorage.removeItem('playerName'); //Limpa dados anteriores, se necessário
    window.location.href = 'farm_game.html';
});

    continueGameBtn.addEventListener('click', () => {
        //Redireciona para a página principal do jogo
        window.location.href = 'game_main.html';
    });

    optionsBtn.addEventListener('click', () => {
        alert('Funcionalidade de Opções ainda não implementada!');
    });

    exitBtn.addEventListener('click', () => {
        alert('Saindo do jogo... (Em um navegador, isso não fecha a aba/janela)');
    });
});