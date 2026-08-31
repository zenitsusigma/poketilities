const guessForm = document.getElementById("guess-form");
const guessInput = document.getElementById("guess-input");
const submitBtn = document.getElementById("guess-submit-btn");
const submitText = document.getElementById("guess-submit-text");
const submitSpinner = document.getElementById("guess-spinner");
const quitBtn = document.getElementById("quit-btn");
const errorEl = document.getElementById("pokedle-error");
const rowsEl = document.getElementById("pokedle-rows");
const winMessageEl = document.getElementById("pokedle-win-message");
const newRoundBtn = document.getElementById("new-round-btn");

let solved = false;
let alreadyGuessed = new Set();

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function typeCellHTML(typeResult) {
    if (!typeResult.value) {
        return `<span class="pokedle-cell pokedle-cell--empty">-</span>`;
    }
    const color = TYPE_COLORS[typeResult.value] || "#888";
    return `<span class="pokedle-cell pokedle-cell--type pokedle-cell--${typeResult.status}" style="--type-color: ${color}">${typeResult.value}</span>`;
}

function numericCellHTML(numResult, formatter) {
    const arrow = numResult.status === "correct" ? "" : numResult.status === "up" ? " &uarr;" : " &darr;";
    return `<span class="pokedle-cell pokedle-cell--${numResult.status}">${formatter(numResult.value)}${arrow}</span>`;
}

function setSubmitLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitText.style.display = isLoading ? "none" : "inline";
    submitSpinner.style.display = isLoading ? "block" : "none";
}

async function startNewRound() {
    solved = false;
    alreadyGuessed = new Set();
    errorEl.textContent = "";
    rowsEl.innerHTML = "";
    winMessageEl.style.display = "none";
    newRoundBtn.style.display = "none";
    guessInput.disabled = false;
    guessInput.value = "";
    guessInput.focus();

    await fetch("/api/pokedle/new");
}

guessForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (solved) return;

    const guess = guessInput.value.trim();
    if (!guess) return;

    errorEl.textContent = "";

    // Check for a repeat guess before even hitting the network - cheaper,
    // faster feedback, and stops you from wasting a look-up on a name
    // you've already tried this round.
    const normalizedGuess = guess.toLowerCase();
    if (alreadyGuessed.has(normalizedGuess)) {
        errorEl.textContent = `You already guessed "${capitalize(normalizedGuess)}" this round.`;
        return;
    }

    setSubmitLoading(true);

    let data;
    try {
        const response = await fetch("/api/pokedle/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guess }),
        });
        data = await response.json();
    } finally {
        setSubmitLoading(false);
    }

    if (data.error) {
        errorEl.textContent = data.error;
        return;
    }

    alreadyGuessed.add(data.guessName.toLowerCase());

    const row = document.createElement("div");
    row.className = "pokedle-row";
    row.innerHTML = `
        <span class="pokedle-cell pokedle-cell--name ${data.correct ? "pokedle-cell--correct" : ""}">${capitalize(data.guessName)}</span>
        ${typeCellHTML(data.types[0])}
        ${typeCellHTML(data.types[1])}
        ${numericCellHTML(data.generation, (v) => v)}
        ${numericCellHTML(data.height, (v) => (v / 10).toFixed(1) + "m")}
        ${numericCellHTML(data.weight, (v) => (v / 10).toFixed(1) + "kg")}
    `;
    rowsEl.prepend(row);
    guessInput.value = "";

    if (data.correct) {
        solved = true;
        guessInput.disabled = true;
        winMessageEl.textContent = `Got it! It was ${capitalize(data.answerName)}, in ${data.guessCount} guess${data.guessCount === 1 ? "" : "es"}.`;
        winMessageEl.style.display = "block";
        newRoundBtn.style.display = "inline-block";
    }
});

quitBtn.addEventListener("click", async () => {
    if (solved) return;

    const response = await fetch("/api/pokedle/quit", { method: "POST" });
    const data = await response.json();

    if (data.error) return;

    solved = true;
    guessInput.disabled = true;
    winMessageEl.textContent = `Quit \u2014 it was ${capitalize(data.answerName)}.`;
    winMessageEl.style.display = "block";
    newRoundBtn.style.display = "inline-block";
});

newRoundBtn.addEventListener("click", startNewRound);

startNewRound();