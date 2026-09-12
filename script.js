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

function loadHabits() {
  const saved = localStorage.getItem("habitsData");
  if (saved) habitsData = JSON.parse(saved);
}

function saveHabits() {
  localStorage.setItem("habitsData", JSON.stringify(habitsData));
}

function renderHabits() {
  const container = document.getElementById("habits");
  container.innerHTML = "";

  habitsData.forEach((habit) => {
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
    checkbox.addEventListener("change", () => updateHabit(habit.id));

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + habit.name));

    // Bottone Edit
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-habit-btn";
    editBtn.addEventListener("click", () => editHabit(habit.id));

    // Bottone Delete
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-habit-btn";
    deleteBtn.addEventListener("click", () => deleteHabit(habit.id));

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

  const exists = habitsData.some((h) => h.id === id);
  if (exists) {
    input.value = "";
    return;
  }

  const newHabit = {
    id: id,
    name: name,
    completed: false,
  };

  habitsData.push(newHabit);
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

  if (newName === null) return; // utente ha premuto Cancel

  const trimmedName = newName.trim();
  if (!trimmedName) return; // nome vuoto → non aggiornare

  // Aggiorna usando .map()
  habitsData = habitsData.map((h) => {
    if (h.id === id) {
      return {
        ...h,
        name: trimmedName,
      };
    }
    return h;
  });

  saveHabits();
  renderHabits();
  updateProgress();
}

function updateHabit(id) {
  const habit = habitsData.find((h) => h.id === id);
  if (!habit) return;

  habit.completed = !habit.completed;
  saveHabits();
  updateProgress();
}

function updateProgress() {
  const total = habitsData.length;
  const completed = habitsData.filter((h) => h.completed).length;
  const remaining = total - completed;
  const percentage = total === 0 ? 0 : (completed / total) * 100;

  document.getElementById("progress-text").textContent =
    `Progress: ${completed}/${total} completed`;

  const bar = document.getElementById("habits-progress-bar");
  if (bar) bar.style.width = percentage + "%";

  document.getElementById("completed-count").textContent = completed;
  document.getElementById("remaining-count").textContent = remaining;

  const messageEl = document.getElementById("habit-message");
  if (percentage === 0) {
    messageEl.textContent = "Let's get started 🚀";
  } else if (percentage < 50) {
    messageEl.textContent = "Keep going 💪";
  } else if (percentage < 100) {
    messageEl.textContent = "You're making progress 🔥";
  } else {
    messageEl.textContent = "All habits completed today! 🎉";
  }
}

function resetHabits() {
  habitsData.forEach((h) => (h.completed = false));
  saveHabits();
  renderHabits();
  updateProgress();
}

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
