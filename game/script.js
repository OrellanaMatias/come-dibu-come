const gameArea = document.getElementById('gameArea');
const character = document.getElementById('character');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const missedGoodDisplay = document.getElementById('missedGood');
const gameOverDisplay = document.getElementById('gameOver');
const missedBadDisplay = document.getElementById('missedBad');
const pauseMenu = document.getElementById('pauseMenu');
const goodFoodSound = document.getElementById('goodFoodSound');
const badFoodSound = document.getElementById('badFoodSound');
const gameOverSound = document.getElementById('gameOverSound');

let missedBad = 0;
let characterPosition = gameArea.offsetWidth / 2 - 25;
let characterSpeed = 0;
const characterMaxSpeed = 6;
const characterAcceleration = 0.3;
const characterFriction = 0.8;

let score = 0;
let missedGood = 0;
let gameOver = false;
let gamePaused = false;
let leftPressed = false;
let rightPressed = false;
let foodIntervalId;
let difficultyIntervalId;
let animationFrameId;

const initialFoodDropSpeed = 2;
const maxFoodDropSpeed = 8;
const difficultyIncreaseInterval = 5000;
const initialBadFoodProbability = 0.2;
const badFoodProbabilityIncrease = 0.05;
const maxBadFoodProbability = 0.5;
const initialFoodGenerationInterval = 1400;
const maxFoodGenerationInterval = 1900;

let foodDropSpeed = initialFoodDropSpeed;
let badFoodProbability = initialBadFoodProbability;
let foodGenerationInterval = initialFoodGenerationInterval;

let highScore = localStorage.getItem('highScore') || 0;
highScoreDisplay.textContent = 'Puntuación más alta: ' + highScore;

character.style.left = characterPosition + 'px';

document.addEventListener('keydown', (event) => {
    if (gameOver || gamePaused) return;
    if (event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === 'ArrowRight') {
        rightPressed = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (event.key === 'ArrowRight') {
        rightPressed = false;
    }
});
let lastTouchX = 0;
let touchStartX = 0;
gameArea.addEventListener('touchstart', (event) => {
    if (gameOver || gamePaused) return;
    lastTouchX = event.touches[0].clientX;
});


gameArea.addEventListener('touchmove', (event) => {
    if (gameOver || gamePaused) return;
    const touchX = event.touches[0].clientX;
    const touchDelta = touchX - lastTouchX;
    lastTouchX = touchX;
    characterPosition += touchDelta;
    characterPosition = Math.max(0, Math.min(characterPosition, gameArea.offsetWidth - 50));
    character.style.left = characterPosition + 'px';
});

gameArea.addEventListener('touchend', () => {
    characterSpeed = 0;
});

let mouseX = 0;

gameArea.addEventListener('mousemove', (event) => {
    if (gameOver || gamePaused) return;
    mouseX = event.clientX - gameArea.getBoundingClientRect().left;
    characterPosition = Math.max(0, Math.min(mouseX - 25, gameArea.offsetWidth - 50));
    character.style.left = characterPosition + 'px';
});

function updateCharacterPosition() {
    if (gameOver || gamePaused) return;

    if (leftPressed) {
        characterSpeed = Math.max(characterSpeed - characterAcceleration, -characterMaxSpeed);
    } else if (rightPressed) {
        characterSpeed = Math.min(characterSpeed + characterAcceleration, characterMaxSpeed);
    } else {
        characterSpeed *= characterFriction;
    }

    characterPosition += characterSpeed;
    characterPosition = Math.max(0, Math.min(characterPosition, gameArea.offsetWidth - 50));
    character.style.left = characterPosition + 'px';

    animationFrameId = requestAnimationFrame(updateCharacterPosition);
}

updateCharacterPosition();

function createFood() {
    const food = document.createElement('div');
    food.classList.add('food');

    if (Math.random() > badFoodProbability) {
        food.classList.add('good' + Math.floor(Math.random() * 3 + 1));
    } else {
        const badFoodType = Math.random() < 0.5 ? 'bad' : 'bad2';
        food.classList.add(badFoodType);
    }

    food.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
    food.style.top = '0px';

    gameArea.appendChild(food);
    return food;
}

function dropFood() {
    const food = createFood();
    let foodPositionY = 0;
    let foodSpeed = foodDropSpeed;
    let foodRotation = 0;
    const foodRotationSpeed = 360 / 1000;
    const collisionPadding = 10;

    function animateFood() {
        if (gameOver || gamePaused) return;

        foodPositionY += foodSpeed;
        foodRotation += foodRotationSpeed * 20;
        food.style.top = foodPositionY + 'px';
        food.style.transform = `rotate(${foodRotation}deg)`;

        const foodRect = food.getBoundingClientRect();
        const characterRect = character.getBoundingClientRect();

        const adjustedFoodRect = {
            top: foodRect.top + collisionPadding,
            bottom: foodRect.bottom - collisionPadding,
            left: foodRect.left + collisionPadding,
            right: foodRect.right - collisionPadding,
        };

        const adjustedCharacterRect = {
            top: characterRect.top + collisionPadding,
            bottom: characterRect.bottom - collisionPadding,
            left: characterRect.left + collisionPadding,
            right: characterRect.right - collisionPadding,
        };

        if (
            adjustedFoodRect.bottom >= adjustedCharacterRect.top &&
            adjustedFoodRect.top <= adjustedCharacterRect.bottom &&
            adjustedFoodRect.left <= adjustedCharacterRect.right &&
            adjustedFoodRect.right >= adjustedCharacterRect.left
        ) {
            gameArea.removeChild(food);
            if (food.classList.contains('good1') || food.classList.contains('good2') || food.classList.contains('good3')) {
                score += 10;
                playSound(goodFoodSound);
            } else {
                missedBad++;
                playSound(badFoodSound);
                if (missedBad >= 3) {
                    endGame();
                }
            }
            scoreDisplay.textContent = 'Puntuación: ' + score;
            missedBadDisplay.textContent = 'Objetos malos comidos: ' + missedBad + '/3';
        }

        if (foodPositionY >= gameArea.offsetHeight) {
            gameArea.removeChild(food);
            return;  // Sale de la animación al alcanzar el fondo
        }

        requestAnimationFrame(animateFood);  // Continúa la animación en el siguiente cuadro
    }

    animateFood();
}

function increaseDifficulty() {
    if (foodDropSpeed < maxFoodDropSpeed) {
        foodDropSpeed += 0.5;
    }
    if (foodGenerationInterval > maxFoodGenerationInterval) {
        foodGenerationInterval -= 50;
    }
    badFoodProbability = Math.min(badFoodProbability + badFoodProbabilityIncrease, maxBadFoodProbability);
}

function startGame() {
    score = 0;
    missedGood = 0;
    gameOver = false;
    gamePaused = false;
    foodDropSpeed = initialFoodDropSpeed;
    badFoodProbability = initialBadFoodProbability;
    foodGenerationInterval = initialFoodGenerationInterval;
    scoreDisplay.textContent = 'Puntuación: ' + score;
    missedGoodDisplay.textContent = 'Objetos malos comidos: 0/3';

    updateCharacterPosition();

    foodIntervalId = setInterval(dropFood, foodGenerationInterval);
    difficultyIntervalId = setInterval(increaseDifficulty, difficultyIncreaseInterval);
}

function restartGame() {
    gameOverDisplay.style.display = 'none';

    cancelAnimationFrame(animationFrameId);
    clearInterval(foodIntervalId);
    clearInterval(difficultyIntervalId);

    const foods = document.querySelectorAll('.food');
    foods.forEach(food => gameArea.removeChild(food));

    missedBad = 0;
    missedBadDisplay.textContent = 'Objetos malos comidos: ' + missedBad + '/3';

    pauseMenu.style.display = 'none';
    startGame();
}

function endGame() {
    gameOver = true;
    cancelAnimationFrame(animationFrameId);
    clearInterval(foodIntervalId);
    clearInterval(difficultyIntervalId);
    gameOverDisplay.style.display = 'block';
    playSound(gameOverSound);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = 'Puntuación más alta: ' + highScore;
    }
}

function pauseGame() {
    gamePaused = true;
    pauseMenu.style.display = 'block';
    cancelAnimationFrame(animationFrameId);
    clearInterval(foodIntervalId);
    clearInterval(difficultyIntervalId);
}

function resumeGame() {
    gamePaused = false;
    pauseMenu.style.display = 'none';
    updateCharacterPosition();
    foodIntervalId = setInterval(dropFood, foodGenerationInterval);
    difficultyIntervalId = setInterval(increaseDifficulty, difficultyIncreaseInterval);

    // Continúa animando cualquier comida que esté en la pantalla
    const foods = document.querySelectorAll('.food');
    foods.forEach(food => {
        requestAnimationFrame(function animateFood() {
            if (gameOver || gamePaused) return;

            let foodPositionY = parseFloat(food.style.top);
            let foodRotation = parseFloat(food.style.transform.replace('rotate(', '').replace('deg)', ''));
            let foodSpeed = foodDropSpeed;
            const foodRotationSpeed = 360 / 1000;
            const collisionPadding = 10;

            foodPositionY += foodSpeed;
            foodRotation += foodRotationSpeed * 20;
            food.style.top = foodPositionY + 'px';
            food.style.transform = `rotate(${foodRotation}deg)`;

            if (foodPositionY < gameArea.offsetHeight) {
                requestAnimationFrame(animateFood);
            } else {
                gameArea.removeChild(food);
            }
        });
    });
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

// Call startGame to begin the game
startGame();