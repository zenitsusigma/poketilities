const questionView = document.getElementById("ak-question-view");
const guessView = document.getElementById("ak-guess-view");
const endView = document.getElementById("ak-end-view");

const progressEl = document.getElementById("ak-progress");
const questionEl = document.getElementById("ak-question");
const answerButtons = document.querySelectorAll("#ak-question-view .ak-btn");

const guessSpinner = document.getElementById("ak-guess-spinner");
const guessSprite = document.getElementById("ak-guess-sprite");
const guessName = document.getElementById("ak-guess-name");
const correctBtn = document.getElementById("ak-correct-btn");
const wrongBtn = document.getElementById("ak-wrong-btn");

const endMessage = document.getElementById("ak-end-message");
const restartBtn = document.getElementById("ak-restart-btn");

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showView(view) {
    questionView.style.display = view === "question" ? "block" : "none";
    guessView.style.display = view === "guess" ? "block" : "none";
    endView.style.display = view === "end" ? "block" : "none";
}

function renderResponse(data) {
    if (data.guess) {
        showView("guess");
        guessSpinner.style.display = "block";
        guessSprite.style.display = "none";
        guessName.textContent = "";

        if (!data.name) {
            endMessage.textContent = "I've got nothing left to guess \u2014 you've stumped me!";
            showView("end");
            return;
        }

        guessSprite.onload = () => {
            guessSpinner.style.display = "none";
            guessSprite.style.display = "block";
        };
        guessSprite.src = data.sprite || "";
        guessName.textContent = capitalize(data.name);
    } else {
        showView("question");
        progressEl.textContent = `Question ${data.questionNumber} / ${data.maxQuestions}`;
        questionEl.textContent = data.question;
    }
}

async function startGame() {
    showView("question");
    questionEl.textContent = "Loading\u2026";
    progressEl.textContent = "";
    const response = await fetch("/api/akinator/start");
    const data = await response.json();
    renderResponse(data);
}

answerButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
        const response = await fetch("/api/akinator/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer: btn.dataset.answer }),
        });
        const data = await response.json();
        renderResponse(data);
    });
});

correctBtn.addEventListener("click", async () => {
    await fetch("/api/akinator/correct", { method: "POST" });
    endMessage.textContent = "Nice, got it! Knew it all along.";
    showView("end");
});

wrongBtn.addEventListener("click", async () => {
    const response = await fetch("/api/akinator/wrong", { method: "POST" });
    const data = await response.json();

    if (data.outOfGuesses) {
        endMessage.textContent = "You got me! Nice one, I couldn't figure that one out.";
        showView("end");
        return;
    }

    renderResponse(data);
});

restartBtn.addEventListener("click", startGame);

startGame();