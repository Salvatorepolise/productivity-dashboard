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
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.completed;

    checkbox.addEventListener("change", () => updateHabit(habit.id));

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + habit.name));
    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  });
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

  // Progress text + bar
  document.getElementById("progress-text").textContent =
    `Progress: ${completed}/${total} completed`;

  const bar = document.getElementById("habits-progress-bar");
  if (bar) bar.style.width = percentage + "%";

  // Analytics
  document.getElementById("completed-count").textContent = completed;
  document.getElementById("remaining-count").textContent = remaining;

  // Dynamic message
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
