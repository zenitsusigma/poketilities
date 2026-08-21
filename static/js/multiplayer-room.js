const socket = io();

const gameArea = document.getElementById("game-area");
const hiddenInput = document.getElementById("hidden-input");
const guessDisplay = document.getElementById("guess-display");
const spriteImg = document.getElementById("pokemon-sprite");
const feedback = document.getElementById("feedback");
const playerList = document.getElementById("player-list");
const startBtn = document.getElementById("start-btn");

let roundActive = false;
let answerLength = 0;

function normalizeName(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z'-]/gi, "")
        .toLowerCase();
}

function focusInput() {
    hiddenInput.focus();
}
gameArea.addEventListener("click", focusInput);
focusInput();

function renderGuess() {
    const typed = hiddenInput.value;
    if (answerLength > 0) {
        guessDisplay.innerHTML = Array.from({ length: answerLength })
            .map((_, i) => `<span class="tile">${typed[i] || ""}</span>`)
            .join("");
    } else {
        guessDisplay.textContent = typed || "\u00A0";
    }
}

socket.on("connect", () => {
    socket.emit("join", { code: ROOM_CODE, name: PLAYER_NAME });
});

socket.on("player_list", (data) => {
    playerList.innerHTML = data.players.map((p) => `<li>${p.name} — ${p.score}</li>`).join("");
});

socket.on("error", (data) => {
    feedback.textContent = data.message;
});

if (startBtn) {
    startBtn.addEventListener("click", () => {
        socket.emit("start_game", { code: ROOM_CODE });
        startBtn.style.display = "none";
    });
}

socket.on("round_start", (data) => {
    roundActive = true;
    feedback.textContent = "";
    hiddenInput.value = "";
    spriteImg.src = data.sprite;
    spriteImg.style.display = "inline-block";
    spriteImg.classList.add("silhouette");
    answerLength = data.length || 0;
    renderGuess();
    focusInput();
});

socket.on("round_won", (data) => {
    roundActive = false;
    spriteImg.classList.remove("silhouette");
    feedback.textContent = `${data.winner} got it! It was ${data.answer}.`;
    playerList.innerHTML = data.players.map((p) => `<li>${p.name} — ${p.score}</li>`).join("");
});

socket.on("wrong_guess", () => {
    guessDisplay.classList.remove("shake");
    void guessDisplay.offsetWidth;
    guessDisplay.classList.add("shake");
});

hiddenInput.addEventListener("input", () => {
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
        if (!roundActive) return;
        const guess = hiddenInput.value.trim();
        if (!guess) return;
        socket.emit("submit_guess", { code: ROOM_CODE, guess });
        hiddenInput.value = "";
        renderGuess();
    }
});