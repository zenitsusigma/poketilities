const addForm = document.getElementById("tb-add-form");
const addInput = document.getElementById("tb-add-input");
const addText = document.getElementById("tb-add-text");
const addSpinner = document.getElementById("tb-add-spinner");
const errorEl = document.getElementById("tb-error");
const teamGrid = document.getElementById("tb-team-grid");
const coverageWrap = document.getElementById("tb-coverage");
const coverageGrid = document.getElementById("tb-coverage-grid");
let team = JSON.parse(localStorage.getItem("teamBuilderTeam") || "[]");

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function saveTeam() {
    localStorage.setItem("teamBuilderTeam", JSON.stringify(team));
}

function renderTeam() {
    teamGrid.innerHTML = "";

    for (let i = 0; i < 6; i++) {
        const slot = document.createElement("div");
        if (team[i]) {
            const member = team[i];
            slot.className = "tb-slot tb-slot--filled";
            slot.innerHTML = `
                <button type="button" class="tb-remove-btn" data-index="${i}">&times;</button>
                <img class="tb-slot-sprite" src="${member.sprite}" alt="">
                <span class="tb-slot-name">${capitalize(member.name)}</span>
                <span class="tb-slot-types">${member.types.map((t) => `<span class="tb-type-chip" style="--type-color: ${TYPE_COLORS[t]}">${t}</span>`).join("")}</span>
            `;
        } else {
            slot.className = "tb-slot";
            slot.innerHTML = `<span class="tb-slot-empty">Empty Slot</span>`;
        }
        teamGrid.appendChild(slot);
    }

    teamGrid.querySelectorAll(".tb-remove-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            team.splice(parseInt(btn.dataset.index, 10), 1);
            saveTeam();
            renderTeam();
            renderCoverage();
        });
    });
}

function renderCoverage() {
    if (team.length === 0) {
        coverageWrap.style.display = "none";
        return;
    }
    coverageWrap.style.display = "block";
    coverageGrid.innerHTML = "";

    Object.keys(TYPE_CHART).forEach((atkType) => {
        const weak = [];
        const safe = [];

        team.forEach((member) => {
            let mult = 1;
            member.types.forEach((defType) => {
                const chart = TYPE_CHART[atkType];
                mult *= chart[defType] ?? 1;
            });
            if (mult > 1) weak.push(member.name);
            else safe.push(member.name);
        });

        const cell = document.createElement("div");
        cell.className = "tb-coverage-cell";
        if (weak.length >= 3) cell.classList.add("tb-coverage-cell--danger");
        else if (safe.length >= 3) cell.classList.add("tb-coverage-cell--strong");

        cell.innerHTML = `
            <span class="tb-coverage-type" style="--type-color: ${TYPE_COLORS[atkType]}">${capitalize(atkType)}</span>
            <span class="tb-coverage-count">${weak.length} weak / ${team.length}</span>
        `;
        coverageGrid.appendChild(cell);
    });
}

function setAddLoading(isLoading) {
    addText.style.display = isLoading ? "none" : "inline";
    addSpinner.style.display = isLoading ? "block" : "none";
}

addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const name = addInput.value.trim();
    if (!name) return;

    if (team.length >= 6) {
        errorEl.textContent = "Your team is full \u2014 remove someone first.";
        return;
    }

    if (team.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
        errorEl.textContent = `${capitalize(name)} is already on your team.`;
        return;
    }

    setAddLoading(true);
    let data;
    try {
        const response = await fetch(`/api/team-builder/lookup?name=${encodeURIComponent(name)}`);
        data = await response.json();
    } finally {
        setAddLoading(false);
    }

    if (data.error) {
        errorEl.textContent = data.error;
        return;
    }

    team.push(data);
    saveTeam();
    addInput.value = "";
    renderTeam();
    renderCoverage();
});

renderTeam();
renderCoverage();