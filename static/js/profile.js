function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const wtStreak = parseInt(localStorage.getItem("whosThatBestStreak") || "0", 10);
document.getElementById("pf-wt-streak").textContent = wtStreak;

const sbStreak = parseInt(localStorage.getItem("statBattleBestStreak") || "0", 10);
document.getElementById("pf-sb-streak").textContent = sbStreak;

const dexProgress = JSON.parse(localStorage.getItem("pokedexProgress") || "{}");
const dexListEl = document.getElementById("pf-dex-list");
let totalNamed = 0;

Object.keys(GEN_RANGES).forEach((genKey) => {
    const [start, end] = GEN_RANGES[genKey];
    let named = 0;
    for (let id = start; id <= end; id++) {
        if (dexProgress[id]) named++;
    }
    totalNamed += named;
    const total = end - start + 1;
    const pct = total ? (named / total) * 100 : 0;

    const row = document.createElement("div");
    row.className = "pf-dex-row";
    row.innerHTML = `
        <span class="pf-dex-gen">Gen ${genKey}</span>
        <div class="pf-dex-bar"><div class="pf-dex-fill" style="width:${pct}%"></div></div>
        <span class="pf-dex-count">${named} / ${total}</span>
    `;
    dexListEl.appendChild(row);
});

document.getElementById("pf-dex-total").textContent = totalNamed;

const team = JSON.parse(localStorage.getItem("teamBuilderTeam") || "[]");
const teamRowEl = document.getElementById("pf-team-row");

if (team.length === 0) {
    teamRowEl.innerHTML = `<p class="pf-empty">No team built yet. <a href="/team-builder">Build one &rarr;</a></p>`;
} else {
    team.forEach((member) => {
        const card = document.createElement("div");
        card.className = "pf-team-member";
        card.innerHTML = `
            <img src="${member.sprite}" alt="">
            <span>${capitalize(member.name)}</span>
        `;
        teamRowEl.appendChild(card);
    });
}

const localRuns = JSON.parse(localStorage.getItem("whosThatLocalLeaderboard") || "[]");
const localRunsEl = document.getElementById("pf-local-runs");

if (localRuns.length === 0) {
    localRunsEl.innerHTML = `<li class="pf-empty">No runs saved on this browser yet.</li>`;
} else {
    localRuns.forEach((run, i) => {
        const li = document.createElement("li");
        li.className = "pf-list-item";
        const date = new Date(run.at).toLocaleDateString();
        li.innerHTML = `<span>#${i + 1} - ${run.score} pts</span><span>${date}</span>`;
        localRunsEl.appendChild(li);
    });
}

async function loadGlobalBoard() {
    const boardEl = document.getElementById("pf-global-board");
    boardEl.innerHTML = `<li class="pf-empty">Loading&hellip;</li>`;
    try {
        const response = await fetch("/api/leaderboard/top");
        const rows = await response.json();

        if (rows.length === 0) {
            boardEl.innerHTML = `<li class="pf-empty">No runs submitted yet.</li>`;
            return;
        }

        boardEl.innerHTML = "";
        rows.forEach((row, i) => {
            const li = document.createElement("li");
            li.className = "pf-list-item";
            li.innerHTML = `<span>#${i + 1} ${row.player_name}</span><span>${row.score} pts</span>`;
            boardEl.appendChild(li);
        });
    } catch (err) {
        boardEl.innerHTML = `<li class="pf-empty">Couldn't reach the leaderboard right now.</li>`;
    }
}

loadGlobalBoard();