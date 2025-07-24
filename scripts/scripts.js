// Document ready function
document.addEventListener("DOMContentLoaded", function () {
    // --- Map Interactivity Code ---
    const regions = {
        "northeast": ["Boston Bhangra", "Penn State Bhangra", "Rutgers Bhangra"],
        "midwest": ["Michigan State Bhangra", "Ohio State Bhangra", "Chicago Bhangra"],
        "west": ["UCLA Bhangra", "Bay Area Bhangra", "UC Berkeley Bhangra"],
        "south": ["Texas A&M Bhangra", "University of Houston Bhangra"],
        "southwest": ["Arizona State Bhangra", "New Mexico Bhangra"]
    };

    const teamList = document.getElementById("team-list");
    const svgElement = document.getElementById("map-svg");

    // Add hover and click functionality for regions
    svgElement.querySelectorAll(".region").forEach(region => {
        region.addEventListener("mouseenter", () => {
            region.style.fill = "rgba(255, 0, 0, 0.6)"; // Highlight on hover
        });

        region.addEventListener("mouseleave", () => {
            region.style.fill = "rgba(255, 255, 255, 0.3)"; // Revert on mouse leave
        });

        region.addEventListener("click", () => {
            const regionId = region.id;
            if (regions[regionId]) {
                teamList.innerHTML = regions[regionId]
                    .map(team => `<li>${team}</li>`)
                    .join("");
            }
        });
    });

    // --- Login Form Handling Code ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault(); // Prevent form from reloading the page

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:5000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.status === 200) {
                    alert("Login successful!");
                    // Redirect to another page, e.g., dashboard
                    window.location.href = "/dashboard.html";
                } else {
                    alert(data.message || "Invalid credentials");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while logging in.");
            }
        });
    }
});
