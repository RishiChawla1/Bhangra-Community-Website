document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  const addRoleButton = document.getElementById("add-role");
  const rolesContainer = document.getElementById("roles-container");

  // Fetch roles from backend
  const roleRes = await fetch("http://localhost:3000/api/roles");
  const roles = await roleRes.json();

  // Populate a single role dropdown
  function populateDropdown(select) {
    select.innerHTML = '<option value="">Select a role</option>';
    roles.forEach(role => {
      const option = document.createElement("option");
      option.value = role.id;
      option.textContent = role.name;
      select.appendChild(option);
    });
  }

  // Live date validation
  function attachLiveValidation(roleBlock) {
    const startInput = roleBlock.querySelector(".start-date");
    const endInput = roleBlock.querySelector(".end-date");
    const presentCheckbox = roleBlock.querySelector(".present-checkbox");

    // Restrict start date to today or earlier
    const today = new Date().toISOString().split("T")[0];
    startInput.max = today;
    endInput.max = today;

    function validate() {
      // Prevent future start date
      if (startInput.value && new Date(startInput.value) > new Date(today)) {
        startInput.setCustomValidity("Start date cannot be in the future.");
        return;
      }
      if (endInput.value && new Date(endInput.value) > new Date(today)) {
        endInput.setCustomValidity("End date cannot be in the future.");
      }
      else {
        startInput.setCustomValidity("");
      }

      // Validate date order if not Present
      if (!presentCheckbox.checked && startInput.value && endInput.value) {
        if (new Date(startInput.value) > new Date(endInput.value)) {
          endInput.setCustomValidity("End date must be after start date.");
        } else {
          endInput.setCustomValidity("");
        }
      } else {
        endInput.setCustomValidity("");
      }
    }

    startInput.addEventListener("input", validate);
    endInput.addEventListener("input", validate);
    presentCheckbox.addEventListener("change", () => {
      endInput.disabled = presentCheckbox.checked;
      validate();
    });

    validate();
  }

  // Add remove button functionality
  function attachRemoveButton(roleBlock) {
    const removeBtn = roleBlock.querySelector(".remove-role");
    removeBtn.addEventListener("click", () => {
      const allRoles = document.querySelectorAll(".role-entry");
      if (allRoles.length > 1) {
        roleBlock.remove();
      } else {
        alert("You must have at least one role.");
      }
    });
  }

  // Initialize all dropdowns, checkboxes, and validation
  function setupRoleBlock(roleBlock) {
    populateDropdown(roleBlock.querySelector(".role-select"));
    attachLiveValidation(roleBlock);
    attachRemoveButton(roleBlock);
  }

  // First role block setup
  setupRoleBlock(document.querySelector(".role-entry"));

  // Add another role block
  addRoleButton.addEventListener("click", () => {
    const firstRole = rolesContainer.querySelector(".role-entry");
    const newRole = firstRole.cloneNode(true);

    // Clear values
    newRole.querySelector(".role-select").value = "";
    newRole.querySelector(".start-date").value = "";
    newRole.querySelector(".end-date").value = "";
    newRole.querySelector(".present-checkbox").checked = false;
    newRole.querySelector(".end-date").disabled = false;

    rolesContainer.appendChild(newRole);
    setupRoleBlock(newRole);
  });

  // Form submission
  document.getElementById("experience-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newTeamName = document.getElementById("new-team").value.trim();
    let team_ID = document.getElementById("team-select").value;
    const description = document.getElementById("description").value;

    if (!team_ID && !newTeamName) {
      alert("Please select an existing team or enter a new team name.");
      return;
    }

    // Add new team if needed
    if (newTeamName && !team_ID) {
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

    // Collect roles with validation
    const roles = [];
    let hasInvalid = false;
    const today = new Date().toISOString().split("T")[0];

    document.querySelectorAll(".role-entry").forEach(block => {
      const role_ID = block.querySelector(".role-select").value;
      const startDate = block.querySelector(".start-date").value;
      const present = block.querySelector(".present-checkbox").checked;
      const endDate = present ? "Present" : block.querySelector(".end-date").value;

      if (!role_ID || !startDate || (!present && !endDate)) {
        alert("Please fill out all required fields.");
        hasInvalid = true;
        return;
      }

      if (new Date(startDate) > new Date(today)) {
        alert("Start date cannot be in the future.");
        hasInvalid = true;
        return;
      }

      if (!present && new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be after end date.");
        hasInvalid = true;
        return;
      }

      roles.push({ role_ID, startDate, endDate });
    });

    if (hasInvalid) return;

    // Submit
    const res = await fetch("http://localhost:3000/api/experience/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ team_ID, roles, description })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Experience added successfully!");
      document.getElementById("experience-form").reset();
      rolesContainer.innerHTML = "";
      addRoleButton.click();
    } else {
      alert(data.message || "Failed to add experience");
    }
  });
});
