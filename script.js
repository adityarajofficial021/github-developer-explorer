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

let repos = [];

async function getUser() {
    const username = usernameInput.value.trim(); 

    if(!username) {
        alert("Enter Username");
        return;
    }

    profileDiv.innerHTML = "<h3>Loading...</h3>";
    reposDiv.innerHTML = "";

    try {
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        
        // --- NEW: Rate Limit Handling ---
        const remaining = userRes.headers.get('x-ratelimit-remaining');
        const limit = userRes.headers.get('x-ratelimit-limit');
        const resetTime = userRes.headers.get('x-ratelimit-reset');

        if (remaining && limit) {
            rateLimitInfo.textContent = `API Requests Remaining: ${remaining} / ${limit}`;
        }

        if(userRes.status === 404) {
            profileDiv.innerHTML = "<h2>User Not Found</h2>";
            return;
        }

        // Catch 403 (Rate Limit Exceeded)
        if(userRes.status === 403 || userRes.status === 429) {
            let resetMessage = "";
            if (resetTime) {
                // Convert UNIX timestamp to readable local time
                const resetDate = new Date(resetTime * 1000);
                resetMessage = `<p>Limit resets at: <strong>${resetDate.toLocaleTimeString()}</strong></p>`;
            }
            
            profileDiv.innerHTML = `
                <div class="card" style="text-align: center; border-color: #ef4444;">
                    <h2 style="color: #ef4444;">API Limit Exceeded</h2>
                    <p>You have hit the GitHub API's 60 requests/hour limit for unauthenticated users.</p>
                    ${resetMessage}
                </div>
            `;
            return;
        }
        // --------------------------------

        const user = await userRes.json();
        const repoRes = await fetch(`https://api.github.com/users/${username}/repos`);
        
        repos = await repoRes.json();

        profileDiv.innerHTML = `
        <div class="card profile">
            <img src="${user.avatar_url}">
            <div>
                <h2>${user.name || user.login}</h2>
                <p>${user.bio || "No Bio Available"}</p>
                <p>Followers: ${user.followers}</p>
                <p>Following: ${user.following}</p>
                <p>Public Repos: ${user.public_repos}</p>
                <br>
                <a href="${user.html_url}" target="_blank">View Profile</a>
            </div>
        </div>
        `;

        renderRepos();

    } catch (error) {
        console.error(error);
        profileDiv.innerHTML = "<h2>Something Went Wrong</h2>";
    }
}

function renderRepos() {
    let data = [...repos];
    const sort = document.getElementById("sort").value;

    if(sort === "stars") {
        data.sort((a,b) => b.stargazers_count - a.stargazers_count);
    }
    if(sort === "forks") {
        data.sort((a,b) => b.forks_count - a.forks_count);
    }
    if(sort === "updated") {
        data.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    reposDiv.innerHTML = data.map(repo => `
        <div class="repo">
            <h3>${repo.name}</h3>
            <p>${repo.description || "No Description"}</p>
            <br>
            <p>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}</p>
            <p>Language: ${repo.language || "N/A"}</p>
            <br>
            <a href="${repo.html_url}" target="_blank">Open Repository</a>
        </div>
    `).join("");
}
