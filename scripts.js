// ----- Game state -----
let score = 0;
let missedItems = 0;
const MAX_MISSES = 5;

let gameRunning = false;
let spawnTimerId = null;   // setInterval id for spawning new items
let animationFrameId = null; // requestAnimationFrame id for the fall loop

let activeItems = []; // { el, y, speed }

const scoreSound = new Audio('047747_high-score-fill-75680.mp3');
const backgroundMusic = new Audio('emotional-string-33858.mp3');
backgroundMusic.loop = true;

// Cached DOM references
const scoreEl = document.getElementById("score");
const missesEl = document.getElementById("misses");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const gameOverMessage = document.getElementById("gameOverMessage");
const scoreFinalEl = document.getElementById("scoreFinal");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");

// Safe wrapper so autoplay-policy rejections don't throw unhandled errors
function safePlay(audio) {
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Autoplay may be blocked until the user interacts with the page; ignore.
        });
    }
}

function updateHud() {
    scoreEl.textContent = "Score: " + score;
    missesEl.textContent = "Misses: " + missedItems + " / " + MAX_MISSES;
}

// ----- Start / stop / reset -----
function startGame() {
    score = 0;
    missedItems = 0;
    gameRunning = true;

    updateHud();
    clearAllItems();

    startBtn.classList.add("hidden");
    stopBtn.classList.remove("hidden");
    gameOverMessage.classList.add("hidden");

    safePlay(backgroundMusic);

    spawnTimerId = setInterval(spawnBatch, 1000);
    spawnBatch(); // spawn immediately so the player isn't waiting
    animationFrameId = requestAnimationFrame(gameLoop);
}

function stopGame() {
    endRound();
    resetToStartScreen();
}

function endRound() {
    gameRunning = false;
    if (spawnTimerId !== null) {
        clearInterval(spawnTimerId);
        spawnTimerId = null;
    }
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    backgroundMusic.pause();
    clearAllItems();
}

function clearAllItems() {
    activeItems.forEach(item => item.el.remove());
    activeItems = [];
}

function resetToStartScreen() {
    gameOverMessage.classList.add("hidden");
    stopBtn.classList.add("hidden");
    startBtn.classList.remove("hidden");
    score = 0;
    missedItems = 0;
    updateHud();
}

function triggerGameOver() {
    endRound();
    gameOverMessage.classList.remove("hidden");
    scoreFinalEl.textContent = "Your Final Score: " + score;
    startBtn.classList.add("hidden");
    stopBtn.classList.add("hidden");
}

// ----- Spawning -----
function spawnBatch() {
    if (!gameRunning) return;
    for (let i = 0; i < 3; i++) {
        spawnItem();
    }
}

function spawnItem() {
    const itemType = pickItemType();
    const el = document.createElement("div");
    el.classList.add(itemType);

    const randomX = Math.random() * Math.max(window.innerWidth - 50, 0);
    el.style.backgroundColor = getRandomColor();
    el.style.left = randomX + "px";
    el.style.top = "-50px";

    document.body.appendChild(el);

    const item = {
        el,
        y: -50,
        speed: Math.random() * 3 + 2 // px per frame tick
    };

    el.onclick = () => {
        score++;
        updateHud();
        safePlay(scoreSound);
        removeItem(item);
    };

    activeItems.push(item);
}

function pickItemType() {
    const roll = Math.random();
    if (roll < 0.15) return 'heart';
    if (roll < 0.3) return 'coin';
    return 'star';
}

function getRandomColor() {
    const colors = ["red", "blue", "yellow", "green", "purple", "orange", "pink"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function removeItem(item) {
    item.el.remove();
    const idx = activeItems.indexOf(item);
    if (idx !== -1) activeItems.splice(idx, 1);
}

// ----- Main fall loop -----
function gameLoop() {
    if (!gameRunning) return;

    const floor = window.innerHeight;

    // Iterate backwards so removal during iteration is safe
    for (let i = activeItems.length - 1; i >= 0; i--) {
        const item = activeItems[i];
        item.y += item.speed;
        item.el.style.top = item.y + "px";

        if (item.y > floor) {
            activeItems.splice(i, 1);
            item.el.remove();
            missedItems++;
            updateHud();

            if (missedItems >= MAX_MISSES) {
                triggerGameOver();
                return;
            }
        }
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// ----- Event listeners -----
startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", stopGame);
restartBtn.addEventListener("click", startGame);
exitBtn.addEventListener("click", resetToStartScreen);

// Initial state on page load
window.addEventListener("load", () => {
    updateHud();
    startBtn.classList.remove("hidden");
});
