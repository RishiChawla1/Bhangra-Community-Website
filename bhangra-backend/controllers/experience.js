document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  const addRoleButton = document.getElementById("add-role");
  const rolesContainer = document.getElementById("roles-container");

  // Add another role block
  addRoleButton.addEventListener("click", () => {
    const firstRole = rolesContainer.querySelector(".role-entry");
    const newRole = firstRole.cloneNode(true);
    newRole.querySelector(".role-select").value = "";
    newRole.querySelector(".start-date").value = "";
    newRole.querySelector(".end-date").value = "";
    rolesContainer.appendChild(newRole);
  });

  // Handle form submission
  document.getElementById("experience-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newTeamName = document.getElementById("new-team").value;
    let team_ID = document.getElementById("team-select").value;
    const description = document.getElementById("description").value;

    // Step 1: Add new team if needed
    if (newTeamName) {
      const teamRes = await fetch("http://localhost:3000/api/teams/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ team_name: newTeamName })
      });

      const teamData = await teamRes.json();
      team_ID = teamData.team_ID;
    }

    // Step 2: Gather all roles
    const roles = [];
    const roleBlocks = document.querySelectorAll(".role-entry");
    roleBlocks.forEach(block => {
      const role_ID = block.querySelector(".role-select").value;
      const startDate = block.querySelector(".start-date").value;
      const endDate = block.querySelector(".end-date").value;

      roles.push({ role_ID, startDate, endDate });
    });

    // Step 3: Submit experience
    const res = await fetch("http://localhost:3000/api/experience/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ team_ID, roles, description }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Experience added successfully!");
      document.getElementById("experience-form").reset();
    } else {
      alert(data.message || "Failed to add experience");
    }
  });
});
