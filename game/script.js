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
    let foodRotation = 0;
    const foodRotationSpeed = 360 / 1000;
    const collisionPadding = 10;

    let foodInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(foodInterval);
            return;
        }

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
            clearInterval(foodInterval);

            if (food.classList.contains('good1') || food.classList.contains('good2') || food.classList.contains('good3')) {
                score += 10;
            } else {
                score -= 5;
            }

            scoreDisplay.textContent = 'Puntuación: ' + score;
        }

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
    foodDropSpeed = initialFoodDropSpeed;
    badFoodProbability = initialBadFoodProbability;
    foodGenerationInterval = initialFoodGenerationInterval;
    scoreDisplay.textContent = 'Puntuación: ' + score;
    missedGoodDisplay.textContent = 'Copas perdidas: ' + missedGood;
    gameOverDisplay.style.display = 'none';

    foodIntervalId = setInterval(dropFood, foodGenerationInterval);
    difficultyIntervalId = setInterval(increaseDifficulty, difficultyIncreaseInterval);
}

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

function restartGame() {
    const foods = document.querySelectorAll('.food');
    foods.forEach(food => food.remove());
    startGame();
}

function backToMenu() {
    window.location.href = '../index.html';
}

startGame();
