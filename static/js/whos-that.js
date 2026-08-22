const gameArea = document.getElementById("game-area");
const hiddenInput = document.getElementById("hidden-input");
const guessDisplay = document.getElementById("guess-display");
const hintEl = document.getElementById("hint");
const feedback = document.getElementById("feedback");
const skipBtn = document.getElementById("skip-btn");
const hintBtn = document.getElementById("hint-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const scoreValue = document.getElementById("score-value");
const streakValue = document.getElementById("streak-value");
const bestStreakValue = document.getElementById("best-streak-value");
const spriteImg = document.getElementById("pokemon-sprite");
const loadingIndicator = document.getElementById("loading-indicator");
const timerBar = document.getElementById("timer-bar");
const timerTrack = document.querySelector(".wt-timer-track");
const pauseOverlay = document.getElementById("pause-overlay");
const diffButtons = document.querySelectorAll(".wt-diff-btn");
const diffCaption = document.getElementById("diff-caption");
const genButtons = document.querySelectorAll(".wt-gen-btn:not(#all-gen-btn)");
const allGenBtn = document.getElementById("all-gen-btn");
const megaToggle = document.getElementById("mega-toggle");
const regionalToggle = document.getElementById("regional-toggle");
const livesEls = document.querySelectorAll(".wt-life");
const historyList = document.getElementById("history-list");
const fullHistoryList = document.getElementById("full-history-list");
const expandHistoryBtn = document.getElementById("expand-history-btn");
const historyModal = document.getElementById("history-modal");
const closeHistoryBtn = document.getElementById("close-history-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const leaderboardModal = document.getElementById("leaderboard-modal");
const closeLeaderboardBtn = document.getElementById("close-leaderboard-btn");
const leaderboardList = document.getElementById("leaderboard-list");
const globalLeaderboardList = document.getElementById("global-leaderboard-list");
const submitScoreModal = document.getElementById("submit-score-modal");
const submitScoreForm = document.getElementById("submit-score-form");
const submitScoreName = document.getElementById("submit-score-name");
const submitScoreValue = document.getElementById("submit-score-value");
const skipSubmitBtn = document.getElementById("skip-submit-btn");

const DIFF_CAPTIONS = {
    easy: "Easy: full colour sprite, hint kicks in after a few misses.",
    normal: "Normal: silhouette brightens as you type correct letters.",
    hard: "Hard: full silhouette, hidden length, race the timer.",
};

// --- Game state ---
let currentAnswer = "";
let difficulty = "easy";
let selectedGens = new Set(["1"]);
let allowMega = false;
let allowRegional = false;

let score = 0;
let streak = 0;
let bestStreak = parseInt(localStorage.getItem("whosThatBestStreak") || "0", 10);
let lives = WHOS_THAT_SETTINGS.livesCount;

let wrongGuesses = 0;
let revealedHintChars = 0;
let roundOver = false;
let isPaused = false;
let requestToken = 0;
let advanceTimeout = null;
let guessHistory = [];

let maxTimeMs = 0;
let timeLeftMs = 0;
let roundStartTimestamp = 0;
let timerRAF = null;

bestStreakValue.textContent = bestStreak;

// --- Strips accents/punctuation so "flabébé" and "flabebe" both match ---
function normalizeName(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z'-]/gi, "")
        .toLowerCase();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function focusInput() {
    hiddenInput.focus();
}
gameArea.addEventListener("click", (e) => {
    if (e.target.closest(".wt-modal-card") || e.target.closest("button") || e.target.closest("label")) return;
    focusInput();
});
focusInput();

function renderLives() {
    livesEls.forEach((el, i) => {
        el.innerHTML = i < lives ? "&#9829;" : "&#9825;";
        el.classList.toggle("wt-life--lost", i >= lives);
    });
}

function renderGuess() {
    const typed = hiddenInput.value;

    if (difficulty === "hard") {
        guessDisplay.classList.add("wt-guess--plain");
        guessDisplay.textContent = typed ? typed.toUpperCase() : "";
        return;
    }

    guessDisplay.classList.remove("wt-guess--plain");
    guessDisplay.innerHTML = currentAnswer
        .split("")
        .map((_, i) => `<span class="wt-tile">${typed[i] ? typed[i].toUpperCase() : ""}</span>`)
        .join("");
}

function shakeDisplay() {
    guessDisplay.classList.remove("wt-shake");
    void guessDisplay.offsetWidth; // restart the animation even on repeated wrong guesses
    guessDisplay.classList.add("wt-shake");
}

diffButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (btn.dataset.diff === difficulty) return;
        difficulty = btn.dataset.diff;
        diffButtons.forEach((b) => b.classList.toggle("active", b === btn));
        diffCaption.textContent = DIFF_CAPTIONS[difficulty];
        updateDifficultyUI();
        loadNewPokemon();
    });
});

function updateDifficultyUI() {
    const isHard = difficulty === "hard";
    hintBtn.disabled = isHard || roundOver;
    timerTrack.style.display = isHard ? "block" : "none";
}

function refreshAllGenButtonState() {
    allGenBtn.classList.toggle("active", selectedGens.size === genButtons.length);
}

allGenBtn.addEventListener("click", () => {
    selectedGens = new Set(GENERATION_KEYS);
    genButtons.forEach((b) => b.classList.add("active"));
    allGenBtn.classList.add("active");
    loadNewPokemon();
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
        refreshAllGenButtonState();
        loadNewPokemon();
    });
});

megaToggle.addEventListener("change", (e) => {
    allowMega = e.target.checked;
    loadNewPokemon();
});

regionalToggle.addEventListener("change", (e) => {
    allowRegional = e.target.checked;
    loadNewPokemon();
});

hiddenInput.addEventListener("input", () => {
    if (roundOver || isPaused) {
        hiddenInput.value = "";
        return;
    }
    hiddenInput.value = normalizeName(hiddenInput.value);
    renderGuess();

    if (difficulty === "normal" && currentAnswer) {
        let matchCount = 0;
        for (let i = 0; i < hiddenInput.value.length && i < currentAnswer.length; i++) {
            if (hiddenInput.value[i] === currentAnswer[i]) matchCount++;
            else break;
        }
        const revealPercent = matchCount / currentAnswer.length;
        spriteImg.style.filter = `brightness(${Math.min(1, Math.max(0.05, revealPercent))})`;
    }
});

hiddenInput.addEventListener("keydown", (e) => {
    if (roundOver) {
        if (e.key === "Enter") {
            e.preventDefault();
            if (lives <= 0) playAgain();
            else loadNewPokemon();
        }
        return;
    }

    if (isPaused) return;

    // Ctrl+Delete (or Ctrl+Backspace — browsers differ) clears the whole guess at once
    if (e.ctrlKey && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        hiddenInput.value = "";
        renderGuess();
        if (difficulty === "normal") spriteImg.style.filter = "brightness(0.05)";
        return;
    }

    if (e.key === "Enter") {
        e.preventDefault();
        submitGuess();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        e.preventDefault();
        togglePause();
    }
});

function togglePause() {
    if (roundOver) return;
    isPaused = !isPaused;
    pauseOverlay.style.display = isPaused ? "flex" : "none";
    if (isPaused) {
        pauseTimerVisuals();
    } else {
        resumeTimerVisuals();
        focusInput();
    }
}

function togglePause() {
    if (roundOver) return;
    isPaused = !isPaused;
    pauseOverlay.style.display = isPaused ? "flex" : "none";
    if (isPaused) {
        pauseTimerVisuals();
    } else {
        resumeTimerVisuals();
        focusInput();
    }
}

function submitGuess() {
    const guess = normalizeName(hiddenInput.value.trim());
    if (!guess) return;

    if (guess === currentAnswer) {
        endRound(true);
        return;
    }

    wrongGuesses++;
    shakeDisplay();

    if (difficulty !== "hard" && wrongGuesses >= WHOS_THAT_SETTINGS.easyHintAfterWrongGuesses) {
        revealedHintChars = Math.max(revealedHintChars, 1);
        renderHint();
    }
}

hintBtn.addEventListener("click", () => {
    if (roundOver || isPaused || difficulty === "hard") return;
    if (revealedHintChars < currentAnswer.length - 1) {
        revealedHintChars++;
        renderHint();
    }
});

skipBtn.addEventListener("click", () => {
    if (roundOver || isPaused) return;
    endRound(false);
});

playAgainBtn.addEventListener("click", playAgain);

skipBtn.addEventListener("click", () => {
    if (roundOver || isPaused) return;
    endRound(false);
});

playAgainBtn.addEventListener("click", playAgain);

function startTimer() {
    maxTimeMs = WHOS_THAT_SETTINGS.hardTimerSeconds * 1000;
    timeLeftMs = maxTimeMs;
    roundStartTimestamp = Date.now();
    tickTimer();
}

function tickTimer() {
    cancelAnimationFrame(timerRAF);
    const frame = () => {
        if (isPaused || roundOver) return;
        const elapsed = Date.now() - roundStartTimestamp;
        timeLeftMs = Math.max(0, maxTimeMs - elapsed);
        const pct = maxTimeMs ? (timeLeftMs / maxTimeMs) * 100 : 0;
        timerBar.style.width = `${pct}%`;

        if (timeLeftMs <= 0) {
            endRound(false);
            return;
        }
        timerRAF = requestAnimationFrame(frame);
    };
    frame();
}

function pauseTimerVisuals() {
    cancelAnimationFrame(timerRAF);
}

function resumeTimerVisuals() {
    if (difficulty !== "hard" || roundOver) return;
    roundStartTimestamp = Date.now() - (maxTimeMs - timeLeftMs);
    tickTimer();
}

function addHistoryItem(name, won, points) {
    guessHistory.unshift({ name, won, points });
    guessHistory = guessHistory.slice(0, 50);
    renderHistory();
}

function historyRow(item) {
    const li = document.createElement("li");
    li.className = `wt-history-item ${item.won ? "wt-history-item--win" : "wt-history-item--loss"}`;
    li.innerHTML = `<span>${capitalize(item.name)}</span><span>${item.won ? "+" + item.points : "missed"}</span>`;
    return li;
}

function renderHistory() {
    historyList.innerHTML = "";
    fullHistoryList.innerHTML = "";

    if (guessHistory.length === 0) {
        historyList.innerHTML = '<li class="wt-history-empty">No guesses yet — go catch one!</li>';
        fullHistoryList.innerHTML = '<li class="wt-history-empty">No guesses yet — go catch one!</li>';
        return;
    }

    guessHistory.slice(0, 5).forEach((item) => historyList.appendChild(historyRow(item)));
    guessHistory.forEach((item) => fullHistoryList.appendChild(historyRow(item)));
}

function saveLocalLeaderboardEntry(finalScore) {
    if (finalScore <= 0) return;
    const board = JSON.parse(localStorage.getItem("whosThatLocalLeaderboard") || "[]");
    board.push({ score: finalScore, at: Date.now() });
    board.sort((a, b) => b.score - a.score);
    localStorage.setItem("whosThatLocalLeaderboard", JSON.stringify(board.slice(0, 10)));
}

function renderLeaderboard() {
    const board = JSON.parse(localStorage.getItem("whosThatLocalLeaderboard") || "[]");
    leaderboardList.innerHTML = "";

    if (board.length === 0) {
        leaderboardList.innerHTML = '<li class="wt-history-empty">No runs saved on this browser yet.</li>';
        return;
    }

    board.forEach((entry, i) => {
        const li = document.createElement("li");
        li.className = "wt-history-item";
        const date = new Date(entry.at).toLocaleDateString();
        li.innerHTML = `<span>#${i + 1} — ${entry.score} pts</span><span>${date}</span>`;
        leaderboardList.appendChild(li);
    });
}

expandHistoryBtn.addEventListener("click", () => historyModal.classList.add("wt-modal--open"));
closeHistoryBtn.addEventListener("click", () => historyModal.classList.remove("wt-modal--open"));
async function renderGlobalLeaderboard() {
    globalLeaderboardList.innerHTML = '<li class="wt-history-empty">Loading&hellip;</li>';
    try {
        const response = await fetch("/api/leaderboard/top");
        const rows = await response.json();

        if (rows.length === 0) {
            globalLeaderboardList.innerHTML = '<li class="wt-history-empty">No runs submitted yet &mdash; be the first!</li>';
            return;
        }

        globalLeaderboardList.innerHTML = "";
        rows.forEach((row, i) => {
            const li = document.createElement("li");
            li.className = "wt-history-item";
            li.innerHTML = `<span>#${i + 1} ${row.player_name}</span><span>${row.score} pts</span>`;
            globalLeaderboardList.appendChild(li);
        });
    } catch (err) {
        globalLeaderboardList.innerHTML = '<li class="wt-history-empty">Couldn\'t reach the leaderboard right now.</li>';
    }
}

leaderboardBtn.addEventListener("click", () => {
    renderLeaderboard();
    renderGlobalLeaderboard();
    leaderboardModal.classList.add("wt-modal--open");
});

submitScoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = submitScoreName.value.trim();
    if (!name) return;

    await fetch("/api/leaderboard/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score }),
    });

    submitScoreModal.classList.remove("wt-modal--open");
    submitScoreName.value = "";
});

skipSubmitBtn.addEventListener("click", () => {
    submitScoreModal.classList.remove("wt-modal--open");
});
closeLeaderboardBtn.addEventListener("click", () => leaderboardModal.classList.remove("wt-modal--open"));
[historyModal, leaderboardModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("wt-modal--open");
    });
});

function endRound(won) {
    if (roundOver) return;
    roundOver = true;
    pauseTimerVisuals();
    spriteImg.style.filter = "none";
    skipBtn.disabled = true;
    hintBtn.disabled = true;

    let pointsEarned = 0;

    if (won) {
        pointsEarned = 10;
        score += pointsEarned;
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
            localStorage.setItem("whosThatBestStreak", String(bestStreak));
        }
        feedback.textContent = `Correct! It was ${capitalize(currentAnswer)}.`;
        feedback.className = "wt-feedback wt-feedback--good";
    } else {
        streak = 0;
        lives--;
        feedback.textContent = `It was ${capitalize(currentAnswer)}.`;
        feedback.className = "wt-feedback wt-feedback--bad";
    }

    scoreValue.textContent = score;
    streakValue.textContent = streak;
    bestStreakValue.textContent = bestStreak;
    renderLives();
    addHistoryItem(currentAnswer, won, pointsEarned);
    guessDisplay.classList.remove("wt-guess--plain");
    guessDisplay.textContent = capitalize(currentAnswer);

    if (lives <= 0) {
        advanceTimeout = setTimeout(gameOverSequence, 900);
    } else {
        advanceTimeout = setTimeout(loadNewPokemon, 1600);
    }
}

function gameOverSequence() {
    saveLocalLeaderboardEntry(score);
    feedback.innerHTML = `Run over &mdash; final score <strong>${score}</strong>. Press Enter or hit Play Again.`;
    feedback.className = "wt-feedback wt-feedback--bad";
    playAgainBtn.style.display = "inline-block";

    if (score > 0) {
        submitScoreValue.textContent = score;
        submitScoreModal.classList.add("wt-modal--open");
    }
}

function playAgain() {
    clearTimeout(advanceTimeout);
    score = 0;
    lives = WHOS_THAT_SETTINGS.livesCount;
    scoreValue.textContent = score;
    renderLives();
    playAgainBtn.style.display = "none";
    loadNewPokemon()
}

async function loadNewPokemon() {
    clearTimeout(advanceTimeout);
    const myToken = ++requestToken; // guards a slow, late response from overwriting a newer round

    feedback.textContent = "";
    feedback.className = "wt-feedback";
    revealedHintChars = 0;
    renderHint();
    hiddenInput.value = "";
    wrongGuesses = 0;
    roundOver = false;
    isPaused = false;
    pauseOverlay.style.display = "none";
    skipBtn.disabled = false;
    hintBtn.disabled = difficulty === "hard";
    playAgainBtn.style.display = "none";
    loadingIndicator.style.display = "flex";
    spriteImg.style.display = "none";
    timerBar.style.width = "100%";

    if (difficulty === "easy") spriteImg.style.filter = "none";
    else if (difficulty === "normal") spriteImg.style.filter = "brightness(0.05)";
    else spriteImg.style.filter = "brightness(0)";

    const params = new URLSearchParams({
        gens: Array.from(selectedGens).join(","),
        mega: allowMega ? "1" : "0",
        regional: allowRegional ? "1" : "0",
    });

    let data;
    try {
        const response = await fetch(`/api/random-pokemon?${params}`);
        data = await response.json();
    } catch (err) {
        if (myToken !== requestToken) return;
        loadingIndicator.textContent = "COULDN'T REACH POKEAPI — TRY AGAIN";
        return;
    }

    if (myToken !== requestToken) return; // a newer round started while this was in flight

    currentAnswer = data.name.toLowerCase();

    spriteImg.onload = () => {
        if (myToken !== requestToken) return;
        loadingIndicator.style.display = "none";
        spriteImg.style.display = "block";
        if (difficulty === "hard") startTimer();
    };
    spriteImg.src = data.sprite;

    renderGuess();
    focusInput();
}

renderLives();
updateDifficultyUI();
refreshAllGenButtonState();
renderHistory();
loadNewPokemon();