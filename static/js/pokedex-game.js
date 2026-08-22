const genButtons = document.querySelectorAll("#gen-select .gen-btn");
const streakEl = document.getElementById("sd-streak");
const bestStreakEl = document.getElementById("sd-best-streak");
const categoryEl = document.getElementById("sd-category");
const arenaEl = document.getElementById("sd-arena");
const feedbackEl = document.getElementById("sd-feedback");
const nextBtn = document.getElementById("sd-next-btn");

const leftCard = document.getElementById("sd-left");
const leftSprite = document.getElementById("sd-left-sprite");
const leftName = document.getElementById("sd-left-name");
const leftValue = document.getElementById("sd-left-value");

const rightCard = document.getElementById("sd-right");
const rightSprite = document.getElementById("sd-right-sprite");
const rightName = document.getElementById("sd-right-name");
const rightValue = document.getElementById("sd-right-value");

let selectedGens = new Set(["1"]);
let streak = 0;
let bestStreak = parseInt(localStorage.getItem("statShowdownBestStreak") || "0", 10);
let roundActive = false;

bestStreakEl.textContent = bestStreak;

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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
        startRound();
    });
});

async function startRound() {
    roundActive = false;
    feedbackEl.textContent = "";
    feedbackEl.className = "sd-feedback";
    nextBtn.style.display = "none";
    leftValue.textContent = "";
    rightValue.textContent = "";
    leftCard.classList.remove("sd-card--correct", "sd-card--wrong");
    rightCard.classList.remove("sd-card--correct", "sd-card--wrong");
    categoryEl.textContent = "Loading\u2026";

    const gensParam = Array.from(selectedGens).join(",");
    const response = await fetch(`/api/pokedex-game/round?gens=${gensParam}`);
    const data = await response.json();

    categoryEl.textContent = `Higher ${data.category}?`;
    leftSprite.src = data.left.sprite;
    leftName.textContent = capitalize(data.left.name);
    rightSprite.src = data.right.sprite;
    rightName.textContent = capitalize(data.right.name);

    roundActive = true;
}

async function makeGuess(side) {
    if (!roundActive) return;
    roundActive = false;

    const response = await fetch("/api/pokedex-game/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: side }),
    });
    const data = await response.json();

    leftValue.textContent = data.leftValue;
    rightValue.textContent = data.rightValue;

    const winningCard = data.leftValue >= data.rightValue ? leftCard : rightCard;
    const losingCard = data.leftValue >= data.rightValue ? rightCard : leftCard;
    winningCard.classList.add("sd-card--correct");
    losingCard.classList.add("sd-card--wrong");

    if (data.correct) {
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
            localStorage.setItem("statShowdownBestStreak", String(bestStreak));
        }
        feedbackEl.textContent = "Correct!";
        feedbackEl.className = "sd-feedback sd-feedback--good";
    } else {
        streak = 0;
        feedbackEl.textContent = "Wrong \u2014 streak reset.";
        feedbackEl.className = "sd-feedback sd-feedback--bad";
    }

    streakEl.textContent = streak;
    bestStreakEl.textContent = bestStreak;
    nextBtn.style.display = "inline-block";
}

leftCard.addEventListener("click", () => makeGuess("left"));
rightCard.addEventListener("click", () => makeGuess("right"));
nextBtn.addEventListener("click", startRound);

startRound();