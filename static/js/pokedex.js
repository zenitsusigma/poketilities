const genButtons = document.querySelectorAll("#gen-select .gen-btn");
const gridEl = document.getElementById("px-grid");
const progressTextEl = document.getElementById("px-progress-text");
const progressFillEl = document.getElementById("px-progress-fill");

let progress = JSON.parse(localStorage.getItem("pokedexProgress") || "{}");
let currentGen = "1";
let activeId = null;

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

function saveProgress() {
    localStorage.setItem("pokedexProgress", JSON.stringify(progress));
}

function updateProgressBar() {
    const [start, end] = GEN_RANGES[currentGen];
    const total = end - start + 1;
    let named = 0;
    for (let id = start; id <= end; id++) {
        if (progress[id]) named++;
    }
    progressTextEl.textContent = `${named} / ${total} named`;
    progressFillEl.style.width = `${(named / total) * 100}%`;
}

function buildGrid() {
    const [start, end] = GEN_RANGES[currentGen];
    gridEl.innerHTML = "";
    activeId = null;

    for (let id = start; id <= end; id++) {
        const slot = document.createElement("div");
        slot.className = "px-slot";
        slot.dataset.id = id;

        if (progress[id]) {
            renderSolved(slot, id);
        } else {
            renderClosed(slot, id);
        }
        gridEl.appendChild(slot);
    }
    updateProgressBar();
}

function renderClosed(slot, id) {
    slot.className = "px-slot";
    slot.innerHTML = `<span class="px-slot-number">#${String(id).padStart(4, "0")}</span>`;
    slot.onclick = () => openSlot(id);
}

function renderSolved(slot, id) {
    const entry = progress[id];
    slot.className = "px-slot px-slot--solved";
    slot.innerHTML = `
        <img class="px-slot-sprite" src="${entry.sprite}" alt="">
        <span class="px-slot-name">${capitalize(entry.name)}</span>
    `;
    slot.onclick = null;
}

async function openSlot(id) {
    if (activeId !== null && activeId !== id) {
        // Collapse whatever slot was previously open, back to closed state
        const prevSlot = gridEl.querySelector(`[data-id="${activeId}"]`);
        if (prevSlot && !progress[activeId]) renderClosed(prevSlot, activeId);
    }
    activeId = id;

    const slot = gridEl.querySelector(`[data-id="${id}"]`);
    slot.className = "px-slot px-slot--open";
    slot.innerHTML = `<div class="pokeball-spinner pokeball-spinner--small"></div>`;
    slot.onclick = null;

    const response = await fetch(`/api/pokedex/reveal?id=${id}`);
    const data = await response.json();

    slot.innerHTML = `
        <img class="px-slot-sprite px-slot-sprite--silhouette" src="${data.sprite}" alt="">
        <input type="text" class="px-slot-input" placeholder="Name?" autocomplete="off">
        <button type="button" class="px-slot-reveal">Reveal</button>
    `;

    const input = slot.querySelector(".px-slot-input");
    const revealBtn = slot.querySelector(".px-slot-reveal");
    const sprite = slot.querySelector(".px-slot-sprite");
    sprite.onload = () => sprite.classList.remove("px-slot-sprite--silhouette");

    input.focus();
    input.addEventListener("input", () => {
        input.value = normalizeName(input.value);
    });
    input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await submitGuess(id, slot, input, sprite);
        }
    });
    revealBtn.addEventListener("click", async () => {
        const res = await fetch("/api/pokedex/reveal-answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        const revealData = await res.json();
        if (revealData.answer) {
            progress[id] = { name: revealData.answer, sprite: sprite.src };
            saveProgress();
            renderSolved(slot, id);
            updateProgressBar();
            activeId = null;
        }
    });
}

async function submitGuess(id, slot, input, sprite) {
    const guess = input.value.trim();
    if (!guess) return;

    const response = await fetch("/api/pokedex/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, guess }),
    });
    const data = await response.json();

    if (data.correct) {
        progress[id] = { name: data.answer, sprite: sprite.src };
        saveProgress();
        renderSolved(slot, id);
        updateProgressBar();
        activeId = null;
    } else {
        input.classList.remove("px-shake");
        void input.offsetWidth;
        input.classList.add("px-shake");
        input.value = "";
    }
}

genButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        currentGen = btn.dataset.gen;
        genButtons.forEach((b) => b.classList.toggle("active", b === btn));
        buildGrid();
    });
});

buildGrid();