
document.addEventListener("DOMContentLoaded", function () {
  const groupName = localStorage.getItem("groupName");
  if (groupName) {
    document.querySelector(".group-title").textContent = `Group: ${groupName}`;
  }
});


const createTaskBtn = document.querySelector("#create-task-button");
if (createTaskBtn !== null) {
  createTaskBtn.addEventListener("click", showTaskSummary);
}


const splitCostBtn = document.querySelector("#create-cost-button");
if (splitCostBtn !== null) {
  splitCostBtn.addEventListener("click", showCostSummary);
}


const shareTasksButton = document.querySelector("#share-tasks");
if (shareTasksButton) {
  shareTasksButton.addEventListener("click", showTaskSection);
}



function isTaskTitleValid(title) {
    if (title.length === 0) {
        alert("Task Title is required.");
        return false;
    }

    if (title.length > 50) {
        alert("Title must be lower than 50 characters");
        return false;
    }

    return true;
}



function isTaskDescriptionValid(desc) {
    if (desc.length > 200) {
        alert("Description must be lower than 200 characters.");
        return false;
    }
    return true;
}

function isAssigneeSelected() {
    const checkboxes = document.querySelectorAll(".checkbox-list input[type='checkbox']");
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
          return true;
        }
    }
    alert("Members required for task creation.");
    return false;
}




// ========== Create and show task summary ==========
function showTaskSummary() {
    const title = document.querySelector("#task-title").value;

    if (!isTaskTitleValid(title)) {
        return; 
    }

    const desc = document.querySelector("#task-desc").value;

    if (!isTaskDescriptionValid(desc)) {
        return; 
    }

    if (!isAssigneeSelected()) return;


    const deadline = document.querySelector("#task-deadline").value;
    const recurrence = document.querySelector("#task-recurrence").value;

    const checkboxes = document.querySelectorAll(".checkbox-list input[type='checkbox']");
    let selectedUsers = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            const name = checkboxes[i].getAttribute("data-name");
            selectedUsers.push(name);
        }
    }

    const selectedPriority = document.querySelector(".priority.selected");
    let priorityColor = "transparent";
    if (selectedPriority) {
        const type = selectedPriority.classList;
        if (type.contains("critical")) priorityColor = "rgb(200, 0, 0)";
        else if (type.contains("important")) priorityColor = "rgb(255, 165, 0)";
        else if (type.contains("low")) priorityColor = "rgb(0, 180, 0)";
    }

    document.querySelector("#summary-task-title").textContent = title || "[Untitled]";
    document.querySelector("#summary-task-desc").textContent = desc || "No description provided.";
    document.querySelector("#summary-deadline").textContent = deadline || "—";
    document.querySelector("#summary-recurrence").textContent = recurrence || "—";
    document.querySelector("#summary-priority-box").style.backgroundColor = priorityColor;

    const assigneeList = document.querySelector("#summary-assignees");
    assigneeList.innerHTML = "";

    if (selectedUsers.length > 0) {
        for (let j = 0; j < selectedUsers.length; j++) {
            const li = document.createElement("li");
            li.textContent = selectedUsers[j];
            assigneeList.appendChild(li);
        }
    } else {
      const li = document.createElement("li");
      li.textContent = "None";
      assigneeList.appendChild(li);
    }

    document.querySelector("#task-section").classList.remove("visible");
    document.querySelector("#task-summary").classList.add("visible");

    const taskData = {
        title,
        desc,
        deadline,
        recurrence,
        assignees: selectedUsers,
        priority: priorityColor,
        timestamp: new Date().toISOString()
    };


    //Get existing tasks
    let allTasks=  JSON.parse(localStorage.getItem("taskSummaries")) || [];

    //add new task
    allTasks.push(taskData);

    //save back to storage
    localStorage.setItem("taskSummaries", JSON.stringify(allTasks));
}

// ========== Create and show cost summary ==========
function showCostSummary() {
    const amount = parseFloat(document.querySelector("#cost-amount").value);
    const desc = document.querySelector("#cost-desc").value;
    const deadline = document.querySelector("#cost-deadline").value;
    const recurrence = document.querySelector("#cost-recurrence").value;

    const checkboxes = document.querySelectorAll("#cost-section .checkbox-list input[type='checkbox']");
    let selectedUsers = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            const name = checkboxes[i].nextSibling.nodeValue.trim();
            selectedUsers.push(name);
        }
    }

    const perPersonCost = selectedUsers.length > 0 ? (amount / (selectedUsers.length + 1)).toFixed(2) : "—";

    const selectedPriority = document.querySelector("#cost-section .priority.selected");
    let priorityColor = "transparent";
    let priorityMessage = "";

    if (selectedPriority) {
        const type = selectedPriority.classList;
        if (type.contains("critical")) {
            priorityColor = "rgb(200, 0, 0)";
            priorityMessage = " Urgent: You must pay immediately.";
        } else if (type.contains("important")) {
            priorityColor = "rgb(255, 165, 0)";
            priorityMessage = " Important: Payment is due soon.";
        } else if (type.contains("low")) {
            priorityColor = "rgb(0, 180, 0)";
            priorityMessage = " Reminder: You have a pending payment.";
        }
    }

    document.querySelector("#summary-cost-amount").textContent = `GBP ${amount || "—"}`;
    document.querySelector("#summary-cost-desc").textContent = desc || "No description provided.";
    document.querySelector("#summary-cost-deadline").textContent = deadline || "—";
    document.querySelector("#summary-cost-priority").style.backgroundColor = priorityColor;

    const costAssigneeList = document.querySelector("#summary-cost-assignees");
    costAssigneeList.innerHTML = "";

    if (selectedUsers.length > 0) {
        for (let j = 0; j < selectedUsers.length; j++) {
            const li = document.createElement("li");
            li.innerHTML = `${selectedUsers[j]} — <span style="color:${priorityColor}">GBP ${perPersonCost}</span>`;
            costAssigneeList.appendChild(li);
        }
    } else {
        const li = document.createElement("li");
        li.textContent = "None";
        costAssigneeList.appendChild(li);
    }

    let messagePara = document.querySelector("#summary-cost-priority-message");
    if (!messagePara) {
        messagePara = document.createElement("p");
        messagePara.id = "summary-cost-priority-message";
        document.querySelector("#cost-summary .summary-ass-date").appendChild(messagePara);
    }

    messagePara.textContent = priorityMessage;
    messagePara.style.marginTop = "1rem";
    messagePara.style.color = priorityColor;

    let recurrenceSpan = document.querySelector("#summary-cost-recurrence");
    if (!recurrenceSpan) {
        const p = document.createElement("p");
        p.className = "summary-recurrence";
        p.innerHTML = `<strong>Recurrence:</strong> <span id="summary-cost-recurrence">${recurrence || "—"}</span>`;
        document.querySelector("#cost-summary .summary-ass-date").appendChild(p);
    } else {
        recurrenceSpan.textContent = recurrence || "—";
    }

    document.querySelector("#cost-section").classList.remove("visible");
    document.querySelector("#cost-summary").classList.add("visible");
}

// ========== Toggle selected class for priority buttons ==========
const priorityButtons = document.querySelectorAll(".priority");
for (let i = 0; i < priorityButtons.length; i++) {
    priorityButtons[i].addEventListener("click", function () {
        clearPrioritySelection();
        priorityButtons[i].classList.add("selected");
    });
}

// ========== Clear selected class from all priority buttons ==========
function clearPrioritySelection() {
    for (let i = 0; i < priorityButtons.length; i++) {
        priorityButtons[i].classList.remove("selected");
    }
}

// ========== Show task form and hide others ==========
function showTaskSection() {
    const taskSection = document.querySelector("#task-section");
    const costSection = document.querySelector("#cost-section");
    const taskSummary = document.querySelector("#task-summary");
    const costSummary = document.querySelector("#cost-summary");

    if (taskSection) taskSection.classList.add("visible");
    if (costSection) costSection.classList.remove("visible");
    if (taskSummary) taskSummary.classList.remove("visible");
    if (costSummary) costSummary.classList.remove("visible");

    clearTaskForm();
}



function showCostSection() {
    const costSection = document.querySelector("#cost-section");
    const taskSection = document.querySelector("#task-section");
    const taskSummary = document.querySelector("#task-summary");
    const costSummary = document.querySelector("#cost-summary");

    if (costSection) costSection.classList.add("visible");
    if (taskSection) taskSection.classList.remove("visible");
    if (taskSummary) taskSummary.classList.remove("visible");
    if (costSummary) costSummary.classList.remove("visible");

    clearCostForm();
}

const splitCostsButton = document.querySelector("#split-costs");
if (splitCostsButton) {
    splitCostsButton.addEventListener("click", showCostSection);
}


// ========== Clear task form inputs ==========
function clearTaskForm() {
  document.querySelector("#task-title").value = "";
  document.querySelector("#task-desc").value = "";
  document.querySelector("#task-deadline").value = "";
  document.querySelector("#task-recurrence").value = "";

  const checkboxes = document.querySelectorAll("#task-section .checkbox-list input[type='checkbox']");
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = false;
  }

  clearPrioritySelection();
}

// ========== Clear cost form inputs ==========
function clearCostForm() {
  document.querySelector("#cost-amount").value = "";
  document.querySelector("#cost-desc").value = "";
  document.querySelector("#cost-deadline").value = "";
  document.querySelector("#cost-recurrence").value = "";

  const checkboxes = document.querySelectorAll("#cost-section .checkbox-list input[type='checkbox']");
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = false;
  }

  clearPrioritySelection();
}



function populateAssigneeCheckboxes() {
    const residentItems = document.querySelectorAll(".resident-list li");
    const taskAssignees = document.querySelector("#task-assignees");
    const costAssignees = document.querySelector("#cost-assignees");

    taskAssignees.innerHTML = "";
    costAssignees.innerHTML = "";

    for (let i = 0; i < residentItems.length; i++) {
        const name = residentItems[i].textContent.trim();

        const taskLabel = document.createElement("label");
        const taskCheckbox = document.createElement("input");
        taskCheckbox.type = "checkbox";
        taskCheckbox.setAttribute("data-name", name);
        taskLabel.appendChild(taskCheckbox);
        taskLabel.append(" " + name);
        taskAssignees.appendChild(taskLabel);

        const costLabel = document.createElement("label");
        const costCheckbox = document.createElement("input");
        costCheckbox.type = "checkbox";
        costCheckbox.setAttribute("data-name", name);
        costLabel.appendChild(costCheckbox);
        costLabel.append(" " + name);
        costAssignees.appendChild(costLabel);
    }
}

document.addEventListener("DOMContentLoaded", populateAssigneeCheckboxes);



document.addEventListener("DOMContentLoaded", function () {
    displayGroupName();
    displayGroupDescription();
});

// ========== Show Group Name ==========
function displayGroupName() {
    const groupName = localStorage.getItem("groupName");
    if (groupName) {
      document.querySelector(".group-title").textContent = `Group: ${groupName}`;
    }
}

// ========== Show Group Description if present ==========
function displayGroupDescription() {
    const groupDesc = localStorage.getItem("groupDescription");
    const descElement = document.querySelector(".group-description");

    if (groupDesc && descElement) {
      descElement.textContent = groupDesc;
    } else if (descElement) {
      descElement.style.display = "none";
    }
}



//to clear the task summary
function handleClearTaskSummary() {
    document.querySelector("#task-summary").classList.remove("visible");

    clearTaskForm(); 

    // Show main group buttons (Share Tasks, Split Costs)
    const mainActions = document.querySelector(".group-main-actions");
    if (mainActions) {
      mainActions.classList.add("visible");
    }

    // Hide all task/cost forms
    document.querySelector("#task-section").classList.remove("visible");
    document.querySelector("#cost-section").classList.remove("visible");
    document.querySelector("#cost-summary").classList.remove("visible");
}

const clearTaskSummaryBtn = document.querySelector("#clear-task-summary");

if (clearTaskSummaryBtn) {
  clearTaskSummaryBtn.addEventListener("click", handleClearTaskSummary);
}


//function to export tasks to local storage
function exportTaskSummariesToCSV(){
    const tasks = JSON.parse(localStorage.getItem("taskSummaries")) || [];

    if (tasks.length === 0) {
        alert("No tasks to export.");
        return;
    }

    // Prepare CSV header
    let csv = "Title,Description,Deadline,Recurrence,Assignees,Priority,Timestamp\n";

    tasks.forEach(task => {
      const assignees = task.assignees.join(" | ");
      const row = [
          task.title,
          task.desc,
          task.deadline,
          task.recurrence,
          `"${assignees}"`,
          task.priority,
          task.timestamp
      ].map(field => `"${field}"`).join(",");

      csv += row + "\n";
    });


    //Download the CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "task_summaries.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

//event listener for download
const exportBtn = document.querySelector("#export-tasks-csv");
if (exportBtn) {
    exportBtn.addEventListener("click", exportTaskSummariesToCSV);
}


//function to clear costs 
// Handle clearing cost summary
function handleClearCostSummary() {
    document.querySelector("#cost-summary").classList.remove("visible");

    clearCostForm(); // Optional: reset form inputs

    // Show main buttons
    const mainActions = document.querySelector(".group-main-actions");
    if (mainActions) {
      mainActions.classList.add("visible");
    }

    // Hide other sections
    document.querySelector("#task-section").classList.remove("visible");
    document.querySelector("#task-summary").classList.remove("visible");
    document.querySelector("#cost-section").classList.remove("visible");
}

const clearCostSummaryBtn = document.querySelector("#clear-cost-summary");
if (clearCostSummaryBtn) {
    clearCostSummaryBtn.addEventListener("click", handleClearCostSummary);
}


//for cost export
function exportCostSummariesToCSV() {
    const amount = document.querySelector("#summary-cost-amount").textContent || "";
    const desc = document.querySelector("#summary-cost-desc").textContent || "";
    const deadline = document.querySelector("#summary-cost-deadline").textContent || "";
    const recurrence = document.querySelector("#summary-cost-recurrence")?.textContent || "";
    const assignees = Array.from(document.querySelectorAll("#summary-cost-assignees li")).map(li => li.textContent).join(" | ");
    const priority = document.querySelector("#summary-cost-priority")?.style.backgroundColor || "";
    const timestamp = new Date().toISOString();

    // Prepare CSV
    let csv = "Amount,Description,Deadline,Recurrence,Assignees,Priority,Timestamp\n";
    let row = [amount, desc, deadline, recurrence, `"${assignees}"`, priority, timestamp].map(f => `"${f}"`).join(",");
    csv += row + "\n";

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cost_summary.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Cost summary exported as CSV!");
}

const exportCostBtn = document.querySelector("#export-costs-csv");
if (exportCostBtn) {
    exportCostBtn.addEventListener("click", exportCostSummariesToCSV);
}

function loadGroups() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        return;
    }

    fetch(`/api/groups/${userId}`)
    .then((res) => res.json())
    .then((groups) => {
      const groupList = document.querySelector("#group-list");
            if (!groupList) {
                return;
            }

      groupList.innerHTML = "";

      if (groups.length === 0) {
        groupList.innerHTML = "<p>No groups joined.</p>";
      } else {
        groups.forEach((group) => {
          const item = document.createElement("p");
          item.textContent = `Group ID: ${group.id}, Name: ${group.name}`;
          groupList.appendChild(item);
        });
      }
    })
    .catch((err) => {
      console.error("Error loading groups:", err);
    });
}

document.addEventListener("DOMContentLoaded", loadGroups);






































