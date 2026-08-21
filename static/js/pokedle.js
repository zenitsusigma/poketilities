const genButtons = document.querySelectorAll("#gen-select .gen-btn");
const guessForm = document.getElementById("guess-form");
const guessInput = document.getElementById("guess-input");
const errorEl = document.getElementById("pokedle-error");
const rowsEl = document.getElementById("pokedle-rows");
const winMessageEl = document.getElementById("pokedle-win-message");
const newRoundBtn = document.getElementById("new-round-btn");

let selectedGens = new Set(["1"]);
let solved = false;

genButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const gen = btn.dataset.gen;
        if (selectedGens.has(gen)) {
            if (selectedGens.size === 1) return;
            selectedGens.delete(gen);
        } else {
            selectedGens.add(gen);
            btn.classList.add("active");
        }
        startNewRound();
    });
});

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function typeCellHTML(typeResult) {
    if (!typeResult.value) {
        return `<span class="pokedle-cell pokedle-cell--empty">&mdash;</span>`;
    }
    const color = TYPE_COLORS[typeResult.value] || "#888";
    return `<span class="pokedle-cell pokedle-cell--type pokedle-cell--${typeResult.status}" style="--type-color: ${color}">${typeResult.value}</span>`;
}

function numericCellHTML(numResult, formatter) {
    const arrow = numResult.status === "correct" ? "" : numResult.status === "up" ? " &uarr;" : " &darr;";
    return `<span class="pokedle-cell pokedle-cell--${numResult.status}">${formatter(numResult.value)}${arrow}</span>`;
}

async function startNewRound() {
    solved = false;
    errorEl.textContent = "";
    rowsEl.innerHTML = "";
    winMessageEl.style.display = "none";
    newRoundBtn.style.display = "none";
    guessInput.disabled = false;
    guessInput.value = "";
    guessInput.focus();

    await fetch(`/api/pokedle/new?gens=${Array.from(selectedGens).join(",")}`);
}

guessForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (solved) return;

    const guess = guessInput.value.trim();
    if (!guess) return;

    errorEl.textContent = "";

    const response = await fetch("/api/pokedle/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess }),
    });
    const data = await response.json();

    if (data.error) {
        errorEl.textContent = data.error;
        return;
    }

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

newRoundBtn.addEventListener("click", startNewRound);

startNewRound();