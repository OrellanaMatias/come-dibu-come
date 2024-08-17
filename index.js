function startGame() {
    window.location.href = "game/game.html";
}

function showInstructions() {
    document.getElementById('instructionsPopup').style.display = 'flex';
}

function closeInstructions() {
    document.getElementById('instructionsPopup').style.display = 'none';
}

function showInfo() {
    document.getElementById('infoPopup').style.display = 'flex';
}

function closeInfo() {
    document.getElementById('infoPopup').style.display = 'none';
}

const scrollContent = document.getElementById('scrollContent');
scrollContent.addEventListener('mouseover', () => {
    scrollContent.style.animationPlayState = 'paused';
});
scrollContent.addEventListener('mouseout', () => {
    scrollContent.style.animationPlayState = 'running';
});
