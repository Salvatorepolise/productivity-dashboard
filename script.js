// ===== GOALS =====
const goals = [
  "Practice English for 1 hour",
  "Study JavaScript fundamentals",
  "Build the productivity dashboard",
];

const goalsList = document.getElementById("goals-list");
const newGoalInput = document.getElementById("new-goal-input");
const addGoalBtn = document.getElementById("add-goal-btn");

function renderGoals() {
  goalsList.innerHTML = "";
  goals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${goal}`;
    goalsList.appendChild(li);
  });
}

function addGoal() {
  const text = newGoalInput.value.trim();
  if (!text) return;
  goals.push(text);
  renderGoals();
  newGoalInput.value = "";
}

addGoalBtn.addEventListener("click", addGoal);
newGoalInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addGoal();
});

// ===== HABITS =====
let habitsData = [
  { id: "english", name: "English", completed: false },
  { id: "coding", name: "Coding", completed: false },
  { id: "reading", name: "Reading", completed: false },
  { id: "exercise", name: "Exercise", completed: false },
];

let searchText = "";
let sortOption = "default";

function loadHabits() {
  const saved = localStorage.getItem("habitsData");
  if (saved) habitsData = JSON.parse(saved);
}

function saveHabits() {
  localStorage.setItem("habitsData", JSON.stringify(habitsData));
}

function getFilteredHabits() {
  if (!searchText.trim()) {
    return [...habitsData];
  }

  return habitsData.filter((habit) =>
    habit.name.toLowerCase().includes(searchText.toLowerCase()),
  );
}

function getVisibleHabits() {
  const filtered = getFilteredHabits();

  if (sortOption === "az") {
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortOption === "completed") {
    return filtered.sort((a, b) => Number(b.completed) - Number(a.completed));
  }

  if (sortOption === "remaining") {
    return filtered.sort((a, b) => Number(a.completed) - Number(b.completed));
  }

  return filtered;
}

function renderHabits() {
  const container = document.getElementById("habits");
  container.innerHTML = "";

  const visibleHabits = getVisibleHabits();

  if (visibleHabits.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No habits found";
    emptyMessage.style.color = "#71717a";
    emptyMessage.style.fontSize = "0.95rem";
    container.appendChild(emptyMessage);
    return;
  }

  visibleHabits.forEach((habit) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "6px";
    wrapper.style.gap = "8px";

    const label = document.createElement("label");
    label.style.flex = "1";
    label.style.cursor = "pointer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.completed;
    checkbox.dataset.id = habit.id;
    checkbox.className = "habit-checkbox";

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + habit.name));

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-habit-btn";
    editBtn.dataset.id = habit.id;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-habit-btn";
    deleteBtn.dataset.id = habit.id;

    wrapper.appendChild(label);
    wrapper.appendChild(editBtn);
    wrapper.appendChild(deleteBtn);
    container.appendChild(wrapper);
  });
}

function addHabit() {
  const input = document.getElementById("new-habit-input");
  const name = input.value.trim();
  if (!name) return;

  const id = name.toLowerCase().replace(/\s+/g, "-");

  const exists = habitsData.some(
    (h) => h.name.toLowerCase() === name.toLowerCase(),
  );
  if (exists) {
    alert("This habit already exists");
    return;
  }

  habitsData = [...habitsData, { id, name, completed: false }];
  saveHabits();
  renderHabits();
  updateProgress();
  input.value = "";
}

function deleteHabit(id) {
  habitsData = habitsData.filter((habit) => habit.id !== id);
  saveHabits();
  renderHabits();
  updateProgress();
}

function editHabit(id) {
  const habit = habitsData.find((h) => h.id === id);
  if (!habit) return;

  const newName = prompt("Enter the new name:", habit.name);
  if (newName === null) return;

  const trimmedName = newName.trim();
  if (!trimmedName) return;

  const nameExists = habitsData.some(
    (h) => h.id !== id && h.name.toLowerCase() === trimmedName.toLowerCase(),
  );
  if (nameExists) {
    alert("This habit name already exists");
    return;
  }

  habitsData = habitsData.map((h) => {
    if (h.id === id) return { ...h, name: trimmedName };
    return h;
  });

  saveHabits();
  renderHabits();
  updateProgress();
}

function updateHabit(id) {
  habitsData = habitsData.map((h) => {
    if (h.id === id) return { ...h, completed: !h.completed };
    return h;
  });

  saveHabits();
  updateProgress();
  renderHabits();
}

// ===== STATISTICS =====
function updateStatistics() {
  const total = habitsData.length;

  const completed = habitsData.reduce((count, habit) => {
    return habit.completed ? count + 1 : count;
  }, 0);

  const remaining = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("total-habits").textContent = total;
  document.getElementById("completed-habits").textContent = completed;
  document.getElementById("remaining-habits").textContent = remaining;
  document.getElementById("progress-percentage").textContent = `${percentage}%`;
}

// ===== INSIGHT =====
function getHabitInsight() {
  const total = habitsData.length;

  if (total === 0) {
    return "Add your first habit to get started.";
  }

  const completed = habitsData.reduce((count, habit) => {
    return habit.completed ? count + 1 : count;
  }, 0);

  const percentage = Math.round((completed / total) * 100);

  if (percentage === 0) {
    return "Start your day by completing your first habit.";
  }

  if (percentage < 50) {
    return "Keep going — small steps still count.";
  }

  if (percentage < 100) {
    return "You're more than halfway. Finish strong.";
  }

  return "All habits completed today. Great work!";
}

function updateInsight() {
  const insightEl = document.getElementById("habit-insight");
  if (!insightEl) return;

  insightEl.textContent = getHabitInsight();
}

// ===== HABIT STATUS (Day 16) =====
function getHabitStatusKey() {
  if (habitsData.length === 0) {
    return "no habits";
  }

  if (habitsData.every((habit) => habit.completed)) {
    return "all completed";
  }

  if (habitsData.some((habit) => habit.completed)) {
    return "some completed";
  }

  return "none completed";
}

function getHabitStatusMessage() {
  const status = getHabitStatusKey();

  if (status === "no habits") {
    return "🌱 No habits yet. Add your first one.";
  }

  if (status === "all completed") {
    return "🔥 All habits completed!";
  }

  if (status === "some completed") {
    return "💪 You still have habits to complete.";
  }

  return "🌱 None completed yet. Start with one.";
}

function updateHabitStatus() {
  const statusEl = document.getElementById("habit-status");
  if (!statusEl) return;

  statusEl.textContent = getHabitStatusMessage();
}

function updateProgress() {
  const total = habitsData.length;

  const completed = habitsData.reduce((count, habit) => {
    return habit.completed ? count + 1 : count;
  }, 0);

  const remaining = total - completed;
  const percentage = total === 0 ? 0 : (completed / total) * 100;

  document.getElementById("progress-text").textContent =
    `Progress: ${completed}/${total} completed`;

  const bar = document.getElementById("habits-progress-bar");
  if (bar) bar.style.width = percentage + "%";

  document.getElementById("completed-count").textContent = completed;
  document.getElementById("remaining-count").textContent = remaining;

  const messageEl = document.getElementById("habit-message");

  if (total === 0) {
    messageEl.textContent = "Add your first habit";
  } else if (!habitsData.some((h) => h.completed)) {
    messageEl.textContent = "Start your day! 🚀";
  } else if (habitsData.every((h) => h.completed)) {
    messageEl.textContent = "Everything done! 🔥";
  } else {
    messageEl.textContent = "Good progress! 💪";
  }

  updateStatistics();
  updateInsight();
  updateHabitStatus();
}

function resetHabits() {
  habitsData = habitsData.map((h) => ({ ...h, completed: false }));
  saveHabits();
  renderHabits();
  updateProgress();
}

// ===== EVENT DELEGATION =====
document.getElementById("habits").addEventListener("click", function (event) {
  const target = event.target;
  const id = target.dataset.id;
  if (!id) return;

  if (target.classList.contains("edit-habit-btn")) editHabit(id);
  if (target.classList.contains("delete-habit-btn")) deleteHabit(id);
});

document.getElementById("habits").addEventListener("change", function (event) {
  const target = event.target;
  if (target.classList.contains("habit-checkbox")) {
    const id = target.dataset.id;
    if (id) updateHabit(id);
  }
});

document.getElementById("search-habit-input").addEventListener("input", (e) => {
  searchText = e.target.value;
  renderHabits();
});

document.getElementById("sort-habits").addEventListener("change", (e) => {
  sortOption = e.target.value;
  renderHabits();
});

document.getElementById("add-habit-btn").addEventListener("click", addHabit);
document.getElementById("new-habit-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addHabit();
});
document
  .getElementById("reset-habits-btn")
  .addEventListener("click", resetHabits);

// ===== CODING =====
const goalMinutes = 60;
const todayInput = document.getElementById("today-input");
const goalEl = document.getElementById("goal-minutes");
const statusEl = document.getElementById("goal-status");
const progressBar = document.getElementById("progress-bar");

const savedMinutes = localStorage.getItem("todayMinutes");
if (savedMinutes !== null) todayInput.value = savedMinutes;

function updateCodingGoal() {
  const todayMinutes = Number(todayInput.value) || 0;
  goalEl.textContent = goalMinutes;

  const percentage = Math.min((todayMinutes / goalMinutes) * 100, 100);
  progressBar.style.width = percentage + "%";

  if (todayMinutes >= goalMinutes) {
    statusEl.textContent = "Goal completed ✓";
    statusEl.style.color = "#16a34a";
  } else {
    statusEl.textContent = "Not completed yet";
    statusEl.style.color = "#a1a1aa";
  }
}

todayInput.addEventListener("input", () => {
  localStorage.setItem("todayMinutes", todayInput.value);
  updateCodingGoal();
});

// ===== NOTES =====
const notesTextarea = document.getElementById("notes");
const savedNotes = localStorage.getItem("notes");
if (savedNotes) notesTextarea.value = savedNotes;

notesTextarea.addEventListener("input", () => {
  localStorage.setItem("notes", notesTextarea.value);
});

// ===== INIT =====
loadHabits();
renderHabits();
updateProgress();
updateCodingGoal();
renderGoals();
