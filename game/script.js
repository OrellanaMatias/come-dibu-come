const gameArea = document.getElementById('gameArea');
const character = document.getElementById('character');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const missedGoodDisplay = document.getElementById('missedGood');
const gameOverDisplay = document.getElementById('gameOver');

let characterPosition = gameArea.offsetWidth / 2 - 25;
let characterSpeed = 0;
const characterMaxSpeed = 6;
const characterAcceleration = 0.3;
const characterFriction = 0.8;

let score = 0;
let missedGood = 0;
let gameOver = false;
let leftPressed = false;
let rightPressed = false;
let foodIntervalId;
let difficultyIntervalId;
let animationFrameId;

// Configuración de dificultad
const initialFoodDropSpeed = 2; // Velocidad inicial de caída de la comida
const maxFoodDropSpeed = 8; // Velocidad máxima de caída de la comida
const difficultyIncreaseInterval = 5000; // Intervalo para aumentar la dificultad (5 segundos)
const initialBadFoodProbability = 0.2; // Probabilidad inicial de comida mala
const badFoodProbabilityIncrease = 0.05; // Incremento de la probabilidad de comida mala
const maxBadFoodProbability = 0.5; // Probabilidad máxima de comida mala
const initialFoodGenerationInterval = 1400; // Intervalo inicial de generación de comida
const maxFoodGenerationInterval = 1900;

let foodDropSpeed = initialFoodDropSpeed;
let badFoodProbability = initialBadFoodProbability;
let foodGenerationInterval = initialFoodGenerationInterval;

// Cargar la puntuación más alta del almacenamiento local
let highScore = localStorage.getItem('highScore') || 0;
highScoreDisplay.textContent = 'Puntuación más alta: ' + highScore;

// ssssss inicial del personaje
character.style.left = characterPosition + 'px';

// Movimiento del personaje
document.addEventListener('keydown', (event) => {
    if (gameOver) return;
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

// Controles para móviles
let touchStartX = 0;
gameArea.addEventListener('touchstart', (event) => {
    if (gameOver) return;
    touchStartX = event.touches[0].clientX;
});

gameArea.addEventListener('touchmove', (event) => {
    if (gameOver) return;
    const touchX = event.touches[0].clientX;
    const touchDelta = touchX - touchStartX;
    touchStartX = touchX;
    characterPosition += touchDelta;
    characterPosition = Math.max(0, Math.min(characterPosition, gameArea.offsetWidth - 50));
    character.style.left = characterPosition + 'px';
});

gameArea.addEventListener('touchend', () => {
    characterSpeed = 0;
});

// Actualizar la cosa del personaje
function updateCharacterPosition() {
    if (gameOver) return;

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


// crear de comida
function createFood() {
    const food = document.createElement('div');
    food.classList.add('food');

    if (Math.random() > badFoodProbability) {
        food.classList.add('good' + Math.floor(Math.random() * 3 + 1));
    } else {
        food.classList.add('bad');
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
    let foodRotation = 0; // Ángulo de rotación inicial
    const foodRotationSpeed = 360 / 1000; // Velocidad de rotación en grados por milisegundo
    const collisionPadding = 10; // Ajuste del tamaño de la colisión

    let foodInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(foodInterval);
            return;
        }

        foodPositionY += foodSpeed;
        foodRotation += foodRotationSpeed * 20; // Actualizar el ángulo de rotación
        food.style.top = foodPositionY + 'px';
        food.style.transform = `rotate(${foodRotation}deg)`; // Aplicar la rotación

        // Comprobar si la comida es atrapada por el personaje
        const foodRect = food.getBoundingClientRect();
        const characterRect = character.getBoundingClientRect();

        // Reducir manualmente el área de colisión
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
            clearInterval(foodInterval);

            if (food.classList.contains('good1') || food.classList.contains('good2') || food.classList.contains('good3')) {
                score += 10;
            } else {
                score -= 5;
            }

            scoreDisplay.textContent = 'Puntuación: ' + score;
        }

        // Comprobar si la comida buena se cayo al piso
        if (foodPositionY >= gameArea.offsetHeight) {
            gameArea.removeChild(food);
            clearInterval(foodInterval);

            if (food.classList.contains('good1') || food.classList.contains('good2') || food.classList.contains('good3')) {
                missedGood++;
                missedGoodDisplay.textContent = 'Copas perdidas: ' + missedGood;

                if (missedGood >= 8) {
                    endGame();
                }
            }
        }
    }, 20);
}
// Aumentar la dificultad
function increaseDifficulty() {
    if (foodDropSpeed < maxFoodDropSpeed) {
        foodDropSpeed += 0.5;
    }
    if (foodGenerationInterval > maxFoodGenerationInterval) {
        foodGenerationInterval -= 50;
    }
    badFoodProbability = Math.min(badFoodProbability + badFoodProbabilityIncrease, maxBadFoodProbability);
}

// Iniciar el juego
function startGame() {
    score = 0;
    missedGood = 0;
    gameOver = false;
    foodDropSpeed = initialFoodDropSpeed; // Reiniciar la velocidad de caída de la comida
    badFoodProbability = initialBadFoodProbability; // Reiniciar la probabilidad de comida mala
    foodGenerationInterval = initialFoodGenerationInterval; // Reiniciar el intervalo de generación de comida
    scoreDisplay.textContent = 'Puntuación: ' + score;
    missedGoodDisplay.textContent = 'Copas perdidas: ' + missedGood;
    gameOverDisplay.style.display = 'none';

    foodIntervalId = setInterval(dropFood, foodGenerationInterval);
    difficultyIntervalId = setInterval(increaseDifficulty, difficultyIncreaseInterval);
}

// Finalizar el juego
function endGame() {
    gameOver = true;
    clearInterval(foodIntervalId);
    clearInterval(difficultyIntervalId);
    cancelAnimationFrame(animationFrameId);
    gameOverDisplay.style.display = 'flex';

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = 'Puntuación más alta: ' + highScore;
    }
}

// Pausar el juego cuando no esta visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {                   
        clearInterval(foodIntervalId);
        clearInterval(difficultyIntervalId);
        cancelAnimationFrame(animationFrameId);
    } else if (!gameOver) {
        foodIntervalId = setInterval(dropFood, foodGenerationInterval);
        difficultyIntervalId = setInterval(increaseDifficulty, difficultyIncreaseInterval);
        updateCharacterPosition();
    }
});

// Reiniciar el juego
function restartGame() {
    const foods = document.querySelectorAll('.food');
    foods.forEach(food => food.remove());
    startGame();
}

// Volver al menu
function backToMenu() {
    window.location.href = '../index.html';
}

// Iniciar el juego al cargar la página
startGame();
