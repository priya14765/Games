let score = 0;
let gameRunning = false;
let gameInterval;
let missedItems = 0;  // Track how many items have missed the bottom
let gameOver = false;
let scoreSound = new Audio('047747_high-score-fill-75680.mp3'); // Beep sound for catching objects
let backgroundMusic = new Audio('emotional-string-33858.mp3'); // Example music, replace with a game sound file

// Function to start the game
function startGame() {
    gameRunning = true;
    missedItems = 0;
    gameOver = false;
    score = 0;
    document.getElementById("score").textContent = "Score: " + score;
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("stopBtn").style.display = "inline-block";
    document.getElementById("gameOverMessage").style.display = "none"; // Hide game over message
    createItems();
    backgroundMusic.play();
}

// Function to stop the game
function stopGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    backgroundMusic.pause(); // Stop the background music
    alert("Game stopped. Returning to start screen.");
    location.reload(); // Reload the page to go back to the start screen
}

// Function to create falling items
function createItems() {
    if (!gameRunning || gameOver) return;

    for (let i = 0; i < 3; i++) { // Creates 3 items at once
        createItem();
    }
    
    gameInterval = setTimeout(createItems, 1000); // Repeat every second
}

// Function to create a single item (star, heart, or coin)
function createItem() {
    const itemType = Math.random() > 0.7 ? 'heart' : Math.random() > 0.7 ? 'coin' : 'star';
    const item = document.createElement("div");
    item.classList.add(itemType);

    // Set random position
    let randomX = Math.random() * (window.innerWidth - 50);
    let randomColor = getRandomColor();

    item.style.backgroundColor = randomColor;
    item.style.left = randomX + "px";
    item.style.top = "-50px"; // Start above the screen

    document.body.appendChild(item);

    // Make item fall
    let fallSpeed = Math.random() * 3 + 2; 
    let fallInterval = setInterval(() => {
        item.style.top = (parseFloat(item.style.top) + fallSpeed) + "px";

        // If item reaches the bottom, increase missedItems counter
        if (parseFloat(item.style.top) > window.innerHeight) {
            missedItems++;
            if (missedItems >= 5) {
                gameOver = true;
                clearInterval(gameInterval);
                backgroundMusic.pause(); // Stop the background music
                displayGameOver();
            }
            clearInterval(fallInterval);
            item.remove();
        }
    }, 20);

    // Click event to catch the item
    item.onclick = function () {
        score++;
        document.getElementById("score").textContent = "Score: " + score;
        scoreSound.play(); // Play sound when an item is caught
        clearInterval(fallInterval);
        item.remove();
    };
}

// Function to generate random colors
function getRandomColor() {
    const colors = ["red", "blue", "yellow", "green", "purple", "orange", "pink"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Function to display Game Over message
function displayGameOver() {
    document.getElementById("gameOverMessage").style.display = "block";
    document.getElementById("scoreFinal").textContent = "Your Final Score: " + score;
}

// Event listeners for buttons
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", () => location.reload()); // Reload page on restart
document.getElementById("stopBtn").addEventListener("click", stopGame);
document.getElementById("exitBtn").addEventListener("click", () => {
    alert("Exiting game. Returning to start screen.");
    location.reload(); // Reload the page to reset everything
});

// Show the start button on page load
window.onload = () => {
    document.getElementById("startBtn").style.display = "inline-block";
};
