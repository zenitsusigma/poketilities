const diffButtons = document.querySelectorAll("#mm-diffrow .gen-btn");
const genButtons = document.querySelectorAll("#gen-select .gen-btn");
const boardEl = document.getElementById("mm-board");
const movesEl = document.getElementById("mm-moves");
const timeEl = document.getElementById("mm-time");
const bestEl = document.getElementById("mm-best");
const winMessageEl = document.getElementById("mm-win-message");
const newGameBtn = document.getElementById("mm-new-game-btn");

let pairCount = 6;
let selectedGens = new Set(["1"]);
let flipped = [];
let matchedCount = 0;
let moves = 0;
let locked = false;
let timerInterval = null;
let elapsedSeconds = 0;

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function bestKey() {
    return `memoryBest_${pairCount}`;
}

function loadBest() {
    const saved = localStorage.getItem(bestKey());
    bestEl.textContent = saved ? `${saved} moves` : "\u2014";
}

diffButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        pairCount = parseInt(btn.dataset.pairs, 10);
        diffButtons.forEach((b) => b.classList.toggle("active", b === btn));
        startGame();
    });
});

genButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const gen = btn.dataset.gen;
        if (selectedGens.has(gen)) {
            if (selectedGens.size === 1) return;
            selectedGens.delete(gen);
            btn.classList.remove("active");
        } else {
            selectedGens.add(gen);
            btn.classList.add("active");
        }
        startGame();
    });
});

function startTimer() {
    clearInterval(timerInterval);
    elapsedSeconds = 0;
    timeEl.textContent = formatTime(0);
    timerInterval = setInterval(() => {
        elapsedSeconds++;
        timeEl.textContent = formatTime(elapsedSeconds);
    }, 1000);
}

async function startGame() {
    clearInterval(timerInterval);
    flipped = [];
    matchedCount = 0;
    moves = 0;
    locked = true;
    movesEl.textContent = "0";
    timeEl.textContent = "0:00";
    winMessageEl.style.display = "none";
    loadBest();

    boardEl.innerHTML = `<div class="pokeball-spinner" id="mm-loading"></div>`;

    const gensParam = Array.from(selectedGens).join(",");
    const response = await fetch(`/api/memory/deal?pairs=${pairCount}&gens=${gensParam}`);
    const data = await response.json();

    const deck = [...data.cards, ...data.cards]
        .map((card) => ({ ...card, key: Math.random() }))
        .sort(() => Math.random() - 0.5);

    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = `repeat(${pairCount <= 6 ? 4 : pairCount <= 8 ? 4 : 5}, 1fr)`;

    deck.forEach((card, index) => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "mm-card";
        tile.dataset.index = index;
        tile.dataset.name = card.name;
        tile.innerHTML = `
            <div class="mm-card-inner">
                <div class="mm-card-back"></div>
                <div class="mm-card-front">
                    <img src="${card.sprite}" alt="">
                </div>
            </div>
        `;
        tile.addEventListener("click", () => flipCard(tile));
        boardEl.appendChild(tile);
    });

    locked = false;
    startTimer();
}

function flipCard(tile) {
    if (locked) return;
    if (tile.classList.contains("mm-card--flipped") || tile.classList.contains("mm-card--matched")) return;
    if (flipped.length === 2) return;

    tile.classList.add("mm-card--flipped");
    flipped.push(tile);

    if (flipped.length === 2) {
        moves++;
        movesEl.textContent = moves;
        locked = true;

        const [a, b] = flipped;
        if (a.dataset.name === b.dataset.name) {
            setTimeout(() => {
                a.classList.add("mm-card--matched");
                b.classList.add("mm-card--matched");
                flipped = [];
                locked = false;
                matchedCount++;
                if (matchedCount === pairCount) endGame();
            }, 400);
        } else {
            setTimeout(() => {
                a.classList.remove("mm-card--flipped");
                b.classList.remove("mm-card--flipped");
                flipped = [];
                locked = false;
            }, 800);
        }
    }
}

function endGame() {
    clearInterval(timerInterval);
    const saved = localStorage.getItem(bestKey());
    if (!saved || moves < parseInt(saved, 10)) {
        localStorage.setItem(bestKey(), String(moves));
    }
    loadBest();
    winMessageEl.textContent = `Cleared in ${moves} moves and ${formatTime(elapsedSeconds)}!`;
    winMessageEl.style.display = "block";
}

newGameBtn.addEventListener("click", startGame);

startGame();