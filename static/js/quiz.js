const introEl = document.getElementById("quiz-intro");
const activeEl = document.getElementById("quiz-active");
const resultsEl = document.getElementById("quiz-results");
const startBtn = document.getElementById("start-quiz-btn");
const nextBtn = document.getElementById("quiz-next-btn");
const restartBtn = document.getElementById("quiz-restart-btn");
const questionEl = document.getElementById("quiz-question");
const optionsEl = document.getElementById("quiz-options");
const progressText = document.getElementById("quiz-progress-text");
const progressFill = document.getElementById("quiz-progress-fill");
const scoreText = document.getElementById("quiz-score-text");
const finalScoreEl = document.getElementById("quiz-final-score");
const finalMessageEl = document.getElementById("quiz-final-message");

let order = [];
let currentIndex = 0;
let score = 0;
let answered = false;

function shuffledIndexes(length) {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function showQuestion() {
    answered = false;
    nextBtn.style.display = "none";
    const q = QUIZ_QUESTIONS[order[currentIndex]];

    progressText.textContent = `Question ${currentIndex + 1} / ${QUIZ_QUESTIONS.length}`;
    scoreText.textContent = `Score: ${score}`;
    progressFill.style.width = `${(currentIndex / QUIZ_QUESTIONS.length) * 100}%`;

    questionEl.textContent = q.question;
    optionsEl.innerHTML = "";

    q.options.forEach((option, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-option";
        btn.textContent = option;
        btn.addEventListener("click", () => selectAnswer(i, btn, q.correct));
        optionsEl.appendChild(btn);
    });

}

function selectAnswer(chosenIndex, btnEl, correctIndex) {
    if (answered) return;
    answered = true;

    [...optionsEl.children].forEach((btn, i) => {
        btn.disabled = true;
        if (i === correctIndex) btn.classList.add("quiz-option--correct");
        else if (i === chosenIndex) btn.classList.add("quiz-option--wrong");
    });

    if (chosenIndex === correctIndex) {
        score++;
        scoreText.textContent = `Score: ${score}`;
    }

    nextBtn.style.display = "inline-block";
}


function nextQuestion() {
    currentIndex++;
    if (currentIndex < order.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    activeEl.style.display = "none";
    resultsEl.style.display = "block";
    progressFill.style.width = "100%";

    finalScoreEl.textContent = `${score} / ${QUIZ_QUESTIONS.length}`;
    
    const pct = score / QUIZ_QUESTIONS.length;
    let message;
    if (pct == 1) message = "Perfect score! Well played..."
    else if (pct >= 0.7) message = "Good job! Keep it up!"
    else if (pct >= 0.4) message = "Not bad! Keep practicing!"
    else message = "Keep trying! You'll get better!"
    finalMessageEl.textContent = message;
}

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", startQuiz);