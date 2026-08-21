const toggleBtn = document.getElementById("theme-toggle");
const root = document.documentElement;

const saved = localStorage.getItem("theme") || "dark";
root.setAttribute("data-theme", saved);

toggleBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
});