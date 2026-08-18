const spriteImg = document.getElementById("pokemon-sprite");
const gameArea = document.getElementById("game-area");
const hiddenInput = document.getElementById("hidden-input");
const guessDisplay = document.getElementById("guess-display");
const hintEl = document.getElementById("hint");
const feedback = document.getElementById("feedback");
const revealBtn = document.getElementById("reveal-btn");
const nextBtn = document.getElementById("next-btn");
const scoreValue = document.getElementById("score-value");
const streakValue = document.getElementById("streak-value");
const bestStreakValue = document.getElementById("best-streak-value");
const timerEl = document.getElementById("timer");
const diffButtons = document.querySelectorAll(".diff-btn");
const genButtons = document.querySelectorAll(".gen-btn");

let currentAnswer = "";
let difficulty = "easy";
let selectedGens = new Set(["1"]); // starts on Gen 1 only — click more buttons to widen the pool
let score = 0;
let streak = 0;
let bestStreak = parseInt(localStorage.getItem("whosThatBestStreak") || "0", 10);
let wrongGuesses = 0;
let roundOver = false;
let timerInterval = null;
let timeLeft = 0;

bestStreakValue.textContent = bestStreak;

// --- Strips accents/punctuation so "flabébé" and "flabebe" both match ---
function normalizeName(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // é -> e, etc.
        .replace(/[^a-z'-]/gi, "")
        .toLowerCase();
}

diffButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        difficulty = btn.dataset.diff;
        diffButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        loadNewPokemon();
    });
});

genButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const gen = btn.dataset.gen;
        if (selectedGens.has(gen)) {
            if (selectedGens.size === 1) return; // keep at least one generation on
            selectedGens.delete(gen);
            btn.classList.remove("active");
        } else {
            selectedGens.add(gen);
            btn.classList.add("active");
        }
        loadNewPokemon();
    });
});

function focusInput() {
    hiddenInput.focus();
}
gameArea.addEventListener("click", focusInput);
focusInput();

function renderGuess() {
    const typed = hiddenInput.value;

    if (difficulty === "hard") {
        guessDisplay.textContent = typed || "\u00A0";
        return;
    }

    const letters = currentAnswer.split("");
    guessDisplay.innerHTML = letters
        .map((_, i) => `<span class="tile">${typed[i] ? typed[i] : ""}</span>`)
        .join("");
}

hiddenInput.addEventListener("input", () => {
    if (roundOver) return;
    hiddenInput.value = normalizeName(hiddenInput.value);
    renderGuess();
});

hiddenInput.addEventListener("keydown", (e) => {
    if (e.ctrlKey && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        hiddenInput.value = "";
        renderGuess();
        return;
    }

    if (e.key === "Enter") {
        e.preventDefault();
        if (roundOver) {
            loadNewPokemon();
        } else {
            submitGuess();
        }
    }

    if (e.key === "Escape" && !roundOver) {
        e.preventDefault();
        endRound(false);
    }
});

function submitGuess() {
    const guess = normalizeName(hiddenInput.value.trim());
    if (!guess) return;

    if (guess === currentAnswer) {
        endRound(true);
        return;
    }

    wrongGuesses++;
    guessDisplay.classList.remove("shake");
    void guessDisplay.offsetWidth;
    guessDisplay.classList.add("shake");

    if (difficulty === "easy" && wrongGuesses >= WHOS_THAT_SETTINGS.easyHintAfterWrongGuesses) {
        hintEl.textContent = `Hint: starts with "${currentAnswer[0].toUpperCase()}"`;
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = WHOS_THAT_SETTINGS.hardTimerSeconds;
    timerEl.textContent = `⏱ ${timeLeft}s`;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `⏱ ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endRound(false);
        }
    }, 1000);
}

function endRound(won) {
    roundOver = true;
    clearInterval(timerInterval);
    spriteImg.classList.remove("silhouette");
    revealBtn.style.display = "none";
    nextBtn.style.display = "inline-block";

    if (won) {
        score++;
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
            localStorage.setItem("whosThatBestStreak", bestStreak);
        }
        feedback.textContent = `Correct! It was ${capitalize(currentAnswer)}.`;
    } else {
        streak = 0;
        feedback.textContent = `It was ${capitalize(currentAnswer)}.`;
    }

    scoreValue.textContent = score;
    streakValue.textContent = streak;
    bestStreakValue.textContent = bestStreak;
    guessDisplay.textContent = capitalize(currentAnswer);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function loadNewPokemon() {
    feedback.textContent = "";
    hintEl.textContent = "";
    hiddenInput.value = "";
    wrongGuesses = 0;
    roundOver = false;
    nextBtn.style.display = "none";
    revealBtn.style.display = "inline-block";
    spriteImg.classList.add("silhouette");
    timerEl.textContent = "";

    const gensParam = Array.from(selectedGens).join(",");
    const response = await fetch(`/api/random-pokemon?gens=${gensParam}`);
    const data = await response.json();
    currentAnswer = data.name.toLowerCase();
    spriteImg.src = data.sprite;

    renderGuess();
    focusInput();

    if (difficulty === "hard") {
        startTimer();
    }
}

revealBtn.addEventListener("click", () => {
    if (!roundOver) endRound(false);
});
nextBtn.addEventListener("click", loadNewPokemon);

loadNewPokemon();