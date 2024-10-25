var menuAudio = new Audio('assets/menu.mp3');
menuAudio.play();

menuAudio.addEventListener('ended', () => {
    menuAudio.currentTime = 0;
    menuAudio.play();
});

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


const images = [
    'url("assets/background.png")',
    'url("assets/background -2.png")'
];

let currentIndex = 0;

function cambiarFondo() {
    document.getElementById('startScreen').style.backgroundImage = images[currentIndex];
    currentIndex = (currentIndex + 1) % images.length; 
}


setInterval(cambiarFondo, 500);

cambiarFondo();
