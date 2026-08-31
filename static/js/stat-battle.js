const genButtons = document.querySelectorAll("#gen-select .gen-btn");
const streakEl = document.getElementById("sb-streak");
const bestStreakEl = document.getElementById("sb-best-streak");
const categoryEl = document.getElementById("sb-category");
const arenaEl = document.getElementById("sb-arena");
const feedbackEl = document.getElementById("sb-feedback");a
const nextBtn = document.getElementById("sb-next-btn");

const leftCard = document.getElementById("sb-left");
const leftSprite = document.getElementById("sb-left-sprite");
const leftSpinner = document.getElementById("sb-left-spinner");
const leftName = document.getElementById("sb-left-name");
const leftValue = document.getElementById("sb-left-value");

const rightCard = document.getElementById("sb-right");
const rightSprite = document.getElementById("sb-right-sprite");
const rightSpinner = document.getElementById("sb-right-spinner");
const rightName = document.getElementById("sb-right-name");
const rightValue = document.getElementById("sb-right-value");

let selectedGens = new Set(["1"]);
let streak = 0;
let bestStreak = parseInt(localStorage.getItem("statBattleBestStreak") || "0", 10);
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
    feedbackEl.className = "sb-feedback";
    nextBtn.style.display = "none";
    leftValue.textContent = "";
    rightValue.textContent = "";
    leftCard.classList.remove("sb-card--correct", "sb-card--wrong");
    rightCard.classList.remove("sb-card--correct", "sb-card--wrong");
    categoryEl.textContent = "Loading\u2026";

    leftSpinner.style.display = "block";
    rightSpinner.style.display = "block";
    leftSprite.style.display = "none";
    rightSprite.style.display = "none";

    const gensParam = Array.from(selectedGens).join(",");
    const response = await fetch(`/api/pokedex-game/round?gens=${gensParam}`);
    const data = await response.json();

    categoryEl.textContent = `Higher ${data.category}?`;
    leftName.textContent = capitalize(data.left.name);
    rightName.textContent = capitalize(data.right.name);

    // Spinner stays up on each side until that specific image has actually
    // finished downloading, not just until the API response arrives -
    // the sprite fetch is a separate, often slower, network round-trip.
    leftSprite.onload = () => {
        leftSpinner.style.display = "none";
        leftSprite.style.display = "block";
    };
    rightSprite.onload = () => {
        rightSpinner.style.display = "none";
        rightSprite.style.display = "block";
    };
    leftSprite.src = data.left.sprite;
    rightSprite.src = data.right.sprite;

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
    winningCard.classList.add("sb-card--correct");
    losingCard.classList.add("sb-card--wrong");

    if (data.correct) {
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
            localStorage.setItem("statBattleBestStreak", String(bestStreak));
        }
        feedbackEl.textContent = "Correct!";
        feedbackEl.className = "sb-feedback sb-feedback--good";
    } else {
        streak = 0;
        feedbackEl.textContent = "Wrong \u2014 streak reset.";
        feedbackEl.className = "sb-feedback sb-feedback--bad";
    }

    streakEl.textContent = streak;
    bestStreakEl.textContent = bestStreak;
    nextBtn.style.display = "inline-block";
}

leftCard.addEventListener("click", () => makeGuess("left"));
rightCard.addEventListener("click", () => makeGuess("right"));
nextBtn.addEventListener("click", startRound);

startRound();