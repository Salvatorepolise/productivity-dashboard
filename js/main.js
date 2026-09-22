import {
  initHabits,
  addHabit,
  deleteHabit,
  editHabit,
  updateHabit,
  resetHabits,
  setSearchText,
  setSortOption,
} from "./state.js";

import { renderHabits, updateProgress, renderGoals } from "./ui.js";
import { loadDailyQuote } from "./api.js";

// ===== GOALS =====
const goals = [
  "Practice English for 1 hour",
  "Study JavaScript fundamentals",
  "Build the productivity dashboard",
];

const goalsList = document.getElementById("goals-list");
const newGoalInput = document.getElementById("new-goal-input");
const addGoalBtn = document.getElementById("add-goal-btn");

function handleAddGoal() {
  const text = newGoalInput.value.trim();
  if (!text) return;
  goals.push(text);
  renderGoals(goals, goalsList);
  newGoalInput.value = "";
}

addGoalBtn.addEventListener("click", handleAddGoal);
newGoalInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleAddGoal();
});

// ===== HABIT EVENTS =====
document.getElementById("habits").addEventListener("click", (event) => {
  const target = event.target;
  const id = target.dataset.id;
  if (!id) return;

  if (target.classList.contains("edit-habit-btn")) {
    editHabit(id);
    renderHabits();
    updateProgress();
  }

  if (target.classList.contains("delete-habit-btn")) {
    deleteHabit(id);
    renderHabits();
    updateProgress();
  }
});

document.getElementById("habits").addEventListener("change", (event) => {
  const target = event.target;
  if (target.classList.contains("habit-checkbox")) {
    const id = target.dataset.id;
    if (id) {
      updateHabit(id);
      updateProgress();
      renderHabits();
    }
  }
});

document.getElementById("search-habit-input").addEventListener("input", (e) => {
  setSearchText(e.target.value);
  renderHabits();
});

document.getElementById("sort-habits").addEventListener("change", (e) => {
  setSortOption(e.target.value);
  renderHabits();
});

document.getElementById("add-habit-btn").addEventListener("click", () => {
  const input = document.getElementById("new-habit-input");
  const ok = addHabit(input.value);
  if (ok) {
    input.value = "";
    renderHabits();
    updateProgress();
  }
});

document.getElementById("new-habit-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const input = document.getElementById("new-habit-input");
    const ok = addHabit(input.value);
    if (ok) {
      input.value = "";
      renderHabits();
      updateProgress();
    }
  }
});

document.getElementById("reset-habits-btn").addEventListener("click", () => {
  resetHabits();
  renderHabits();
  updateProgress();
});

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
initHabits();
renderHabits();
updateProgress();
updateCodingGoal();
renderGoals(goals, goalsList);
loadDailyQuote();
