document.addEventListener("DOMContentLoaded", displayUserGroups);

// ========== Display all stored groups ==========
function displayUserGroups() {
    const groupList = document.querySelector("#group-list");
    const groups = JSON.parse(localStorage.getItem("userGroups")) || [];
    const emptyGroupText= document.querySelector("#empty-group-text")

    groupList.innerHTML = "";

    if (groups.length === 0) {
      emptyGroupText.style.display = "block";  // show message
      return;
    } else {
      emptyGroupText.style.display = "none";  // hide if groups exist
    }



    groups.forEach((group, index) => {
      const row = document.createElement("section");
      row.classList.add("table-row");

      row.innerHTML = `
          <span>${group.name}</span>
          <span>${group.id}</span>
          <span>${group.role || "—"}</span>
          <span>—</span> <!-- Placeholder for member count -->
          <section class="action-buttons">
              <button onclick="viewGroup(${index})" class="view-button">View</button>
              <button onclick="deleteGroup(${index})" class="delete-button">Delete</button>
          </section>

      `;

      groupList.appendChild(row);
    });
}

// ========== View button logic ==========
function viewGroup(index) {
    const groups = JSON.parse(localStorage.getItem("userGroups")) || [];
    const group = groups[index];

    localStorage.setItem("groupName", group.name);
    localStorage.setItem("groupDescription", group.description);
    localStorage.setItem("groupId", group.id);

    window.location.href = "group.html";
}


// ======== To delete from group lists ========
function deleteGroup(index) {
    const groups = JSON.parse(localStorage.getItem("userGroups")) || [];
    const group = groups[index];

    const confirmed = confirm(`Are you sure you want to delete the group "${group.name}"?`);

    if (!confirmed) return;

    groups.splice(index, 1);
    localStorage.setItem("userGroups", JSON.stringify(groups));

    displayUserGroups();
}

function loadYourGroups() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("You need to be logged in to view your groups.");
    return;
  }

  fetch(`/api/user-groups?userId=${userId}`)
    .then(response => response.json())
    .then(groups => {
      const container = document.querySelector("#your-groups");
      if (container) {
        container.innerHTML = "";

        if (groups.length === 0) {
          container.textContent = "No groups joined yet.";
          return;
        }

        groups.forEach(group => {
          const p = document.createElement("p");
          p.textContent = `Group ID: ${group.id}, Name: ${group.name}`;
          container.appendChild(p);
        });
      }
    })
    .catch(err => {
      console.error(err);
      alert("Could not load your groups");
    });
}







































