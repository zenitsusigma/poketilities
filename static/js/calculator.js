const type1Grid = document.getElementById("type1-grid");
const type2Grid = document.getElementById("type2-grid");
const resultsEl = document.getElementById("calc-results");
const placeholderEl = document.getElementById("calc-placeholder")

const groups = {
    4: document.getElementById("weak-4x"),
    2: document.getElementById("weak-2x"),
    0.5: document.getElementById("resist-half"),
    0.25: document.getElementById("resist-quarter"),
    0: document.getElementById("immune"),
};

let type1 = null;
let type2 = null;

function buildTypeButton(type, onclick) {
    const btn = document.createElement("button")
    btn.type = "button";
    btn.className = "calc-tyoe-btn";
    btn.textContent = type;
    btn.style.setProperty("--type-color", TYPE_COLORS[type]);
    btn.addEventListener("click", () => onClick(type, btn));
    return btn;
}

Objects.keys(TYPE_COLORS).forEach((type) => {
    type1Grid.appendChild(buildTypeButton(type, selectType1));
    type2Grid.appendChild(buildTypeButton(type, selectType2))
});

function selectType1(type, btn) {
    type1 = type1 === type ? null : type;
    [...type1Grid.children].forEach((b) => b.classList.toggle("active", b === btn && type1 === type));
    calculate();
}

function selectType2(type, btn) {
    type2 = type2 === type ? null : type;
    [...type2Grid.children].forEach((b) => b.classList.toggle("active", b === btn && type2 === type));
    calculate();
}

function makeChip(type) {
    const chip = document.createElement("span");
    chip.className = "calc-chip";
    chip.textContent = type;
    chip.style.setProperty("--type-color", TYPE_COLORS[type]);
    return chip;
}

function calculate() {
    if (!type1) {
        resultsEl.style.display = "none";
        placeholderEl.style.display = "block";
        return;
    }

    Object.values(groups).forEach((el) => (el.innerHTML = ""));
    const buckets = { 4: [], 2: [], 0.5: [], 0.25: [], 0: [] };

    Object.keys(TYPE_CHART).forEach((attackingType) => {
        const chart = TYPE_CHART[attackingType];
        const mult1 = chart[type1] ?? 1;
        const mult2 = type2 ? (chart[type2] ?? 1) : 1;
        const total = mult1 * mult2;

        if (buckets[total]) buckets[total].push(attackingType);
    });

    Object.entries(buckets).forEach(([multiplier, types]) => {
        const group = groups[multiplier];
        const parentGroup = group.closest(".calc-result-group");
        if (types.length === 0) {
            parentGroup.style.display = "none";
            return;
        }
        parentGroup.style.display = "block";
        types.forEach((t) => group.appendChild(makeChip(t)));
    });

    resultsEl.style.display = "grid";
    placeholderEl.style.display = "none";
}