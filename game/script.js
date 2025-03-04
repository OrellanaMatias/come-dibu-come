const CONFIG = {
    character: {
        maxSpeed: 12,
        acceleration: 0.8,
        friction: 0.85,
        initialPosition: null
    },
    food: {
        initialDropSpeed: 2.5,      
        maxDropSpeed: 8,             
        rotationSpeed: 2.5,
        collisionPadding: 10,
        initialInterval: 2000,      
        minInterval: 1200          
    },
    difficulty: {
        updateInterval: 8000,       
        initialBadProbability: 0.15, 
        maxBadProbability: 0.4,      
        badProbabilityIncrease: 0.03 
    },
    background: {
        images: [
            'url("../assets/background.png")',
            'url("../assets/background -2.png")'
        ],
        changeInterval: 500
    }
};

class Game {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.setupEventListeners();
        this.setupAudio();
    }

    initializeElements() {
        this.gameArea = document.getElementById('gameArea');
        this.character = document.getElementById('character');
        this.scoreDisplay = document.getElementById('score');
        this.highScoreDisplay = document.getElementById('highScore');
        this.missedBadDisplay = document.getElementById('missedBad');
        this.gameOverDisplay = document.getElementById('gameOver');
        this.pauseMenu = document.getElementById('pauseMenu');
        
        CONFIG.character.initialPosition = this.gameArea.offsetWidth / 2 - 25;
    }
    initializeState() {
        const savedHighScore = localStorage.getItem('highScore');
        this.state = {
            score: 0,
            highScore: savedHighScore ? parseInt(savedHighScore) : 0,
            missedBad: 0,
            gameOver: false,
            gamePaused: false,
            backgroundIndex: 0,
            foodDropSpeed: CONFIG.food.initialDropSpeed,
            badFoodProbability: CONFIG.difficulty.initialBadProbability,
            foodGenerationInterval: CONFIG.food.initialInterval
        };

        this.movement = {
            position: CONFIG.character.initialPosition,
            velocity: 0,
            leftPressed: false,
            rightPressed: false,
            touchStartX: 0
        };

        this.intervals = {
            food: null,
            difficulty: null,
            background: null
        };

        this.animationFrame = null;
    }

    setupAudio() {
        this.audio = {
            background: new Audio('../assets/ambience.mp3'),
            goodFood: document.getElementById('goodFoodSound'),
            badFood: document.getElementById('badFoodSound'),
            gameOver: document.getElementById('gameOverSound')
        };

        this.audio.background.loop = true;
        this.audio.background.volume = 0.2;
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.gameArea.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.gameArea.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.gameArea.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.gameArea.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        document.getElementById('centeredGif').addEventListener('click', () => {
            const sound = document.getElementById('gameOverSound2');
            sound.currentTime = 0;
            sound.play();
        });
    }

    handleKeyDown(event) {
        if (this.state.gameOver || this.state.gamePaused) return;
        if (event.key === 'ArrowLeft') this.movement.leftPressed = true;
        if (event.key === 'ArrowRight') this.movement.rightPressed = true;
    }

    handleKeyUp(event) {
        if (event.key === 'ArrowLeft') this.movement.leftPressed = false;
        if (event.key === 'ArrowRight') this.movement.rightPressed = false;
    }

    handleTouchStart(event) {
        if (this.state.gameOver || this.state.gamePaused) return;
        this.movement.touchStartX = event.touches[0].clientX;
    }

    handleTouchMove(event) {
        if (this.state.gameOver || this.state.gamePaused) return;
        event.preventDefault();
        const touchX = event.touches[0].clientX;
        const touchDelta = touchX - this.movement.touchStartX;
        this.movement.touchStartX = touchX;
        
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const relativeX = touchX - gameAreaRect.left;
        this.movement.position = Math.max(0, Math.min(relativeX - 25, this.gameArea.offsetWidth - 50));
        this.character.style.left = `${this.movement.position}px`;
    }

    handleTouchEnd() {
        if (this.state.gameOver || this.state.gamePaused) return;
        this.movement.touchStartX = 0;
    }
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseGame();
        } else if (!this.state.gameOver && !this.state.gamePaused) {
            this.resumeGame();
        }
    }

    updateCharacterPosition() {
        if (this.state.gameOver || this.state.gamePaused) return;

        if (this.movement.leftPressed) {
            this.movement.velocity -= CONFIG.character.acceleration;
        } else if (this.movement.rightPressed) {
            this.movement.velocity += CONFIG.character.acceleration;
        }

        this.movement.velocity *= CONFIG.character.friction;
        this.movement.velocity = Math.max(Math.min(this.movement.velocity, CONFIG.character.maxSpeed), -CONFIG.character.maxSpeed);

        this.movement.position += this.movement.velocity;
        this.movement.position = Math.max(0, Math.min(this.movement.position, this.gameArea.offsetWidth - 50));
        this.character.style.left = `${this.movement.position}px`;

        this.animationFrame = requestAnimationFrame(() => this.updateCharacterPosition());
    }

    createFood() {
        const food = document.createElement('div');
        food.classList.add('food');

        if (Math.random() > this.state.badFoodProbability) {
            food.classList.add(`good${Math.floor(Math.random() * 3 + 1)}`);
        } else {
            food.classList.add(Math.random() < 0.5 ? 'bad' : 'bad2');
        }

        food.style.left = `${Math.random() * (this.gameArea.offsetWidth - 30)}px`;
        food.style.top = '0px';
        this.gameArea.appendChild(food);

        this.animateFood(food);
    }

    animateFood(food) {
        let positionY = 0;
        let rotation = 0;
        
        // Store animation data on the food element itself
        food.animationData = { positionY, rotation };

        const animate = () => {
            if (this.state.gameOver) return;
            
            // Skip animation when paused but don't terminate
            if (!this.state.gamePaused) {
                food.animationData.positionY += this.state.foodDropSpeed;
                food.animationData.rotation += CONFIG.food.rotationSpeed;
                
                food.style.top = `${food.animationData.positionY}px`;
                food.style.transform = `rotate(${food.animationData.rotation}deg)`;

                if (this.checkCollision(food)) {
                    this.handleCollision(food);
                    return;
                }

                if (food.animationData.positionY >= this.gameArea.offsetHeight) {
                    this.gameArea.removeChild(food);
                    return;
                }
            }
            
            // Store the animation frame ID on the food element
            food.animationFrameId = requestAnimationFrame(animate);
        };

        food.animationFrameId = requestAnimationFrame(animate);
    }

    checkCollision(food) {
        const foodRect = food.getBoundingClientRect();
        const characterRect = this.character.getBoundingClientRect();
        const padding = CONFIG.food.collisionPadding;

        return !(
            foodRect.bottom - padding < characterRect.top + padding ||
            foodRect.top + padding > characterRect.bottom - padding ||
            foodRect.right - padding < characterRect.left + padding ||
            foodRect.left + padding > characterRect.right - padding
        );
    }

    handleCollision(food) {
        this.gameArea.removeChild(food);
        
        if (food.classList.contains('good1') || food.classList.contains('good2') || food.classList.contains('good3')) {
            this.state.score += 10;
            this.playSound(this.audio.goodFood);
        } else {
            this.state.missedBad++;
            this.playSound(this.audio.badFood);
            if (this.state.missedBad >= 3) {
                this.endGame();
                return;
            }
        }

        this.updateScore();
    }

    updateScore() {
        this.scoreDisplay.textContent = `Puntuación: ${this.state.score}`;
        this.missedBadDisplay.textContent = `Objetos malos comidos: ${this.state.missedBad}/3`;
        this.highScoreDisplay.textContent = `Puntuación más alta: ${this.state.highScore}`;
    }

    increaseDifficulty() {
        this.state.foodDropSpeed = Math.min(
            this.state.foodDropSpeed + 0.3,  
            CONFIG.food.maxDropSpeed
        );
        
        this.state.badFoodProbability = Math.min(
            this.state.badFoodProbability + CONFIG.difficulty.badProbabilityIncrease,
            CONFIG.difficulty.maxBadProbability
        );

        this.state.foodGenerationInterval = Math.max(
            this.state.foodGenerationInterval - 50,
            CONFIG.food.minInterval
        );

        clearInterval(this.intervals.food);
        this.intervals.food = setInterval(
            () => this.createFood(), 
            this.state.foodGenerationInterval
        );
    }
    updateBackground() {
        const nextImage = CONFIG.background.images[this.state.backgroundIndex];
        const currentImage = this.gameArea.style.backgroundImage;
        
        if (currentImage !== nextImage) {
            this.gameArea.style.backgroundImage = `${currentImage}, ${nextImage}`;
            setTimeout(() => {
                this.gameArea.style.backgroundImage = nextImage;
            }, 50);
        }
        
        this.state.backgroundIndex = (this.state.backgroundIndex + 1) % CONFIG.background.images.length;
    }

    increaseDifficulty() {
        this.state.foodDropSpeed = Math.min(
            this.state.foodDropSpeed + 0.3,
            CONFIG.food.maxDropSpeed
        );
        
        this.state.badFoodProbability = Math.min(
            this.state.badFoodProbability + CONFIG.difficulty.badProbabilityIncrease,
            CONFIG.difficulty.maxBadProbability
        );

        const newInterval = Math.max(
            this.state.foodGenerationInterval - 50,
            CONFIG.food.minInterval
        );
        
        if (newInterval !== this.state.foodGenerationInterval) {
            this.state.foodGenerationInterval = newInterval;
            const existingInterval = this.intervals.food;
            this.intervals.food = setInterval(() => this.createFood(), newInterval);
            setTimeout(() => clearInterval(existingInterval), newInterval);
        }
    }
    startGame() {
        this.resetGame();
        this.audio.background.play();
        this.updateCharacterPosition();
        
        this.intervals.food = setInterval(() => this.createFood(), this.state.foodGenerationInterval);
        this.intervals.difficulty = setInterval(() => this.increaseDifficulty(), CONFIG.difficulty.updateInterval);
        this.intervals.background = setInterval(() => this.updateBackground(), CONFIG.background.changeInterval);
    }

    resetGame() {
        const currentHighScore = this.state.highScore;
        
        this.state.score = 0;
        this.state.missedBad = 0;
        this.state.gameOver = false;
        this.state.gamePaused = false;
        this.state.foodDropSpeed = CONFIG.food.initialDropSpeed;
        this.state.badFoodProbability = CONFIG.difficulty.initialBadProbability;
        
        this.movement = {
            position: CONFIG.character.initialPosition,
            velocity: 0,
            leftPressed: false,
            rightPressed: false,
            touchStartX: 0
        };

        this.state.highScore = currentHighScore;
        
        this.updateScore();
        this.gameOverDisplay.style.display = 'none';
        this.pauseMenu.style.display = 'none';
        
        const foods = document.querySelectorAll('.food');
        foods.forEach(food => this.gameArea.removeChild(food));
    }

    endGame() {
        this.state.gameOver = true;
        this.audio.background.pause();
        this.clearAllIntervals();
        this.gameOverDisplay.style.display = 'flex';
        this.playSound(this.audio.gameOver);

        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            localStorage.setItem('highScore', this.state.highScore);
            this.highScoreDisplay.textContent = `Puntuación más alta: ${this.state.highScore}`;
        }
    }
    pauseGame() {
        this.state.gamePaused = true;
        this.audio.background.pause();
        this.pauseMenu.style.display = 'block';
        this.clearAllIntervals();
    }

    resumeGame() {
        this.state.gamePaused = false;
        this.audio.background.play();
        this.pauseMenu.style.display = 'none';
        this.updateCharacterPosition();
        this.intervals.food = setInterval(() => this.createFood(), this.state.foodGenerationInterval);
        this.intervals.difficulty = setInterval(() => this.increaseDifficulty(), CONFIG.difficulty.updateInterval);
        this.intervals.background = setInterval(() => this.updateBackground(), CONFIG.background.changeInterval);
    }
    clearAllIntervals() {
        cancelAnimationFrame(this.animationFrame);
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
    }

    playSound(sound) {
        sound.currentTime = 0;
        sound.play();
    }

    backToMenu() {
        window.location.href = '../index.html';
    }
}

const game = new Game();
game.startGame();

window.startGame = () => game.startGame();
window.restartGame = () => game.startGame();
window.pauseGame = () => game.pauseGame();
window.resumeGame = () => game.resumeGame();
window.backToMenu = () => game.backToMenu();