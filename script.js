// --- Dark Mode Logic ---
const themeToggle = document.getElementById("theme-toggle");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 Dark Mode";
    }
});

const profileDiv = document.getElementById("profile");
const reposDiv = document.getElementById("repos");
const usernameInput = document.getElementById("username");
const rateLimitInfo = document.getElementById("rate-limit-info"); // NEW: Grab the rate limit element

usernameInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        getUser();
    }
});