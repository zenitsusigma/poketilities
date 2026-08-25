const toggleBtn = document.getElementById("theme-toggle");
const root = document.documentElement;

const saved = localStorage.getItem("theme") || "dark";
root.setAttribute("data-theme", saved);

toggleBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
});

const guideToggle = document.getElementById("guide-toggle");
const guideModal = document.getElementById("guide-modal");
const guideClose = document.getElementById("guide-close");

guideToggle.addEventListener("click", () => {
    guideModal.classList.add("site-modal--open");
});

guideClose.addEventListener("click", () => {
    guideModal.classList.remove("site-modal--open");
});

guideModal.addEventListener("click", (e) => {
    if (e.target === guideModal) {
        guideModal.classList.remove("site-modal--open");
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        guideModal.classList.remove("site-modal--open");
    }
});