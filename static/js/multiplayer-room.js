const socket = io();

const gameArea = document.getElementById("game-area");
const hiddenInput = document.getElementById("hidden-input");
const guessDisplay = document.getElementById("guess-display");
const spriteImg = document.getElementById("pokemon-sprite");
const spinner = document.getElementById("mpr-spinner");
const feedback = document.getElementById("feedback");
const playerList = document.getElementById("player-list");
const startBtn = document.getElementById("start-btn");
const waitingMsg = document.getElementById("mpr-waiting");

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
            .map((_, i) => `<span class="mpr-tile">${typed[i] || ""}</span>`)
            .join("");
    } else {
        guessDisplay.textContent = typed || "\u00A0";
    }
}

socket.on("connect", () => {
    socket.emit("join", { code: ROOM_CODE, name: PLAYER_NAME });
});

socket.on("player_list", (data) => {
    playerList.innerHTML = data.players
        .map((p) => `<li class="mpr-player"><span>${p.name}</span><span class="mpr-player-score">${p.score}</span></li>`)
        .join("");
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
    feedback.className = "mpr-feedback";
    hiddenInput.value = "";
    if (waitingMsg) waitingMsg.style.display = "none";

    spinner.style.display = "block";
    spriteImg.style.display = "none";
    spriteImg.classList.add("mpr-silhouette");
    spriteImg.onload = () => {
        spinner.style.display = "none";
        spriteImg.style.display = "block";
    };
    spriteImg.src = data.sprite;
    answerLength = data.length || 0;
    renderGuess();
    focusInput();
});

socket.on("round_won", (data) => {
    roundActive = false;
    spriteImg.classList.remove("mpr-silhouette");
    feedback.textContent = `${data.winner} got it! It was ${data.answer}.`;
    feedback.className = "mpr-feedback mpr-feedback--good";
    playerList.innerHTML = data.players
        .map((p) => `<li class="mpr-player"><span>${p.name}</span><span class="mpr-player-score">${p.score}</span></li>`)
        .join("");
});

socket.on("wrong_guess", () => {
    guessDisplay.classList.remove("mpr-shake");
    void guessDisplay.offsetWidth;
    guessDisplay.classList.add("mpr-shake");
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